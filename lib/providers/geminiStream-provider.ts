"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText, type ModelMessage } from "ai";
import { buildSystemPrompt } from "../services/personaDescription-service";
import { GENERATION_CONFIG } from "../config/api-config";
import { logger } from "../utils/logger";
import type { ProviderMessage } from "../../types/shared";

/**
 * Normalize messages for AI SDK
 */
function normalizeMessages(messages: ProviderMessage[]): ModelMessage[] {
  return (messages || [])
    .filter((m) => typeof m?.content === "string" && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.trim(),
    }));
}

/**
 * Build the full system instruction text for Gemini
 */
function getSystemInstruction(activeRole: string): string {
  const systemPrompt = buildSystemPrompt(activeRole);
  logger.debug("🧠 [GEMINI] System instruction built", {
    preview: systemPrompt.slice(0, 120),
  });
  return systemPrompt;
}


/**
 * Stream real-time text chunks from Gemini
 */
export async function streamGeminiResponse({
  messages,
  apiKey,
  activeRole,
  isBusinessRelated: _isBusinessRelated,
  onChunk,
  onError,
  onComplete,
}: {
  messages: ProviderMessage[];
  apiKey: string;
  activeRole: string;
  isBusinessRelated?: boolean;
  onChunk?: (chunk: string) => void;
  onError?: (err: unknown) => void;
  onComplete?: (finalText: string) => void;
}) {
  try {
    void _isBusinessRelated;
    logger.info("🚀 [GEMINI] Starting streaming response");

    // 🧠 Inject system prompt first
    const systemInstruction = getSystemInstruction(activeRole);
    const allMessages: ModelMessage[] = [
      { role: "system", content: systemInstruction },
      ...normalizeMessages(messages),
    ];

    logger.debug("📨 [GEMINI STREAM] Message stack built", {
      totalMessages: allMessages.length,
    });

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("gemini-2.5-flash");

    const result = await streamText({
      model,
      messages: allMessages,
      temperature: GENERATION_CONFIG.gemini.temperature,
      topP: GENERATION_CONFIG.gemini.topP,
      maxOutputTokens: GENERATION_CONFIG.gemini.maxOutputTokens,
    });

    let finalText = "";
    let chunkCount = 0;
    let charCount = 0;

    for await (const delta of result.textStream) {
      chunkCount++;
      finalText += delta;
      charCount += delta.length;

      if (chunkCount % 5 === 0 || delta.length > 80) {
        logger.debug("💬 [GEMINI STREAM] Chunk snapshot", {
          chunkIndex: chunkCount,
          preview: delta.slice(0, 80).replace(/\s+/g, " "),
        });
      }

      onChunk?.(delta);
    }

    logger.info("✅ [GEMINI STREAM COMPLETE]", {
      chunks: chunkCount,
      characters: charCount,
    });
    onComplete?.(finalText);

    return finalText;
  } catch (err) {
    logger.error("❌ [GEMINI STREAM ERROR]", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    onError?.(err);
    throw err;
  }
}


export async function callGeminiOnce({
  messages,
  apiKey,
  activeRole,
}: {
  messages: ProviderMessage[];
  apiKey: string;
  activeRole: string;
}): Promise<{ content: string }> {
  const systemInstruction = getSystemInstruction(activeRole);
  const normalized = normalizeMessages(messages);

  try {
    logger.info("🧠 [GEMINI] Starting non-streaming call");

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("gemini-2.5-flash");

    const { text } = await generateText({
      model,
      messages: [{ role: "system", content: systemInstruction }, ...normalized],
      temperature: GENERATION_CONFIG.gemini.temperature,
      topP: GENERATION_CONFIG.gemini.topP,
      maxOutputTokens: GENERATION_CONFIG.gemini.maxOutputTokens,
    });

    const cleaned = text
      .replace(/\[HISTORY\]/gi, "")
      .replace(/\[CURRENT\]/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    logger.info("✅ [GEMINI] Non-streaming complete", {
      length: cleaned.length,
      preview: cleaned.slice(0, 180),
    });

    return { content: cleaned };
  } catch (err) {
    logger.error("❌ [GEMINI] Non-streaming error", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}
/**
 * Generate a short chat title (2–3 words)
 */
export async function generateGeminiTitle(apiKey: string, userMessage: string) {
  const google = createGoogleGenerativeAI({ apiKey });
  const model = google("gemini-2.5-flash");

  const systemPrompt =
    "You are a helpful assistant that creates short, meaningful chat titles (2–3 words). If the message is just greetings, return 'Greeting'.";

  try {
    logger.info("🧠 [GEMINI] Generating title");

    const { text } = await generateText({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      maxOutputTokens: 50,
    });

    const title = text.trim().replace(/^['"]|['"]$/g, "");
    logger.info("✅ [GEMINI] Title generated", { title });
    return title;
  } catch (err) {
    logger.error("❌ [GEMINI] Title generation failed", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}
