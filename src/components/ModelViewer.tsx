"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Hellhound, ShadowSpider, FloatingGhost, ShadowWraith, SkullSpecter, TheStranger } from "./EnemyModels";
import PlayerBodyMesh from "./PlayerBodyMesh";

// ─── Model data registry ─────────────────────────────────
interface ModelEntry {
  id: string;
  name: string;
  description: string;
  category: "player" | "enemy";
  stats?: {
    hp?: number;
    damage?: number;
    speed?: string;
    ability?: string;
  };
  cameraDistance: number;
  yOffset: number;
}

const MODELS: ModelEntry[] = [
  {
    id: "player",
    name: "The Traveler",
    description: "A lone survivor navigating between the Night and Day realms. Equipped with a flashlight, backpack, and unshakable resolve.",
    category: "player",
    stats: { hp: 100, ability: "Flashlight, Fire Torch" },
    cameraDistance: 7,
    yOffset: -0.5,
  },
  {
    id: "hellhound",
    name: "Hellhound",
    description: "A massive four-legged beast with glowing red eyes and jagged spine spikes. Prowls the darkness with terrifying speed.",
    category: "enemy",
    stats: { hp: 60, damage: 12, speed: "Fast", ability: "Unfreezable" },
    cameraDistance: 8,
    yOffset: -0.5,
  },
  {
    id: "shadow_spider",
    name: "Shadow Spider",
    description: "A grotesque eight-legged arachnid with armored plating, venomous fangs, and multiple glowing eyes.",
    category: "enemy",
    stats: { hp: 40, damage: 8, speed: "Very Fast", ability: "Venom" },
    cameraDistance: 8,
    yOffset: -0.3,
  },
  {
    id: "floating_ghost",
    name: "Banshee Ghost",
    description: "A spectral entity draped in flowing ethereal sheets. Its hollow eye sockets and screaming mouth chill the soul.",
    category: "enemy",
    stats: { hp: 80, damage: 15, speed: "Slow", ability: "Phasing" },
    cameraDistance: 8,
    yOffset: -1.5,
  },
  {
    id: "shadow_wraith",
    name: "Shadow Wraith",
    description: "The Grim Reaper incarnate — a hooded skeletal figure wielding a scythe, surrounded by a dark aura and dragging chains.",
    category: "enemy",
    stats: { hp: 120, damage: 20, speed: "Slow", ability: "Freezes in Flashlight" },
    cameraDistance: 9,
    yOffset: -1.2,
  },
  {
    id: "skull_specter",
    name: "Skull Specter",
    description: "A floating skull engulfed in spectral fire. Small but relentless, it pursues with terrifying speed.",
    category: "enemy",
    stats: { hp: 30, damage: 6, speed: "Fastest", ability: "Fire Trail" },
    cameraDistance: 8,
    yOffset: -0.5,
  },
  {
    id: "the_stranger",
    name: "The Stranger",
    description:
      "A hooded figure who keeps vigil at the fences of the hollow world. Tall, thin, faceless under a grey cassock that drags a wet hem behind him. He greets the Traveler with unsettling warmth and hands over supplies without being asked. Observers report: sleeves cut for an adult's reach but small child-sized hands emerging from them; a single yellow sock on the left foot; a humming that matches a song the Traveler's wife used to sing; a shadow that does not agree with the sun. Do not attack him. There is nothing inside the hood to kill. There is, however, something that will hear you try — and remember.",
    category: "enemy",
    stats: { hp: 0, damage: 0, speed: "Still", ability: "Non-hostile. Omnipresent. Patient." },
    cameraDistance: 9,
    yOffset: -1.4,
  },
];

// ─── Static Player Model (no refs needed for viewer) ─────
function StaticPlayerModel() {
  const bodyGroupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const leftKneeRef = useRef<THREE.Group>(null!);
  const rightKneeRef = useRef<THREE.Group>(null!);

  return (
    <group position={[0, 0, 0]}>
      <PlayerBodyMesh
        bodyGroupRef={bodyGroupRef}
        headRef={headRef}
        leftArmRef={leftArmRef}
        rightArmRef={rightArmRef}
        leftLegRef={leftLegRef}
        rightLegRef={rightLegRef}
        leftKneeRef={leftKneeRef}
        rightKneeRef={rightKneeRef}
        flashlightGroupRef={undefined}
        hasTorch={false}
      />
    </group>
  );
}

// ─── Auto-rotate turntable ───────────────────────────────
function Turntable({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Model Renderer ──────────────────────────────────────
function ModelRenderer({ modelId, yOffset }: { modelId: string; yOffset: number }) {
  const pos: [number, number, number] = [0, yOffset, 0];

  switch (modelId) {
    case "player":
      return (
        <group position={[0, yOffset + 0.5, 0]} scale={[1.6, 1.6, 1.6]}>
          <StaticPlayerModel />
        </group>
      );
    case "hellhound":
      return <group scale={[1.2, 1.2, 1.2]}><Hellhound position={pos} /></group>;
    case "shadow_spider":
      return <group scale={[1.2, 1.2, 1.2]}><ShadowSpider position={pos} /></group>;
    case "floating_ghost":
      return <group scale={[1.0, 1.0, 1.0]}><FloatingGhost position={pos} /></group>;
    case "shadow_wraith":
      return <group scale={[0.9, 0.9, 0.9]}><ShadowWraith position={pos} /></group>;
    case "skull_specter":
      return <group scale={[1.0, 1.0, 1.0]}><SkullSpecter position={pos} /></group>;
    case "the_stranger":
      return <group scale={[1.0, 1.0, 1.0]}><TheStranger position={pos} /></group>;
    default:
      return null;
  }
}

// ─── Ground Plate ────────────────────────────────────────
function GroundPlate() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
      <circleGeometry args={[3, 64]} />
      <meshStandardMaterial
        color="#1a1525"
        roughness={0.8}
        metalness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ─── Main Model Viewer Component ─────────────────────────
export default function ModelViewer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const model = MODELS[currentIndex];

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "d") setCurrentIndex((i) => (i + 1) % MODELS.length);
      if (e.key === "ArrowLeft" || e.key === "a") setCurrentIndex((i) => (i - 1 + MODELS.length) % MODELS.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        background: "rgba(5, 3, 15, 0.97)",
        display: "flex",
        flexDirection: "column",
        animation: "mvFadeIn 0.3s ease-out",
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(154, 106, 255, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.4rem" }}>👁️</span>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Georgia', serif",
              fontSize: "1.1rem",
              fontWeight: 400,
              color: "#e0d0c0",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Bestiary
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 100, 100, 0.1)",
            border: "1px solid rgba(255, 100, 100, 0.3)",
            borderRadius: 8,
            color: "#ff6b6b",
            fontFamily: "'Georgia', serif",
            fontSize: "0.8rem",
            padding: "8px 20px",
            cursor: "pointer",
            letterSpacing: "0.1em",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 100, 100, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 100, 100, 0.1)";
          }}
        >
          ✕ Close [ESC]
        </button>
      </div>

      {/* ─── Content ─── */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* 3D Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 1, model.cameraDistance], fov: 50 }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.5,
            }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} color="#8888cc" />
            <directionalLight
              position={[5, 8, 5]}
              intensity={2.0}
              color="#ffffff"
              castShadow
            />
            <directionalLight
              position={[-5, 4, -3]}
              intensity={0.8}
              color="#9a6aff"
            />
            <pointLight position={[0, 3, 0]} intensity={1.5} color="#aa88ff" distance={12} />
            <hemisphereLight
              color="#6644aa"
              groundColor="#1a0a2a"
              intensity={0.5}
            />

            {/* Fog */}
            <fog attach="fog" args={["#0a0515", 8, 25]} />

            <Suspense fallback={null}>
              <Turntable speed={0.4}>
                <ModelRenderer
                  key={model.id}
                  modelId={model.id}
                  yOffset={model.yOffset}
                />
              </Turntable>
              <GroundPlate />
            </Suspense>

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={15}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI / 2 + 0.3}
              target={[0, 0.5, 0]}
            />
          </Canvas>

          {/* Navigation arrows */}
          <button
            onClick={() => setCurrentIndex((i) => (i - 1 + MODELS.length) % MODELS.length)}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(154, 106, 255, 0.15)",
              border: "1px solid rgba(154, 106, 255, 0.3)",
              color: "#e0d0c0",
              fontSize: "1.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(154, 106, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(154, 106, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            ◀
          </button>

          <button
            onClick={() => setCurrentIndex((i) => (i + 1) % MODELS.length)}
            style={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(154, 106, 255, 0.15)",
              border: "1px solid rgba(154, 106, 255, 0.3)",
              color: "#e0d0c0",
              fontSize: "1.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(154, 106, 255, 0.3)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(154, 106, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            ▶
          </button>

          {/* Drag hint */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Georgia', serif",
              fontSize: "0.7rem",
              color: "#5a4a6a",
              letterSpacing: "0.1em",
              pointerEvents: "none",
            }}
          >
            ↔ Drag to rotate • Scroll to zoom
          </div>
        </div>

        {/* ─── Info Panel ─── */}
        <div
          style={{
            width: 320,
            padding: "24px 20px",
            borderLeft: "1px solid rgba(154, 106, 255, 0.12)",
            background: "rgba(12, 8, 20, 0.8)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Category badge */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "4px 12px",
              borderRadius: 20,
              background:
                model.category === "player"
                  ? "rgba(80, 200, 120, 0.15)"
                  : "rgba(255, 80, 80, 0.15)",
              border: `1px solid ${
                model.category === "player"
                  ? "rgba(80, 200, 120, 0.3)"
                  : "rgba(255, 80, 80, 0.3)"
              }`,
              fontFamily: "'Georgia', serif",
              fontSize: "0.65rem",
              color:
                model.category === "player" ? "#66cc88" : "#ff6666",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {model.category === "player" ? "👤 Player" : "💀 Enemy"}
          </div>

          {/* Name */}
          <h3
            style={{
              margin: 0,
              fontFamily: "'Georgia', serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "#e0d0c0",
              letterSpacing: "0.08em",
              lineHeight: 1.3,
            }}
          >
            {model.name}
          </h3>

          {/* Description */}
          <p
            style={{
              margin: 0,
              fontFamily: "'Georgia', serif",
              fontSize: "0.82rem",
              color: "#8a7a6a",
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            {model.description}
          </p>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(154,106,255,0.2), transparent)",
            }}
          />

          {/* Stats */}
          {model.stats && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.7rem",
                  color: "#6a5a7a",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Attributes
              </div>

              {model.stats.hp !== undefined && (
                <StatRow label="Health" value={`${model.stats.hp}`} color="#ff6666" icon="❤️" />
              )}
              {model.stats.damage !== undefined && (
                <StatRow label="Damage" value={`${model.stats.damage}`} color="#ffaa44" icon="⚔️" />
              )}
              {model.stats.speed && (
                <StatRow label="Speed" value={model.stats.speed} color="#44aaff" icon="💨" />
              )}
              {model.stats.ability && (
                <StatRow label="Ability" value={model.stats.ability} color="#aa66ff" icon="✨" />
              )}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(154,106,255,0.2), transparent)",
            }}
          />

          {/* Model counter + thumbnails */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "0.7rem",
                color: "#6a5a7a",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              All Models ({currentIndex + 1} / {MODELS.length})
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {MODELS.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background:
                      i === currentIndex
                        ? "rgba(154, 106, 255, 0.3)"
                        : "rgba(154, 106, 255, 0.08)",
                    border: `1px solid ${
                      i === currentIndex
                        ? "rgba(154, 106, 255, 0.6)"
                        : "rgba(154, 106, 255, 0.15)"
                    }`,
                    color: i === currentIndex ? "#e0d0c0" : "#5a4a6a",
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    padding: 0,
                  }}
                  title={m.name}
                >
                  {m.category === "player" ? "👤" : 
                    m.id === "hellhound" ? "🐺" :
                    m.id === "shadow_spider" ? "🕷️" :
                    m.id === "floating_ghost" ? "👻" :
                    m.id === "shadow_wraith" ? "💀" :
                    "🔥"
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div
            style={{
              marginTop: "auto",
              padding: "12px 0",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "0.65rem",
                color: "#4a3a5a",
                letterSpacing: "0.08em",
              }}
            >
              ← → Navigate • ESC Close
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mvFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Stat Row Helper ─────────────────────────────────────
function StatRow({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'Georgia', serif",
          fontSize: "0.75rem",
          color: "#8a7a6a",
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "0.8rem",
          color,
          fontWeight: 500,
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
