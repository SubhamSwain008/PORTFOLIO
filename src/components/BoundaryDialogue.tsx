"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

const BOUNDS = 220;
const WARN_DIST = 15; // Start warning 15 units before boundary

const MESSAGES = [
    "I shouldn't go this far from the fence...",
    "It's getting too far out here...",
    "I should turn back...",
    "There's nothing out here for me...",
];

/**
 * Shows a dialogue bubble above the player when near the world boundary.
 * Uses a group ref that follows the player position every frame.
 */
export default function BoundaryDialogue({
    playerPosRef,
    color = "#e8d8c0",
}: {
    playerPosRef: React.RefObject<THREE.Vector3>;
    color?: string;
}) {
    const groupRef = useRef<THREE.Group>(null!);
    const textRef = useRef<THREE.Mesh>(null!);
    const bgRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const lastTriggered = useRef(0);
    const wasNear = useRef(false);

    useFrame((state, delta) => {
        if (!playerPosRef.current || !groupRef.current) return;

        // Follow the player every frame
        groupRef.current.position.set(
            playerPosRef.current.x,
            playerPosRef.current.y + 1.8,
            playerPosRef.current.z
        );

        const px = Math.abs(playerPosRef.current.x);
        const pz = Math.abs(playerPosRef.current.z);
        const maxDist = Math.max(px, pz);

        const nearBoundary = maxDist > BOUNDS - WARN_DIST;

        // Cycle message when first entering the boundary zone
        if (nearBoundary && !wasNear.current) {
            const now = state.clock.getElapsedTime();
            if (now - lastTriggered.current > 2) {
                setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
                lastTriggered.current = now;
            }
        }
        wasNear.current = nearBoundary;

        const target = nearBoundary ? 1 : 0;
        opacity.current += (target - opacity.current) * 4 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (textRef.current) {
            const mat = textRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current;
        }
        if (bgRef.current) {
            const mat = bgRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current * 0.65;
        }
    });

    return (
        <group ref={groupRef}>
            <Billboard follow lockX={false} lockY={false} lockZ={false}>
                {/* Background bubble */}
                <mesh ref={bgRef} position={[0, 0, -0.01]}>
                    <planeGeometry args={[5.8, 0.6]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0} />
                </mesh>
                <Text
                    ref={textRef}
                    fontSize={0.32}
                    letterSpacing={0.04}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    material-transparent
                    material-opacity={0}
                    maxWidth={6}
                >
                    {MESSAGES[messageIndex]}
                </Text>
            </Billboard>
        </group>
    );
}
