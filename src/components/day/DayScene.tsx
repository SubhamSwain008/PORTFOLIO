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
import PositionAutoSave from "../PositionAutoSave";
import { MiniMap, MiniMapLogic } from "../MiniMap";
import StaminaBar from "../StaminaBar";
import { getSessionState } from "../useSessionStore";
import { getHungerState } from "../useHungerStore";
import { useWorldSettings, getBrightnessFilter } from "../useWorldSettings";
import { DAY_LIGHTING, CAMERA, TRANSITION, GATE, PORTAL } from "../settings/settings";

// ─── Daytime Fog ───
function DayFogManager() {
    const { scene } = useThree();

    useEffect(() => {
        scene.fog = new THREE.Fog(DAY_LIGHTING.FOG_COLOR, DAY_LIGHTING.FOG_NEAR, DAY_LIGHTING.FOG_FAR);
        scene.background = new THREE.Color(DAY_LIGHTING.BACKGROUND_COLOR);
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
    const PORTAL_Z = PORTAL.BILLBOARD_Z;

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
                position={[0, 5.5, -5.5]}
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
const DAY_GATE_POSITIONS: [number, number, number][] = GATE.POSITIONS.map((g) => [
    g.pos[0], 2.2, g.pos[2],
]);

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
        const handleKeyDown = async (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "x" && !e.repeat) {
                if (nearRef.current) {
                    const session = getSessionState();
                    if (session.mode === "login") {
                        try {
                            await fetch("/api/game/save-hunger", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ hunger: getHungerState().hunger }),
                            });
                        } catch (err) {}
                    }
                    // Navigate back to night world — full page reload frees all day world memory
                    window.location.href = "/?portal=true";
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
                playerPosRef.current.x + DAY_LIGHTING.SUN_OFFSET[0],
                playerPosRef.current.y + DAY_LIGHTING.SUN_OFFSET[1],
                playerPosRef.current.z + DAY_LIGHTING.SUN_OFFSET[2]
            );
            lightRef.current.target.position.copy(playerPosRef.current);
            lightRef.current.target.updateMatrixWorld();
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            intensity={DAY_LIGHTING.SUN_INTENSITY}
            color={DAY_LIGHTING.SUN_COLOR}
            castShadow
            // Much smaller map needed!
            shadow-mapSize-width={DAY_LIGHTING.SHADOW_MAP_SIZE}
            shadow-mapSize-height={DAY_LIGHTING.SHADOW_MAP_SIZE}
            // Tight bounds around player
            shadow-camera-left={-DAY_LIGHTING.SHADOW_CAMERA_BOUNDS}
            shadow-camera-right={DAY_LIGHTING.SHADOW_CAMERA_BOUNDS}
            shadow-camera-top={DAY_LIGHTING.SHADOW_CAMERA_BOUNDS}
            shadow-camera-bottom={-DAY_LIGHTING.SHADOW_CAMERA_BOUNDS}
            shadow-camera-near={DAY_LIGHTING.SHADOW_NEAR}
            shadow-camera-far={DAY_LIGHTING.SHADOW_FAR}
            shadow-bias={DAY_LIGHTING.SHADOW_BIAS}
        />
    );
}

// ─── Main Daytime Scene ───
export default function DayScene() {
    const keys = useRef<Record<string, boolean>>({});
    const playerPosRef = useRef(new THREE.Vector3(0, 0.6, 8));
    const playerAngleRef = useRef(0);
    const dayBrightness = useWorldSettings((s) => s.day.brightness);
    const brightnessFilter = getBrightnessFilter("day");

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
        <div onContextMenu={e => e.preventDefault()} style={{ width: "100vw", height: "100vh", background: DAY_LIGHTING.BACKGROUND_COLOR, filter: `brightness(${brightnessFilter})`, transition: "filter 0.3s ease" }}>
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: DAY_LIGHTING.TONE_MAPPING_EXPOSURE,
                }}
                camera={{
                    fov: CAMERA.FOV,
                    near: CAMERA.NEAR,
                    far: CAMERA.FAR_DAY,
                    position: [0, 14, 18],
                }}
            >
                <DayXKeyHandler />
                <DayFogManager />
                <MiniMapLogic playerPosRef={playerPosRef} />

                <Suspense fallback={null}>
                    <group>
                        {/* ─── Daytime Lighting ─── */}

                        {/* Bright ambient */}
                        <ambientLight intensity={DAY_LIGHTING.AMBIENT_INTENSITY} color={DAY_LIGHTING.AMBIENT_COLOR} />

                        {/* Sunlight — warm dynamic directional following player */}
                        <DynamicDaySun playerPosRef={playerPosRef} />

                        {/* Hemisphere light — blue sky, green ground */}
                        <hemisphereLight
                            color={DAY_LIGHTING.HEMI_SKY}
                            groundColor={DAY_LIGHTING.HEMI_GROUND}
                            intensity={DAY_LIGHTING.HEMI_INTENSITY}
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
                            angleRef={playerAngleRef}
                        />

                        {/* Camera Controller (reused from night world) */}
                        <CameraController targetRef={playerPosRef} angleRef={playerAngleRef} />
                    </group>
                </Suspense>
            </Canvas>

            {/* ─── Inventory HUD (HTML overlay) ─── */}
            <InventoryHUD />

            {/* ─── Position auto-save (login mode only) ─── */}
            <PositionAutoSave playerPosRef={playerPosRef} world="day" />

            {/* ─── HUD Overlay ─── */}
            <MiniMap />
            <StaminaBar />
        </div>
    );
}
