import React, { memo } from "react";
import Image, { StaticImageData } from "next/image";
import { Copy, MonitorPlay } from "lucide-react";
import AIResponseRenderer from "../ui/AIResponseRenderer";
import { ChatMessage, SupportedLang } from "@/types/chat.types";
import { extractFirstCodeBlock, buildSrcDoc } from "@/lib/chat/chat-utils";

interface MessageItemProps {
    message: ChatMessage;
    messageId: string;
    showRoleAvatar: boolean;
    roleMeta: { img: StaticImageData | string; border: string; label: string } | null;
    getAdvisorHexColor: (role: string) => string;
    onCopy: (text: string) => void;
    onTogglePreview: (id: string) => void;
    isPreviewOpen: boolean;
    setMessageRef: (el: HTMLDivElement | null) => void;
    setContentRef: (el: HTMLDivElement | null) => void;
}

const ChatMessageItem = memo(function ChatMessageItem({
    message,
    messageId,
    showRoleAvatar,
    roleMeta,
    getAdvisorHexColor,
    onCopy,
    onTogglePreview,
    isPreviewOpen,
    setMessageRef,
    setContentRef,
}: MessageItemProps) {
    const { lang, code } = extractFirstCodeBlock(message.content || "");
    const canPreview =
        message.role !== "user" && !!lang && !!code && ["html", "jsx", "js", "css"].includes(lang);

    return (
        <div
            ref={setMessageRef}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`flex items-start gap-2 md:gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                    }`}
            >
                {showRoleAvatar && roleMeta && (
                    <div className="shrink-0 flex items-start pt-1">
                        <div
                            className="h-7 w-7 rounded-full overflow-hidden"
                            style={{
                                border: `2px solid ${roleMeta.border}`,
                                boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                            }}
                            title={roleMeta.label}
                        >
                            <Image
                                src={roleMeta.img}
                                alt={roleMeta.label}
                                className="h-full w-full object-cover rounded-full"
                            />
                        </div>
                    </div>
                )}

                <div
                    className={`rounded-lg px-3 py-2 break-words ${message.role === "user"
                        ? "bg-[#2A2A2A] border border-white/10 max-w-[80vw] md:max-w-xl"
                        : message.activeRole &&
                            String(message.activeRole).toLowerCase() !== "idea-validator"
                            ? "max-w-[90vw] md:max-w-4xl border-l-4"
                            : "max-w-[90vw] md:max-w-4xl"
                        } text-white`}
                    style={{
                        borderLeftColor:
                            message.activeRole &&
                                String(message.activeRole).toLowerCase() !== "idea-validator"
                                ? getAdvisorHexColor(String(message.activeRole))
                                : showRoleAvatar && message.activeRole // fallback if needed
                                    ? getAdvisorHexColor(String(message.activeRole))
                                    : undefined,
                    }}
                >
                    <div className="text-sm leading-5 ai-md" ref={setContentRef}>
                        <AIResponseRenderer content={message.content} />

                        {/* Code Actions */}
                        {message.role !== "user" && code && (
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => onCopy(code)}
                                    className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
                                    title="Copy code"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy
                                </button>

                                {canPreview && (
                                    <button
                                        onClick={() => onTogglePreview(messageId)}
                                        className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
                                        title="Preview code"
                                    >
                                        <MonitorPlay className="h-3.5 w-3.5" />
                                        {isPreviewOpen ? "Hide Preview" : "Preview"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Preview Area */}
                        {canPreview && isPreviewOpen && code && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                <iframe
                                    className="w-full h-64 md:h-96 bg-white"
                                    sandbox="allow-scripts allow-same-origin"
                                    srcDoc={buildSrcDoc(lang as SupportedLang, code)}
                                />
                                <div className="px-2 py-1 text-[10px] text-white/50 bg-black/30 border-t border-white/10">
                                    Rendering {lang?.toUpperCase()} in a sandboxed preview
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ChatMessageItem;
