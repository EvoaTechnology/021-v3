// import { API_ENDPOINTS } from "../config/api-config";
// import { logger } from "../utils/logger";

// import type { ProviderMessage } from "../../types/shared";


// export async function callRAGAPI(
//   messages: ProviderMessage[],
//   isBusinessRelated: boolean,
//   activeRole: string
// ): Promise<{ cleaned: string }> {
//   const safeMessages = (messages || [])
//     .map((m) => ({
//       role: m?.role ?? "user",
//       content:
//         typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
//     }))
//     .filter((m) => m.content.trim().length > 0);

//   if (safeMessages.length === 0) {
//     throw new Error("RAG API call failed: No valid messages found.");
//   }

  
//   const requestBody = {
//     messages: safeMessages, 
//     activeRole,             
//   };

//   logger.info("📤 [RAG] API REQUEST DETAILS:", {
//     endpoint: API_ENDPOINTS.rag,
//     messageCount: safeMessages.length,
//     activeRole,
//   });

//   const response = await fetch(API_ENDPOINTS.rag, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(requestBody),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     logger.error("❌ [RAG] API ERROR:", {
//       status: response.status,
//       statusText: response.statusText,
//       errorText: errorText.substring(0, 500),
//     });
//     throw new Error(`RAG API error: ${response.status} - ${errorText}`);
//   }

//   const data = await response.json();
//   const raw = data?.answer ?? data?.response ?? data?.result ?? "";

//   if (typeof raw !== "string" || raw.trim().length === 0) {
//     throw new Error("Invalid RAG API response: No text content found.");
//   }

//   return { cleaned: raw.trim() };
// }


import { API_ENDPOINTS } from "../config/api-config";
import { logger } from "../utils/logger";
 
import type { ProviderMessage } from "../../types/shared";
 
 
export async function callRAGAPI(
  messages: ProviderMessage[],
  isBusinessRelated: boolean,
  activeRole: string
): Promise<Response> { // MODIFIED: Return type is now Promise<Response>
  const safeMessages = (messages || [])
    .map((m) => ({
      // RAG backend expects 'user' or 'assistant'
      role: m?.role === "system" ? "user" : (m?.role ?? "user"),
      content:
        typeof m?.content === "string" ? m.content : String(m?.content ?? ""),
    }))
    .filter((m) => m.content.trim().length > 0);
 
  if (safeMessages.length === 0) {
    throw new Error("RAG API call failed: No valid messages found.");
  }
 
  
  const requestBody = {
    messages: safeMessages, 
    activeRole,             
  };
 
  logger.info("📤 [RAG] API REQUEST DETAILS:", {
    endpoint: API_ENDPOINTS.rag,
    messageCount: safeMessages.length,
    activeRole,
  });
 
  const response = await fetch(API_ENDPOINTS.rag, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
 
  if (!response.ok) {
    const errorText = await response.text();
    logger.error("❌ [RAG] API ERROR:", {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500),
    });
    throw new Error(`RAG API error: ${response.status} - ${errorText}`);
  }
 
  // MODIFIED: Return the raw response object for streaming
  return response;
}