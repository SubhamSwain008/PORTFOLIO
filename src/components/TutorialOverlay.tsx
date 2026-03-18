"use client";

import { useState, useEffect, useCallback } from "react";
import { getGameState, setGameState, useGameStore } from "./useGameStore";
import { getSessionState, setSessionState } from "./useSessionStore";

// ─── Tutorial Page Data ─────────────────────────────────────
interface TutorialPage {
  title: string;
  icon: string;
  sections: { heading?: string; text: string; icon?: string }[];
}

const TUTORIAL_PAGES: TutorialPage[] = [
  {
    title: "Welcome, Traveler",
    icon: "🌙",
    sections: [
      {
        text: "You awaken in a boundless landscape divided into two distinct realities — the Night World and the Day World. At the heart of your existence stands the Hall of Night, a sanctuary of warmth in an otherwise hostile realm.",
      },
      {
        heading: "Your Goal",
        icon: "🎯",
        text: "Survive the darkness. Scavenge resources, cook meals, manage your hunger and health, and use every tool at your disposal to endure the night. The fence around the hall is your only safe zone from the horrors lurking outside.",
      },
      {
        heading: "Two Realms",
        icon: "🌗",
        text: "Use the portal behind the Hall to travel between the Night World (dangerous, enemy-filled) and the Day World (peaceful, fewer resources). Each realm offers unique challenges and opportunities.",
      },
    ],
  },
  {
    title: "Controls",
    icon: "🎮",
    sections: [
      {
        heading: "Movement",
        icon: "🏃",
        text: "W / ↑ — Move forward\nS / ↓ — Move backward (slower)\nA / ← — Turn left\nD / → — Turn right",
      },
      {
        heading: "Sprint",
        icon: "⚡",
        text: "Hold SHIFT while moving to sprint at up to 2× speed. Sprinting drains your stamina bar rapidly. When stamina runs out, you slow back to walking speed. Stamina recovers when not sprinting (30 seconds for full recovery).",
      },
      {
        heading: "Interact",
        icon: "🔑",
        text: "Press X to interact:\n• Enter/exit the Hall\n• Cross fence gates\n• Travel through portals\n• Use the fireplace, table, and bed inside the Hall",
      },
    ],
  },
  {
    title: "The Enemies",
    icon: "💀",
    sections: [
      {
        heading: "Skull Specter",
        icon: "👻",
        text: "HP: 30 · DMG: 6 · Speed: 1.5×\nThe fastest enemy — a floating skull that swarms you relentlessly. Fragile but terrifying in packs. Up to 4 can appear at once.",
      },
      {
        heading: "Shadow Spider",
        icon: "🕷️",
        text: "HP: 40 · DMG: 8 · Speed: 1.4×\nA skittering nightmare that moves almost as fast as the specter. Up to 3 can hunt you simultaneously.",
      },
      {
        heading: "Hellhound",
        icon: "🐺",
        text: "HP: 60 · DMG: 12 · Speed: 1.25×\nA demonic canine — a balanced predator of the wastes. Neither the fastest nor the strongest, but a reliable hunter.",
      },
      {
        heading: "Banshee Ghost",
        icon: "👻",
        text: "HP: 80 · DMG: 15 · Speed: 1.1×\nA spectral entity that hovers with eerie presence. Slow but packs a devastating punch.",
      },
      {
        heading: "⚠️ Shadow Wraith",
        icon: "🌑",
        text: "HP: 120 · DMG: 20 · Speed: 1.0×\nThe most formidable terror. Slow but immensely powerful. CRUCIAL WEAKNESS: It freezes completely when caught in your flashlight beam! Keep it illuminated to survive.",
      },
    ],
  },
  {
    title: "Survival",
    icon: "❤️",
    sections: [
      {
        heading: "Health",
        icon: "❤️",
        text: "You start with 100 HP. Enemies deal damage on contact. If hunger reaches 0, you slowly starve (losing 0.5 HP/sec). Recover health using medicinal items:\n• Healing Herb: +15 HP\n• Health Potion: +30 HP\n• Antidote Vial: +50 HP",
      },
      {
        heading: "Hunger",
        icon: "🍖",
        text: "Hunger drains over a 15-minute cycle from 100 to 0. If hunger drops below 5%, your stamina is completely locked — you cannot sprint! Keep eating to stay alive and mobile.",
      },
      {
        heading: "Stamina",
        icon: "⚡",
        text: "Sprint to move faster, but it drains stamina rapidly. At full stamina you get 2× speed. Below 50 stamina, sprint speed gradually decreases. Takes 30 seconds to fully recover from zero.",
      },
    ],
  },
  {
    title: "Cooking & Saving",
    icon: "🔥",
    sections: [
      {
        heading: "The Fireplace",
        icon: "🔥",
        text: "Inside the Hall of Night, approach the fireplace and press X to cook. Transform raw ingredients into hunger-restoring meals:\n\n🍎 Roasted Apple (1 Mystic Apple) → +15 Hunger\n🍄 Mushroom Skewer (2 Shadow Mushrooms) → +25 Hunger\n🫐 Moonberry Jam (2 Ember Berries + 1 Moon Cheese) → +40 Hunger",
      },
      {
        heading: "The Table",
        icon: "🍽️",
        text: "Approach the dining table inside the Hall to eat cooked meals directly from your inventory. Restore your hunger to keep fighting.",
      },
      {
        heading: "Save Your Progress",
        icon: "💾",
        text: "Approach the bed inside the Hall and press X to save your game. Your position, inventory, hunger, and health are all persisted. (Login mode only — Demo mode doesn't save.)",
      },
    ],
  },
  {
    title: "Items & Tools",
    icon: "🎒",
    sections: [
      {
        heading: "Collecting Items",
        icon: "✨",
        text: "Items are scattered across the world, visible as glowing orbs from a distance. Walk close and they will be automatically collected into your inventory. Items spawn in both worlds, but the Day World has fewer.",
      },
      {
        heading: "Flashlight",
        icon: "🔦",
        text: "Your primary tool in the Night World. It illuminates your path and is ESSENTIAL for freezing Shadow Wraiths. Keep enemies in the beam to stop them in their tracks.",
      },
      {
        heading: "🔥 Fire Torch (Equippable)",
        icon: "🔥",
        text: "Found in the world as 'torch' items. When equipped from your inventory, creates a 5-unit safe zone around you that repels ALL enemies for 60 seconds. A lifesaving tool when overwhelmed!",
      },
      {
        heading: "Other Tools",
        icon: "🛠️",
        text: "• Crystal Pickaxe — A crystalline tool for mining\n• Ancient Compass — Points toward hidden treasures",
      },
    ],
  },
  {
    title: "You're Ready!",
    icon: "⚔️",
    sections: [
      {
        heading: "Key Tips",
        icon: "💡",
        text: "• Stay inside the fence when you need safety — enemies cannot enter!\n• Always keep food stocked — starvation locks your sprint\n• Sprint or equip a Fire Torch to escape enemies\n• The Shadow Wraith freezes in your flashlight — use it!\n• Cook food at the fireplace inside the Hall\n• Travel to the Day World through the portal for safe resource gathering",
      },
      {
        heading: "Re-Open Tutorial",
        icon: "📖",
        text: "You can re-open this tutorial at any time by clicking the 📖 icon in the bottom-right corner of the screen. The game will pause while you're reading.",
      },
      {
        text: "Good luck, Traveler. The night awaits...",
      },
    ],
  },
];

// ─── Styles ─────────────────────────────────────────────────
const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 20000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(5, 5, 15, 0.92)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  animation: "tutorialFadeIn 0.4s ease-out",
};

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(20, 22, 35, 0.98), rgba(12, 14, 22, 0.98))",
  border: "1px solid rgba(154, 106, 255, 0.25)",
  borderRadius: 20,
  width: "min(680px, 92vw)",
  maxHeight: "85vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 80px rgba(0,0,0,0.6), 0 0 60px rgba(154,106,255,0.1)",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  padding: "28px 32px 20px",
  borderBottom: "1px solid rgba(154, 106, 255, 0.12)",
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const bodyStyle: React.CSSProperties = {
  padding: "20px 32px 24px",
  overflowY: "auto",
  flex: 1,
};

const footerStyle: React.CSSProperties = {
  padding: "16px 32px 20px",
  borderTop: "1px solid rgba(154, 106, 255, 0.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const btnBase: React.CSSProperties = {
  fontFamily: "'Georgia', serif",
  fontSize: "0.85rem",
  letterSpacing: "0.08em",
  padding: "10px 24px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "all 0.25s ease",
  border: "1px solid rgba(154, 106, 255, 0.3)",
};

// ─── Component ──────────────────────────────────────────────
export default function TutorialOverlay() {
  const isTutorialOpen = useGameStore((s) => s.isTutorialOpen);
  const [page, setPage] = useState(0);

  // Pause/resume game when tutorial opens/closes
  useEffect(() => {
    if (isTutorialOpen) {
      setGameState({ isPaused: true });
      setPage(0);
    } else {
      setGameState({ isPaused: false });
    }
  }, [isTutorialOpen]);

  const handleFinish = useCallback(async () => {
    setGameState({ isTutorialOpen: false, isPaused: false });

    // Mark tutorial as complete in DB (login mode only)
    const session = getSessionState();
    if (session.mode === "login") {
      try {
        await fetch("/api/game/save-tutorial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch {}
    }
    setSessionState({ firstTimePlayed: false });
  }, []);

  const handleClose = useCallback(() => {
    setGameState({ isTutorialOpen: false, isPaused: false });
  }, []);

  if (!isTutorialOpen) return null;

  const currentPage = TUTORIAL_PAGES[page];
  const isFirst = page === 0;
  const isLast = page === TUTORIAL_PAGES.length - 1;

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* ─── Header ─── */}
        <div style={headerStyle}>
          <span style={{ fontSize: "2rem" }}>{currentPage.icon}</span>
          <div>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "#e0d0c0",
                letterSpacing: "0.15em",
                margin: 0,
                textShadow: "0 0 20px rgba(154, 106, 255, 0.3)",
              }}
            >
              {currentPage.title}
            </h2>
            <span
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "0.72rem",
                color: "#7a6a5a",
                letterSpacing: "0.1em",
              }}
            >
              Page {page + 1} of {TUTORIAL_PAGES.length}
            </span>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div style={bodyStyle}>
          {currentPage.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: i < currentPage.sections.length - 1 ? 20 : 0 }}>
              {section.heading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  {section.icon && <span style={{ fontSize: "1.1rem" }}>{section.icon}</span>}
                  <h3
                    style={{
                      fontFamily: "'Georgia', serif",
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: "#c8b8a8",
                      letterSpacing: "0.08em",
                      margin: 0,
                    }}
                  >
                    {section.heading}
                  </h3>
                </div>
              )}
              <p
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.85rem",
                  color: "#9a8a7a",
                  lineHeight: 1.7,
                  letterSpacing: "0.03em",
                  margin: 0,
                  whiteSpace: "pre-line",
                  paddingLeft: section.heading ? 4 : 0,
                }}
              >
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Footer ─── */}
        <div style={footerStyle}>
          {/* Page dots indicator */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {TUTORIAL_PAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: i === page ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === page ? "rgba(154, 106, 255, 0.7)" : "rgba(154, 106, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {!isFirst && (
              <button
                onClick={() => setPage(page - 1)}
                style={{
                  ...btnBase,
                  background: "rgba(154, 106, 255, 0.08)",
                  color: "#b0a090",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(154, 106, 255, 0.2)";
                  e.currentTarget.style.color = "#e0d0c0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(154, 106, 255, 0.08)";
                  e.currentTarget.style.color = "#b0a090";
                }}
              >
                ← Previous
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleFinish}
                style={{
                  ...btnBase,
                  background: "linear-gradient(135deg, rgba(154, 106, 255, 0.4), rgba(106, 58, 200, 0.4))",
                  color: "#e0d0c0",
                  fontWeight: 500,
                  boxShadow: "0 4px 20px rgba(154, 106, 255, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(154, 106, 255, 0.6), rgba(106, 58, 200, 0.6))";
                  e.currentTarget.style.boxShadow = "0 6px 30px rgba(154, 106, 255, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(154, 106, 255, 0.4), rgba(106, 58, 200, 0.4))";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(154, 106, 255, 0.25)";
                }}
              >
                Begin Adventure ⚔️
              </button>
            ) : (
              <button
                onClick={() => setPage(page + 1)}
                style={{
                  ...btnBase,
                  background: "rgba(154, 106, 255, 0.15)",
                  color: "#e0d0c0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(154, 106, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(154, 106, 255, 0.15)";
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tutorialFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(154,106,255,0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

// ─── Tutorial Button (bottom-right icon) ────────────────────
export function TutorialButton() {
  const isTutorialOpen = useGameStore((s) => s.isTutorialOpen);
  const isDead = useGameStore((s) => s.isDead);

  if (isDead || isTutorialOpen) return null;

  return (
    <button
      id="tutorial-btn"
      onClick={() => setGameState({ isTutorialOpen: true })}
      title="Open Tutorial"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 10002,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "rgba(154, 106, 255, 0.12)",
        border: "1px solid rgba(154, 106, 255, 0.3)",
        color: "#e0d0c0",
        fontSize: "1.3rem",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(154, 106, 255, 0.3)";
        e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.5)";
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(154, 106, 255, 0.12)";
        e.currentTarget.style.borderColor = "rgba(154, 106, 255, 0.3)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      📖
    </button>
  );
}
