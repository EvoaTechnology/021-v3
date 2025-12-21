"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Users, BookOpen, Clock, Activity, Play, Star, ArrowRight, User } from "lucide-react";

type PitchroomTab = "practice" | "simulator" | "resources";

interface PitchroomPageProps {
    onBack?: () => void;
}

export default function PitchroomPage({ onBack }: PitchroomPageProps) {
    const [activeTab, setActiveTab] = useState<PitchroomTab>("practice");

    const renderContent = () => {
        switch (activeTab) {
            case "practice":
                return <PracticeView />;
            case "simulator":
                return <SimulatorView />;
            case "resources":
                return <ResourcesView />;
            default:
                return <PracticeView />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-300">
            {/* Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Mic className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-mono tracking-tight">Pitchroom</h1>
                        <p className="text-xs text-muted-foreground">Master your startup pitch</p>
                    </div>
                </div>

                {/* Navigation Tabs (Top) */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                    <TabButton
                        active={activeTab === "practice"}
                        onClick={() => setActiveTab("practice")}
                        icon={<Mic className="h-4 w-4" />}
                        label="Practice"
                        activeColor="bg-orange-500"
                    />
                    <TabButton
                        active={activeTab === "simulator"}
                        onClick={() => setActiveTab("simulator")}
                        icon={<Users className="h-4 w-4" />}
                        label="Simulator"
                        activeColor="bg-blue-500"
                    />
                    <TabButton
                        active={activeTab === "resources"}
                        onClick={() => setActiveTab("resources")}
                        icon={<BookOpen className="h-4 w-4" />}
                        label="Resources"
                        activeColor="bg-green-500"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto w-full">
                {renderContent()}
            </div>
        </div>
    );
}

// --- Sub-Components ---

function TabButton({ active, onClick, icon, label, activeColor }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, activeColor: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${active
                    ? `text-white shadow-sm ${activeColor}`
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

function PracticeView() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recognition, setRecognition] = useState<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPiece + ' ';
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }

                setTranscript(prev => prev + finalTranscript);
            };

            setRecognition(recognitionInstance);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            recorder.start();
            setIsRecording(true);
            setTranscript("");
            setAnalysis(null);
            setRecordingTime(0);

            // Start speech recognition
            if (recognition) {
                recognition.start();
            }

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 300) { // 5 minutes max
                        stopRecording();
                        return 300;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to record your pitch.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        if (recognition) {
            recognition.stop();
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        setIsRecording(false);
        setIsPaused(false);

        // Analyze the pitch
        if (transcript.trim()) {
            analyzePitch();
        }
    };

    const analyzePitch = () => {
        setIsAnalyzing(true);

        // Simulate AI analysis (in production, this would call your AI API)
        setTimeout(() => {
            const words = transcript.trim().split(/\s+/);
            const wordCount = words.length;
            const duration = recordingTime;
            const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

            // Filler word detection
            const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
            let fillerCount = 0;
            const lowerTranscript = transcript.toLowerCase();
            fillerWords.forEach(filler => {
                const regex = new RegExp(`\\b${filler}\\b`, 'gi');
                const matches = lowerTranscript.match(regex);
                if (matches) fillerCount += matches.length;
            });

            // Content analysis
            const keyPhrases = ['problem', 'solution', 'market', 'team', 'traction', 'revenue', 'customer', 'competitive', 'vision', 'investment'];
            const mentionedPhrases = keyPhrases.filter(phrase =>
                lowerTranscript.includes(phrase)
            );

            // Scoring system (0-10)
            let pacingScore = 10;
            if (wpm < 120) pacingScore = 6; // Too slow
            else if (wpm > 180) pacingScore = 6; // Too fast
            else if (wpm >= 140 && wpm <= 160) pacingScore = 10; // Perfect
            else pacingScore = 8;

            const clarityScore = Math.max(0, 10 - (fillerCount / wordCount) * 100);
            const contentScore = (mentionedPhrases.length / keyPhrases.length) * 10;
            const lengthScore = duration >= 120 && duration <= 300 ? 10 : duration < 120 ? 6 : 8;

            const overallScore = ((pacingScore + clarityScore + contentScore + lengthScore) / 4).toFixed(1);

            setAnalysis({
                overallScore: parseFloat(overallScore),
                duration,
                wordCount,
                wpm,
                fillerCount,
                pacingScore,
                clarityScore,
                contentScore,
                lengthScore,
                mentionedPhrases,
                missingPhrases: keyPhrases.filter(p => !mentionedPhrases.includes(p)),
                feedback: generateFeedback(parseFloat(overallScore), wpm, fillerCount, mentionedPhrases.length)
            });

            setIsAnalyzing(false);
        }, 2000);
    };

    const generateFeedback = (score: number, wpm: number, fillerCount: number, phrasesCount: number) => {
        const feedback = [];

        if (score >= 8) {
            feedback.push("🎉 Excellent pitch! You're ready to present to investors.");
        } else if (score >= 6) {
            feedback.push("👍 Good pitch! A few improvements will make it great.");
        } else {
            feedback.push("💪 Keep practicing! Focus on the areas below.");
        }

        if (wpm < 120) {
            feedback.push("⚡ Speak a bit faster to maintain energy and engagement.");
        } else if (wpm > 180) {
            feedback.push("🐢 Slow down slightly to ensure clarity and comprehension.");
        } else {
            feedback.push("✅ Perfect pacing! Your speaking speed is ideal.");
        }

        if (fillerCount > 10) {
            feedback.push("🎯 Reduce filler words by pausing instead of saying 'um' or 'like'.");
        } else if (fillerCount < 5) {
            feedback.push("✅ Excellent clarity! Minimal filler words detected.");
        }

        if (phrasesCount < 5) {
            feedback.push("📋 Include more key elements: problem, solution, market, team, traction.");
        } else {
            feedback.push("✅ Great content coverage! You hit the key points.");
        }

        return feedback;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const keyPoints = [
        "Start with a compelling hook or problem statement",
        "Clearly define the problem you're solving",
        "Present your unique solution and value proposition",
        "Explain your business model and revenue streams",
        "Highlight market size and opportunity",
        "Showcase traction, metrics, or early wins",
        "Introduce your team and their expertise",
        "Address competition and your competitive advantage",
        "Share your vision and future roadmap",
        "End with a clear ask (funding amount, partnership, etc.)"
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Practice Your Pitch</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Record your pitch, get instant AI feedback on clarity, pacing, and confidence.
                    Refine your delivery before meeting investors.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Recording Card */}
                <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-between gap-6 shadow-sm min-h-[400px]">
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 relative group cursor-pointer transition-all ${isRecording
                            ? 'bg-red-500/20 border-red-500 animate-pulse'
                            : 'bg-muted border-muted-foreground/10 hover:border-orange-500/50'
                            }`}>
                            <Mic className={`h-12 w-12 transition-colors ${isRecording ? 'text-red-500' : 'text-muted-foreground group-hover:text-orange-500'
                                }`} />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">
                                {isRecording ? 'Recording...' : 'Start Recording'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isRecording ? formatTime(recordingTime) : 'Up to 5 minutes'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isAnalyzing}
                        className={`w-full px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-foreground text-background hover:opacity-90'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <Mic className="h-4 w-4" />
                        {isRecording ? 'Stop Recording' : 'Record Pitch'}
                    </button>
                </div>

                {/* Guide / Tips */}
                <div className="space-y-6 flex flex-col min-h-[400px]">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex-1">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            What we analyze
                        </h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <div className="p-1 rounded bg-green-500/10 mt-0.5"><Clock className="h-3 w-3 text-green-500" /></div>
                                <span><strong>Pacing & WPM:</strong> Are you speaking too fast or too slow?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="p-1 rounded bg-purple-500/10 mt-0.5"><Activity className="h-3 w-3 text-purple-500" /></div>
                                <span><strong>Clarity & Filler Words:</strong> Detection of 'um', 'ah', 'like'.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="p-1 rounded bg-yellow-500/10 mt-0.5"><Star className="h-3 w-3 text-yellow-500" /></div>
                                <span><strong>Engagement & Tone:</strong> Energy variations and emotional resonance.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="p-1 rounded bg-blue-500/10 mt-0.5"><BookOpen className="h-3 w-3 text-blue-500" /></div>
                                <span><strong>Content Coverage:</strong> Key pitch elements and structure.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Play className="h-24 w-24" />
                        </div>
                        <h3 className="font-semibold mb-2">Need Inspiration?</h3>
                        <p className="text-sm text-muted-foreground mb-4">Listen to successful pitches from Airbnb, Uber, and more.</p>
                        <button className="text-sm font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1">
                            Browse Library <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Points to Include */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    Key Points to Include in Your Pitch
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                    {keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs font-bold">{idx + 1}</span>
                            </div>
                            <span className="text-muted-foreground">{point}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analysis Results */}
            {isAnalyzing && (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Analyzing your pitch...</p>
                </div>
            )}

            {analysis && !isAnalyzing && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold">{analysis.overallScore}</div>
                                <div className="text-sm opacity-90">/ 10</div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Overall Pitch Score</h3>
                        <p className="text-muted-foreground">Based on pacing, clarity, content, and structure</p>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="text-3xl font-bold text-green-500 mb-1">{analysis.pacingScore.toFixed(1)}</div>
                            <div className="text-sm font-medium mb-1">Pacing</div>
                            <div className="text-xs text-muted-foreground">{analysis.wpm} WPM</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="text-3xl font-bold text-purple-500 mb-1">{analysis.clarityScore.toFixed(1)}</div>
                            <div className="text-sm font-medium mb-1">Clarity</div>
                            <div className="text-xs text-muted-foreground">{analysis.fillerCount} filler words</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="text-3xl font-bold text-blue-500 mb-1">{analysis.contentScore.toFixed(1)}</div>
                            <div className="text-sm font-medium mb-1">Content</div>
                            <div className="text-xs text-muted-foreground">{analysis.mentionedPhrases.length}/10 key points</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="text-3xl font-bold text-yellow-500 mb-1">{analysis.lengthScore.toFixed(1)}</div>
                            <div className="text-sm font-medium mb-1">Length</div>
                            <div className="text-xs text-muted-foreground">{formatTime(analysis.duration)}</div>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-4">AI Feedback & Recommendations</h3>
                        <div className="space-y-2">
                            {analysis.feedback.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Missing Elements */}
                    {analysis.missingPhrases.length > 0 && (
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
                            <h3 className="font-semibold mb-3 text-yellow-600 dark:text-yellow-400">Consider Adding:</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.missingPhrases.map((phrase: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
                                        {phrase}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transcript */}
                    {transcript && (
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="font-semibold mb-3">Your Pitch Transcript</h3>
                            <div className="text-sm text-muted-foreground leading-relaxed max-h-60 overflow-y-auto">
                                {transcript}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setTranscript("");
                                setAnalysis(null);
                                setRecordingTime(0);
                            }}
                            className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                        >
                            Record Another Pitch
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function SimulatorView() {
    const personas = [
        { name: "The Visionary", role: "Angel Investor", desc: "Focuses on potential, market size, and the dream.", color: "bg-purple-500", icon: <Star className="h-6 w-6 text-white" /> },
        { name: "The Skeptic", role: "VC Partner", desc: "Drills into unit economics, CAC/LTV, and risks.", color: "bg-red-500", icon: <User className="h-6 w-6 text-white" /> },
        { name: "The Operator", role: "Ex-Founder", desc: "Cares about execution, team, and go-to-market.", color: "bg-blue-500", icon: <Activity className="h-6 w-6 text-white" /> },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Investor Simulator</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Test your pitch against AI personas with different investment styles.
                    Prepare for the tough questions before they happen.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {personas.map((persona, idx) => (
                    <div key={idx} className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer">
                        <div className={`w-12 h-12 rounded-lg ${persona.color} flex items-center justify-center mb-4 shadow-lg shadow-black/5`}>
                            {persona.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-1">{persona.name}</h3>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{persona.role}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {persona.desc}
                        </p>
                        <button className="w-full py-2 rounded-lg bg-muted text-foreground text-sm font-medium group-hover:bg-foreground group-hover:text-background transition-colors">
                            Simulate Meeting
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ResourcesView() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("All Types");

    const featuredResources = [
        {
            title: "How to Start a Startup - Sam Altman (Stanford)",
            author: "Sam Altman",
            rating: 4.9,
            level: "Beginner",
            url: "https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe-1",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "The Lean Startup Methodology - Steve Blank",
            author: "Steve Blank",
            rating: 4.8,
            level: "Intermediate",
            url: "https://steveblank.com/category/lean-launchpad/",
            icon: <Activity className="h-5 w-5" />
        },
        {
            title: "Zero to One - Peter Thiel",
            author: "Peter Thiel",
            rating: 4.6,
            level: "Intermediate",
            url: "https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "The Lean Startup - Eric Ries",
            author: "Eric Ries",
            rating: 4.5,
            level: "Beginner",
            url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "Guy Kawasaki's Pitch Deck Template",
            author: "Guy Kawasaki",
            rating: 4.6,
            level: "Intermediate",
            url: "https://guykawasaki.com/the-only-10-slides-you-need-in-your-pitch/",
            icon: <Star className="h-5 w-5" />
        }
    ];

    const allResources = [
        {
            title: "How to Start a Startup - Sam Altman (Stanford)",
            author: "Sam Altman",
            description: "Complete startup course from Y Combinator covering everything from idea validation to scaling.",
            rating: 4.9,
            views: "2.5M",
            duration: "20 hours",
            category: "Course",
            level: "Beginner",
            url: "https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe-1"
        },
        {
            title: "The Lean Startup Methodology - Steve Blank",
            author: "Steve Blank",
            description: "Learn the customer development process and how to build products customers actually want.",
            rating: 4.8,
            views: "1.8M",
            duration: "8 hours",
            category: "Course",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=QoAOzMTLP5s"
        },
        {
            title: "Fundraising Masterclass - Jason Calacanis",
            author: "Jason Calacanis",
            description: "Complete guide to raising capital from angel investors and VCs.",
            rating: 4.7,
            views: "1.6M",
            duration: "12 hours",
            category: "Fundraising",
            level: "Advanced",
            url: "https://www.youtube.com/watch?v=EHtvTGaPzF4"
        },
        {
            title: "Zero to One - Peter Thiel",
            author: "Peter Thiel",
            description: "Notes on startups and how to build the future. Essential reading for any entrepreneur.",
            rating: 4.6,
            views: "5.5M",
            duration: "",
            category: "Book",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=rFZrL1RiuVI"
        },
        {
            title: "The Lean Startup - Eric Ries",
            author: "Eric Ries",
            description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
            rating: 4.5,
            views: "3.1M",
            duration: "",
            category: "Book",
            level: "Beginner",
            url: "https://www.youtube.com/watch?v=fEvKo90qBns"
        },
        {
            title: "Venture Deals - Brad Feld & Jason Mendelson",
            author: "Brad Feld",
            description: "Be smarter than your lawyer and venture capitalist when negotiating deals.",
            rating: 4.7,
            views: "1.1M",
            duration: "",
            category: "Fundraising",
            level: "Advanced",
            url: "https://www.youtube.com/watch?v=2Th8JhUvHKY"
        },
        {
            title: "Business Model Canvas Template",
            author: "Strategyzer",
            description: "Interactive template to design and visualize your business model.",
            rating: 4.8,
            views: "2.7M",
            duration: "",
            category: "Template",
            level: "Beginner",
            url: "https://www.strategyzer.com/library/the-business-model-canvas"
        },
        {
            title: "Guy Kawasaki's Pitch Deck Template",
            author: "Guy Kawasaki",
            description: "The famous 10/20/30 rule pitch deck template from Guy Kawasaki.",
            rating: 4.6,
            views: "1.9M",
            duration: "",
            category: "Template",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=liQLdRk0Ziw"
        },
        {
            title: "Financial Model Template for Startups",
            author: "Y Combinator",
            description: "Comprehensive Excel template for startup financial planning and projections.",
            rating: 4.5,
            views: "890K",
            duration: "",
            category: "Template",
            level: "Advanced",
            url: "https://www.ycombinator.com/library/7y-startup-financial-models"
        },
        {
            title: "Y Combinator Startup Library",
            author: "Y Combinator",
            description: "Free library of startup advice, templates, and resources from the world's top accelerator.",
            rating: 4.9,
            views: "5.2M",
            duration: "",
            category: "Library",
            level: "All Levels",
            url: "https://www.ycombinator.com/library"
        },
        {
            title: "How to Pitch Your Startup - Y Combinator",
            author: "Y Combinator",
            description: "Master the art of pitching with insights from YC partners and successful founders.",
            rating: 4.8,
            views: "2.1M",
            duration: "45 min",
            category: "Video",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=17XZGUX_9iM"
        },
        {
            title: "Sequoia Capital Pitch Deck Template",
            author: "Sequoia Capital",
            description: "The legendary pitch deck template used by Airbnb, Dropbox, and other unicorns.",
            rating: 4.7,
            views: "3.3M",
            duration: "",
            category: "Template",
            level: "Intermediate",
            url: "https://www.sequoiacap.com/article/writing-a-business-plan/"
        }
    ];

    const filteredResources = allResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
        const matchesType = selectedType === "All Types" || resource.level === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner": return "bg-green-500/10 text-green-500";
            case "Intermediate": return "bg-yellow-500/10 text-yellow-500";
            case "Advanced": return "bg-red-500/10 text-red-500";
            default: return "bg-blue-500/10 text-blue-500";
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Featured Resources */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-bold">Featured Resources</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredResources.map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                            <div className="flex items-start gap-3 mb-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    {resource.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium">{resource.rating}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelColor(resource.level)}`}>
                                            {resource.level}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">by {resource.author}</p>
                                </div>
                            </div>
                            <button className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-auto">
                                <ArrowRight className="h-4 w-4" />
                                Access
                            </button>
                        </a>
                    ))}
                </div>
            </div>

            {/* All Resources Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">All Resources</h2>
                    <span className="text-sm text-muted-foreground">{filteredResources.length} resources</span>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search resources, authors, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors cursor-pointer"
                    >
                        <option>All</option>
                        <option>Course</option>
                        <option>Book</option>
                        <option>Template</option>
                        <option>Video</option>
                        <option>Fundraising</option>
                        <option>Library</option>
                    </select>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors cursor-pointer"
                    >
                        <option>All Types</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>All Levels</option>
                    </select>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelColor(resource.level)}`}>
                                    {resource.level}
                                </span>
                                <Star className="h-4 w-4 text-muted-foreground group-hover:text-yellow-500 transition-colors cursor-pointer" />
                            </div>

                            <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                                {resource.title}
                            </h3>

                            <p className="text-xs text-muted-foreground mb-1">by {resource.author}</p>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                {resource.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span>{resource.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{resource.views} views</span>
                                </div>
                                {resource.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{resource.duration}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2 px-4 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Access Resource
                            </button>
                        </a>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No resources found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
