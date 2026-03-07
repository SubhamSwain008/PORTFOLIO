"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ProfileBuilding from "../ProfileBuilding";
import { DAY_ENV_PROPS } from "../../lib/dayEnvironment";
import { InstancedDayTrees, InstancedDayRocks, InstancedDayFencePerimeter } from "./InstancedDayEnv";
import WorldItems from "../inventory/WorldItems";

interface DayWorldProps {
  playerPosRef?: React.MutableRefObject<THREE.Vector3>;
}

export default function DayWorld({ playerPosRef }: DayWorldProps) {
    const grassTexture = useTexture("/assets/grass.png");
    const portalVideo = useVideoTexture("/assets/portal.mp4", {
        muted: true,
        loop: true,
        start: true,
        crossOrigin: "anonymous",
    });

    // Optimize: Pause the video when player is far away
    useFrame(({ camera }) => {
        if (!portalVideo || !portalVideo.image) return;

        // Distance from camera to portal
        const dist = camera.position.distanceToSquared(new THREE.Vector3(-10, 0, -44.9));
        const video = portalVideo.image as HTMLVideoElement;

        // 60 units squared = 3600
        if (dist > 1800 && !video.paused) {
            video.pause();
        } else if (dist <= 1800 && video.paused) {
            video.play();
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
        t.repeat.set(400 / 15, 400 / 15);
        t.needsUpdate = true;
        return t;
    }, [grassTexture]);

    return (
        <group>
            {/* Outer ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[800, 800]} />
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

            {/* ─── Back Fence Portal Gateway (return to night world) ─── */}
            <group position={[-10, 0, -44.9]}>
                {/* Portal Frame */}
                <mesh position={[0, 2.1, 0.1]}>
                    <boxGeometry args={[3.1, 4.3, 0.4]} />
                    <meshStandardMaterial color="#0a0515" emissive="#0a0515" emissiveIntensity={0.2} roughness={0.9} />
                </mesh>

                {/* Portal Inner Void — video texture */}
                <mesh position={[0, 2.1, 0.31]}>
                    <planeGeometry args={[3.1, 4.3]} />
                    <meshBasicMaterial map={portalVideo} color="#ffffff" toneMapped={false} />
                </mesh>

                {/* Portal Light */}
                <pointLight
                    position={[0, 3, 1]}
                    color="#6a3a9a"
                    intensity={5}
                    distance={15}
                    decay={2}
                />
            </group>

        {/* ─── Collectible Items ─── */}
        {playerPosRef && <WorldItems playerPosRef={playerPosRef} realm="day" />}
      </group>
    );
}
