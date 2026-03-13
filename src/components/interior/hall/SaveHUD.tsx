"use client";

import { useEffect, useState } from "react";
import { useGameStore, setGameState } from "../../useGameStore";
import { getHealthState, setHealthState } from "../../useHealthStore";
import { getHungerState, setHungerState } from "../../useHungerStore";
import { getInventoryState, setInventoryState } from "../../inventory/inventory";

interface GameSave {
    id: number;
    userId: number;
    health: number;
    hunger: number;
    inventory: any;
    created_at: string;
}

export default function SaveHUD() {
    const isSaveUIOpen = useGameStore(s => s.isSaveUIOpen);
    const [saves, setSaves] = useState<GameSave[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSaves = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/game/saves");
            const data = await res.json();
            if (data.ok) {
                setSaves(data.saves);
            } else {
                setError(data.error || "Failed to load saves.");
            }
        } catch (err) {
            setError("Network error fetching saves.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isSaveUIOpen) {
            fetchSaves();
        }
    }, [isSaveUIOpen]);

    const handleNewSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const health = getHealthState().health;
            const hunger = getHungerState().hunger;
            const inventory = getInventoryState().items;

            const res = await fetch("/api/game/saves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ health, hunger, inventory }),
            });
            const data = await res.json();
            if (data.ok) {
                await fetchSaves();
            } else {
                setError(data.error || "Failed to create save.");
            }
        } catch (err) {
            setError("Network error creating save.");
        }
        setLoading(false);
    };

    const handleLoadSave = async (saveId: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/game/load-save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ saveId }),
            });
            const data = await res.json();
            if (data.ok) {
                const save = data.save;
                setHealthState({ health: save.health });
                setHungerState({ hunger: save.hunger });
                
                let parsedInv = [];
                if (typeof save.inventory === "string") {
                   try { parsedInv = JSON.parse(save.inventory); } catch(e) {}
                } else if (Array.isArray(save.inventory)) {
                   parsedInv = save.inventory;
                }

                setInventoryState({ items: parsedInv });
                
                // Close UI on successful load
                setGameState({ isSaveUIOpen: false, isDead: false });

                // Authorize and force spawn in hall interior
                sessionStorage.setItem("hallEntryAllowed", "true");
                window.location.href = "/hall";
            } else {
                setError(data.error || "Failed to load save.");
            }
        } catch (err) {
            setError("Network error loading save.");
        }
        setLoading(false);
    };

    if (!isSaveUIOpen) return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5, 5, 10, 0.85)",
            backdropFilter: "blur(8px)",
        }}>
            <div style={{
                position: "absolute",
                top: 20, right: 30,
                color: "#88aacc",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 16,
                fontWeight: "bold",
                cursor: "pointer",
                padding: "8px 16px",
                border: "1px solid #446688",
                borderRadius: 4,
                background: "rgba(0, 0, 0, 0.5)",
            }} onClick={() => setGameState({ isSaveUIOpen: false })}>
                [ ESC ] CLOSE
            </div>

            <div style={{
                width: 600,
                maxHeight: "80vh",
                background: "linear-gradient(180deg, #101525 0%, #080a15 100%)",
                border: "2px solid #335588",
                borderRadius: 12,
                boxShadow: "0 0 40px rgba(50, 100, 200, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.8)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}>
                <div style={{
                    padding: "24px 32px",
                    borderBottom: "1px solid #335588",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(20, 30, 50, 0.5)",
                }}>
                    <h2 style={{
                        margin: 0,
                        color: "#ccddff",
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: 24,
                        letterSpacing: "0.1em",
                        textShadow: "0 0 10px rgba(100, 150, 255, 0.5)",
                    }}>
                        GAME SAVES
                    </h2>
                    
                    <button 
                        onClick={handleNewSave}
                        disabled={loading}
                        style={{
                            padding: "8px 16px",
                            background: "linear-gradient(180deg, #2244aa 0%, #112266 100%)",
                            border: "1px solid #4477dd",
                            borderRadius: 4,
                            color: "#ddeeff",
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: 14,
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                    }}>
                        + NEW SAVE
                    </button>
                </div>

                <div style={{
                    padding: 32,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}>
                    {error && (
                        <div style={{ color: "#ff6666", marginBottom: 16, textAlign: "center", fontFamily: "monospace" }}>
                            {error}
                        </div>
                    )}

                    {saves.length === 0 && !loading && !error && (
                        <div style={{ color: "#6688aa", textAlign: "center", fontFamily: "monospace", fontStyle: "italic" }}>
                            No save files found.
                        </div>
                    )}

                    {saves.map(save => (
                        <div key={save.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(10, 15, 30, 0.8)",
                            border: "1px solid #224466",
                            borderRadius: 8,
                            padding: "16px 20px",
                        }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ color: "#aabbdd", fontFamily: "'Courier New', Courier, monospace", fontSize: 18, fontWeight: "bold" }}>
                                    Save File #{save.id}
                                </div>
                                <div style={{ color: "#6688aa", fontFamily: "monospace", fontSize: 13 }}>
                                    {new Date(save.created_at).toLocaleString()}
                                </div>
                                <div style={{ color: "#448855", fontFamily: "monospace", fontSize: 12, marginTop: 4 }}>
                                    HP: {Math.round(save.health)} | Hunger: {Math.round(save.hunger)}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleLoadSave(save.id)}
                                disabled={loading}
                                style={{
                                    padding: "8px 24px",
                                    background: "linear-gradient(180deg, #113322 0%, #0a2010 100%)",
                                    border: "1px solid #22aa55",
                                    borderRadius: 4,
                                    color: "#aaffcc",
                                    fontFamily: "'Courier New', Courier, monospace",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: "0 0 10px rgba(30, 150, 80, 0.2)",
                                }}
                            >
                                LOAD
                            </button>
                        </div>
                    ))}
                    
                    {loading && (
                        <div style={{ color: "#88aacc", textAlign: "center", fontFamily: "monospace", marginTop: 16 }}>
                            Syncing...
                        </div>
                    )}
                </div>
            </div>

            {/* Global keyboard listener to close HUD */}
            <GlobalEscapeListener />
        </div>
    );
}

function GlobalEscapeListener() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setGameState({ isSaveUIOpen: false });
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    return null;
}
