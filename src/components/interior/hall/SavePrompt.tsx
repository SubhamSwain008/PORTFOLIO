"use client";

import { useEffect } from "react";
import { useGameStore, setGameState, getGameState } from "../../useGameStore";

export default function SavePrompt() {
    const isNearBed = useGameStore(s => s.isNearBed);
    const isSaveUIOpen = useGameStore(s => s.isSaveUIOpen);

    // Toggle UI when E is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                const state = getGameState();
                if (state.isNearBed) {
                    setGameState({ isSaveUIOpen: !state.isSaveUIOpen });
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Debug
    useEffect(() => {
        console.log("SavePrompt State -> isNearBed:", isNearBed, "isSaveUIOpen:", isSaveUIOpen);
    }, [isNearBed, isSaveUIOpen]);

    if (!isNearBed || isSaveUIOpen) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 8000,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "savePromptBob 2s ease-in-out infinite",
        }}>
            <div style={{
                padding: "10px 28px",
                background: "linear-gradient(135deg, rgba(20, 30, 60, 0.9), rgba(10, 15, 40, 0.95))",
                border: "2px solid #5599ff",
                borderRadius: 8,
                boxShadow: "0 0 20px rgba(50, 140, 255, 0.4), inset 0 0 15px rgba(50, 100, 255, 0.1)",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 16,
                fontWeight: "bold",
                color: "#cceeff",
                letterSpacing: "0.15em",
                textShadow: "0 0 8px rgba(100, 150, 255, 0.6)",
                textTransform: "uppercase",
            }}>
                🛏️ [ E ] Sleep & Save
            </div>
            <style>{`
                @keyframes savePromptBob {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
