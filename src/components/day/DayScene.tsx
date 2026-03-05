"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import DayWorld from "./DayWorld";
import DayPlayer from "./DayPlayer";
import CameraController from "../CameraController";

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
function DayPortalPrompt({ visible }: { visible: boolean }) {
    const promptRef = useRef<THREE.Mesh>(null!);
    const titleRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);
    const time = useRef(0);
    const PORTAL_Z = -28.9;

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
                    color="#ffffffff"
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0.85}
                >
                    THE HALL OF SKILLS
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
                    color="#2a3a2a"
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
    [0, 2.2, -29],
    [0, 2.2, 29],
    [-29, 2.2, 0],
    [29, 2.2, 0],
];

function SingleDayGatePrompt({
    position,
    visible,
    playerPosRef,
}: {
    position: [number, number, number];
    visible: boolean;
    playerPosRef: React.RefObject<THREE.Vector3>;
}) {
    const textRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    useFrame((_, delta) => {
        let isClosest = false;

        if (visible && playerPosRef.current) {
            const playerFlat = new THREE.Vector3(playerPosRef.current.x, 0, playerPosRef.current.z);
            const thisGateFlat = new THREE.Vector3(position[0], 0, position[2]);
            const thisDist = playerFlat.distanceTo(thisGateFlat);

            isClosest = true;
            for (const gp of DAY_GATE_POSITIONS) {
                if (gp === position) continue;
                const otherFlat = new THREE.Vector3(gp[0], 0, gp[2]);
                if (playerFlat.distanceTo(otherFlat) < thisDist) {
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
                color="#2a3a2a"
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

function DayGatePrompt({ visible, playerPosRef }: { visible: boolean; playerPosRef: React.RefObject<THREE.Vector3> }) {
    return (
        <group>
            {DAY_GATE_POSITIONS.map((pos, i) => (
                <SingleDayGatePrompt key={i} position={pos} visible={visible} playerPosRef={playerPosRef} />
            ))}
        </group>
    );
}

// ─── X Key Handler for daytime — only portal return ───
function DayXKeyHandler({ isNearPortal }: { isNearPortal: boolean }) {
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

// ─── Main Daytime Scene ───
export default function DayScene() {
    const keys = useRef<Record<string, boolean>>({});
    const playerPosRef = useRef(new THREE.Vector3(0, 0.6, 8));
    const [isNearPortal, setIsNearPortal] = useState(false);
    const [isNearGate, setIsNearGate] = useState(false);

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

    const handleNearPortal = useCallback((near: boolean) => {
        setIsNearPortal(near);
    }, []);

    const handleNearGate = useCallback((near: boolean) => {
        setIsNearGate(near);
    }, []);

    return (
        <div style={{ width: "100vw", height: "100vh", background: "#87CEEB" }}>
            <Canvas
                shadows
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.6,
                }}
                camera={{
                    fov: 48,
                    near: 0.1,
                    far: 150,
                    position: [0, 14, 18],
                }}
            >
                {/* Global systems */}
                <DayXKeyHandler isNearPortal={isNearPortal} />
                <DayFogManager />

                <Suspense fallback={null}>
                    <group>
                        {/* ─── Daytime Lighting ─── */}

                        {/* Bright ambient */}
                        <ambientLight intensity={2.0} color="#fffbe6" />

                        {/* Sunlight — warm directional */}
                        <directionalLight
                            position={[20, 40, 15]}
                            intensity={3.5}
                            color="#fff5dd"
                            castShadow
                            shadow-mapSize-width={1024}
                            shadow-mapSize-height={1024}
                            shadow-camera-left={-35}
                            shadow-camera-right={35}
                            shadow-camera-top={35}
                            shadow-camera-bottom={-35}
                            shadow-camera-near={0.5}
                            shadow-camera-far={80}
                            shadow-bias={-0.0003}
                        />

                        {/* Hemisphere light — blue sky, green ground */}
                        <hemisphereLight
                            color="#88bbff"
                            groundColor="#4a6a3a"
                            intensity={1.1}
                        />

                        {/* World */}
                        <DayWorld />

                        {/* Portal prompt & building title */}
                        <DayPortalPrompt visible={isNearPortal} />

                        {/* Gate prompt */}
                        <DayGatePrompt visible={isNearGate} playerPosRef={playerPosRef} />

                        {/* Player — no flashlight */}
                        <DayPlayer
                            positionRef={playerPosRef}
                            keys={keys}
                            onNearPortal={handleNearPortal}
                            onNearGate={handleNearGate}
                        />

                        {/* Camera Controller (reused from night world) */}
                        <CameraController targetRef={playerPosRef} />
                    </group>
                </Suspense>
            </Canvas>
        </div>
    );
}
