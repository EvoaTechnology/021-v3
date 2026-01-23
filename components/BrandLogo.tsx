"use client";

import React from "react";

export default function BrandLogo() {
    return (
        <div className="flex items-center gap-3">
            {/* Main Brand: 021 */}
            <div className="relative">
                <span
                    className="text-3xl font-black tracking-tight bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 dark:from-purple-400 dark:via-blue-400 dark:to-purple-500 bg-clip-text text-transparent"
                    style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        letterSpacing: '-0.05em'
                    }}
                >
                    021
                </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-400 dark:via-gray-600 to-transparent opacity-50" />

            {/* Secondary: powered by EVOA */}
            <div className="flex flex-col justify-center -space-y-0.5">
                <span
                    className="text-[9px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        letterSpacing: '0.1em'
                    }}
                >
                    powered by
                </span>
                <span
                    className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide"
                    style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        letterSpacing: '0.05em'
                    }}
                >
                    EVOA
                </span>
            </div>
        </div>
    );
}
