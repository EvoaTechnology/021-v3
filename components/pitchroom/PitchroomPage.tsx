"use client";

import React, { useState } from "react";
import { Mic, Users, BookOpen } from "lucide-react";
import PracticeView from "./PracticeView";
import SimulatorView from "./SimulatorView";
import ResourcesView from "./ResourcesView";

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
        <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20 text-foreground animate-in fade-in duration-300">
            {/* Header with Tab Navigation */}
            <div className="h-20 px-6 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-400/20 shadow-lg shadow-orange-500/20">
                        <Mic className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Pitchroom</h1>
                        <p className="text-xs text-muted-foreground">Practice, simulate, and perfect your pitch</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-xl border border-border/50">
                    <button
                        onClick={() => setActiveTab("practice")}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "practice"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            <span>Practice</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("simulator")}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "simulator"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Simulator</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("resources")}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === "resources"
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Resources</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}
