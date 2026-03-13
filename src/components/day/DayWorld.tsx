"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ProfileBuilding from "../ProfileBuilding";
import { DAY_ENV_PROPS } from "../../lib/dayEnvironment";
import { InstancedDayTrees, InstancedDayRocks, InstancedDayFencePerimeter } from "./InstancedDayEnv";
import WorldItems from "../inventory/WorldItems";
import InstancedGrass from "../InstancedGrass";
import { DAY_ENV, PORTAL } from "../settings/settings";


interface DayWorldProps {
    playerPosRef?: React.MutableRefObject<THREE.Vector3>;
}

// ─── Glowing Portal Frame (Day) ───
// Reads proximity state and animates glow intensity
export default function DayWorld({ playerPosRef }: DayWorldProps) {
    const grassTexture = useTexture("/assets/grass.png");
    const portalVideo = useVideoTexture("/assets/portal.mp4", {
        muted: true,
        loop: true,
        start: false, // Don't auto-play — toggled by proximity
        crossOrigin: "anonymous",
    });

    // Play/pause portal video based on camera distance (30 units)
    const portalWorldPos = useMemo(() => new THREE.Vector3(...PORTAL.PORTAL_POS), []);
    useFrame(({ camera }) => {
        if (!portalVideo?.image) return;
        const dist = camera.position.distanceTo(portalWorldPos);
        const video = portalVideo.image as HTMLVideoElement;
        if (dist < PORTAL.VIDEO_DISTANCE && video.paused) {
            video.play().catch(() => {});
        } else if (dist >= PORTAL.VIDEO_DISTANCE && !video.paused) {
            video.pause();
        }
    });

    const texBase = useMemo(() => {
        const t = grassTexture.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(4, 4);
        t.needsUpdate = true;
        return t;
    }, [grassTexture]);

    const texInner = useMemo(() => {
        const t = grassTexture.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(4, 4);
        t.needsUpdate = true;
        return t;
    }, [grassTexture]);

    const texBuilding = useMemo(() => {
        const t = grassTexture.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(5.6, 5.6);
        t.needsUpdate = true;
        return t;
    }, [grassTexture]);

    const texOuter = useMemo(() => {
        const t = grassTexture.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        // Keep the same ratio as 4 repeats per 60 units -> (1600 / 60) * 4 = 106.666
        t.repeat.set(1600 / 15, 1600 / 15);
        t.needsUpdate = true;
        return t;
    }, [grassTexture]);

    return (
        <group>
            {/* Outer ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[1600, 1600]} />
                <meshStandardMaterial
                    map={texOuter}
                    color="#d0d8c0"
                    roughness={0.82}
                    metalness={0.04}
                />
            </mesh>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    map={texBase}
                    color="#c8d0b8"
                    roughness={0.82}
                    metalness={0.04}
                />
            </mesh>

            {/* Inner ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial
                    map={texInner}
                    color="#d0d8c0"
                    roughness={0.78}
                    metalness={0.05}
                />
            </mesh>

            {/* Building area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[14, 14]} />
                <meshStandardMaterial
                    map={texBuilding}
                    color="#c0c0b0"
                    roughness={0.75}
                    metalness={0.06}
                />
            </mesh>

            {/* ─── Reused Building ("Hall of Skills") ─── */}
            <ProfileBuilding />

            {/* Warm wood fence */}
            <InstancedDayFencePerimeter />

            {/* Environment — different positions via DAY_ENV_PROPS */}
            <InstancedDayTrees items={DAY_ENV_PROPS} />
            <InstancedDayRocks items={DAY_ENV_PROPS} />
            <InstancedGrass realm="day" baseColor={DAY_ENV.GRASS_COLOR} count={DAY_ENV.GRASS_COUNT} treePositions={DAY_ENV_PROPS.filter(e => e.type === 'tree').map(e => e.pos)} />

            {/* ─── Portal video on back wall of Main Hall (return to night world) ─── */}
            <mesh position={[0, 2.5, -4.26]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[4, 5]} />
                <meshBasicMaterial map={portalVideo} color="#ffffff" toneMapped={false} />
            </mesh>

            {/* ─── Collectible Items ─── */}
            {playerPosRef && <WorldItems playerPosRef={playerPosRef} realm="day" />}
        </group>
    );
}
