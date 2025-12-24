import { NextRequest, NextResponse } from "next/server";
import { API_ENDPOINTS, GENERATION_CONFIG } from "../../../lib/config/api-config";
import { logger } from "../../../lib/utils/logger";

function mapRoleToGemini(role: string): "user" | "model" {
    if (role === "assistant") return "model";
    return "user";
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "messages array is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            logger.warn("⚠️ [INVESTOR_SIMULATOR] GEMINI_API_KEY missing");
            // Fallback response when no API key
            return NextResponse.json({
                message: "I'm ready to discuss your startup. However, the AI service is currently unavailable. Please check your API configuration."
            });
        }

        try {
            // Extract system instruction and conversation messages
            const systemMessage = messages.find((m: any) => m.role === "system");
            const conversationMessages = messages.filter((m: any) => m.role !== "system");

            // Build Gemini request
            const requestBody = {
                system_instruction: systemMessage ? {
                    parts: [{ text: systemMessage.content }]
                } : undefined,
                contents: conversationMessages.map((msg: any) => ({
                    role: mapRoleToGemini(msg.role),
                    parts: [{ text: msg.content }]
                })),
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 500,
                    topP: 0.95,
                }
            };

            logger.info("📤 [INVESTOR_SIMULATOR] Gemini API Request", {
                messageCount: conversationMessages.length,
                hasSystemInstruction: !!systemMessage
            });

            const response = await fetch(`${API_ENDPOINTS.gemini}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error("❌ [INVESTOR_SIMULATOR] Gemini API error", {
                    status: response.status,
                    error: errorText.substring(0, 200)
                });
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();

            const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiMessage || typeof aiMessage !== "string" || aiMessage.trim().length === 0) {
                logger.error("❌ [INVESTOR_SIMULATOR] Invalid Gemini response", {
                    responseData: data
                });
                throw new Error("Invalid Gemini API response: No text content found");
            }

            logger.info("✅ [INVESTOR_SIMULATOR] Response generated", {
                responseLength: aiMessage.length
            });

            return NextResponse.json({ message: aiMessage.trim() });
        } catch (error: any) {
            logger.error("❌ [INVESTOR_SIMULATOR] Gemini API call failed", error);

            // Return a helpful error message
            return NextResponse.json({
                message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
            });
        }
    } catch (error) {
        logger.error("❌ [INVESTOR_SIMULATOR] Request handler failed", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
