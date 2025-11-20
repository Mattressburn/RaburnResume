// src/components/BootSequence.jsx
import React, { useState, useEffect } from "react";

const BOOT_LOGS = [
    "INITIALIZING KERNEL...",
    "MOUNTING VIRTUAL FILE SYSTEM...",
    "CONNECTING TO DISCOGS NODE (SECURE)...",
    "BYPASSING MAINFRAME FIREWALL...",
    "DECRYPTING VINYL METADATA...",
    "OPTIMIZING AUDIO VECTORS...",
    "RENDERING INTERFACE...",
    "ACCESS GRANTED."
];

export default function BootSequence({ onComplete }) {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex >= BOOT_LOGS.length) {
                clearInterval(interval);
                // Wait a tiny bit after the last line, then tell parent we are done
                setTimeout(onComplete, 800);
                return;
            }

            setLines((prev) => [...prev, BOOT_LOGS[currentIndex]]);
            currentIndex++;
        }, 400); // Speed of new lines appearing

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-8 flex flex-col justify-end pb-32">
            <div className="max-w-2xl mx-auto w-full">
                {lines.map((line, i) => (
                    <div key={i} className="mb-2 text-sm md:text-base tracking-wider">
                        <span className="text-green-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        <span className="typing-effect">{line}</span>
                    </div>
                ))}
                <div className="animate-pulse mt-4 text-green-500">_</div>
            </div>
        </div>
    );
}