"use client";

import React from "react";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function TrialBanner() {
    const { isTrialActive, daysRemaining, isPro } = useAccessControl();

    if (isPro || !isTrialActive) return null;

    return (
        <div className="mx-2 mb-2 p-3 rounded-lg bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs font-medium text-blue-200">Free Trial Active</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-blue-300/80">{daysRemaining} days remaining</span>
                <Link href="/pricing" className="text-[10px] font-bold text-blue-300 hover:text-white uppercase tracking-wider">
                    Upgrade
                </Link>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(daysRemaining / 7) * 100}%` }}
                />
            </div>
        </div>
    );
}
