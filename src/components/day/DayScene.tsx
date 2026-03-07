"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import DayWorld from "./DayWorld";
import DayPlayer from "./DayPlayer";
import CameraController from "../CameraController";
import BoundaryDialogue from "../BoundaryDialogue";
import InventoryHUD from "../inventory/InventoryHUD";
import { useGameStore } from "../useGameStore";

// ─── Daytime Fog ───
function DayFogManager() {
    const { scene } = useThree();

    useEffect(() => {
        scene.fog = new THREE.Fog("#c0daf0", 50, 130);
        scene.background = new THREE.Color("#87CEEB");
        return () => {
            scene.fog = null;
        };
    }, [scene]);

    return null;
}

// ─── Portal Prompt (same style, shows near back fence portal) ───
function DayPortalPrompt() {
    const visible = useGameStore((s) => s.isNearDayPortal);
    const gameMode = useGameStore((s) => s.gameMode);

    const promptRef = useRef<THREE.Mesh>(null!);
    const titleRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);
    const time = useRef(0);
    const PORTAL_Z = -44.9;

    useFrame((_, delta) => {
        time.current += delta;
        const target = visible ? 1 : 0;
        opacity.current += (target - opacity.current) * 4 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (promptRef.current) {
            const material = promptRef.current.material as THREE.MeshBasicMaterial;
            if (material) material.opacity = opacity.current;
        }
        if (titleRef.current) {
            const mat = titleRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = 0.8 + Math.sin(time.current * 1.5) * 0.1;
        }
    });

    return (
        <group>
            {/* Building title */}
            <Billboard position={[0, 8, 5.2]} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                    ref={titleRef}
                    fontSize={0.65}
                    letterSpacing={0.2}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0.85}
                >
                    THE HALL OF LIGHT
                </Text>
            </Billboard>

            {/* Portal return prompt */}
            <Billboard
                position={[-10, 2.5, PORTAL_Z + 2]}
                follow
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <Text
                    ref={promptRef}
                    fontSize={0.42}
                    letterSpacing={0.15}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0}
                >
                    [ X ]  RETURN
                </Text>
            </Billboard>
        </group>
    );
}

// ─── Gate Prompt for Day world ───
const DAY_GATE_POSITIONS: [number, number, number][] = [
    [0, 2.2, -45],
    [0, 2.2, 45],
    [-45, 2.2, 0],
    [45, 2.2, 0],
];

function SingleDayGatePrompt({
    position,
    playerPosRef,
}: {
    position: [number, number, number];
    playerPosRef: React.RefObject<THREE.Vector3>;
}) {
    const isNearDayGate = useGameStore((s) => s.isNearDayGate);
    const isDayCrossingGate = useGameStore((s) => s.isDayCrossingGate);
    const gameMode = useGameStore((s) => s.gameMode);

    const textRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);
    // Reusable objects for distance check to avoid per-frame allocation
    const playerFlat = useRef(new THREE.Vector3());
    const gateFlat = useRef(new THREE.Vector3());
    const otherFlat = useRef(new THREE.Vector3());

    useFrame((_, delta) => {
        let isClosest = false;
        const visible = isNearDayGate && !isDayCrossingGate && gameMode === "explore";

        if (visible && playerPosRef.current) {
            playerFlat.current.set(playerPosRef.current.x, 0, playerPosRef.current.z);
            gateFlat.current.set(position[0], 0, position[2]);
            const thisDist = playerFlat.current.distanceTo(gateFlat.current);

            isClosest = true;
            for (const gp of DAY_GATE_POSITIONS) {
                if (gp === position) continue;
                otherFlat.current.set(gp[0], 0, gp[2]);
                if (playerFlat.current.distanceTo(otherFlat.current) < thisDist) {
                    isClosest = false;
                    break;
                }
            }
        }

        const target = (visible && isClosest) ? 1 : 0;
        opacity.current += (target - opacity.current) * 6 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (textRef.current) {
            const mat = textRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current;
        }
    });

    return (
        <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
            <Text
                ref={textRef}
                fontSize={0.42}
                letterSpacing={0.12}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                material-transparent
                material-opacity={0}
            >
                [ X ]  CROSS GATE
            </Text>
        </Billboard>
    );
}

function DayGatePrompt({ playerPosRef }: { playerPosRef: React.RefObject<THREE.Vector3> }) {
    return (
        <group>
            {DAY_GATE_POSITIONS.map((pos, i) => (
                <SingleDayGatePrompt key={i} position={pos} playerPosRef={playerPosRef} />
            ))}
        </group>
    );
}

// ─── X Key Handler for daytime — only portal return ───
function DayXKeyHandler() {
    const isNearPortal = useGameStore((s) => s.isNearDayPortal);
    // Use a ref so the effect doesn't need to rebind on every proximity change
    const nearRef = useRef(isNearPortal);
    nearRef.current = isNearPortal;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "x" && !e.repeat) {
                if (nearRef.current) {
                    // Navigate back to night world — full page reload frees all day world memory
                    window.location.href = "/";
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return null;
}

// ─── Dynamic Day Sun ───
// Optimizes shadow rendering by only calculating shadows around the player
function DynamicDaySun({ playerPosRef }: { playerPosRef: React.MutableRefObject<THREE.Vector3> }) {
    const lightRef = useRef<THREE.DirectionalLight>(null!);

    useFrame(() => {
        if (lightRef.current && playerPosRef.current) {
            // High angle, bright daylight position offset
            lightRef.current.position.set(
                playerPosRef.current.x + 20,
                playerPosRef.current.y + 40,
                playerPosRef.current.z + 15
            );
            lightRef.current.target.position.copy(playerPosRef.current);
            lightRef.current.target.updateMatrixWorld();
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            intensity={3.5}
            color="#fff5dd"
            castShadow
            // Much smaller map needed!
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            // Tight bounds around player
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
            shadow-camera-near={0.5}
            shadow-camera-far={80}
            shadow-bias={-0.0003}
        />
    );
}

// ─── Main Daytime Scene ───
export default function DayScene() {
    const keys = useRef<Record<string, boolean>>({});
    const playerPosRef = useRef(new THREE.Vector3(0, 0.6, 8));

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

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#87CEEB" }}>
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.6,
                }}
                camera={{
                    fov: 48,
                    near: 0.1,
                    far: 130,
                    position: [0, 14, 18],
                }}
            >
                {/* Global systems */}
                <DayXKeyHandler />
                <DayFogManager />

                <Suspense fallback={null}>
                    <group>
                        {/* ─── Daytime Lighting ─── */}

                        {/* Bright ambient */}
                        <ambientLight intensity={2.0} color="#fffbe6" />

                        {/* Sunlight — warm dynamic directional following player */}
                        <DynamicDaySun playerPosRef={playerPosRef} />

                        {/* Hemisphere light — blue sky, green ground */}
                        <hemisphereLight
                            color="#88bbff"
                            groundColor="#4a6a3a"
                            intensity={1.1}
                        />

                        {/* World */}
                    <DayWorld playerPosRef={playerPosRef} />

                        {/* Portal prompt & building title */}
                        <DayPortalPrompt />

                        {/* Gate prompt */}
                        <DayGatePrompt playerPosRef={playerPosRef} />

                        {/* Boundary dialogue */}
                        <BoundaryDialogue playerPosRef={playerPosRef} color="#ffffff" />

                        {/* Player — no flashlight */}
                        <DayPlayer
                            positionRef={playerPosRef}
                            keys={keys}
                        />

                        {/* Camera Controller (reused from night world) */}
                        <CameraController targetRef={playerPosRef} />
                    </group>
                </Suspense>
            </Canvas>

            {/* ─── Inventory HUD (HTML overlay) ─── */}
            <InventoryHUD />
        </div>
    );
}
