"use client";

import { useState, useEffect } from "react";
import { useGameStore, setGameState } from "../../useGameStore";
import { useInventoryStore, removeItems, addItems } from "../../inventory/inventory";
import { RECIPES, Recipe } from "../../inventory/recipes";
import { ITEM_REGISTRY, getItemDef } from "../../inventory/types";

export default function CookingHUD() {
    const isCookingUIOpen = useGameStore(s => s.isCookingUIOpen);
    const intentItems = useInventoryStore(s => s.items);

    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(RECIPES[0]);
    const [isCooking, setIsCooking] = useState(false);
    const [progress, setProgress] = useState(0);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isCookingUIOpen) {
                setGameState({ isCookingUIOpen: false });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isCookingUIOpen]);

    if (!isCookingUIOpen) return null;

    // Helper to check if player has enough of an ingredient
    const getOwnedQty = (itemId: string) => {
        const item = intentItems.find(i => i.itemId === itemId);
        return item ? item.quantity : 0;
    };

    const canCook = (recipe: Recipe) => {
        return recipe.ingredients.every(ing => getOwnedQty(ing.itemId) >= ing.quantity);
    };

    const handleCook = () => {
        if (!selectedRecipe || isCooking) return;
        if (!canCook(selectedRecipe)) return;

        setIsCooking(true);
        setProgress(0);

        // Deduct items immediately so they can't spam cook
        selectedRecipe.ingredients.forEach(ing => {
            removeItems(ing.itemId, ing.quantity);
        });

        const dur = selectedRecipe.cookTimeMs;
        const interval = 50; 
        const steps = dur / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            setProgress(Math.min((currentStep / steps) * 100, 100));
            if (currentStep >= steps) {
                clearInterval(timer);
                addItems(selectedRecipe.resultItemId, 1);
                setIsCooking(false);
                setProgress(0);
            }
        }, interval);
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(10, 5, 0, 0.7)",
            backdropFilter: "blur(4px)",
            fontFamily: "'Courier New', Courier, monospace"
        }}>
            {/* Modal Container */}
            <div style={{
                width: 800,
                height: 500,
                backgroundColor: "#2a1c14",
                border: "4px solid #5c3a21",
                borderRadius: 8,
                display: "flex",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(0,0,0,0.8)"
            }}>
                {/* Left Panel: Recipe List */}
                <div style={{
                    flex: "0 0 300px",
                    borderRight: "2px solid #5c3a21",
                    backgroundColor: "#1f140e",
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{
                        padding: 16,
                        backgroundColor: "#3d2514",
                        borderBottom: "2px solid #5c3a21",
                        color: "#ffc288",
                        fontWeight: "bold",
                        fontSize: 18,
                        textAlign: "center"
                    }}>
                        RECIPES
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                        {RECIPES.map(recipe => {
                            const isSelected = selectedRecipe?.id === recipe.id;
                            const isCraftable = canCook(recipe);
                            return (
                                <div 
                                    key={recipe.id}
                                    onClick={() => !isCooking && setSelectedRecipe(recipe)}
                                    style={{
                                        padding: 12,
                                        marginBottom: 8,
                                        backgroundColor: isSelected ? "#4a2d1a" : "#2a1c14",
                                        border: `1px solid ${isSelected ? "#ff9d47" : "#3d2514"}`,
                                        cursor: isCooking ? "not-allowed" : "pointer",
                                        color: isCraftable ? "#e0d0c0" : "#807060",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold" }}>{recipe.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel: Recipe Details */}
                <div style={{
                    flex: 1,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column"
                }}>
                    {selectedRecipe ? (() => {
                        const resultDef = getItemDef(selectedRecipe.resultItemId);
                        const isCraftable = canCook(selectedRecipe);
                        
                        return (
                            <>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                                    <div style={{
                                        width: 64, height: 64, 
                                        backgroundColor: resultDef?.color || "#fff",
                                        border: "2px solid #5c3a21", // Just a color square for abstraction
                                        boxShadow: `0 0 10px ${resultDef?.emissive || "#000"}`,
                                        marginRight: 16
                                    }}/>
                                    <div>
                                        <h2 style={{ margin: 0, color: "#ffc288", fontSize: 24 }}>{selectedRecipe.name}</h2>
                                        <p style={{ margin: "4px 0 0 0", color: "#a09080", fontSize: 14 }}>
                                            {resultDef?.description}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: "#e0d0c0", borderBottom: "1px solid #5c3a21", paddingBottom: 8 }}>Ingredients Requirements</h3>
                                    <div style={{ marginTop: 12 }}>
                                        {selectedRecipe.ingredients.map((ing, idx) => {
                                            const def = getItemDef(ing.itemId);
                                            const owned = getOwnedQty(ing.itemId);
                                            const req = ing.quantity;
                                            const hasEnough = owned >= req;

                                            return (
                                                <div key={idx} style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    padding: "8px 12px",
                                                    backgroundColor: "rgba(0,0,0,0.2)",
                                                    marginBottom: 4,
                                                    borderRadius: 4
                                                }}>
                                                    <span style={{ color: def?.color || "#fff", textShadow: `0 0 5px ${def?.emissive || "#000"}` }}>
                                                        {def?.name}
                                                    </span>
                                                    <span style={{ color: hasEnough ? "#44ff44" : "#ff4444" }}>
                                                        {owned} / {req}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                                    {isCooking && (
                                        <div style={{ width: "100%", height: 12, backgroundColor: "#000", borderRadius: 6, overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${progress}%`,
                                                backgroundColor: "#ff8800",
                                                boxShadow: "0 0 10px #ffaa00",
                                                transition: "width 0.1s linear"
                                            }}/>
                                        </div>
                                    )}
                                    
                                    <div style={{ display: "flex", gap: 12 }}>
                                        <button
                                            onClick={handleCook}
                                            disabled={!isCraftable || isCooking}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                backgroundColor: isCraftable && !isCooking ? "#ff6600" : "#4a2d1a",
                                                color: isCraftable && !isCooking ? "#fff" : "#807060",
                                                border: "none",
                                                borderRadius: 4,
                                                fontWeight: "bold",
                                                fontSize: 16,
                                                cursor: isCraftable && !isCooking ? "pointer" : "not-allowed",
                                                boxShadow: isCraftable && !isCooking ? "0 0 15px rgba(255,102,0,0.4)" : "none"
                                            }}
                                        >
                                            {isCooking ? "Cooking..." : "Cook Segment"}
                                        </button>
                                        <button
                                            onClick={() => !isCooking && setGameState({ isCookingUIOpen: false })}
                                            disabled={isCooking}
                                            style={{
                                                padding: "12px 24px",
                                                backgroundColor: "transparent",
                                                color: "#e0d0c0",
                                                border: "1px solid #5c3a21",
                                                borderRadius: 4,
                                                cursor: isCooking ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </>
                        );
                    })() : (
                        <div style={{ color: "#807060", margin: "auto" }}>Select a recipe</div>
                    )}
                </div>
            </div>
        </div>
    );
}
