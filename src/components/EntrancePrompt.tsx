"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

export default function EntrancePrompt() {
    const isNear = useGameStore((s) => s.isNearEntrance);
    const gameMode = useGameStore((s) => s.gameMode);

    const promptRef = useRef<THREE.Mesh>(null!);
    const titleRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);
    const time = useRef(0);

    const visible = isNear && gameMode === "explore";

    useFrame((_, delta) => {
        time.current += delta;

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

        // Title glow pulse
        if (titleRef.current) {
            const mat = titleRef.current.material as THREE.MeshBasicMaterial;
            if (mat) {
                mat.opacity = 0.7 + Math.sin(time.current * 1.5) * 0.15;
            }
        }
    });

    // Building: front face at Z = DEPTH/2 = 4, door position
    const DOOR_Z = 4.5;

    return (
        <group>
            {/* ─── Building Name: "THE HALL OF IDENTITY" ─── */}
            {/* Billboard always faces camera — guaranteed visibility */}
            <Billboard position={[0, 8, DOOR_Z + 1.2]} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                    ref={titleRef}
                    fontSize={0.65}
                    letterSpacing={0.2}
                    color="#c8b89a"
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0.85}
                >
                    THE HALL OF IDENTITY
                </Text>
            </Billboard>

            {/* ─── "[ X ] ENTER" prompt ─── */}
            {/* Billboard ensures it's always readable */}
            <Billboard
                position={[0, 2.5, DOOR_Z + 2]}
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
