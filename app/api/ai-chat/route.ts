"use server";

import { type NextRequest, NextResponse } from "next/server";
import { AIChatResponse } from "../../../types/ai-chat.types";
import { getAvailableAPIKeys } from "../../../lib/config/api-config";
import { isBusinessRelated } from "../../../lib/services/message-classifier";
import { APIProviderFactory } from "../../../lib/providers/api-provider-factory";
import {
  logAPIKeys,
  logBusinessClassification,
  logFallbackUsage,
} from "../../../lib/utils/logging-utils";
import { DatabaseService } from "../../../lib/services/database-service";
import { createClient as createSupabaseServerClient } from "../../../utils/supabase/server";
import { buildRateKey, checkRateLimit } from "../../../lib/utils/rate-limit";
import { logger } from "../../../lib/utils/logger";
import { autoGenerateFigmaDesign } from "../../../lib/services/figma-auto-generator";

async function requireAuth() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      return { ok: false as const, status: 401, error: "Unauthorized" };
    }
    return { ok: true as const, user: data.user };
  } catch (err) {
    logger.error("❌ [AUTH] Supabase auth error:", err);
    return { ok: false as const, status: 500, error: "Auth check failed" };
  }
}

function FallbackResponse(lastMessage: string, business: boolean, role: string): string {
  const intro = `As your ${role}, here’s what I suggest next.`;
  const base = lastMessage?.trim()
    ? `You asked: "${lastMessage}".`
    : `You haven’t asked a specific question yet.`;
  const type = business
    ? `This appears business-related. I’ll stay focused on practical outcomes.`
    : `This seems general, but I’ll still offer something helpful.`;
  const steps = `\n\nNext steps:\n1) Clarify your goal.\n2) List 3 constraints (time, budget, resources).\n3) Share key data for a tailored plan.`;
  return `${intro}\n\n${base}\n${type}${steps}`;
}

export async function POST(request: NextRequest) {
  try {
    /*  1. Auth check */
    const auth = await requireAuth();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const userId = auth.user.id;

    /*  2. Validate input */
    const raw = await request.json();
    const { AIChatBodySchema } = await import("../../../lib/validation/ai-chat");
    const parsed = AIChatBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, activeRole, sessionId } = parsed.data;

    /*  3. Verify session ownership */
    if (sessionId) {
      const session = await DatabaseService.getChatSessionById(sessionId);
      if (!session || String(session.userId) !== String(userId)) {
        return NextResponse.json(
          { error: "Unauthorized to access this session" },
          { status: 403 }
        );
      }
    }

    /*  4. Rate limit check */
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";
    const rateKey = buildRateKey(["ai-chat", userId, ip]);
    const rate = checkRateLimit(rateKey, { capacity: 10, refillRatePerSec: 0.2 });
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", retryAfterMs: rate.retryAfterMs },
        { status: 429 }
      );
    }

    /*  5. Prepare provider call */
    const lastMessage = messages[messages.length - 1]?.content || "";
    const apiKeys = getAvailableAPIKeys();
    const businessRelated = isBusinessRelated(lastMessage);

    logAPIKeys(apiKeys);
    logBusinessClassification(businessRelated);

    logger.info("🚀 [AI-CHAT] Calling API provider...");

    /*  6. Get provider response */
    const apiResponse = await APIProviderFactory.getResponse(
      messages,
      businessRelated,
      activeRole
    );


    //    STREAM MODE (Gemini)

    if (apiResponse instanceof Response) {
      logger.info("🔄 [AI-CHAT] Gemini streaming response started", {
        provider: "gemini",
        status: apiResponse.status,
        ok: apiResponse.ok,
        contentType: apiResponse.headers.get("content-type") || "unknown",
      });

      const originalBody = apiResponse.body;
      if (!originalBody) {
        logger.warn("⚠️ [AI-CHAT] Gemini stream had no body");
        return apiResponse;
      }

      let fullText = "";
      let chunkCount = 0;
      const MAX_RESPONSE_SIZE = 100 * 1024; // 100KB limit to prevent memory issues

      const loggedStream = new ReadableStream({
        async start(controller) {
          const reader = originalBody.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const textChunk = decoder.decode(value, { stream: true });
              chunkCount++;

              // Prevent unbounded memory growth
              if (fullText.length + textChunk.length > MAX_RESPONSE_SIZE) {
                logger.warn("⚠️ [AI-CHAT] Response size limit reached, truncating");
                fullText += textChunk.substring(0, MAX_RESPONSE_SIZE - fullText.length);
                controller.enqueue(value.slice(0, MAX_RESPONSE_SIZE - fullText.length));
                break;
              }

              if (process.env.NODE_ENV === 'development') {
                logger.debug(`💬 [AI-CHAT] Chunk #${chunkCount} (${value.length} bytes)`);
              }

              fullText += textChunk;
              controller.enqueue(value);
            }

            logger.info(`✅ [AI-CHAT] Gemini stream complete (${chunkCount} chunks)`);

            // 🎨 AUTO-GENERATE FIGMA DESIGN (CTO ONLY) - Generate and stream immediately
            let finalContent = fullText.trim();

            if (activeRole?.toLowerCase() === "cto" && sessionId && fullText.trim()) {
              try {
                logger.info("🎨 [AI-CHAT] Generating Figma design...");

                const designId = await autoGenerateFigmaDesign(
                  fullText.trim(),
                  userId,
                  activeRole
                );

                if (designId) {
                  // Get user's plugin installation status
                  // Note: userId is a UUID from Supabase, not a MongoDB ObjectId
                  // We need to find user by email instead
                  const User = (await import("../../../model/User")).default;
                  const user = await User.findOne({ email: auth.user.email });
                  const hasInstalledPlugin = user?.hasInstalledFigmaPlugin || false;

                  // Create conditional Figma message
                  let figmaMessage = "";

                  if (!hasInstalledPlugin) {
                    // First-time user: Full setup instructions
                    figmaMessage = `\n\n---\n\n🎨 **Figma Design Generated**\n\nTo view this design in Figma (one-time setup required):\n\n⬇️ **Download the EVOA Figma Plugin:**\nhttps://github.com/EvoaTechnology/021-v3/releases/download/figma-plugin-v1/figma-plugin-dist.zip\n\n**After downloading:**\n1. Unzip the file\n2. Open Figma (web or desktop)\n3. Go to Plugins → Development → Import plugin from manifest\n4. Select the manifest.json file\n5. Open the EVOA Design Import plugin\n\nThen paste the Design Import Code below and click "Import".\n\n---\n\n**Design Import Code:**\n\n\`\`\`\n${designId}\n\`\`\``;
                  } else {
                    // Returning user: Minimal instructions
                    figmaMessage = `

---

🎨 **Figma Design Generated**

Open the EVOA Design Import plugin in Figma and paste the code below to import the design.

---

**Design Import Code:**

\`\`\`
${designId}
\`\`\``;
                  }

                  finalContent += figmaMessage;

                  // 🚀 SEND FIGMA CODE THROUGH STREAM (immediate display)
                  const figmaChunk = new TextEncoder().encode(figmaMessage);
                  controller.enqueue(figmaChunk);

                  logger.info("🎨 [AI-CHAT] Sent Figma design code through stream", {
                    designId,
                    hasInstalledPlugin,
                    chunkSize: figmaChunk.length,
                  });
                }
              } catch (figmaErr) {
                logger.error("⚠️ [AI-CHAT] Failed to generate Figma design:", figmaErr);
              }
            }

            // 💾 Save final message to database
            if (sessionId && finalContent) {
              try {
                await DatabaseService.createChatMessage({
                  content: finalContent,
                  role: "ai",
                  sessionId,
                  activeRole: activeRole || undefined,
                });

                logger.info("💾 [AI-CHAT] Stored final message with Figma code", {
                  length: finalContent.length,
                  activeRole,
                });
              } catch (dbErr) {
                logger.error("⚠️ [AI-CHAT] Failed to store streamed message:", dbErr);
              }
            }

            controller.close();
          } catch (err) {
            logger.error("❌ [AI-CHAT] Stream read error:", err);
            controller.error(err);
          }
        },
      });

      return new Response(loggedStream, {
        headers: apiResponse.headers,
        status: apiResponse.status,
      });
    }


    logger.info("✅ [AI-CHAT] Provider JSON response received", {
      provider: apiResponse.provider,
      responseLength: apiResponse.content?.length || 0,
      confidence: apiResponse.confidence,
    });

    let stored = false;

    if (sessionId && apiResponse?.content?.trim()) {
      try {
        await DatabaseService.createChatMessage({
          content: apiResponse.content.trim(),
          role: "ai",
          sessionId,
          activeRole: activeRole || undefined,
        });
        stored = true;
        logger.info("💾 [AI-CHAT] Stored non-streaming AI response to DB", {
          length: apiResponse.content.length,
          activeRole,
        });

        // 🎨 AUTO-GENERATE FIGMA DESIGN (CTO ONLY)
        if (activeRole?.toLowerCase() === "cto") {
          const designId = await autoGenerateFigmaDesign(
            apiResponse.content.trim(),
            userId,
            activeRole
          );

          if (designId) {
            // Append Figma design code to response content
            const figmaMessage = `\n\n---\n\n🎨 **Figma Design Created!**\n\nCopy this code and paste it in the Figma plugin:\n\n\`\`\`\n${designId}\n\`\`\``;

            apiResponse.content += figmaMessage;

            logger.info("🎨 [AI-CHAT] Appended Figma design code to response", {
              designId,
            });
          }
        }
      } catch (err) {
        logger.error("⚠️ [AI-CHAT] Failed to store non-streaming AI response:", err);
      }
    }

    // ✅ Send JSON response
    return NextResponse.json(
      {
        content: apiResponse.content,
        provider: apiResponse.provider,
        isBusinessRelated: businessRelated,
        confidence: apiResponse.confidence,
        activeRole,
        storedToDB: stored,
      } satisfies AIChatResponse,
      { status: 200 }
    );
  } catch (err) {

    logger.error("❌ [AI-CHAT] Server error in generating AI response:", err);
    logFallbackUsage();

    const fallback = FallbackResponse("Unknown", false, "assistant");
    return NextResponse.json(
      {
        content: fallback,
        fallbackMode: true,
        confidence: 70,
        activeRole: "assistant",
      } satisfies AIChatResponse,
      { status: 500 }
    );
  }
}
