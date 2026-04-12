"use client";

import { useState, useEffect } from "react";
import { useGameStore, setGameState } from "../../useGameStore";
import { useInventoryStore, removeItems } from "../../inventory/inventory";
import { getItemDef } from "../../inventory/types";
import { getHungerState, setHungerState } from "../../useHungerStore";
import { netPostBackground } from "@/lib/netFetch";

const ITEM_ICONS: Record<string, string> = {
    cooked_apple: "🥧",
    roasted_mushroom: "🍢",
    sweet_jam: "🍯",
};

export default function EatingHUD() {
    const isEatingUIOpen = useGameStore(s => s.isEatingUIOpen);
    const items = useInventoryStore(s => s.items);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isEatingUIOpen) {
                setGameState({ isEatingUIOpen: false });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEatingUIOpen]);

    if (!isEatingUIOpen) return null;

    // Filter to only consumable food items (not medicine)
    const foodItems = items.filter(item => {
        const def = getItemDef(item.itemId);
        return def && def.consumable && def.hungerRestore && def.hungerRestore > 0;
    });

    const handleEat = (itemId: string) => {
        const def = getItemDef(itemId);
        if (!def || !def.consumable || !def.hungerRestore) return;

        const success = removeItems(itemId, 1);
        if (success) {
            const currentHunger = getHungerState().hunger;
            const newHunger = Math.min(100, currentHunger + def.hungerRestore);
            setHungerState({ hunger: newHunger });

            netPostBackground("/api/game/save-hunger", { hunger: newHunger });
        }
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(5, 10, 5, 0.7)",
            backdropFilter: "blur(4px)",
            fontFamily: "'Courier New', Courier, monospace"
        }}>
            <div style={{
                width: 600,
                maxHeight: 450,
                backgroundColor: "#1a2a1a",
                border: "4px solid #3a5a3a",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(0,0,0,0.8)",
                display: "flex",
                flexDirection: "column",
            }}>
                {/* Header */}
                <div style={{
                    padding: 16,
                    backgroundColor: "#2a3a2a",
                    borderBottom: "2px solid #3a5a3a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <div style={{ color: "#88ff88", fontWeight: "bold", fontSize: 18 }}>
                        🍽️ DINING TABLE
                    </div>
                    <div style={{ color: "#668866", fontSize: 12 }}>
                        Hunger: {Math.round(getHungerState().hunger)}%
                    </div>
                </div>

                {/* Food list */}
                <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                    {foodItems.length === 0 ? (
                        <div style={{
                            color: "#557755",
                            textAlign: "center",
                            padding: "40px 0",
                            fontSize: 14,
                        }}>
                            No cooked food available.<br />
                            <span style={{ fontSize: 12, opacity: 0.7 }}>
                                Cook something at the fireplace first!
                            </span>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {foodItems.map(item => {
                                const def = getItemDef(item.itemId);
                                if (!def) return null;
                                const icon = ITEM_ICONS[def.id] || "🍽️";
                                const isHovered = hoveredItem === def.id;

                                return (
                                    <div
                                        key={def.id}
                                        onMouseEnter={() => setHoveredItem(def.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        onClick={() => handleEat(def.id)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "12px 16px",
                                            backgroundColor: isHovered ? "rgba(80, 160, 80, 0.2)" : "rgba(0,0,0,0.2)",
                                            border: `1px solid ${isHovered ? "#66aa66" : "#2a3a2a"}`,
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <span style={{ fontSize: 28 }}>{icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: "#c0e0c0", fontWeight: "bold", fontSize: 14 }}>
                                                {def.name}
                                            </div>
                                            <div style={{ color: "#88aa88", fontSize: 11, marginTop: 2 }}>
                                                {def.description}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: "#66ff66", fontWeight: "bold", fontSize: 14 }}>
                                                +{def.hungerRestore}
                                            </div>
                                            <div style={{ color: "#668866", fontSize: 10 }}>hunger</div>
                                        </div>
                                        <div style={{
                                            background: "rgba(100, 200, 100, 0.2)",
                                            borderRadius: 10,
                                            padding: "2px 8px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            color: "#88ff88",
                                        }}>
                                            ×{item.quantity}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Close button */}
                <div style={{
                    padding: 12,
                    borderTop: "2px solid #3a5a3a",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <button
                        onClick={() => setGameState({ isEatingUIOpen: false })}
                        style={{
                            padding: "10px 40px",
                            backgroundColor: "transparent",
                            color: "#88cc88",
                            border: "1px solid #3a5a3a",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: 14,
                        }}
                    >
                        Close [Esc]
                    </button>
                </div>
            </div>
        </div>
    );
}
