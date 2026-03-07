"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function WallCandle({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
    const lightRef = useRef<THREE.PointLight>(null!);
    const flameRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime + delay;
        if (lightRef.current) {
            const flicker = Math.sin(t * 4.5) * 0.3 + Math.sin(t * 7.1) * 0.15 + Math.sin(t * 11.3) * 0.1;
            lightRef.current.intensity = 3.0 + flicker * 2.0;
        }
        if (flameRef.current) {
            flameRef.current.scale.y = 1.0 + Math.sin(t * 6) * 0.2;
            flameRef.current.scale.x = 1.0 + Math.sin(t * 8) * 0.1;
            flameRef.current.position.y = 0.35 + Math.sin(t * 5) * 0.02;
        }
    });

    return (
        <group position={position}>
            <mesh><boxGeometry args={[0.15, 0.3, 0.08]} /><meshStandardMaterial color="#1a1008" roughness={0.9} metalness={0.4} /></mesh>
            <mesh position={[0, 0.2, 0.04]}><cylinderGeometry args={[0.03, 0.04, 0.25, 6]} /><meshStandardMaterial color="#c8b890" roughness={0.8} /></mesh>
            <mesh ref={flameRef} position={[0, 0.35, 0.04]}>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial color="#ff0000" emissive="#ffaa00" emissiveIntensity={8} transparent opacity={0.9} />
            </mesh>
            <pointLight ref={lightRef} position={[0, 0.5, 0.2]} color="#ff8833" intensity={3.0} distance={8} decay={2} />
        </group>
    );
}
