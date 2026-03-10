"use client";

import { useEffect } from "react";
import { useGameStore, setGameState, getGameState } from "../../useGameStore";

export default function EatingPrompt() {
    const isNearTable = useGameStore(s => s.isNearTable);
    const isEatingUIOpen = useGameStore(s => s.isEatingUIOpen);
    const isCookingUIOpen = useGameStore(s => s.isCookingUIOpen);

    // Toggle UI when E is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "e") {
                const state = getGameState();
                if (state.isNearTable && !state.isCookingUIOpen) {
                    setGameState({ isEatingUIOpen: !state.isEatingUIOpen });
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!isNearTable || isEatingUIOpen || isCookingUIOpen) return null;

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
            animation: "eatPromptBob 2s ease-in-out infinite",
        }}>
            <div style={{
                padding: "10px 28px",
                background: "linear-gradient(135deg, rgba(10, 40, 15, 0.9), rgba(5, 25, 10, 0.95))",
                border: "2px solid #66cc77",
                borderRadius: 8,
                boxShadow: "0 0 20px rgba(80, 200, 100, 0.3), inset 0 0 15px rgba(50, 180, 80, 0.1)",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 16,
                fontWeight: "bold",
                color: "#88ff99",
                letterSpacing: "0.15em",
                textShadow: "0 0 8px rgba(80, 255, 100, 0.5)",
                textTransform: "uppercase",
            }}>
                🍽️ [ E ] Eat
            </div>
            <style>{`
                @keyframes eatPromptBob {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
