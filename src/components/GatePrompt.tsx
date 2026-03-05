"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "./useGameStore";

/**
 * Renders a "[ X ] CROSS GATE" billboard at EACH of the 4 fence gate openings.
 * Only the nearest one fades in; the others stay invisible.
 */
const GATE_POSITIONS: [number, number, number][] = [
    [0, 2.2, -45],   // North
    [0, 2.2, 45],    // South
    [-45, 2.2, 0],   // West
    [45, 2.2, 0],    // East
];

function SingleGatePrompt({
    position,
    playerPosRef,
}: {
    position: [number, number, number];
    playerPosRef: React.RefObject<THREE.Vector3>;
}) {
    const isNear = useGameStore((s) => s.isNearGate);
    const isCrossing = useGameStore((s) => s.isCrossingGate);
    const gameMode = useGameStore((s) => s.gameMode);

    const textRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    useFrame((_, delta) => {
        // Only show if this is the closest gate to the player
        let isClosest = false;
        const show = isNear && !isCrossing && gameMode === "explore";

        if (show && playerPosRef.current) {
            const playerFlat = new THREE.Vector3(playerPosRef.current.x, 0, playerPosRef.current.z);
            const thisGateFlat = new THREE.Vector3(position[0], 0, position[2]);
            const thisDist = playerFlat.distanceTo(thisGateFlat);

            // Check if this is the closest gate
            isClosest = true;
            for (const gp of GATE_POSITIONS) {
                if (gp === position) continue;
                const otherFlat = new THREE.Vector3(gp[0], 0, gp[2]);
                if (playerFlat.distanceTo(otherFlat) < thisDist) {
                    isClosest = false;
                    break;
                }
            }
        }

        const target = (show && isClosest) ? 1 : 0;
        opacity.current += (target - opacity.current) * 6 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);

        if (textRef.current) {
            const mat = textRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current;
        }
    });

    return (
        <Billboard
            position={position}
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
        >
            <Text
                ref={textRef}
                fontSize={0.42}
                letterSpacing={0.12}
                color="#e8d8c0"
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

export default function GatePrompt({ playerPosRef }: { playerPosRef: React.RefObject<THREE.Vector3> }) {
    return (
        <group>
            {GATE_POSITIONS.map((pos, i) => (
                <SingleGatePrompt key={i} position={pos} playerPosRef={playerPosRef} />
            ))}
        </group>
    );
}
