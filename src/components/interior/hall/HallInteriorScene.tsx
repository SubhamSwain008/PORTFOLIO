"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import HallInteriorWorld from "./HallInteriorWorld";
import HallInteriorPlayer from "./HallInteriorPlayer";
import { getSessionState } from "../../useSessionStore";
import { getHungerState } from "../../useHungerStore";
import { getHealthState } from "../../useHealthStore";
import { HALL_INTERIOR } from "../../settings/settings";
import { netPostBackground } from "@/lib/netFetch";
import MobileControls from "../../MobileControls";

// ─── Interior Camera (normal gameplay) ───────────────────
function InteriorCamera({
  targetRef,
  angleRef,
}: {
  targetRef: React.MutableRefObject<THREE.Vector3>;
  angleRef: React.MutableRefObject<number>;
}) {
  const camRef = useRef<THREE.PerspectiveCamera>(null!);
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!camRef.current) return;

    const pos = targetRef.current;
    const idealOffset = new THREE.Vector3(
      0,
      HALL_INTERIOR.CAM_OFFSET_Y,
      HALL_INTERIOR.CAM_OFFSET_Z
    );
    idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleRef.current);
    const targetPosition = new THREE.Vector3().copy(pos).add(idealOffset);

    const W = HALL_INTERIOR.ROOM_WIDTH;
    const D = HALL_INTERIOR.ROOM_DEPTH;
    const H = HALL_INTERIOR.ROOM_HEIGHT;
    targetPosition.x = THREE.MathUtils.clamp(targetPosition.x, -W / 2 + 0.5, W / 2 - 0.5);
    targetPosition.z = THREE.MathUtils.clamp(targetPosition.z, -D / 2 + 0.5, D / 2 - 0.5);
    targetPosition.y = THREE.MathUtils.clamp(targetPosition.y, 2, H - 0.5);

    camRef.current.position.lerp(targetPosition, HALL_INTERIOR.CAM_LERP);

    const lookTarget = new THREE.Vector3(pos.x, 2.5, pos.z);
    currentLookAt.current.lerp(lookTarget, 0.04);
    camRef.current.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={HALL_INTERIOR.CAM_FOV}
      near={0.1}
      far={50}
      position={[0, 5, 3]}
    />
  );
}

// ─── Interior Fog ────────────────────────────────────────
function InteriorFog() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog("#4a3520", 8, 30);
    scene.background = new THREE.Color("#1a100a");
    return () => { scene.fog = null; };
  }, [scene]);

  return null;
}

// ─── Fade Overlay ────────────────────────────────────────
function InteriorFade({
  phaseRef,
  onFadeComplete,
}: {
  phaseRef: React.MutableRefObject<"in" | "idle" | "out">;
  onFadeComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const { camera } = useThree();
  const elapsed = useRef(0);
  const lastPhase = useRef<string>("");
  const DURATION = 0.8;

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    meshRef.current.position.copy(camera.position).add(dir.multiplyScalar(0.3));
    meshRef.current.quaternion.copy(camera.quaternion);

    const phase = phaseRef.current;

    // Reset elapsed when phase changes
    if (phase !== lastPhase.current) {
      elapsed.current = 0;
      lastPhase.current = phase;
    }

    if (phase === "in") {
      elapsed.current += delta;
      const p = Math.min(elapsed.current / DURATION, 1);
      matRef.current.opacity = 1 - p;
      if (p >= 1) {
        onFadeComplete();
      }
    } else if (phase === "out") {
      elapsed.current += delta;
      const p = Math.min(elapsed.current / DURATION, 1);
      matRef.current.opacity = p;
      if (p >= 1) {
        onFadeComplete();
      }
    } else {
      matRef.current.opacity = 0;
      elapsed.current = 0;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={9999}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial ref={matRef} color="#000000" transparent opacity={1}
        depthTest={false} depthWrite={false} />
    </mesh>
  );
}

// ─── Main Scene Component ────────────────────────────────
export default function HallInteriorScene() {
  const keys = useRef<Record<string, boolean>>({});

  const spawnPos: [number, number, number] = [
    HALL_INTERIOR.SPAWN_POS[0],
    HALL_INTERIOR.SPAWN_POS[1],
    HALL_INTERIOR.SPAWN_POS[2],
  ];

  const playerPosRef = useRef(new THREE.Vector3(spawnPos[0], spawnPos[1], spawnPos[2]));
  const playerAngleRef = useRef(HALL_INTERIOR.SPAWN_ANGLE);

  const isNearExitRef = useRef(false);
  const [isNearExit, setIsNearExit] = useState(false);
  const fadePhaseRef = useRef<"in" | "idle" | "out">("in");
  const isExiting = useRef(false);
  const hasNavigated = useRef(false);

  const router = useRouter();

  // Key listeners — use refs to avoid stale closures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === "x" && !e.repeat && isNearExitRef.current && !isExiting.current) {
        isExiting.current = true;
        fadePhaseRef.current = "out";
      }
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

  const handleFadeComplete = useCallback(() => {
    const phase = fadePhaseRef.current;

    if (phase === "in") {
      fadePhaseRef.current = "idle";
    } else if (phase === "out" && isExiting.current && !hasNavigated.current) {
      hasNavigated.current = true;
      const session = getSessionState();
      if (session.mode === "login") {
        // Fire-and-forget — do not block exit on network.
        netPostBackground("/api/game/save-hunger", {
          hunger: getHungerState().hunger,
          health: getHealthState().health,
        });
      }
      router.push("/");
    }
  }, [router]);

  const handleNearExit = useCallback((near: boolean) => {
    isNearExitRef.current = near;
    setIsNearExit(near);
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{ width: "100vw", height: "100vh", background: "#0a0500" }}
    >
      <Canvas
        shadows dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <InteriorFog />
        <InteriorFade phaseRef={fadePhaseRef} onFadeComplete={handleFadeComplete} />

        <Suspense fallback={null}>
          <HallInteriorWorld />

          <HallInteriorPlayer
            positionRef={playerPosRef}
            keys={keys}
            angleRef={playerAngleRef}
            onNearExit={handleNearExit}
          />

          <InteriorCamera
            targetRef={playerPosRef}
            angleRef={playerAngleRef}
          />

        </Suspense>
      </Canvas>
      <MobileControls />
      {isNearExit && (
        <div style={{
          position: "fixed",
          bottom: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#e8d8c0",
          fontFamily: "monospace",
          fontSize: "1.2rem",
          letterSpacing: "0.15em",
          textShadow: "0 0 8px #000, 0 0 16px #000",
          background: "rgba(0,0,0,0.55)",
          padding: "6px 20px",
          borderRadius: "4px",
          pointerEvents: "none",
          userSelect: "none",
        }}>
          [ X ]  EXIT HALL
        </div>
      )}
    </div>
  );
}
