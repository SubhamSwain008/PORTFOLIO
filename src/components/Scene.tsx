"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import World from "./World";
import Player from "./Player";
import CameraController from "./CameraController";
import EntrancePrompt from "./EntrancePrompt";
import PortalPrompt from "./PortalPrompt";
import GatePrompt from "./GatePrompt";
import BoundaryDialogue from "./BoundaryDialogue";
import InventoryHUD from "./inventory/InventoryHUD";
import {
  useGameStore,
  getGameState,
  setGameState,
} from "./useGameStore";

// ─── Fog Manager (scene-level fog toggle) ────────────────
function FogManager() {
  const gameMode = useGameStore((s) => s.gameMode);
  const { scene } = useThree();

  useFrame(() => {
    if (gameMode === "explore" || gameMode === "transitioning-in" || gameMode === "transitioning-out") {
      if (!scene.fog || (scene.fog as THREE.Fog).color.getHexString() !== "12141c") {
        scene.fog = new THREE.Fog("#12141c", 40, 120);
        scene.background = new THREE.Color("#12141c");
      }
    } else {
      // Interior mode has its own fog system
      if (scene.fog && (scene.fog as THREE.Fog).color.getHexString() === "12141c") {
        scene.fog = null;
        scene.background = new THREE.Color("#000000");
      }
    }
  });

  return null;
}

// ─── Fade Overlay (full-screen black quad in front of camera) ────
function FadeOverlay() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const { camera } = useThree();

  const gameMode = useGameStore((s) => s.gameMode);
  const elapsed = useRef(0);
  const FADE_DURATION = 0.7; // seconds

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;

    // Position overlay directly in front of the camera
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    meshRef.current.position.copy(camera.position).add(camDir.multiplyScalar(0.5));
    meshRef.current.quaternion.copy(camera.quaternion);

    if (gameMode === "transitioning-in") {
      elapsed.current += delta;
      const progress = Math.min(elapsed.current / FADE_DURATION, 1);
      matRef.current.opacity = progress;

      if (progress >= 1) {
        setGameState({
          gameMode: "interior",
          transitionProgress: 1,
          isNearEntrance: false,
        });
        elapsed.current = 0;
      }
    } else if (gameMode === "transitioning-out") {
      elapsed.current += delta;
      const progress = Math.min(elapsed.current / FADE_DURATION, 1);
      // Fade OUT: opacity goes 1 → 0
      matRef.current.opacity = 1 - progress;

      if (progress >= 1) {
        setGameState({
          gameMode: "explore",
          transitionProgress: 0,
          isNearExit: false,
        });
        elapsed.current = 0;
      }
    } else if (gameMode === "interior") {
      // Keep faded out during interior entry — quickly fade from black
      if (elapsed.current < FADE_DURATION) {
        elapsed.current += delta;
        const progress = Math.min(elapsed.current / FADE_DURATION, 1);
        matRef.current.opacity = 1 - progress;
      } else {
        matRef.current.opacity = 0;
      }
    } else {
      // explore mode — ensure transparent
      matRef.current.opacity = 0;
      elapsed.current = 0;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={9999}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial
        ref={matRef}
        color="#000000"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── X Key Handler ───────────────────────────────────────
function XKeyHandler() {
  const xPressed = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "x" && !e.repeat) {
        xPressed.current = true;
        const state = getGameState();

        // ─── Death screen: restart ───
        if (state.isDead) {
          window.location.reload();
          return;
        }

        if (state.gameMode === "explore" && state.isNearPortal) {
          // Navigate to the daytime realm — full page nav frees night world memory
          window.location.href = "/realm";
          return;
        } else if (state.gameMode === "explore" && state.isNearEntrance) {
          setGameState({ gameMode: "transitioning-in", transitionProgress: 0 });
        } else if (state.gameMode === "interior" && state.isNearExit && state.currentFloor === 0) {
          setGameState({ gameMode: "transitioning-out", transitionProgress: 0 });
        } else if (state.gameMode === "interior" && state.isNearStairs && state.pendingFloor === null) {
          // ─── Floor transition (via fade) ───
          if (state.currentFloor === 0) {
            setGameState({ pendingFloor: 1 });
          } else {
            setGameState({ pendingFloor: 0 });
          }
        } else if (state.gameMode === "interior" && state.isNearUpperDoor && state.currentFloor === 1) {
          // ─── Suicide door ───
          setGameState({ isDead: true });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "x") {
        xPressed.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return null;
}

// ─── Dynamic Sun Shadows ───
// Makes the shadow map follow the player so we don't need a huge, blurry 2048x2048 texture
// covering the entire map
function DynamicSun({ playerPosRef }: { playerPosRef: React.MutableRefObject<THREE.Vector3> }) {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    if (lightRef.current && playerPosRef.current) {
      // Offset light position relative to player
      lightRef.current.position.set(
        playerPosRef.current.x + 15,
        playerPosRef.current.y + 30,
        playerPosRef.current.z + 10
      );
      // Follow player exactly
      lightRef.current.target.position.copy(playerPosRef.current);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={1.8}
      color="#b0c0ff"
      castShadow
      // Drastically lower map size because frustum is small!
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
      // Very tight box around player
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-camera-near={0.5}
      shadow-camera-far={60}
      shadow-bias={-0.0005}
    />
  );
}

// ─── Scene ───────────────────────────────────────────────
export default function Scene() {
  const keys = useRef<Record<string, boolean>>({});
  // Zero-render camera synchronization using mutable ref
  const playerPosRef = useRef(new THREE.Vector3(0, 0.6, 8));
  const gameMode = useGameStore((s) => s.gameMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const isExplore =
    gameMode === "explore" || gameMode === "transitioning-in";
  const isInterior =
    gameMode === "interior" || gameMode === "transitioning-out";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        camera={{
          fov: 48,
          near: 0.1,
          far: 120,
          position: [0, 14, 18],
        }}
      >
        {/* ─── Global systems ─── */}
        <XKeyHandler />
        <FogManager />
        <FadeOverlay />

        <Suspense fallback={null}>

          {/* ═══════════════════════════════════════════════
             EXPLORE MODE (3D world)
           ═══════════════════════════════════════════════ */}
          {isExplore && (
            <group>
              {/* Ambient */}
              <ambientLight intensity={0.5} color="#4a4a65" />

              {/* Dynamic Moonlight focusing shadows only on player */}
              <DynamicSun playerPosRef={playerPosRef} />

              {/* Rim light */}
              <directionalLight
                position={[-12, 20, -15]}
                intensity={0.6}
                color="#7a5a9a"
              />

              {/* Warm ground-bounce fill */}
              <directionalLight
                position={[5, 8, 20]}
                intensity={0.35}
                color="#5a4a40"
              />

              {/* Hemisphere light */}
              <hemisphereLight
                color="#445577"
                groundColor="#1a1520"
                intensity={0.4}
              />

              {/* World */}
              <World playerPosRef={playerPosRef} />

              {/* Entrance prompt */}
              <EntrancePrompt />

              {/* Back Portal prompt */}
              <PortalPrompt />

              {/* Fence Gate prompt */}
              <GatePrompt playerPosRef={playerPosRef} />

              {/* Boundary dialogue */}
              <BoundaryDialogue playerPosRef={playerPosRef} />

              {/* Player */}
              <Player positionRef={playerPosRef} keys={keys} />

              {/* Camera Controller */}
              <CameraController targetRef={playerPosRef} />
            </group>
          )}

          {/* ═══════════════════════════════════════════════
             INTERIOR MODE (To be implemented modularly)
           ═══════════════════════════════════════════════ */}
          {/* Portfolio and Game interior instances will be injected here */}

        </Suspense>
      </Canvas>

      {/* ─── Inventory HUD (HTML overlay) ─── */}
      {isExplore && <InventoryHUD />}
    </div>
  );
}
