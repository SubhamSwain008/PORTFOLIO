"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import World from "./World";
import Player from "./Player";
import CameraController from "./CameraController";
import EntrancePrompt from "./EntrancePrompt";
import PortalPrompt from "./PortalPrompt";
import InteriorWorld from "./InteriorWorld";
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

        if (state.gameMode === "explore" && state.isNearEntrance) {
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
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        camera={{
          fov: 48,
          near: 0.1,
          far: 200,
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

              {/* Moonlight */}
              <directionalLight
                position={[15, 30, 10]}
                intensity={1.8}
                color="#b0c0ff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-35}
                shadow-camera-right={35}
                shadow-camera-top={35}
                shadow-camera-bottom={-35}
                shadow-camera-near={0.5}
                shadow-camera-far={100}
                shadow-bias={-0.0003}
              />

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
              <World />

              {/* Entrance prompt */}
              <EntrancePrompt />

              {/* Back Portal prompt */}
              <PortalPrompt />

              {/* Player */}
              <Player positionRef={playerPosRef} keys={keys} />

              {/* Camera Controller */}
              <CameraController targetRef={playerPosRef} />
            </group>
          )}

          {/* ═══════════════════════════════════════════════
             INTERIOR MODE (2D profile room)
           ═══════════════════════════════════════════════ */}
          {isInterior && <InteriorWorld keys={keys} />}
        </Suspense>
      </Canvas>
    </div>
  );
}
