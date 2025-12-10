export type AppRole = "user" | "ai" | "assistant" | "system";

export interface ChatMessage {
    _id?: string;
    id?: string; // For compatibility
    role: AppRole;
    content: string;
    sessionId?: string;
    activeRole?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    timestamp?: Date | string; // For compatibility with local state
}

export interface ChatSession {
    _id?: string;
    userId: string;
    topic: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AIChatRequest {
    messages: ProviderMessage[];
    activeRole: string;
    sessionId?: string;
    userId?: string;
}

export interface AIChatResponse {
    content: string;
    provider: string;
    confidence: number;
    userMessageId?: string;
    isBusinessRelated?: boolean;
    activeRole?: string;
    storedToDB?: boolean;
}

export interface ProviderMessage {
    role: AppRole;
    content: string;
    roleContext?: string;
}

export type SupportedLang = "html" | "jsx" | "js" | "css";

export interface MatchRef {
    messageId: string;
    start: number;
    end: number;
    occurrenceInMessage: number;
}
