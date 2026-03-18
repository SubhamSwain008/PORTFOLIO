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
import { FireTorchIndicator } from "./inventory/InventoryHUD";
import SaveIndicator, { setSavingStatus } from "./SaveIndicator";
import { getSessionState } from "./useSessionStore";
import { getHungerState } from "./useHungerStore";
import { getHealthState } from "./useHealthStore";
import {
  useGameStore,
  getGameState,
  setGameState,
} from "./useGameStore";
import PositionAutoSave from "./PositionAutoSave";
import { MiniMap, MiniMapLogic } from "./MiniMap";
import StaminaBar from "./StaminaBar";
import HungerBar from "./HungerBar";
import HealthBar from "./HealthBar";
import HungerManager from "./HungerManager";
import DeathOverlay from "./DeathOverlay";
import MobileControls from "./MobileControls";
import TutorialOverlay, { TutorialButton } from "./TutorialOverlay";
import { useWorldSettings, getBrightnessFilter } from "./useWorldSettings";
import { NIGHT_LIGHTING, CAMERA, TRANSITION } from "./settings/settings";

// Derive the hex string from settings for fog identity checks
const FOG_HEX = NIGHT_LIGHTING.FOG_COLOR.replace("#", "");

// ─── Fog Manager (scene-level fog toggle) ────────────────
function FogManager() {
  const { scene } = useThree();

  useFrame(() => {
    // Always apply night fog (interior is on a separate page now)
    if (!scene.fog || (scene.fog as THREE.Fog).color.getHexString() !== FOG_HEX) {
      scene.fog = new THREE.Fog(NIGHT_LIGHTING.FOG_COLOR, NIGHT_LIGHTING.FOG_NEAR, NIGHT_LIGHTING.FOG_FAR);
      scene.background = new THREE.Color(NIGHT_LIGHTING.FOG_COLOR);
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
  const FADE_DURATION = TRANSITION.FADE_DURATION; // seconds

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;

    // Position overlay directly in front of the camera
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    meshRef.current.position.copy(camera.position).add(camDir.multiplyScalar(0.5));
    meshRef.current.quaternion.copy(camera.quaternion);

    if (gameMode === "transitioning-in") {
      // Fade to black before page navigation to /hall
      elapsed.current += delta;
      const progress = Math.min(elapsed.current / FADE_DURATION, 1);
      matRef.current.opacity = progress;
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
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "x" && !e.repeat) {
        xPressed.current = true;
        const state = getGameState();

        // ─── Death screen: restart ───
        if (state.isDead) {
          window.location.reload();
          return;
        }

        if (state.gameMode === "explore" && state.isNearPortal) {
          const session = getSessionState();
          if (session.mode === "login") {
            try {
              await fetch("/api/game/save-hunger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hunger: getHungerState().hunger, health: getHealthState().health }),
              });
            } catch (err) {}
          }
          // Navigate to the daytime realm — full page nav frees night world memory
          window.location.href = "/realm?portal=true";
          return;
        } else if (state.gameMode === "explore" && state.isNearEntrance) {
          // Navigate to the hall interior page
          sessionStorage.setItem("hallEntryAllowed", "true");
          const session = getSessionState();
          if (session.mode === "login") {
            try {
              await fetch("/api/game/save-hunger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hunger: getHungerState().hunger, health: getHealthState().health }),
              });
            } catch (err) {}
          }
          window.location.href = "/hall";
          return;
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
        playerPosRef.current.x + NIGHT_LIGHTING.MOON_OFFSET[0],
        playerPosRef.current.y + NIGHT_LIGHTING.MOON_OFFSET[1],
        playerPosRef.current.z + NIGHT_LIGHTING.MOON_OFFSET[2]
      );
      // Follow player exactly
      lightRef.current.target.position.copy(playerPosRef.current);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={NIGHT_LIGHTING.MOON_INTENSITY}
      color={NIGHT_LIGHTING.MOON_COLOR}
      castShadow
      // Drastically lower map size because frustum is small!
      shadow-mapSize-width={NIGHT_LIGHTING.SHADOW_MAP_SIZE}
      shadow-mapSize-height={NIGHT_LIGHTING.SHADOW_MAP_SIZE}
      // Very tight box around player
      shadow-camera-left={-NIGHT_LIGHTING.SHADOW_CAMERA_BOUNDS}
      shadow-camera-right={NIGHT_LIGHTING.SHADOW_CAMERA_BOUNDS}
      shadow-camera-top={NIGHT_LIGHTING.SHADOW_CAMERA_BOUNDS}
      shadow-camera-bottom={-NIGHT_LIGHTING.SHADOW_CAMERA_BOUNDS}
      shadow-camera-near={NIGHT_LIGHTING.SHADOW_NEAR}
      shadow-camera-far={NIGHT_LIGHTING.SHADOW_FAR}
      shadow-bias={NIGHT_LIGHTING.SHADOW_BIAS}
    />
  );
}

// ─── Scene ───────────────────────────────────────────────
export default function Scene() {
  const keys = useRef<Record<string, boolean>>({});
  // Zero-render camera synchronization using mutable ref
  const playerPosRef = useRef(new THREE.Vector3(0, 0.6, 8));
  const playerAngleRef = useRef(0);
  const gameMode = useGameStore((s) => s.gameMode);
  const nightBrightness = useWorldSettings((s) => s.night.brightness);
  const brightnessFilter = getBrightnessFilter("night");

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
    gameMode === "explore" || gameMode === "transitioning-in" || gameMode === "transitioning-out";

  return (
    <div onContextMenu={e => e.preventDefault()} style={{ width: "100vw", height: "100vh", background: NIGHT_LIGHTING.BACKGROUND_COLOR, filter: `brightness(${brightnessFilter})`, transition: "filter 0.3s ease" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: NIGHT_LIGHTING.TONE_MAPPING_EXPOSURE,
        }}
        camera={{
          fov: CAMERA.FOV,
          near: CAMERA.NEAR,
          far: CAMERA.FAR_NIGHT,
          position: [0, 14, 18],
        }}
      >
        <XKeyHandler />
        <FogManager />
        <FadeOverlay />
        <MiniMapLogic playerPosRef={playerPosRef} />

        <Suspense fallback={null}>

          {/* ═══════════════════════════════════════════════
             EXPLORE MODE (3D world)
           ═══════════════════════════════════════════════ */}
          {isExplore && (
            <group>
              {/* Ambient */}
              <ambientLight intensity={NIGHT_LIGHTING.AMBIENT_INTENSITY} color={NIGHT_LIGHTING.AMBIENT_COLOR} />

              {/* Dynamic Moonlight focusing shadows only on player */}
              <DynamicSun playerPosRef={playerPosRef} />

              {/* Rim light */}
              <directionalLight
                position={[-12, 20, -15]}
                intensity={NIGHT_LIGHTING.RIM_INTENSITY}
                color={NIGHT_LIGHTING.RIM_COLOR}
              />

              {/* Warm ground-bounce fill */}
              <directionalLight
                position={[5, 8, 20]}
                intensity={NIGHT_LIGHTING.FILL_INTENSITY}
                color="#5a4a40"
              />

              {/* Hemisphere light */}
              <hemisphereLight
                color={NIGHT_LIGHTING.HEMI_SKY}
                groundColor={NIGHT_LIGHTING.HEMI_GROUND}
                intensity={NIGHT_LIGHTING.HEMI_INTENSITY}
              />

              {/* World */}
              <World playerPosRef={playerPosRef} playerAngleRef={playerAngleRef} />

              {/* Entrance prompt */}
              <EntrancePrompt />

              {/* Back Portal prompt */}
              <PortalPrompt />

              {/* Fence Gate prompt */}
              <GatePrompt playerPosRef={playerPosRef} />

              {/* Boundary dialogue */}
              <BoundaryDialogue playerPosRef={playerPosRef} />

              {/* Player */}
              <Player positionRef={playerPosRef} keys={keys} angleRef={playerAngleRef} />

              {/* Camera Controller */}
              <CameraController targetRef={playerPosRef} angleRef={playerAngleRef} />
            </group>
          )}

          {/* ═══════════════════════════════════════════════
             INTERIOR MODE — Handled on separate /hall page
             to save GPU by not rendering both worlds at once
           ═══════════════════════════════════════════════ */}

        </Suspense>
      </Canvas>

      {/* ─── Inventory HUD (HTML overlay) ─── */}
      {isExplore && <InventoryHUD />}
      {isExplore && <FireTorchIndicator />}

      {/* ─── Position auto-save (login mode only) ─── */}
      <PositionAutoSave playerPosRef={playerPosRef} world="night" />

      {/* ─── Save indicator ─── */}
      <SaveIndicator />

      {/* ─── HUD Overlay ─── */}
      {isExplore && <MiniMap />}
      <StaminaBar />
      <HungerBar />
      <HealthBar />
      <HungerManager />
      <DeathOverlay />
      <MobileControls />
      <TutorialOverlay />
      <TutorialButton />
    </div>
  );
}
