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
            <div className="h-auto md:h-20 px-4 md:px-6 py-4 md:py-0 border-b border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 bg-card/80 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-400/20 shadow-lg shadow-orange-500/20 shrink-0">
                        <Mic className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Pitchroom</h1>
                        <p className="text-xs text-muted-foreground hidden md:block">Practice, simulate, and perfect your pitch</p>
                    </div>
                    {/* Mobile Only: Back Button if needed could go here */}
                </div>

                {/* Tab Navigation */}
                <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex items-center gap-2 md:gap-3 bg-muted/50 p-1 md:p-1.5 rounded-xl border border-border/50 min-w-max">
                        <button
                            onClick={() => setActiveTab("practice")}
                            className={`flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "practice"
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-100 md:scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <Mic className="h-4 w-4" />
                                <span>Practice</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("simulator")}
                            className={`flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "simulator"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 md:scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <Users className="h-4 w-4" />
                                <span>Simulator</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("resources")}
                            className={`flex-1 md:flex-none px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "resources"
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-100 md:scale-105"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                }`}
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <BookOpen className="h-4 w-4" />
                                <span>Resources</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}
