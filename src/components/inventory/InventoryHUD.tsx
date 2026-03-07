"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useInventoryStore, nearestItemPrompt } from "./inventory";
import { getItemDef, ITEM_REGISTRY } from "./types";

// ─── Emoji Icons for items (matching the item theme) ─────
const ITEM_ICONS: Record<string, string> = {
  mystic_apple: "🍎",
  golden_bread: "🍞",
  shadow_mushroom: "🍄",
  ember_berry: "🫐",
  moon_cheese: "🧀",
  crystal_pickaxe: "⛏️",
  torch: "🔥",
  ancient_compass: "🧭",
};

export default function InventoryHUD() {
  const items = useInventoryStore((s) => s.items);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  // Toggle with I key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "i" && !e.repeat) {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Poll the mutable nearestItemPrompt via rAF — zero React re-renders
  useEffect(() => {
    let raf: number;
    const poll = () => {
      if (promptRef.current) {
        if (nearestItemPrompt.visible) {
          promptRef.current.style.opacity = "1";
          promptRef.current.style.transform = "translateX(-50%) translateY(0)";
          promptRef.current.textContent = `[ X ]  ${nearestItemPrompt.name}`;
        } else {
          promptRef.current.style.opacity = "0";
          promptRef.current.style.transform = "translateX(-50%) translateY(8px)";
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* ─── Collect Prompt (above inventory bar) ─── */}
      <div
        ref={promptRef}
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%) translateY(8px)",
          zIndex: 1001,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.2s ease, transform 0.2s ease",
          background: "rgba(10, 8, 20, 0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 220, 120, 0.3)",
          borderRadius: "8px",
          padding: "8px 20px",
          color: "#ffdd88",
          fontSize: "15px",
          fontWeight: 600,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(255, 200, 80, 0.4)",
          whiteSpace: "nowrap",
        }}
      />

      {/* Inventory Toggle Button */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          pointerEvents: "auto",
        }}
      >
        {/* Toggle bar button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            background: isOpen
              ? "rgba(80, 60, 120, 0.85)"
              : "rgba(20, 20, 35, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: isOpen ? "12px 12px 0 0" : "12px",
            color: "#e0e0e0",
            padding: "8px 24px",
            cursor: "pointer",
            fontSize: "13px",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            letterSpacing: "2px",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            outline: "none",
          }}
        >
          <span style={{ fontSize: "16px" }}>🎒</span>
          <span>Inventory</span>
          {totalItems > 0 && (
            <span
              style={{
                background: "rgba(200, 100, 50, 0.9)",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {totalItems}
            </span>
          )}
          <span
            style={{
              fontSize: "10px",
              opacity: 0.5,
              marginLeft: 4,
            }}
          >
            [I]
          </span>
        </button>

        {/* Expanded Inventory Panel */}
        {isOpen && (
          <div
            style={{
              background: "rgba(15, 12, 25, 0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderTop: "none",
              borderRadius: "0 0 12px 12px",
              padding: "12px 16px",
              minWidth: "320px",
              maxWidth: "480px",
            }}
          >
            {items.length === 0 ? (
              <div
                style={{
                  color: "rgba(200, 200, 220, 0.5)",
                  textAlign: "center",
                  padding: "16px 0",
                  fontSize: "13px",
                  fontFamily: "'Inter', 'Segoe UI', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                No items collected yet.
                <br />
                <span style={{ fontSize: "11px", opacity: 0.6 }}>
                  Explore the world to find items!
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                  gap: "8px",
                }}
              >
                {items.map((collected) => {
                  const def = getItemDef(collected.itemId);
                  if (!def) return null;
                  const icon = ITEM_ICONS[def.id] || "📦";
                  const isHovered = hoveredItem === def.id;

                  return (
                    <div
                      key={def.id}
                      onMouseEnter={() => setHoveredItem(def.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        position: "relative",
                        background: isHovered
                          ? "rgba(100, 80, 140, 0.4)"
                          : "rgba(40, 35, 55, 0.5)",
                        border: `1px solid ${isHovered ? "rgba(160, 120, 220, 0.5)" : "rgba(100, 100, 120, 0.2)"}`,
                        borderRadius: "8px",
                        padding: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        cursor: "default",
                        transition: "all 0.2s ease",
                        transform: isHovered ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>{icon}</span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#c0c0d0",
                          textAlign: "center",
                          lineHeight: 1.2,
                          fontFamily: "'Inter', 'Segoe UI', sans-serif",
                          maxWidth: "60px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {def.name}
                      </span>
                      {/* Quantity badge */}
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 4,
                          background: "rgba(200, 100, 50, 0.9)",
                          borderRadius: "8px",
                          padding: "0px 5px",
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#fff",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {collected.quantity}
                      </span>
                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 6px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(10, 8, 18, 0.95)",
                            border: "1px solid rgba(160, 120, 220, 0.3)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            width: "180px",
                            zIndex: 1001,
                            pointerEvents: "none",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "12px",
                              color: "#e0d8f0",
                              marginBottom: 4,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {def.name}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "rgba(180, 170, 200, 0.8)",
                              lineHeight: 1.4,
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {def.description}
                          </div>
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: "10px",
                              color: "rgba(140, 130, 160, 0.6)",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            {def.category}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
