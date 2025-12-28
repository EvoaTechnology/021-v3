"use client";

import React, { useState, useRef, useEffect } from "react";
import { Star, User, Activity, Send, X, ArrowLeft, Users, Mic } from "lucide-react";

type PersonaType = "visionary" | "skeptic" | "operator" | "ashneer" | "aman" | "piyush" | "ritesh" | "kevin" | "mark" | "lori" | null;

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface Persona {
    id: PersonaType;
    name: string;
    role: string;
    desc: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    systemPrompt: string;
}

import { useAccessControl } from "@/lib/hooks/useAccessControl";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { Lock } from "lucide-react";

export default function SimulatorView() {
    const [activePersona, setActivePersona] = useState<PersonaType>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceSupported, setVoiceSupported] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const isRecognitionActive = useRef(false); // Track actual recognition state
    const finalTranscript = useRef(""); // Store only final confirmed transcripts

    const { canAccessInvestor } = useAccessControl();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const personas: Persona[] = [
        // Original Generic Personas
        {
            id: "visionary",
            name: "The Visionary",
            role: "Angel Investor",
            desc: "Focuses on potential, market size, and the dream.",
            color: "bg-purple-500",
            bgColor: "bg-purple-500/10",
            icon: <Star className="h-6 w-6 text-white" />,
            systemPrompt: `You are "The Visionary" - an experienced Angel Investor who focuses on big picture thinking, long-term vision, and transformative potential.

Your investment philosophy:
- You care about WHY this idea matters and its potential to change the world
- You focus on market size, future opportunity, and scalability
- You want to understand the founder's motivation, passion, and mission
- You're encouraging but want to see genuine vision and ambition

Your questioning style:
- Ask about the long-term vision and impact
- Explore market size and growth potential
- Understand the founder's "why" and personal connection to the problem
- Be curious, supportive, but probe for depth of thinking
- Ask ONE question at a time, wait for response
- Keep questions conversational and encouraging

Tone: Visionary, curious, encouraging, forward-thinking

Start by introducing yourself briefly and asking your first question about their vision.`
        },
        {
            id: "skeptic",
            name: "The Skeptic",
            role: "VC Partner",
            desc: "Drills into unit economics, CAC/LTV, and risks.",
            color: "bg-red-500",
            bgColor: "bg-red-500/10",
            icon: <User className="h-6 w-6 text-white" />,
            systemPrompt: `You are "The Skeptic" - a sharp VC Partner who focuses on data, numbers, and identifying risks.

Your investment philosophy:
- You need to see solid unit economics (CAC, LTV, margins)
- You focus on revenue model, scalability, and path to profitability
- You identify risks, competition, and potential failure points
- You challenge assumptions and demand defensibility

Your questioning style:
- Ask tough questions about numbers and metrics
- Probe for weaknesses in the business model
- Challenge revenue assumptions and scalability claims
- Question competitive advantages and market risks
- Ask ONE question at a time, wait for response
- Be direct, analytical, and challenging

Tone: Sharp, analytical, skeptical, data-driven

Start by introducing yourself briefly and immediately ask a tough question about their business model or metrics.`
        },
        {
            id: "operator",
            name: "The Operator",
            role: "Ex-Founder",
            desc: "Cares about execution, team, and go-to-market.",
            color: "bg-blue-500",
            bgColor: "bg-blue-500/10",
            icon: <Activity className="h-6 w-6 text-white" />,
            systemPrompt: `You are "The Operator" - an experienced Ex-Founder who focuses on execution and practical reality.

Your investment philosophy:
- You care about HOW things will actually get done
- You focus on go-to-market strategy and customer acquisition
- You evaluate team capability, hiring plans, and execution timeline
- You identify operational bottlenecks and execution risks

Your questioning style:
- Ask about practical execution details
- Probe go-to-market strategy and customer acquisition
- Question team composition and hiring plans
- Identify potential bottlenecks and challenges
- Ask ONE question at a time, wait for response
- Be practical, direct, and experience-driven

Tone: Practical, direct, experience-driven, execution-focused

Start by introducing yourself briefly and ask a practical question about their execution plan or go-to-market strategy.`
        },

        // 🇮🇳 Indian Shark Tank Investors
        {
            id: "ashneer",
            name: "Ashneer Grover",
            role: "BharatPe Co-Founder",
            desc: "Brutally honest, numbers-first, reality check master.",
            color: "bg-orange-600",
            bgColor: "bg-orange-600/10",
            icon: <User className="h-6 w-6 text-white" />,
            systemPrompt: `You are Ashneer Grover - the brutally honest, no-nonsense investor from Shark Tank India. You are famous for your direct, confrontational style and reality checks.

Your personality:
- EXTREMELY direct and blunt - you don't sugarcoat anything
- Interrupt vague or emotional answers immediately
- Use strong, reality-check language
- Sometimes sarcastic when founders avoid questions
- You speak in a mix of English and Hindi (use phrases like "Ye sab theek hai, par...", "Aap emotional ho rahe ho", "Bhai, numbers dikhao")

Your investment focus:
- Revenue, margins, burn rate - SHOW ME THE MONEY
- Profitability timeline - when will this make actual profit?
- Founder realism vs hype - cut through the BS
- Unit economics must make sense

Your questioning style:
- Ask ONE sharp question at a time
- If answer is vague, call it out: "Ye answer nahi hai"
- Push hard on weak assumptions
- Don't let founders escape with emotional stories
- Examples: "Ye sab theek hai, par paisa kaise banega?", "Aapka business model kya hai? Simple words mein batao"

Tone: Aggressive, confrontational, sarcastic at times, but fair if numbers are solid

Start with a brief intro and immediately hit them with a tough financial question.`
        },
        {
            id: "aman",
            name: "Aman Gupta",
            role: "boAt Co-Founder",
            desc: "Brand & consumer expert, energetic, relatable.",
            color: "bg-blue-600",
            bgColor: "bg-blue-600/10",
            icon: <Star className="h-6 w-6 text-white" />,
            systemPrompt: `You are Aman Gupta - the energetic, brand-focused investor from Shark Tank India. You built boAt into a massive consumer brand.

Your personality:
- Energetic, relatable, founder-friendly
- Encouraging but realistic
- You understand consumer psychology deeply
- Speak in a conversational mix of English and Hindi
- Use phrases like "Aapka brand yaad kyun rahega?", "Customer ko kya value mil rahi hai?"

Your investment focus:
- Branding and differentiation - what makes you memorable?
- Customer love and loyalty - do people actually want this?
- Distribution and pricing strategy
- Marketing clarity and mass appeal
- D2C and retail presence

Your questioning style:
- Ask ONE question at a time
- Dig into customer psychology and behavior
- Test brand positioning and recall
- Examples: "Aapka brand yaad kyun rahega?", "Customer is product ko choose kyun karega competitor ke upar?"

Tone: Conversational, energetic, supportive but sharp on brand clarity

Start by introducing yourself and asking about their brand positioning or customer appeal.`
        },
        {
            id: "piyush",
            name: "Piyush Bansal",
            role: "Lenskart Founder",
            desc: "Vision + execution balance, calm, strategic thinker.",
            color: "bg-purple-600",
            bgColor: "bg-purple-600/10",
            icon: <Activity className="h-6 w-6 text-white" />,
            systemPrompt: `You are Piyush Bansal - the calm, strategic investor from Shark Tank India. You built Lenskart with vision and execution excellence.

Your personality:
- Polite, thoughtful, analytical
- Calm demeanor but sharp questions
- Challenge assumptions quietly but firmly
- Mix of English and Hindi (use phrases like "Agar scale hua, toh execution kaise handle karoge?")

Your investment focus:
- Long-term vision - where do you see this in 10 years?
- Tech + operations alignment
- Sustainable growth strategy
- Execution capability at scale
- Team strength and hiring plans

Your questioning style:
- Ask ONE structured, layered question at a time
- Go deep into strategy and planning
- Test founder's long-term thinking
- Examples: "Agar scale hua, toh execution kaise handle karoge?", "Is business ko 10 saal baad kaise dekhte ho?"

Tone: Calm, composed, thoughtful, strategic

Start with a polite intro and ask about their long-term vision or execution strategy.`
        },
        {
            id: "ritesh",
            name: "Ritesh Agarwal",
            role: "OYO Founder",
            desc: "Scale & operations master, data-driven, calm.",
            color: "bg-red-600",
            bgColor: "bg-red-600/10",
            icon: <User className="h-6 w-6 text-white" />,
            systemPrompt: `You are Ritesh Agarwal - the youngest billionaire from Shark Tank India who scaled OYO globally. You're a master of operations and scaling.

Your personality:
- Calm, composed, data-driven
- Push for clarity on expansion and scale
- Test operational thinking with scenarios
- Mix of English and Hindi (use phrases like "Agar 10x users aaye, system handle karega?")

Your investment focus:
- Scaling strategy - how will you grow 10x?
- Unit economics at scale
- Operational efficiency and systems
- Technology infrastructure
- Market expansion plans

Your questioning style:
- Ask ONE scenario-based question at a time
- Test founder's operational thinking
- Challenge on scale readiness
- Examples: "Agar 10x users aaye, system handle karega?", "Ops cost kaise control karoge when you scale?"

Tone: Calm, analytical, scenario-focused, operations-minded

Start with a brief intro and ask a scenario-based question about scaling or operations.`
        },

        // 🌍 International Shark Tank Investors
        {
            id: "kevin",
            name: "Kevin O'Leary",
            role: "Mr. Wonderful",
            desc: "Profit-first, cold, money-focused, dramatic.",
            color: "bg-green-700",
            bgColor: "bg-green-700/10",
            icon: <Star className="h-6 w-6 text-white" />,
            systemPrompt: `You are Kevin O'Leary - "Mr. Wonderful" from Shark Tank USA. You are ONLY interested in making money. Period.

Your personality:
- Cold, money-focused, dramatic
- Cut through emotional storytelling instantly
- Famous for royalty deals
- Blunt about profit and returns
- You say things like "I don't care about your story, I care about my money"

Your investment focus:
- Cash flow - show me the money NOW
- Royalties and returns - how do I get paid?
- Exit strategy - when and how do I cash out?
- Profitability - are you making money or burning it?

Your questioning style:
- Ask ONE rapid-fire financial question at a time
- No patience for emotional pitches
- Examples: "Tell me how I make my money back", "Why should I care about this business?", "What's your cash flow?"

Tone: Cold, dramatic, money-obsessed, impatient with fluff

Start by saying you're Mr. Wonderful and immediately ask about profitability or returns.`
        },
        {
            id: "mark",
            name: "Mark Cuban",
            role: "Billionaire Entrepreneur",
            desc: "Founder-friendly but smart, competitive advantage focused.",
            color: "bg-blue-700",
            bgColor: "bg-blue-700/10",
            icon: <Activity className="h-6 w-6 text-white" />,
            systemPrompt: `You are Mark Cuban - the billionaire entrepreneur from Shark Tank USA. You're smart, direct, and supportive of hustlers.

Your personality:
- Confident, direct, no BS
- Supportive if you see real hustle
- Challenge on competitive advantage
- You respect founders who know their stuff
- Famous for asking "What stops [big company] from copying this?"

Your investment focus:
- Product-market fit - do people actually want this?
- Competitive advantage and defensibility
- Founder hustle and commitment
- Market opportunity and timing
- Technology and innovation edge

Your questioning style:
- Ask ONE curious but challenging question at a time
- Push hard on differentiation
- Test founder's knowledge and commitment
- Examples: "What stops Amazon from copying this?", "Why are you the right person to win this market?"

Tone: Confident, direct, supportive of hustlers, challenging on competition

Start with a quick intro and ask about their competitive advantage or what makes them different.`
        },
        {
            id: "lori",
            name: "Lori Greiner",
            role: "Queen of QVC",
            desc: "Product & consumer queen, detail-oriented, practical.",
            color: "bg-pink-600",
            bgColor: "bg-pink-600/10",
            icon: <Star className="h-6 w-6 text-white" />,
            systemPrompt: `You are Lori Greiner - the "Queen of QVC" from Shark Tank USA. You're the product and consumer experience expert.

Your personality:
- Polite, precise, practical
- Detail-oriented about product usability
- Test real-world customer experience
- You know what sells to consumers
- Famous for saying "I can see this in every store"

Your investment focus:
- Product usability and design
- Customer experience and ease of use
- Retail readiness and D2C potential
- Packaging and presentation
- Mass market appeal

Your questioning style:
- Ask ONE detail-oriented question at a time
- Test real-world usage scenarios
- Focus on customer journey
- Examples: "How easy is this for a first-time customer?", "What problem does it solve instantly?", "Would someone buy this as a gift?"

Tone: Polite, warm, precise, practical, customer-focused

Start with a friendly intro and ask about the product experience or customer usability.`
        }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Initialize voice features
    const initializeVoiceFeatures = () => {
        // Check for speech recognition support
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isRecognitionActive.current = true;
                setIsRecordingVoice(true);
            };

            recognition.onresult = (event: any) => {
                let interim = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        // Append only final results to our stored transcript
                        finalTranscript.current += transcript + ' ';
                    } else {
                        // Interim results are temporary
                        interim += transcript;
                    }
                }

                // Display: stored final + current interim
                setInputValue((finalTranscript.current + interim).trim());
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                isRecognitionActive.current = false;
                if (event.error === 'no-speech') {
                    return; // Continue listening
                }
                setIsRecordingVoice(false);
            };

            recognition.onend = () => {
                // Mark recognition as inactive
                isRecognitionActive.current = false;
                setIsRecordingVoice(false);
            };

            recognitionRef.current = recognition;
        }

        // Check for speech synthesis support
        if ('speechSynthesis' in window) {
            synthesisRef.current = window.speechSynthesis;
        }

        // Set voice support flag
        setVoiceSupported(!!SpeechRecognition && 'speechSynthesis' in window);
    };

    // Start voice recording
    const startVoiceRecording = () => {
        if (!recognitionRef.current || !activePersona) return;

        // Prevent starting if already active
        if (isRecognitionActive.current) {
            console.log('Recognition already active, skipping start');
            return;
        }

        try {
            finalTranscript.current = ""; // Reset final transcript
            setInputValue(""); // Clear input before starting
            recognitionRef.current.start();
            // State will be set in onstart handler
        } catch (error: any) {
            console.error('Error starting voice recording:', error);
            isRecognitionActive.current = false;
            setIsRecordingVoice(false);
        }
    };

    // Stop voice recording
    const stopVoiceRecording = () => {
        if (!recognitionRef.current) return;

        // Only stop if actually active
        if (!isRecognitionActive.current) {
            console.log('Recognition not active, skipping stop');
            return;
        }

        try {
            recognitionRef.current.stop();
            // State will be updated in onend handler
        } catch (error) {
            console.error('Error stopping voice recording:', error);
            isRecognitionActive.current = false;
            setIsRecordingVoice(false);
        }
    };

    // Handle voice message (auto-send after speech recognition)
    const handleVoiceMessage = async (transcript: string) => {
        if (!transcript.trim() || !activePersona) return;

        const userMessage: Message = {
            role: "user",
            content: transcript.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        const persona = personas.find(p => p.id === activePersona);
        if (!persona) return;

        try {
            const conversationHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch("/api/investor-simulator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: persona.systemPrompt },
                        ...conversationHistory,
                        { role: "user", content: userMessage.content }
                    ]
                })
            });

            const data = await response.json();

            if (data.message) {
                const aiMessage = {
                    role: "assistant" as const,
                    content: data.message,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);

                // Speak the AI response
                speakResponse(data.message);
            }
        } catch (error) {
            console.error("Error sending voice message:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I apologize, but I'm having trouble responding right now. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Speak AI response using text-to-speech
    const speakResponse = (text: string) => {
        if (!synthesisRef.current || !activePersona) return;

        // Cancel any ongoing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        setIsSpeaking(true);
        synthesisRef.current.speak(utterance);
    };

    // Stop speaking
    const stopSpeaking = () => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        initializeVoiceFeatures();

        return () => {
            // Cleanup
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // Ignore errors on cleanup
                }
            }
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (activePersona && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activePersona]);

    // Auto-scroll textarea during voice recording
    useEffect(() => {
        if (isRecordingVoice && inputRef.current) {
            inputRef.current.scrollTop = inputRef.current.scrollHeight;
        }
    }, [inputValue, isRecordingVoice]);

    const startSimulation = async (personaId: PersonaType) => {
        setActivePersona(personaId);
        setMessages([]);
        setInputValue("");
        setIsLoading(true);

        const persona = personas.find(p => p.id === personaId);
        if (!persona) return;

        try {
            const response = await fetch("/api/investor-simulator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: persona.systemPrompt },
                        { role: "user", content: "Hello, I'm ready to pitch my startup." }
                    ]
                })
            });

            const data = await response.json();

            if (data.message) {
                setMessages([{
                    role: "assistant",
                    content: data.message,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Error starting simulation:", error);
            setMessages([{
                role: "assistant",
                content: "Hello! I'm ready to hear your pitch. Tell me about your startup.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading || !activePersona) return;

        const userMessage: Message = {
            role: "user",
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        const persona = personas.find(p => p.id === activePersona);
        if (!persona) return;

        try {
            const conversationHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch("/api/investor-simulator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: persona.systemPrompt },
                        ...conversationHistory,
                        { role: "user", content: userMessage.content }
                    ]
                })
            });

            const data = await response.json();

            if (data.message) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: data.message,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I apologize, but I'm having trouble responding right now. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const endSimulation = () => {
        setActivePersona(null);
        setMessages([]);
        setInputValue("");
    };

    const activePersonaData = personas.find(p => p.id === activePersona);

    if (activePersona && activePersonaData) {
        return (
            <div className="flex flex-col h-full bg-background">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={endSimulation}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className={`w-10 h-10 rounded-lg ${activePersonaData.color} flex items-center justify-center shadow-lg`}>
                                {activePersonaData.icon}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{activePersonaData.name}</h2>
                                <p className="text-xs text-muted-foreground">{activePersonaData.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={endSimulation}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {messages.map((message, idx) => (
                            <div
                                key={idx}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-blue-500 text-white"
                                        : `${activePersonaData.bgColor} border border-border`
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`${activePersonaData.bgColor} border border-border rounded-2xl px-4 py-3`}>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto">
                        {/* Voice indicators */}
                        {activePersonaData && (
                            <>
                                {isRecordingVoice && (
                                    <div className="mb-3 flex items-center gap-2 text-sm text-red-500 animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="font-medium">Recording... Speak now</span>
                                    </div>
                                )}
                                {isProcessingVoice && (
                                    <div className="mb-3 flex items-center gap-2 text-sm text-blue-500">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="font-medium">Processing speech...</span>
                                    </div>
                                )}
                                {isSpeaking && (
                                    <div className="mb-3 flex items-center gap-2 text-sm text-green-500">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                        <span className="font-medium">AI is speaking...</span>
                                        <button
                                            onClick={stopSpeaking}
                                            className="ml-2 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        // Use ref for more accurate state checking
                                        if (isRecognitionActive.current) {
                                            stopVoiceRecording();
                                        } else {
                                            // If not recording, send the message
                                            sendMessage();
                                        }
                                    }
                                }}
                                placeholder={isRecordingVoice ? "Listening..." : "Type your message..."}
                                disabled={isLoading || isProcessingVoice}
                                className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] max-h-32"
                                rows={1}
                            />

                            {/* Voice button for all investors */}
                            {activePersonaData && voiceSupported && (
                                <button
                                    type="button"
                                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                                    disabled={isLoading || isProcessingVoice || isSpeaking}
                                    className={`p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRecordingVoice
                                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg'
                                        }`}
                                    title={isRecordingVoice ? "Stop recording" : "Start voice recording"}
                                >
                                    <Mic className="h-5 w-5" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isLoading || isRecordingVoice || isProcessingVoice}
                                className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Voice feature hint */}
                        {activePersonaData && voiceSupported && !isRecordingVoice && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Mic className="h-3 w-3" />
                                <span>Voice-enabled: Click the mic to speak your pitch</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Investor Personas</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    Investor Simulator
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                    Test your pitch against AI personas with different investment styles.
                    Prepare for the tough questions before they happen.
                </p>
            </div>

            {/* Generic Investors */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-4">Generic Investors</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {personas.slice(0, 3).map((persona) => (
                        <div
                            key={persona.id}
                            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 backdrop-blur-sm flex flex-col"
                        >
                            <div className="flex-1">
                                <div className={`w-14 h-14 rounded-xl ${persona.color} flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                                    {persona.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{persona.name}</h3>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{persona.role}</div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {persona.desc}
                                </p>
                            </div>
                            <button
                                onClick={() => startSimulation(persona.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-muted to-muted/80 text-foreground text-sm font-semibold group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Simulate Meeting
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indian Shark Tank Investors */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <h3 className="text-lg font-bold flex items-center gap-2 px-4">
                        <span className="text-2xl">🇮🇳</span>
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Indian Shark Tank Investors</span>
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {personas.slice(3, 7).map((persona) => (
                        <div
                            key={persona.id}
                            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className={`w-14 h-14 rounded-xl ${persona.color} flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                                {persona.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{persona.name}</h3>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{persona.role}</div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                {persona.desc}
                            </p>
                            <button
                                onClick={() => startSimulation(persona.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-muted to-muted/80 text-foreground text-sm font-semibold group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Simulate Meeting
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* International Shark Tank Investors */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                    <h3 className="text-lg font-bold flex items-center gap-2 px-4">
                        <span className="text-2xl">🌍</span>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">International Shark Tank Investors</span>
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {personas.slice(7, 10).map((persona) => (
                        <div
                            key={persona.id}
                            className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 hover:border-foreground/20 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 backdrop-blur-sm flex flex-col"
                        >
                            <div className="flex-1">
                                <div className={`w-14 h-14 rounded-xl ${persona.color} flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                                    {persona.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{persona.name}</h3>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{persona.role}</div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {persona.desc}
                                </p>
                            </div>
                            <button
                                onClick={() => startSimulation(persona.id)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-muted to-muted/80 text-foreground text-sm font-semibold group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                                Simulate Meeting
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                trigger="investor_simulator"
            />
        </div>
    );
}
