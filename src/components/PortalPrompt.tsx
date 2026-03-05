"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export default function PortalPrompt() {
    const isNear = useGameStore((s) => s.isNearPortal);
    const gameMode = useGameStore((s) => s.gameMode);

    const promptRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    const visible = isNear && gameMode === "explore";

    useFrame((_, delta) => {
        // Smooth opacity for prompt
        const target = visible ? 1 : 0;
        opacity.current += (target - opacity.current) * 4 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (promptRef.current) {
            const material = promptRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
                material.opacity = opacity.current;
            }
        }
    });

    // Portal Door position (back fence)
    const PORTAL_Z = -44.9;

    return (
        <group>
            {/* ─── "[ X ] ENTER" prompt ─── */}
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
                    color="#e8d8c0"
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0}
                >
                    [ X ]  ENTER
                </Text>
            </Billboard>
        </group>
    );
}
