"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Clock, Activity, Play, Star, ArrowRight, BookOpen } from "lucide-react";

export default function PracticeView() {
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
        <div className="p-8 max-w-6xl mx-auto space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-4 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                    <Mic className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">AI-Powered Practice</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    Practice Your Pitch
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                    Record your pitch, get instant AI feedback on clarity, pacing, and confidence.
                    Refine your delivery before meeting investors.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Recording Card */}
                <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-8 flex flex-col items-center justify-between gap-8 shadow-xl shadow-black/5 backdrop-blur-sm min-h-[450px]">
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
                        <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 relative group cursor-pointer transition-all duration-300 ${isRecording
                                ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500 animate-pulse shadow-2xl shadow-red-500/30'
                                : 'bg-gradient-to-br from-muted to-muted/50 border-muted-foreground/10 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/20'
                            }`}>
                            <Mic className={`h-16 w-16 transition-all duration-300 ${isRecording ? 'text-red-500 scale-110' : 'text-muted-foreground group-hover:text-orange-500 group-hover:scale-110'
                                }`} />
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-2xl font-bold">
                                {isRecording ? 'Recording...' : 'Start Recording'}
                            </h3>
                            <div className="flex items-center gap-2 justify-center">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground font-mono">
                                    {isRecording ? formatTime(recordingTime) : 'Up to 5 minutes'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isAnalyzing}
                        className={`w-full px-8 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${isRecording
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/30'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]`}
                    >
                        <Mic className="h-5 w-5" />
                        {isRecording ? 'Stop Recording' : 'Record Pitch'}
                    </button>
                </div>

                {/* Guide / Tips */}
                <div className="space-y-6 flex flex-col min-h-[450px]">
                    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-sm flex-1">
                        <h3 className="font-bold text-lg mb-5 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Activity className="h-5 w-5 text-blue-500" />
                            </div>
                            What we analyze
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 rounded-lg bg-green-500/10 mt-0.5 group-hover:bg-green-500/20 transition-colors">
                                    <Clock className="h-4 w-4 text-green-500" />
                                </div>
                                <span className="leading-relaxed"><strong className="text-foreground">Pacing & WPM:</strong> <span className="text-muted-foreground">Are you speaking too fast or too slow?</span></span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 rounded-lg bg-purple-500/10 mt-0.5 group-hover:bg-purple-500/20 transition-colors">
                                    <Activity className="h-4 w-4 text-purple-500" />
                                </div>
                                <span className="leading-relaxed"><strong className="text-foreground">Clarity & Filler Words:</strong> <span className="text-muted-foreground">Detection of 'um', 'ah', 'like'.</span></span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 rounded-lg bg-yellow-500/10 mt-0.5 group-hover:bg-yellow-500/20 transition-colors">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                </div>
                                <span className="leading-relaxed"><strong className="text-foreground">Engagement & Tone:</strong> <span className="text-muted-foreground">Energy variations and emotional resonance.</span></span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="p-1.5 rounded-lg bg-blue-500/10 mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                                    <BookOpen className="h-4 w-4 text-blue-500" />
                                </div>
                                <span className="leading-relaxed"><strong className="text-foreground">Content Coverage:</strong> <span className="text-muted-foreground">Key pitch elements and structure.</span></span>
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 shadow-lg shadow-black/5 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Play className="h-32 w-32" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Need Inspiration?</h3>
                        <p className="text-sm text-muted-foreground mb-4 relative z-10">Listen to successful pitches from Shark Tank.</p>
                        <a
                            href="https://www.youtube.com/playlist?list=PLnkwIhuXMWpc-Ba6sHNHs17qM1Xh8TQ3H"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-orange-500 hover:text-orange-400 flex items-center gap-2 group relative z-10"
                        >
                            Browse Library
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Key Points to Include */}
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-8 shadow-lg shadow-black/5 backdrop-blur-sm">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-500/10">
                        <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                    Key Points to Include in Your Pitch
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-green-500/20 group-hover:scale-110 transition-transform">
                                <span className="text-xs font-bold">{idx + 1}</span>
                            </div>
                            <span className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{point}</span>
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
