"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

const FONT_NOSIFER = "/fonts/nosifer.ttf";
const FONT_BUTCHERMAN = "/fonts/butcherman.ttf";
const FONT_CREEPSTER = "/fonts/creepster.ttf";

// ─── Pulsing Avatar Ring ─────────────────────────────────
function PulsingRing() {
    const ringRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        if (!ringRef.current) return;
        const t = state.clock.elapsedTime;
        const mat = ringRef.current.material as THREE.MeshStandardMaterial;
        // Slow heartbeat-like pulse
        const pulse = Math.sin(t * 2.0) * 0.5 + 0.5;
        mat.emissiveIntensity = 1.0 + pulse * 3.0;
        mat.opacity = 0.5 + pulse * 0.4;
        // Slight scale throb
        ringRef.current.scale.setScalar(1.0 + pulse * 0.04);
    });

    return (
        <mesh ref={ringRef} position={[0, 0, 0.005]}>
            <ringGeometry args={[1.15, 1.28, 32]} />
            <meshStandardMaterial
                color="#880000"
                emissive="#ff0000"
                emissiveIntensity={1.5}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
}

// ─── Stat Bar Component ──────────────────────────────────
function StatBar({
    label,
    value,
    position,
    delay,
}: {
    label: string;
    value: number;
    position: [number, number, number];
    delay: number;
}) {
    const fillRef = useRef<THREE.Mesh>(null!);
    const elapsed = useRef(0);
    const BAR_WIDTH = 3.0;
    const BAR_HEIGHT = 0.22;

    useFrame((_, delta) => {
        elapsed.current += delta;
        if (!fillRef.current) return;

        const t = Math.max(0, elapsed.current - delay);
        const progress = Math.min(1, t / 1.5); // 1.5s animation
        const eased = 1 - Math.pow(1 - progress, 4);
        const currentWidth = eased * (value / 100) * BAR_WIDTH;

        fillRef.current.scale.x = Math.max(0.001, currentWidth);
        fillRef.current.position.x = -BAR_WIDTH / 2 + currentWidth / 2;

        // Horror Glitch Effect
        const mat = fillRef.current.material as THREE.MeshStandardMaterial;
        if (Math.random() > 0.92 && progress > 0.1) {
            fillRef.current.position.y = (Math.random() - 0.5) * 0.08;
            fillRef.current.position.x += (Math.random() - 0.5) * 0.05;
            mat.emissiveIntensity = 0.3 + Math.random() * 4.5;
        } else {
            fillRef.current.position.y = 0;
            mat.emissiveIntensity = 1.5;
        }
    });

    return (
        <group position={position}>
            {/* Label */}
            <Text
                position={[-BAR_WIDTH / 2, 0.28, 0.01]}
                fontSize={0.14}
                font={FONT_CREEPSTER}
                color="#7a2a2a"
                anchorX="left"
                anchorY="middle"
            >
                {label}
            </Text>

            {/* Percentage */}
            <Text
                position={[BAR_WIDTH / 2, 0.28, 0.01]}
                fontSize={0.14}
                font={FONT_CREEPSTER}
                color="#5a1a1a"
                anchorX="right"
                anchorY="middle"
            >
                {value}%
            </Text>

            {/* Background track */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[BAR_WIDTH, BAR_HEIGHT]} />
                <meshStandardMaterial color="#0a0000" roughness={1.0} />
            </mesh>

            {/* Fill bar - Blood Red */}
            <mesh ref={fillRef} position={[-BAR_WIDTH / 2, 0, 0.01]}>
                <planeGeometry args={[1, BAR_HEIGHT - 0.04]} />
                <meshStandardMaterial
                    color="#880000"
                    emissive="#b30000"
                    emissiveIntensity={1.5}
                    roughness={0.84}
                />
            </mesh>
        </group>
    );
}

// ─── Profile Wall ────────────────────────────────────────
export default function ProfileWall() {
    const wallRef = useRef<THREE.Group>(null!);
    const revealTime = useRef(0);
    const wallTex = useTexture("/assets/wall_HOI.png");

    // Stretch texture to fill the wall
    wallTex.wrapS = THREE.ClampToEdgeWrapping;
    wallTex.wrapT = THREE.ClampToEdgeWrapping;
    wallTex.repeat.set(1, 1);

    // Profile data
    const stats = useMemo(
        () => [
            { label: "Discipline", value: 82, delay: 1.2 },
            { label: "Depth", value: 91, delay: 1.5 },
            { label: "Execution", value: 88, delay: 1.8 },
            { label: "Chaos Resistance", value: 76, delay: 2.1 },
        ],
        []
    );

    useFrame((state, delta) => {
        revealTime.current += delta;
        if (wallRef.current) {
            // Unstable screen shake
            if (Math.random() > 0.98) {
                wallRef.current.position.x = (Math.random() - 0.5) * 0.1;
                wallRef.current.position.y = WALL_HEIGHT / 2 + 0.3 + (Math.random() - 0.5) * 0.1;
            } else {
                wallRef.current.position.x = 0;
                wallRef.current.position.y = WALL_HEIGHT / 2 + 0.3;
            }
        }
    });

    const WALL_WIDTH = 40;
    const WALL_HEIGHT = 20;

    return (
        <group ref={wallRef} position={[0, 4.8, -3]}>
            {/* ─── Wall backdrop ─── */}
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[WALL_WIDTH, WALL_HEIGHT]} />
                <meshStandardMaterial
                    map={wallTex}
                    color="#ffffff"
                    emissive="#220000"
                    emissiveIntensity={0.4}
                    roughness={0.95}
                    metalness={0.05}
                />
            </mesh>

            {/* ══════════════════════════════════════════════════
           LEFT SECTION — Profile Picture
         ══════════════════════════════════════════════════ */}
            <group position={[-7.5, -3.5, 0]}>
                {/* Circular avatar background */}
                <mesh position={[0, 0, 0.01]}>
                    <circleGeometry args={[1.2, 32]} />
                    <meshStandardMaterial
                        color="#110505"
                        roughness={0.9}
                    />
                </mesh>
                {/* Inner circle (avatar placeholder with initials) */}
                <mesh position={[0, 0, 0.02]}>
                    <circleGeometry args={[1.05, 32]} />
                    <meshStandardMaterial
                        color="#0a0000"
                        emissive="#1a0000"
                        emissiveIntensity={0.9}
                        roughness={0.8}
                    />
                </mesh>
                {/* Avatar initials */}
                <Text
                    position={[0, 0, 0.03]}
                    fontSize={0.9}
                    font={FONT_BUTCHERMAN}
                    color="#5a1010"
                    anchorX="center"
                    anchorY="middle"
                >
                    SS
                </Text>

                {/* Ring glow - Animated Pulse */}
                <PulsingRing />
            </group>

            {/* ══════════════════════════════════════════════════
           CENTER SECTION — Name, Title, Tagline, Bio
         ══════════════════════════════════════════════════ */}
            <group position={[0, -4.5, 0.05]}>
                {/* Semi-transparent dark backdrop for readability */}
                <mesh position={[0, 1.3, -0.02]}>
                    <planeGeometry args={[10, 4.5]} />
                    <meshStandardMaterial
                        color="#000000"
                        transparent
                        opacity={0.45}
                        roughness={1}
                    />
                </mesh>
                {/* Name */}
                <Text
                    position={[0, 2.8, 0]}
                    fontSize={0.65}
                    font={FONT_NOSIFER}
                    letterSpacing={0.08}
                    color="#8a1a1a"
                    anchorX="center"
                    anchorY="middle"
                >
                    Subham Swain
                </Text>

                {/* Horizontal rule under name */}
                <mesh position={[0, 2.35, 0]}>
                    <planeGeometry args={[4, 0.02]} />
                    <meshStandardMaterial
                        color="#8a0000"
                        emissive="#bf0000"
                        emissiveIntensity={1.8}
                    />
                </mesh>

                {/* Title */}
                <Text
                    position={[0, 1.95, 0]}
                    fontSize={0.28}
                    font={FONT_BUTCHERMAN}
                    letterSpacing={0.1}
                    color="#5a2a2a"
                    anchorX="center"
                    anchorY="middle"
                >
                    System Architect  |  Builder
                </Text>

                {/* Tagline */}
                <Text
                    position={[0, 1.1, 0]}
                    fontSize={0.35}
                    font={FONT_CREEPSTER}
                    color="#9a2a2a"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={9}
                    textAlign="center"
                    lineHeight={1.4}
                >
                    I build controlled systems in chaotic environments.
                </Text>

                {/* Bio */}
                <Text
                    position={[0, -0.1, 0]}
                    fontSize={0.28}
                    font={FONT_CREEPSTER}
                    color="#8a2a2a"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={9}
                    textAlign="center"
                    lineHeight={1.6}
                >
                    {`I design with structure.\nI optimize for depth.\nI build systems that evolve beyond templates.`}
                </Text>
            </group>

            {/* ══════════════════════════════════════════════════
           RIGHT SECTION — Stat Bars
         ══════════════════════════════════════════════════ */}
            <group position={[7.5, -6.5, 0.01]}>
                <Text
                    position={[0, 2.8, 0]}
                    fontSize={0.22}
                    font={FONT_BUTCHERMAN}
                    letterSpacing={0.15}
                    color="#5a1a1a"
                    anchorX="center"
                    anchorY="middle"
                >
                    ATTRIBUTES
                </Text>

                {stats.map((stat, i) => (
                    <StatBar
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        position={[0, 2.0 - i * 0.7, 0]}
                        delay={stat.delay}
                    />
                ))}
            </group>
        </group>
    );
}
