"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image, { StaticImageData } from "next/image";
import {
  Trash, Send, Plus, MessageSquare, Lightbulb,
  ArrowLeftToLine, ArrowRightToLine, UserRound, LogOut,
  ChevronDown, ChevronUp, Settings, Sun, Moon, Mic, Presentation,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

import { useAuthStore } from "../store/authStore";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import UpgradeModal from "@/components/ui/UpgradeModal";
import TrialBanner from "@/components/ui/TrialBanner";
import { useChatStore } from "../store/chatStore";
import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
import { useToast } from "../../components/ui/Toast";
import ChatMessageItem from "../../components/chat/ChatMessageItem";
import PitchroomPage from "../../components/pitchroom/PitchroomPage";

import { ChatMessage as Message, AIChatRequest, AIChatResponse, MatchRef } from "@/types/chat.types";
import {
  normalizeForProvider,
  findAllMatchesInMessages,
  wantsCodeFromText,
  systemInstructionForRole,
} from "@/lib/chat/chat-utils";

import profile from "../../public/ceo-1.png";
import proBg from "../../public/proBg.png";
import CEOImage from "../../public/ceo-1.png";
import CFOImage from "../../public/cfo-1.png";
import CMOImage from "../../public/cmo-1.png";
import CTOImage from "../../public/cto-1.png";








interface AITitleResponse {
  title: string;
}

type PreviewState = Record<string, boolean>;
const DEFAULT_STORE_KEY = "idea-validator";

// Role mapping: UI display names <-> store keys
const roleToStoreKey: Record<string, string> = {
  "Idea Validator": "idea-validator",
  "CEO": "ceo",
  "CFO": "cfo",
  "CTO": "cto",
  "CMO": "cmo",
};
const storeKeyToRole: Record<string, string> = {
  "idea-validator": "Idea Validator",
  "ceo": "CEO",
  "cfo": "CFO",
  "cto": "CTO",
  "cmo": "CMO",
};

const advisorColors: Record<string, string> = {
  ceo: "blue",
  cfo: "green",
  cto: "purple",
  cmo: "pink",
};

const getAdvisorColor = (roleName: string): string => {
  return advisorColors[roleName.toLowerCase()] || "gray";
};

const getAdvisorHexColor = (roleName: string): string => {
  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#8b5cf6",
    pink: "#ec4899",
    gray: "#6b7280",
  };
  const colorKey = getAdvisorColor(roleName);
  return colorMap[colorKey] || colorMap.gray;
};

// helper: accept either display name or store key and return store key
const getStoreKey = (displayOrKey?: string | null) => {
  if (!displayOrKey) return DEFAULT_STORE_KEY;
  return roleToStoreKey[displayOrKey] || displayOrKey;
};

/** ---------- Component ---------- **/
export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "pitchroom">("chat");
  const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
  const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [proUser] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);



  // Role mapping: UI display names <-> store keys


  // --- Additive: which message(s) have preview toggled open ---
  const [openPreviews, setOpenPreviews] = useState<PreviewState>({});
  const togglePreview = useCallback((id: string) => {
    setOpenPreviews(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Additive: copy helper
  const copyText = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({ variant: "success", title: "Copied to clipboard" });
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Copy failed", description: "Please copy manually." });
    }
  }, [toast]);

  // C-Suite Advisor States
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const replyingAdvisor: string | null = null;
  const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
  const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(new Set());


  const { user, checkAuth } = useAuthStore();
  const { canCreateChat, isRestricted, canSendMessage } = useAccessControl();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { setTheme } = useTheme();


  const {
    chatSessions,
    currentSessionId,
    messages,
    currentActiveRole,
    isLoading,
    error,
    loadChatSessions,
    createNewChatSession,
    selectChatSession,
    addMessage,
    deleteChatSession,
    updateSessionTopic,
    clearError,
    setActiveRole,
  } = useChatStore();

  // Get display role from store key
  const activeRole = storeKeyToRole[currentActiveRole] || "Idea Validator";

  // Rename state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState("");

  const handleRenameSession = useCallback(async () => {
    if (!editingSessionId || !editingTopic.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await updateSessionTopic(editingSessionId, editingTopic.trim());
      setEditingSessionId(null);
      setEditingTopic("");
    } catch (error) {
      console.error("Failed to rename session:", error);
      toast({ variant: "error", title: "Rename failed" });
    }
  }, [editingSessionId, editingTopic, updateSessionTopic, toast]);

  const startRenaming = useCallback((sessionId: string, currentTopic: string) => {
    setEditingSessionId(sessionId);
    setEditingTopic(currentTopic || "New Chat");
  }, []);

  // Messages are authoritative from store; keep local copy for UI and optimistic updates
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        setSidebarOpenLeft(false);
        setSidebarOpenRight(false);
      } else {
        setSidebarOpenLeft(true);
        setSidebarOpenRight(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * DISPLAY FILTERING FIX
   * - When currentActiveRole is 'idea-validator' -> show messages with no activeRole or activeRole === 'idea-validator'
   * - When currentActiveRole is an advisor store key (e.g. 'cto') -> show ONLY messages with activeRole === that store key
   * This prevents Idea Validator messages from appearing in advisor views.
   */
  const displayMessages = useMemo(() => {
    const storeKey = currentActiveRole || DEFAULT_STORE_KEY;
    if (storeKey === "idea-validator") {
      return localMessages.filter((msg) => {
        if (!msg) return false;
        if (!msg.activeRole) return true;
        const r = String(msg.activeRole).toLowerCase();
        return r === "idea-validator" || r === "idea validator";
      });
    } else {
      return localMessages.filter((msg) => {
        if (!msg) return false;
        const r = String(msg.activeRole || "").toLowerCase();
        return r === storeKey;
      });
    }
  }, [localMessages, currentActiveRole]);

  const currentSession = chatSessions.find(
    (session) => session._id === currentSessionId
  );

  const createNewChat = useCallback(
    async (isAutoCreate = false) => {
      setViewMode("chat");
      if (!isAutoCreate && proUser) {
        router.push("/pricing");
        return;
      }
      if (!user?.id) {
        console.error("No user ID available");
        return;
      }
      try {
        const initialMessage = "Hello! I'm your 021 AI. How can I help you today?";
        await createNewChatSession(user.id, "New Chat", initialMessage);
        if (isAutoCreate) {
          const welcomeMessage: Message = {
            _id: Date.now().toString() + "_welcome",
            role: "ai",
            content: initialMessage,
            timestamp: new Date(),
            activeRole: getStoreKey(activeRole),
          };
          setLocalMessages([welcomeMessage]);
          setActiveRole("idea-validator"); // Store key
          setActiveAdvisor(null);
          // don't clear clickedAdvisors here — keep history so user can re-select advisors
        }
      } catch (error) {
        console.error("Failed to create new chat:", error);
        toast({
          variant: "error",
          title: "Could not create chat",
          description: "Please try again in a moment.",
        });
      }
    },
    [proUser, router, user?.id, createNewChatSession, toast, activeRole, setActiveRole]
  );

  const handleCreateNewChat = useCallback(() => {
    createNewChat(false);
  }, [createNewChat]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/logout", { method: "GET" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const handleNavigateToPricing = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  const handleCloseSidebarleft = useCallback(() => {
    setSidebarOpenLeft(false);
  }, []);
  const handleOpenSidebarleft = useCallback(() => {
    setSidebarOpenLeft(true);
  }, []);
  const handleCloseSidebarright = useCallback(() => {
    setSidebarOpenRight(false);
  }, []);
  const handleOpenSidebarright = useCallback(() => {
    setSidebarOpenRight(true);
  }, []);

  /**
   * FIX: advisor click should persist the chosen advisor for the current session
   * and must remain selectable even after toggling to idea-validator.
   *
   * IMPORTANT CHANGE:
   * - Previously the handler blocked clicks when thinkingAdvisor === advisorKey.
   *   That prevented re-selecting an advisor that was mid-think, causing the "stuck" issue.
   * - Now we only prevent selection if replyingAdvisor === advisorKey (i.e. a final reply is in progress).
   * - We also clear thinkingAdvisor when a user explicitly clicks a different advisor to ensure UI becomes interactive.
   */
  const handleAdvisorClick = useCallback(
    (advisorKey: string) => {
      // allow click even if thinking — user must be able to re-open that advisor
      if (replyingAdvisor === advisorKey) return;

      const storeKey = advisorKey.toLowerCase();

      // If selecting a different advisor, clear thinking state (user intentionally switched)
      setThinkingAdvisor((prev) => (prev && prev !== advisorKey ? null : prev));

      // set store active role immediately
      setActiveRole(storeKey);
      // update UI advisor selection immediately
      setActiveAdvisor(advisorKey);
      // keep history of clicked advisors so UI can show visited state
      setClickedAdvisors((prev) => {
        const next = new Set(Array.from(prev));
        next.add(advisorKey);
        return next;
      });
      // persist selection per session so switching sessions preserves advisor
      try {
        if (typeof window !== "undefined" && currentSessionId) {
          localStorage.setItem(`activeRole:${currentSessionId}`, storeKey);
        }
      } catch {
        // ignore
      }
    },
    [replyingAdvisor, setActiveRole, currentSessionId]
  );

  const handleSelectChatSession = useCallback(
    async (sessionId: string) => {
      setViewMode("chat");
      try {
        // Load persisted advisor selection for this session
        let persistedRole: string | null = null;
        if (typeof window !== "undefined") {
          persistedRole = localStorage.getItem(`activeRole:${sessionId}`);
        }

        // Use persisted role or default to idea-validator
        const roleToLoad = persistedRole || "idea-validator";

        // Load messages with role filter
        await selectChatSession(sessionId, roleToLoad);

        const session = chatSessions.find((s) => s._id === sessionId);
        if (session) {
          // Restore advisor UI state from persisted role
          if (persistedRole && persistedRole !== "idea-validator") {
            const advisorKey = persistedRole;
            setActiveAdvisor(advisorKey);
            setClickedAdvisors((prev) => {
              const next = new Set(Array.from(prev));
              next.add(advisorKey);
              return next;
            });
          } else {
            // Check messages for last used advisor
            const allMessages = messages;
            const lastMessageWithRole = allMessages
              .filter((msg) => {
                const mRole = msg.activeRole;
                const msgRole = typeof mRole === "string" ? mRole.toLowerCase() : mRole;
                return msgRole && msgRole !== "idea-validator";
              })
              .pop();

            if (lastMessageWithRole?.activeRole) {
              const msgRoleKey = String(lastMessageWithRole.activeRole).toLowerCase();
              setActiveRole(msgRoleKey);
              const advisorKey = msgRoleKey;
              setActiveAdvisor(advisorKey);
              setClickedAdvisors((prev) => {
                const next = new Set(Array.from(prev));
                next.add(advisorKey);
                return next;
              });
              if (typeof window !== "undefined") {
                localStorage.setItem(`activeRole:${sessionId}`, msgRoleKey);
              }
            } else {
              setActiveRole("idea-validator");
              setActiveAdvisor(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to select chat session:", error);
        toast({
          variant: "error",
          title: "Could not load chat",
          description: "Please try again.",
        });
      }
    },
    [selectChatSession, chatSessions, messages, setActiveRole, toast]
  );

  const dynamicTitle = useCallback(
    async (messages: Message): Promise<string> => {
      const userMsg = messages.content;
      try {
        const response = await fetch("/api/ai-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMsg }),
        });
        const data: AITitleResponse = await response.json();
        return data.title;
      } catch (error) {
        console.error("error in dynamicTitle", error);
        return "Error generating title";
      }
    },
    []
  );

  // ---------- UPDATED handleSendMessage (keeps store key in activeRole and prepends system instr) ----------
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id) return;

    // Use store key (not display name) for persistence/context
    const storeRoleKey = roleToStoreKey[activeRole] || "idea-validator";

    // Create user message locally — use storeRoleKey in activeRole to remain consistent
    const userMessage: Message = {
      _id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      // store key so server and UI share same context
      activeRole: storeRoleKey,
    };

    const newMessages = [...localMessages, userMessage];

    const requestMessagesBase: Message[] = newMessages;

    if (currentSession?.topic === "New Chat") {
      try {
        const title = (await dynamicTitle(userMessage)) || "new chat";
        await updateSessionTopic(currentSessionId, title);
      } catch (error) {
        console.error("Failed to update session topic:", error);
      }
    }

    try {
      // Store activeRole with message (only for advisors, not idea-validator)
      await addMessage(
        inputValue.trim(),
        "user",
        currentSessionId,
        storeRoleKey !== "idea-validator" ? storeRoleKey : undefined
      );
    } catch (error) {
      console.error("Failed to save user message:", error);
    }

    setLocalMessages(newMessages);

    setInputValue("");
    setIsTyping(true);
    // Keep focus in input even if button was clicked
    setTimeout(() => inputRef.current?.focus(), 0);

    // Set thinking state for selected advisor (if any)
    if (activeAdvisor) {
      setThinkingAdvisor(activeAdvisor);
    }

    // Detect if this user explicitly asked for code
    const userWantsCode = wantsCodeFromText(inputValue);

    // Build normalized messages for provider
    let providerMessages = normalizeForProvider(requestMessagesBase);

    // Prepend a system instruction to guide the assistant, especially for CTO / code requests
    const sys = systemInstructionForRole(storeRoleKey, userWantsCode);
    if (sys) {
      providerMessages = [{ role: "system", content: sys }, ...providerMessages];
    }

    const requestBody: AIChatRequest = {
      activeRole: storeRoleKey, // send store key so the backend knows the role
      messages: providerMessages,
      sessionId: currentSessionId,
      userId: user.id,
    };

    try {
      setIsTyping(true);

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to connect to AI service");
      if (!response.body) throw new Error("No response stream from AI");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalText = "";

      // Add streaming placeholder
      setLocalMessages((prev) => [
        ...prev,
        {
          _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_stream`,
          role: "ai",
          content: "",
          timestamp: new Date(),
          activeRole: storeRoleKey, // ensure activeRole stored consistently
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        finalText += chunk;

        setLocalMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = finalText;
          return updated;
        });
      }

      if (!finalText.trim()) {
        finalText = "⚠️ No response received from AI.";
      }

      // Finalize streamed message
      setLocalMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = finalText;
        return updated;
      });
    } catch (err) {
      console.error("❌ Stream error:", err);
      toast({
        variant: "error",
        title: "Message failed",
        description: "AI service temporarily unavailable.",
      });
    } finally {
      // Always clear typing + thinking state when done (success or fail)
      setIsTyping(false);
      // Restore focus to input
      setTimeout(() => inputRef.current?.focus(), 10);
      setThinkingAdvisor(null);
    }
  }, [
    inputValue,
    isTyping,
    currentSessionId,
    user?.id,
    localMessages,
    currentSession?.topic,
    activeRole,
    activeAdvisor,
    updateSessionTopic,
    addMessage,
    setLocalMessages,
    setInputValue,
    setIsTyping,
    dynamicTitle,
    toast,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Prevent submission if already typing
        if (isTyping) return;
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage, isTyping]
  );

  const handleDeleteChatSession = useCallback(
    async (sessionId: string) => {
      try {
        if (chatSessions.length === 1) {
          toast({
            variant: "warning",
            title: "Cannot delete",
            description:
              "You can't delete the last chat. Please create another chat first.",
          });
          return;
        }

        const confirmed = window.confirm(
          "Delete this chat session? This action cannot be undone."
        );
        if (!confirmed) return;

        setDeletingSessionId(sessionId);
        await deleteChatSession(sessionId);
      } catch (error) {
        console.error("Failed to delete chat session:", error);
        toast({
          variant: "error",
          title: "Delete failed",
          description: "We couldn't delete the chat. Please try again.",
        });
      } finally {
        setDeletingSessionId(null);
      }
    },
    [chatSessions.length, deleteChatSession, toast]
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newChatMessage = sessionStorage.getItem("newChatMessage");
      const shouldCreateNewChat =
        sessionStorage.getItem("createNewChat") === "true";

      if (newChatMessage) {
        sessionStorage.removeItem("newChatMessage");
        sessionStorage.removeItem("createNewChat");

        const generateTitle = async () => {
          try {
            if (shouldCreateNewChat && user?.id) {
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: newChatMessage.trim(),
                timestamp: new Date(),
                activeRole: getStoreKey(activeRole),
              };

              const title = await dynamicTitle(userMessage);

              const initialMessage =
                "Hello! I'm your 021 AI. How can I help you today?";
              await createNewChatSession(user.id, title, initialMessage);

              const welcomeMessage: Message = {
                _id: Date.now().toString() + "_welcome",
                role: "ai",
                content: initialMessage,
                timestamp: new Date(),
                activeRole: getStoreKey(activeRole),
              };
              setLocalMessages([welcomeMessage]);

              sessionStorage.setItem("newChatMessage", newChatMessage);
              return true;
            }
            return false;
          } catch (error) {
            console.error("Failed to generate title or create chat:", error);
            if (shouldCreateNewChat && user?.id) {
              createNewChat(true).then(() => {
                sessionStorage.setItem("newChatMessage", newChatMessage);
              });
              return true;
            }
            return false;
          }
        };

        if (shouldCreateNewChat && user?.id) {
          generateTitle().then((created) => {
            if (created) return;
          });
          return;
        }

        if (user?.id && currentSessionId) {
          const userMessage: Message = {
            _id: Date.now().toString(),
            role: "user",
            content: newChatMessage.trim(),
            timestamp: new Date(),
            activeRole: getStoreKey(activeRole),
          };

          const newMessages = [...localMessages, userMessage];
          setLocalMessages(newMessages);

          addMessage(newChatMessage.trim(), "user", currentSessionId).then(
            () => {
              const requestBody: AIChatRequest = {
                messages: normalizeForProvider(newMessages).map((m) => ({
                  role: m.role,
                  content: m.content,
                  roleContext: m.roleContext,
                })),
                activeRole: getStoreKey(activeRole),
                sessionId: currentSessionId,
                userId: user.id,
              };

              setIsTyping(true);

              fetch("/api/ai-chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              })
                .then(async (response) => {
                  if (!response.ok) {
                    throw new Error(
                      `API error: ${response.status} ${response.statusText}`
                    );
                  }

                  const contentType = response.headers.get("content-type") ?? "";

                  if (contentType.includes("application/json")) {
                    return (await response.json()) as AIChatResponse;
                  }

                  const text = await response.text();

                  return {
                    content: text || "",
                    provider: "gemini-stream",
                    confidence: 0,
                  } satisfies AIChatResponse;
                })
                .then((data: AIChatResponse) => {
                  const aiMessage: Message = {
                    _id: Date.now().toString() + "_ai",
                    role: "ai",
                    content: data.content,
                    timestamp: new Date(),
                    activeRole: getStoreKey(activeRole),
                  };

                  setLocalMessages((prev) => [...prev, aiMessage]);
                })
                .catch((error) => {
                  console.error("error in chat: ", error);

                  let errorMessage = "Unexpected error occurred.";

                  if (
                    error instanceof TypeError &&
                    String(error.message || "").includes("fetch")
                  ) {
                    errorMessage =
                      "Network error. Please check your connection and try again.";
                  } else if (
                    error instanceof Error &&
                    String(error.message || "").includes("API error")
                  ) {
                    errorMessage =
                      "AI service is temporarily unavailable. Please try again later.";
                  } else if (error instanceof Error && error.message) {
                    errorMessage = `Unexpected error: ${error.message}`;
                  } else {
                    errorMessage = `Unexpected error: ${String(error)}`;
                  }

                  addMessage(errorMessage, "ai", currentSessionId);

                  const errorMsg: Message = {
                    _id: Date.now().toString() + "_error",
                    role: "ai",
                    content: errorMessage,
                    timestamp: new Date(),
                    activeRole: getStoreKey(activeRole),
                  };

                  setLocalMessages((prev) => [...prev, errorMsg]);
                  toast({
                    variant: "error",
                    title: "Message failed",
                    description: errorMessage,
                  });
                })
                .finally(() => {
                  // clear states
                  setIsTyping(false);
                  // Restore focus to input
                  setTimeout(() => inputRef.current?.focus(), 10);
                  setThinkingAdvisor(null);
                });
            }
          );
        } else if (user?.id) {
          const tempMessage = newChatMessage;
          createNewChat(true).then(() => {
            setTimeout(() => {
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: tempMessage.trim(),
                timestamp: new Date(),
                activeRole: getStoreKey(activeRole),
              };

              const newMessages = [...localMessages, userMessage];
              setLocalMessages(newMessages);

              if (currentSessionId) {
                addMessage(tempMessage.trim(), "user", currentSessionId).then(
                  () => {
                    const requestBody: AIChatRequest = {
                      messages: normalizeForProvider(newMessages).map((m) => ({
                        role: m.role,
                        content: m.content,
                        roleContext: m.roleContext,
                      })),
                      activeRole: getStoreKey(activeRole),
                      sessionId: currentSessionId,
                      userId: user.id,
                    };

                    setIsTyping(true);

                    fetch("/api/ai-chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(requestBody),
                    })
                      .then((response) => response.json())
                      .then((data: AIChatResponse) => {
                        const aiMessage: Message = {
                          _id: Date.now().toString() + "_ai",
                          role: "ai",
                          content: data.content,
                          timestamp: new Date(),
                          activeRole: getStoreKey(activeRole),
                        };

                        setLocalMessages((prev) => [...prev, aiMessage]);
                      })
                      .catch((error) => {
                        console.error("error in chat: ", error);
                        const errorMessage = "Unexpected error occurred.";
                        const errorMsg: Message = {
                          _id: Date.now().toString() + "_error",
                          role: "ai",
                          content: errorMessage,
                          timestamp: new Date(),
                          activeRole: getStoreKey(activeRole),
                        };

                        setLocalMessages((prev) => [...prev, errorMsg]);
                      })
                      .finally(() => {
                        setIsTyping(false);
                        // Restore focus to input
                        setTimeout(() => inputRef.current?.focus(), 10);
                        setThinkingAdvisor(null);
                      });
                  }
                );
              }
            }, 1000);
          });
        }
      }
    }
  }, [
    user?.id,
    currentSessionId,
    createNewChat,
    localMessages,
    activeRole,
    createNewChatSession,
    dynamicTitle,
    addMessage,
    setLocalMessages,
    setIsTyping,
    toast,
  ]);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current && user?.id) {
      hasLoadedRef.current = true;
      loadChatSessions(user.id);
    }
  }, [user?.id, loadChatSessions]);

  const didAutoActionRef = useRef(false);
  useEffect(() => {
    if (didAutoActionRef.current) return;
    if (!user?.id || isLoading) return;
    if (!hasLoadedRef.current) return;

    if (!currentSessionId && chatSessions.length > 0) {
      didAutoActionRef.current = true;
      const mostRecentSession = chatSessions[0];
      handleSelectChatSession(mostRecentSession._id!);
    }
  }, [
    user?.id,
    chatSessions,
    isLoading,
    currentSessionId,
    handleSelectChatSession,
  ]);

  useEffect(() => {
    if (!user?.id) return;
    if (chatSessions.length > 0) {
      const key = `auto-create-${user.id}`;
      if (typeof window !== "undefined") sessionStorage.removeItem(key);
    }
  }, [user?.id, chatSessions.length]);

  useEffect(() => {
    if (currentSessionId && localMessages.length === 0 && !isLoading) {
      const currentSession = chatSessions.find((s) => s._id === currentSessionId);
      if (currentSession) {
        // messages will be loaded by the store
      }
    }
  }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    if (error) {
      console.error("Chat store error:", error);
      toast({ variant: "error", title: "Error", description: String(error) });
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError, toast]);

  /** ---------- Additive: Search state & behavior ---------- **/
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Refs to each rendered message container & its content block
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const matches: MatchRef[] = useMemo(
    () => findAllMatchesInMessages(displayMessages, searchQuery),
    [displayMessages, searchQuery]
  );

  const normalizedIndex = matches.length
    ? (currentMatchIndex % matches.length + matches.length) % matches.length
    : 0;

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setCurrentMatchIndex(0);
  }, []);

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const goToPrev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  // Highlight implementation
  const clearHighlights = useCallback((root: HTMLElement) => {
    const spans = root.querySelectorAll('span[data-search-highlight]');
    spans.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      const text = document.createTextNode(span.textContent || "");
      parent.replaceChild(text, span);
      parent.normalize();
    });
  }, []);

  const applyHighlightsInNode = useCallback((root: HTMLElement, q: string) => {
    if (!q) return 0;
    const query = q.toLowerCase();
    let count = 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node: Node) {
        if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
        const val = node.nodeValue.trim();
        if (!val) return NodeFilter.FILTER_REJECT;
        const parentEl = node.parentElement;
        if (!parentEl) return NodeFilter.FILTER_REJECT;
        const tag = parentEl.tagName.toLowerCase();
        if (tag === "code" || tag === "pre" || tag === "kbd" || tag === "samp") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes: Text[] = [];
    let cur = walker.nextNode();
    while (cur) {
      textNodes.push(cur as Text);
      cur = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      const original = textNode.nodeValue || "";
      const lower = original.toLowerCase();
      let from = 0;
      const pieces: (Text | HTMLSpanElement)[] = [];

      while (true) {
        const idx = lower.indexOf(query, from);
        if (idx === -1) break;
        if (idx > from) {
          pieces.push(document.createTextNode(original.slice(from, idx)));
        }
        const span = document.createElement("span");
        span.setAttribute("data-search-highlight", "1");
        span.style.background = "rgba(250,204,21,0.45)";
        span.style.borderRadius = "4px";
        span.style.padding = "0 2px";
        span.style.boxShadow = "0 0 0 0.5px rgba(0,0,0,0.15)";
        span.textContent = original.slice(idx, idx + query.length);
        pieces.push(span);
        count += 1;
        from = idx + query.length;
      }
      if (from < original.length) {
        pieces.push(document.createTextNode(original.slice(from)));
      }

      if (pieces.length) {
        const parent = textNode.parentNode!;
        pieces.forEach((p) => parent.insertBefore(p, textNode));
        parent.removeChild(textNode);
      }
    });

    return count;
  }, []);

  useEffect(() => {
    Object.values(contentRefs.current).forEach((el) => {
      if (el) clearHighlights(el);
    });

    if (!searchQuery.trim()) return;

    const orderedSpans: HTMLSpanElement[] = [];
    displayMessages.forEach((m, idx) => {
      const id = m._id || `msg-${idx}`;
      const root = contentRefs.current[id];
      if (!root) return;
      const count = applyHighlightsInNode(root, searchQuery);
      if (count > 0) {
        root.querySelectorAll('span[data-search-highlight]').forEach((s) => {
          orderedSpans.push(s as HTMLSpanElement);
        });
      }
    });

    orderedSpans.forEach((span, i) => {
      span.setAttribute("data-highlight-index", String(i));
      span.style.outline = "";
      span.style.outlineOffset = "";
    });

    if (orderedSpans.length > 0) {
      const idx = (currentMatchIndex % orderedSpans.length + orderedSpans.length) % orderedSpans.length;
      const active = orderedSpans[idx];
      if (active) {
        active.style.outline = "2px solid #facc15";
        active.style.outlineOffset = "2px";
        active.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [displayMessages, searchQuery, currentMatchIndex, applyHighlightsInNode, clearHighlights]);

  /** ---------- Additive: Role avatar persistence (per session) ---------- **/
  const [avatarRoleById, setAvatarRoleById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentSessionId) return;
    try {
      const key = `roleAvatarMap:${currentSessionId}`;
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      setAvatarRoleById(raw ? JSON.parse(raw) : {});
    } catch {
      setAvatarRoleById({});
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (!currentSessionId) return;
    const key = `roleAvatarMap:${currentSessionId}`;
    try {
      const next = { ...(avatarRoleById || {}) };
      let changed = false;
      displayMessages.forEach((m) => {
        const id = m._id;
        if (!id) return;
        if (m.activeRole && ["CEO", "CTO", "CMO", "CFO", "ceo", "cto", "cmo", "cfo"].includes(String(m.activeRole))) {
          if (next[id] !== m.activeRole) {
            next[id] = String(m.activeRole);
            changed = true;
          }
        }
      });
      if (changed) {
        setAvatarRoleById(next);
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
    } catch {
      // ignore
    }
  }, [currentSessionId, displayMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const roleAvatarMap: Record<string, { img: StaticImageData; border: string; label: string }> = {
    CEO: { img: CEOImage, border: "#3b82f6", label: "CEO" },
    CTO: { img: CTOImage, border: "#22c55e", label: "CTO" },
    CMO: { img: CMOImage, border: "#fb923c", label: "CMO" },
    CFO: { img: CFOImage, border: "#8b5cf6", label: "CFO" },
  };

  // Resolve role for message: accept store keys or display names. Always return display name (CEO/CTO/...) if possible.
  const resolveRoleForMessage = (m: Message, mid: string): string | undefined => {
    const raw = m.activeRole ?? avatarRoleById[mid];
    if (!raw) return undefined;
    const s = String(raw);
    const lower = s.toLowerCase();
    if (storeKeyToRole[lower]) return storeKeyToRole[lower];
    // Maybe it's already a display name like "CEO"
    if (["CEO", "CTO", "CMO", "CFO"].includes(s)) return s;
    // As fallback, try uppercasing
    const up = s.toUpperCase();
    if (["CEO", "CTO", "CMO", "CFO"].includes(up)) return up;
    return undefined;
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - LEFT */}
      <div
        className={`${sidebarOpenLeft ? "w-[80vw] md:w-60" : "w-0"} bg-sidebar border-r border-border transition-all duration-300 overflow-hidden flex flex-col h-full`}
      >
        {/* Header */}
        <div className="h-16 px-3 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-lg md:text-xl font-bold font-mono">021 AI</h2>
          <button onClick={handleCloseSidebarleft}>
            <ArrowLeftToLine className="h-5 w-5 text-muted-foreground hover:text-muted-foreground/80 transition-colors duration-200" />
          </button>
        </div>

        {/* New Chat */}
        <div className="flex justify-center p-3 md:p-4 shrink-0">
          <button
            onClick={handleCreateNewChat}
            disabled={isLoading}
            className="group relative w-full md:w-50 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-foreground rounded-lg bg-accent/10 border border-border hover:bg-accent hover:border-input transition-all duration-300 ease-out shadow-lg shadow-black/20"
          >
            <Plus className="h-5 w-5 -mr-1.5 relative z-10" />
            <span className="relative z-10">
              {isLoading ? "Creating..." : "New Chat"}
            </span>
          </button>
        </div>

        {/* Sessions */}
        <div className="h-[45vh] shrink-0 overflow-hidden">
          <div className="p-2 md:p-3 h-full">
            <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
              {isLoading && chatSessions.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">Loading chats...</div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">No chats yet</div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleSelectChatSession(session._id!)}
                    className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
    ${currentSessionId === session._id
                        ? `bg-muted border border-border shadow-lg shadow-black/10`
                        : `bg:white/0 border border-transparent hover:bg-accent/50 hover:border-border`
                      }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelectChatSession(session._id!);
                    }}
                  >
                    <div className="relative z-10 p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optional: clicking icon could also trigger rename or just select
                          }}
                        >
                          <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editingSessionId === session._id ? (
                            <input
                              autoFocus
                              className="w-full bg-background/80 text-foreground text-xs border border-input rounded px-1 py-0.5 outline-none focus:border-border"
                              value={editingTopic}
                              onChange={(e) => setEditingTopic(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={handleRenameSession}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRenameSession();
                                } else if (e.key === "Escape") {
                                  setEditingSessionId(null);
                                }
                              }}
                            />
                          ) : (
                            <div
                              className={`font-medium text-xs transition-colors duration-200 truncate ${currentSessionId === session._id
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground/90"
                                }`}
                              title="Double-click to rename"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                startRenaming(session._id!, session.topic || "");
                              }}
                            >
                              {session.topic}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChatSession(session._id!);
                          }}
                          disabled={deletingSessionId === session._id}
                          className="hidden md:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete chat session"
                        >
                          {deletingSessionId === session._id ? (
                            <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Spacer to push footer to bottom */}
        <div className="flex-1" />

        {/* Pitchroom Button */}
        <div className="shrink-0 px-3 pb-3">
          <button
            onClick={() => {
              setViewMode("pitchroom");
              if (window.innerWidth < 768) setSidebarOpenLeft(false);
            }}
            className={`group relative w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out border
                ${viewMode === "pitchroom"
                ? "bg-accent text-accent-foreground border-border shadow-sm"
                : "text-muted-foreground border-transparent hover:bg-accent/50 hover:text-foreground hover:border-border"
              }`}
          >
            <Presentation className={`h-4 w-4 ${viewMode === "pitchroom" ? "text-orange-500" : "text-muted-foreground group-hover:text-orange-500"} transition-colors`} />
            <span>Pitchroom</span>
            {viewMode === "pitchroom" && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </button>
        </div>

        {/* Switch to Pro */}
        <div className="shrink-0 px-3 pt-3 pb-0">
          <button
            onClick={handleNavigateToPricing}
            className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl bg-[#171717] border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 ease-out"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Image
                src={proBg}
                alt="Premium background"
                fill
                className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30" />
            </div>
            <div className="relative z-30 flex items-center justify-center gap-2">
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent">
                SWITCH TO PRO
              </span>
            </div>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="shrink-0 px-3 pb-3 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full gap-2 items-center text-left hover:bg-sidebar-accent/50 p-2 rounded-lg transition-colors outline-none">
                <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
                  <Image className="h-9 w-9 rounded-full border border-border" src={profile} alt="profile" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs font-medium leading-tight truncate">
                      {user?.email ? (() => {
                        const namePart = user.email.split("@")[0];
                        return namePart.length > 16 ? namePart.slice(0, 16) : namePart;
                      })() : "Loading..."}
                    </p>
                    <p className="text-muted-foreground text-xs leading-tight">Free tier</p>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="right">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Chat Area */}
      {viewMode === "pitchroom" ? (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

          {/* Mobile Sidebar Toggle for Pitchroom */}
          <div className="md:hidden h-14 border-b border-border flex items-center px-4 shrink-0">
            {!sidebarOpenLeft && (
              <button onClick={handleOpenSidebarleft} className="mr-3">
                <ArrowRightToLine className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <span className="font-bold">Pitchroom</span>
          </div>

          <PitchroomPage onBack={() => setViewMode("chat")} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-16 bg-sidebar border-b border-border px-3 md:px-6 flex items-center shrink-0">
            <div className="flex items-center gap-3 md:gap-4 w-full">
              {!sidebarOpenLeft && (
                <button onClick={handleOpenSidebarleft}>
                  <ArrowRightToLine className="h-5 w-5 text-muted-foreground hover:text-muted-foreground/80 transition-colors duration-200" />
                </button>
              )}
              <div className="rounded-full flex items-center justify-center text-foreground">
                <UserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-bold font-mono truncate max-w-[40vw] md:max-w-none">
                  {activeRole}
                </h1>
              </div>

              {/* Search Bar */}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-2 py-1">
                  <input
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search…"
                    className="bg-transparent outline-none text-sm placeholder-muted-foreground px-1 py-1 w-24 sm:w-36 md:w-52"
                  />
                  <span className="text-[11px] md:text-xs text-muted-foreground shrink-0">
                    {matches.length > 0 ? `${normalizedIndex + 1}/${matches.length}` : "0/0"}
                  </span>
                  <button
                    onClick={goToPrev}
                    disabled={!matches.length}
                    className="p-1 rounded hover:bg-accent disabled:opacity-40"
                    title="Previous match"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={!matches.length}
                    className="p-1 rounded hover:bg-accent disabled:opacity-40"
                    title="Next match"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!sidebarOpenRight && (
                <button onClick={handleOpenSidebarright} className="ml-2">
                  <ArrowLeftToLine className="h-5 w-5 text-muted-foreground hover:text-muted-foreground/80 transition-colors duration-200" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 px-3 md:px-6 py-3 md:py-4 overflow-y-auto relative">
            <div className="max-w-full md:max-w-4xl mx-auto space-y-3">
              {isLoading && displayMessages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {currentSessionId
                    ? "Loading messages..."
                    : chatSessions.length > 0
                      ? "Loading your chat..."
                      : "Creating your first chat..."}
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {currentSessionId ? "No messages yet. Start a conversation!" : "Setting up your chat..."}
                </div>
              ) : (
                displayMessages.map((message, idx) => {
                  const messageId = message._id || `msg-${idx}`;
                  const resolvedRole = resolveRoleForMessage(message as Message, messageId);
                  const showRoleAvatar = resolvedRole && ["CEO", "CTO", "CMO", "CFO"].includes(resolvedRole) && message.role !== "user";
                  const roleMeta = showRoleAvatar ? roleAvatarMap[resolvedRole as keyof typeof roleAvatarMap] : null;

                  return (
                    <ChatMessageItem
                      key={messageId}
                      message={message as Message}
                      messageId={messageId}
                      showRoleAvatar={!!showRoleAvatar}
                      roleMeta={roleMeta}
                      getAdvisorHexColor={getAdvisorHexColor}
                      onCopy={copyText}
                      onTogglePreview={togglePreview}
                      isPreviewOpen={!!openPreviews[messageId]}
                      setMessageRef={(el) => { messageRefs.current[messageId] = el; }}
                      setContentRef={(el) => { contentRefs.current[messageId] = el; }}
                    />
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted border border-border rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">Assistant is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-background px-3 md:px-6 py-3 md:py-4">
            <div className="max-w-full md:max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <div className="relative rounded-lg bg-muted border border-border shadow-lg shadow-black/20 hover:border-border hover:bg-accent transition-all duration-300">
                    <textarea
                      placeholder={
                        currentSessionId
                          ? "Type your message here..."
                          : chatSessions.length > 0
                            ? "Loading your chat..."
                            : "Creating your chat..."
                      }
                      className="w-full min-h-10 max-h-[30vh] md:max-h-[84px] resize-none bg-transparent px-3 md:px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
                      rows={1}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={!currentSessionId}
                      ref={inputRef}
                      autoFocus
                    />

                    <div className="flex justify-between items-center px-2 md:px-3 py-2 relative z-10">
                      <button
                        onClick={() => {
                          const storeKey = "idea-validator";
                          setActiveRole(storeKey); // reload messages without filter
                          setActiveAdvisor(null);
                          // do NOT clear clickedAdvisors — keep history so advisors can be reselected without refresh
                        }}
                        className={`relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md
                     ${activeRole === "Idea Validator"
                            ? "bg-white/15 hover:bg-white/20 border-border"
                            : "bg-accent/10 hover:bg-accent border-border hover:border-input"
                          }
                     disabled:bg-accent/10 disabled:cursor-not-allowed`}
                      >
                        <Lightbulb
                          className={`h-4 w-4 transition-all duration-200 stroke-2
                          ${activeRole === "Idea Validator"
                              ? "text-yellow-400"
                              : "text-muted-foreground"
                            }`}
                          fill={activeRole === "Idea Validator" ? "currentColor" : "none"}
                        />
                      </button>

                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping || !currentSessionId}
                        className="relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-border hover:border-input transition-all duration-200 ease-out shadow-md bg-accent/10 hover:bg-white/15 disabled:bg-accent/10 disabled:cursor-not-allowed"
                      >
                        {isTyping ? (
                          <div aria-busy="true" className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* C-SUITE ADVISOR - RIGHT */}
      {viewMode === "chat" && (
        <div className={`${sidebarOpenRight ? "w-[80vw] md:w-60" : "w-0"} bg-sidebar border-l border-border transition-all duration-300 overflow-hidden flex flex-col h-full`}>
          <div className="h-16 px-3 border-b border-border flex items-center justify-between shrink-0">
            <h2 className="text-base md:text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
            <button onClick={handleCloseSidebarright} className="p-1 rounded hover:bg-accent transition-colors">
              <ArrowRightToLine className="h-5 w-5 text-muted-foreground hover:text-muted-foreground/80 transition-colors duration-200" />
            </button>
          </div>

          <div className="flex flex-col gap-2 p-3 overflow-y-auto">
            <div className="h-36 md:h-40 w-full bg-transparent">
              <CSuiteAdvisorCard
                name="CEO"
                isLocked={false}
                title="Chief Executive Officer"
                expertise="Strategic Leadership & Vision"
                avatar={CEOImage}
                isActive={activeAdvisor === "ceo"}
                isReplying={replyingAdvisor === "ceo"}
                isThinking={thinkingAdvisor === "ceo"}
                isClicked={clickedAdvisors.has("ceo")}
                primaryColor={advisorColors.ceo}
                onClick={() => handleAdvisorClick("ceo")}
              />
            </div>
            <div className="h-36 md:h-40 w-full bg-transparent">
              <CSuiteAdvisorCard
                name="CFO"
                isLocked={false}
                title="Chief Financial Officer"
                expertise="Financial Strategy & Risk Management"
                avatar={CFOImage}
                isActive={activeAdvisor === "cfo"}
                isReplying={replyingAdvisor === "cfo"}
                isThinking={thinkingAdvisor === "cfo"}
                isClicked={clickedAdvisors.has("cfo")}
                primaryColor={advisorColors.cfo}
                onClick={() => handleAdvisorClick("cfo")}
              />
            </div>
            <div className="h-36 md:h-40 w-full bg-transparent">
              <CSuiteAdvisorCard
                name="CTO"
                isLocked={false}
                title="Chief Technology Officer"
                expertise="Digital Transformation & Innovation"
                avatar={CTOImage}
                isActive={activeAdvisor === "cto"}
                isReplying={replyingAdvisor === "cto"}
                isThinking={thinkingAdvisor === "cto"}
                isClicked={clickedAdvisors.has("cto")}
                primaryColor={advisorColors.cto}
                onClick={() => handleAdvisorClick("cto")}
              />
            </div>
            <div className="h-36 md:h-40 w-full bg-transparent">
              <CSuiteAdvisorCard
                name="CMO"
                isLocked={false}
                title="Chief Marketing Officer"
                expertise="Marketing Strategy & Brand Building"
                avatar={CMOImage}
                isActive={activeAdvisor === "cmo"}
                isReplying={replyingAdvisor === "cmo"}
                isThinking={thinkingAdvisor === "cmo"}
                isClicked={clickedAdvisors.has("cmo")}
                primaryColor={advisorColors.cmo}
                onClick={() => handleAdvisorClick("cmo")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
