import { getAvailableAPIKeys } from "../config/api-config";
import { callGeminiAPI } from "./gemini-provider";
import { streamGeminiResponse } from "./geminiStream-provider";
import { callXAIAPI } from "./xai-provider";
import { callGroqAPI } from "./groq-provider";
import { logger } from "../utils/logger";
import type { ProviderMessage, ProviderResult } from "../../types/shared";

// IMPORT THE RAG PROVIDER
import { callRAGAPI } from "./rag-provider";

/**
 * Provider message/result contracts used across AI providers.
 * These are intentionally minimal to ease provider interchange.
 */
export type ProviderRole = "user" | "assistant" | "system";

/**
 * Log provider context (development mode only)
 * Production: Only logs message count for monitoring
 */
function logProviderContext(messages: ProviderMessage[], providerName: string) {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Development: detailed logging
    const summaries = messages.filter((m) => m.role === "system").length;
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter((m) => m.role === "assistant").length;

    logger.info(`🚀 [${providerName.toUpperCase()}] Request details`, {
      provider: providerName,
      messageCount: {
        system: summaries,
        user: userMessages,
        assistant: assistantMessages,
        total: messages.length,
      },
    });
  } else {
    // Production: minimal logging (no PII)
    logger.info(`🚀 [${providerName.toUpperCase()}] Processing ${messages.length} messages`);
  }
}

/**
 * Sanitize inbound messages prior to sending to any external provider.
 */
function sanitizeMessages(messages: ProviderMessage[]): ProviderMessage[] {
  const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
  const safe = (messages || [])
    .map((m) => ({
      role: ALLOWED.includes(m?.role as ProviderRole)
        ? (m.role as ProviderRole)
        : "user",
      content:
        typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
      roleContext:
        typeof m?.roleContext === "string" && m.roleContext.trim().length > 0
          ? m.roleContext.trim()
          : undefined,
    }))
    .filter((m) => m.content.trim().length > 0);

  // Basic hard cap to avoid mega payloads (tune as needed)
  const MAX_MESSAGES = 200;
  return safe.slice(-MAX_MESSAGES);
}

/**
 * APIProviderFactory orchestrates calls to multiple AI providers.
 */
export class APIProviderFactory {
  /**
   * Attempts providers in priority order until one succeeds.
   */
  static async getResponse(
    messages: ProviderMessage[],
    isBusinessRelated: boolean,
    activeRole: string
  ): Promise<ProviderResult | Response> {
    const apiKeys = getAvailableAPIKeys();

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      logger.info("🎯 Provider selection started", {
        availableProviders: Object.keys(apiKeys).filter(k => apiKeys[k as keyof typeof apiKeys]),
        activeRole,
        messageCount: messages.length,
      });
    }

    const safeMessages = sanitizeMessages(messages);

    if (isDev && safeMessages.length !== messages.length) {
      logger.info(`🧹 Sanitized ${messages.length} → ${safeMessages.length} messages`);
    }

    // 1) TRY RAG (PRIMARY STREAMING)
    try {
      logger.info("🔄 [RAG] ATTEMPTING PRIMARY PROVIDER (STREAMING)...");
      logProviderContext(safeMessages, "rag");

      const response = await callRAGAPI(
        safeMessages,
        isBusinessRelated,
        activeRole
      );

      logger.info("✅ [RAG] SUCCESS (STREAMING)", {
        provider: "rag",
      });

      // Return the Response object directly for streaming
      return response;

    } catch (error) {
      logger.warn("❌ [RAG] FAILED:", {
        provider: "rag",
        error: error instanceof Error ? error.message : String(error),
        fallbackTo: "gemini-stream",
      });
    }

    // 2) TRY GEMINI STREAM (FALLBACK 1)
    if (apiKeys.gemini) {
      try {
        // capture a non-null asserted copy of the key for use inside nested functions
        const geminiKey = apiKeys.gemini!;

        logger.info("🔄 [GEMINI STREAM] Starting stream...");
        const stream = new ReadableStream({
          async start(controller) {
            try {
              await streamGeminiResponse({
                messages: safeMessages,
                apiKey: geminiKey,
                isBusinessRelated,
                activeRole,
                onChunk: (chunk: string) => {
                  controller.enqueue(new TextEncoder().encode(chunk));
                },
                onError: (err: unknown) => {
                  logger.error("🔥 Gemini Stream Error", err);
                  controller.error(err);
                },
                onComplete: () => {
                  controller.close();
                },
              });
            } catch (err) {
              controller.error(err);
            }
          },
        });

        // 👇 return directly as a streaming response
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (err) {
        logger.warn("❌ Gemini stream failed:", err);
      }
    }

    // 3) Gemini Stream (Non-streaming fallback from original file, kept as-is)
    if (apiKeys.gemini) {
      try {
        logger.info("🔄 [GEMINI STREAM] Attempting secondary provider...");
        logProviderContext(safeMessages, "gemini");

        const startTime = Date.now();
        let streamedOutput = "";
        let chunkCount = 0;

        await streamGeminiResponse({
          messages: safeMessages,
          apiKey: apiKeys.gemini,
          isBusinessRelated,
          activeRole,

          onChunk: (chunk: string) => {
            chunkCount++;
            streamedOutput += chunk;
            // Only log chunk details in development
            if (process.env.NODE_ENV === 'development') {
              logger.debug(`[GEMINI STREAM] Chunk ${chunkCount} (${streamedOutput.length} chars)`);
            }
          },

          onError: (err: unknown) => {
            logger.error("❌ [GEMINI STREAM] Error during streaming", {
              message: err instanceof Error ? err.message : String(err),
              stack: err instanceof Error ? err.stack : undefined,
            });
          },

          onComplete: (finalText: string) => {
            logger.info("✅ [GEMINI STREAM] Stream complete", {
              totalLength: finalText.length,
              chunksReceived: chunkCount,
            });
          },
        });

        const duration = Date.now() - startTime;
        const safeOutput = streamedOutput.trim();

        logger.info("✅ [GEMINI STREAM] SUCCESS", {
          provider: "gemini-stream",
          responseTime: `${duration}ms`,
          responseLength: safeOutput.length,
          confidence: 95,
          totalChunks: chunkCount,
        });

        return {
          content: safeOutput,
          provider: "gemini-stream",
          confidence: 95,
        };
      } catch (error) {
        logger.warn("❌ [GEMINI STREAM] FAILED", {
          provider: "gemini-stream",
          error: error instanceof Error ? error.message : String(error),
          fallbackTo: "groq",
        });

        return {
          content: "",
          provider: "gemini-stream",
          confidence: 0,
        };
      }
    }

    // 4) Gemini (Non-streaming fallback)
    if (apiKeys.gemini) {
      try {
        logger.info("🔄 [GEMINI] ATTEMPTING SECONDARY PROVIDER...");
        logProviderContext(safeMessages, "gemini");

        const startTime = Date.now();
        const response = await callGeminiAPI(
          safeMessages,
          apiKeys.gemini,
          isBusinessRelated,
          activeRole
        );
        const duration = Date.now() - startTime;

        const { cleaned } = response;

        logger.info("✅ [GEMINI] SUCCESS:", {
          provider: "gemini",
          responseTime: `${duration}ms`,
          responseLength: cleaned.length,
          confidence: 95,
        });

        return {
          content: cleaned,
          provider: "gemini",
          confidence: 95,
        };
      } catch (error) {
        logger.warn("❌ [GEMINI] FAILED:", {
          provider: "gemini",
          error: error instanceof Error ? error.message : String(error),
          fallbackTo: "groq",
        });
      }
    }

    // 5) Groq (tertiary)
    if (apiKeys.groq) {
      try {
        logger.info("🔄 [GROQ] ATTEMPTING TERTIARY PROVIDER...");
        logProviderContext(safeMessages, "groq");

        const startTime = Date.now();
        const response = await callGroqAPI(
          safeMessages,
          apiKeys.groq,
          isBusinessRelated,
          activeRole
        );
        const duration = Date.now() - startTime;

        const { cleaned } = response;

        logger.info("✅ [GROQ] SUCCESS:", {
          provider: "groq",
          responseTime: `${duration}ms`,
          responseLength: cleaned.length,
          confidence: 95,
        });

        return {
          content: cleaned,
          provider: "groq",
          confidence: 95,
        };
      } catch (error) {
        logger.warn("❌ [GROQ] FAILED:", {
          provider: "groq",
          error: error instanceof Error ? error.message : String(error),
          fallbackTo: "xai",
        });
      }
    }

    // 6) XAI (quaternary)
    if (apiKeys.xai) {
      try {
        logger.info("🔄 [XAI] ATTEMPTING QUATERNARY PROVIDER...");
        logProviderContext(safeMessages, "xai");

        const startTime = Date.now();
        const response = await callXAIAPI(
          safeMessages,
          apiKeys.xai,
          isBusinessRelated,
          activeRole
        );
        const duration = Date.now() - startTime;

        logger.info("✅ [XAI] SUCCESS:", {
          provider: "xai",
          responseTime: `${duration}ms`,
          responseLength: response.length,
          confidence: 90,
        });

        return {
          content: response,
          provider: "xai",
          confidence: 90,
        };
      } catch (error) {
        logger.warn("❌ [XAI] FAILED:", {
          provider: "xai",
          error: error instanceof Error ? error.message : String(error),
          fallbackTo: "none",
        });
      }
    }

    // Nothing worked → allow caller to trigger a UI/LLM fallback
    logger.error("💥 ALL PROVIDERS FAILED - NO FALLBACK AVAILABLE");
    throw new Error("No API providers available");
  }

  /**
   * Returns string identifiers for available providers based on configured keys.
   */
  static getAvailableProviders(): string[] {
    const apiKeys = getAvailableAPIKeys();
    const providers: string[] = [];

    // Add RAG as it's our primary
    providers.push("rag");
    if (apiKeys.openai) providers.push("openai");
    if (apiKeys.gemini) providers.push("gemini");
    if (apiKeys.groq) providers.push("groq");
    if (apiKeys.xai) providers.push("xai");

    return providers;
  }
}