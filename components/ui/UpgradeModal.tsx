"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    trigger?: string;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const handleUpgrade = () => {
        router.push("/pricing");
        onClose();
    };

    if (!isOpen) return null;

    const features = [
        "Unlimited Chat Sessions",
        "Access to All 12+ Investor Personas",
        "Full Access to Startup Resources",
        "Detailed AI Analysis & Feedback"
    ];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-[90vw] max-w-md overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pb-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-4 mx-auto border border-blue-500/20">
                        <Lock className="w-6 h-6 text-blue-400" />
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Unlock Full Access
                        </h2>
                        <p className="text-blue-200/70 text-base">
                            Your free access has ended. Upgrade to Pro to unlock unlimited possibilities.
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-green-400" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 mt-2 flex flex-col gap-3">
                    <Button
                        onClick={handleUpgrade}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 shadow-lg shadow-blue-900/20"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-400 hover:text-white hover:bg-white/5"
                    >
                        Maybe Later
                    </Button>
                </div>
            </div>
        </div>
    );
}
