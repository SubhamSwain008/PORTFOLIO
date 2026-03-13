"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Billboard, PerspectiveCamera } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import HallInteriorWorld from "./HallInteriorWorld";
import HallInteriorPlayer from "./HallInteriorPlayer";
import { getSessionState } from "../../useSessionStore";
import { getHungerState } from "../../useHungerStore";
import { getHealthState } from "../../useHealthStore";
import { HALL_INTERIOR } from "../../settings/settings";

// ─── Interior Camera ─────────────────────────────────────
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

        // Rotate offset behind player
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleRef.current);

        const targetPosition = new THREE.Vector3().copy(pos).add(idealOffset);

        // Clamp camera to stay within room bounds (with some margin)
        const W = HALL_INTERIOR.ROOM_WIDTH;
        const D = HALL_INTERIOR.ROOM_DEPTH;
        const H = HALL_INTERIOR.ROOM_HEIGHT;
        targetPosition.x = THREE.MathUtils.clamp(targetPosition.x, -W / 2 + 0.5, W / 2 - 0.5);
        targetPosition.z = THREE.MathUtils.clamp(targetPosition.z, -D / 2 + 0.5, D / 2 - 0.5);
        targetPosition.y = THREE.MathUtils.clamp(targetPosition.y, 2, H - 0.5);

        camRef.current.position.lerp(targetPosition, HALL_INTERIOR.CAM_LERP);

        // Look at player upper body
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
        return () => {
            scene.fog = null;
        };
    }, [scene]);

    return null;
}

// ─── Exit Prompt Billboard ───────────────────────────────
function ExitPrompt({ isNearExit }: { isNearExit: boolean }) {
    const textRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    useFrame((_, delta) => {
        const target = isNearExit ? 1 : 0;
        opacity.current += (target - opacity.current) * 5 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (textRef.current) {
            const mat = textRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current;
        }
    });

    const D = HALL_INTERIOR.ROOM_DEPTH;

    return (
        <Billboard
            position={[0, 2.5, D / 2 + 0.5]}
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
        >
            <Text
                ref={textRef}
                fontSize={0.35}
                letterSpacing={0.12}
                color="#e8d8c0"
                anchorX="center"
                anchorY="middle"
                material-transparent
                material-opacity={0}
            >
                [ X ]  EXIT HALL
            </Text>
        </Billboard>
    );
}

// ─── Fade Overlay (entry/exit transitions) ───────────────
function InteriorFade({
    phase,
    onFadeComplete,
}: {
    phase: "in" | "idle" | "out";
    onFadeComplete: () => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const matRef = useRef<THREE.MeshBasicMaterial>(null!);
    const { camera } = useThree();
    const elapsed = useRef(0);
    const completed = useRef(false);
    const DURATION = 0.8;

    // Reset `completed` flag on new phase
    useEffect(() => {
        if (phase !== "idle") {
            completed.current = false;
        }
    }, [phase]);

    useFrame((_, delta) => {
        if (!meshRef.current || !matRef.current) return;

        // Position in front of camera
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        meshRef.current.position.copy(camera.position).add(dir.multiplyScalar(0.3));
        meshRef.current.quaternion.copy(camera.quaternion);

        if (phase === "in") {
            // Fade from black to transparent
            elapsed.current += delta;
            const progress = Math.min(elapsed.current / DURATION, 1);
            matRef.current.opacity = 1 - progress;
            if (progress >= 1 && !completed.current) {
                completed.current = true;
                elapsed.current = 0;
                onFadeComplete();
            }
        } else if (phase === "out") {
            // Fade to black
            elapsed.current += delta;
            const progress = Math.min(elapsed.current / DURATION, 1);
            matRef.current.opacity = progress;
            if (progress >= 1 && !completed.current) {
                completed.current = true;
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
            <meshBasicMaterial
                ref={matRef}
                color="#000000"
                transparent
                opacity={1}
                depthTest={false}
                depthWrite={false}
            />
        </mesh>
    );
}

// ─── Main Scene Component ────────────────────────────────
export default function HallInteriorScene() {
    const keys = useRef<Record<string, boolean>>({});
    const playerPosRef = useRef(
        new THREE.Vector3(
            HALL_INTERIOR.SPAWN_POS[0],
            HALL_INTERIOR.SPAWN_POS[1],
            HALL_INTERIOR.SPAWN_POS[2]
        )
    );
    const playerAngleRef = useRef(HALL_INTERIOR.SPAWN_ANGLE);
    const [isNearExit, setIsNearExit] = useState(false);
    const [fadePhase, setFadePhase] = useState<"in" | "idle" | "out">("in");
    const isExiting = useRef(false);

    // Key listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = true;

            // X key to exit
            if (e.key.toLowerCase() === "x" && !e.repeat && isNearExit && !isExiting.current) {
                isExiting.current = true;
                setFadePhase("out");
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
    }, [isNearExit]);

    const router = useRouter();

    const handleFadeComplete = useCallback(async () => {
        if (fadePhase === "in") {
            setFadePhase("idle");
        } else if (fadePhase === "out") {
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
            // Navigate back to main world without a full page reload
            router.push("/");
        }
    }, [fadePhase, router]);

    const handleNearExit = useCallback((near: boolean) => {
        setIsNearExit(near);
    }, []);

    return (
        <div
            onContextMenu={e => e.preventDefault()}
            style={{
                width: "100vw",
                height: "100vh",
                background: "#0a0500",
            }}
        >
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
            >
                <InteriorFog />
                <InteriorFade phase={fadePhase} onFadeComplete={handleFadeComplete} />

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

                    <ExitPrompt isNearExit={isNearExit} />
                </Suspense>
            </Canvas>
        </div>
    );
}
