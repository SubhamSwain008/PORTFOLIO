"use client";

import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useGameStore, setGameState, getGameState } from "../../useGameStore";
import { HALL_INTERIOR } from "../../settings/settings";

export default function CookingPrompt() {
    const isNearFireplace = useGameStore(s => s.isNearFireplace);
    const isCookingUIOpen = useGameStore(s => s.isCookingUIOpen);
    const textRef = useRef<THREE.Mesh>(null!);
    
    // Toggle UI when C is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "c") {
                const state = getGameState();
                if (state.isNearFireplace) {
                     setGameState({ isCookingUIOpen: !state.isCookingUIOpen });
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Bobbing animation for the prompt
    useFrame((state) => {
        if (textRef.current && isNearFireplace && !isCookingUIOpen) {
            textRef.current.position.y = 2.4 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        }
    });

    if (!isNearFireplace || isCookingUIOpen) return null;

    const fpPos = HALL_INTERIOR.FIREPLACE_POS;
    return (
        <Text
            ref={textRef}
            position={[fpPos[0], 2.4, fpPos[2] + 0.5]}
            fontSize={0.2}
            color="#ffbb66"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff"
            outlineWidth={0.02}
            outlineColor="#331100"
        >
            [ C ] COOK
        </Text>
    );
}
