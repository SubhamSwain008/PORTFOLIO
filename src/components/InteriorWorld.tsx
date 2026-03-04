"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Text, Billboard, useTexture, Html } from "@react-three/drei";
import * as THREE from "three";
import ProfileWall from "./ProfileWall";
import WallCandle from "./WallCandle";
import { useGameStore, getGameState, setGameState } from "./useGameStore";

const FONT_CREEPSTER = "/fonts/creepster.ttf";
const FONT_NOSIFER = "/fonts/nosifer.ttf";
const FONT_BUTCHERMAN = "/fonts/butcherman.ttf";

// ═══════════════════════════════════════════════════════════
//  REUSABLE ATMOSPHERE COMPONENTS
// ═══════════════════════════════════════════════════════════

// ─── Floating Dust Particles ─────────────────────────────
function DustParticles({ yOffset = 0 }: { yOffset?: number }) {
    const count = 200;
    const pointsRef = useRef<THREE.Points>(null!);

    const { positions, speeds, offsets } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const offsets = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = yOffset + Math.random() * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            speeds[i] = 0.05 + Math.random() * 0.15;
            offsets[i] = Math.random() * Math.PI * 2;
        }
        return { positions, speeds, offsets };
    }, [yOffset]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const t = state.clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] += speeds[i] * 0.02;
            pos[i * 3] += Math.sin(t * 0.3 + offsets[i]) * 0.003;
            pos[i * 3 + 2] += Math.cos(t * 0.2 + offsets[i]) * 0.002;
            if (pos[i * 3 + 1] > yOffset + 14) {
                pos[i * 3 + 1] = yOffset - 1;
                pos[i * 3] = (Math.random() - 0.5) * 30;
                pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#ff6644"
                transparent
                opacity={0.4}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}


// ─── Blood Drip Effect ───────────────────────────────────
function BloodDrips({ yOffset = 0 }: { yOffset?: number }) {
    const drips = useMemo(() => {
        return Array.from({ length: 15 }, () => ({
            x: (Math.random() - 0.5) * 20,
            y: yOffset + 8 + Math.random() * 3,
            width: 0.02 + Math.random() * 0.04,
            height: 0.5 + Math.random() * 2.5,
            opacity: 0.15 + Math.random() * 0.3,
        }));
    }, [yOffset]);

    return (
        <group position={[0, 0, -2.85]}>
            {drips.map((d, i) => (
                <mesh key={i} position={[d.x, d.y, 0]}>
                    <planeGeometry args={[d.width, d.height]} />
                    <meshStandardMaterial color="#4a0000" emissive="#8a0000" emissiveIntensity={0.8} transparent opacity={d.opacity} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Cobweb Corner ───────────────────────────────────────
function Cobweb({ position, scale = 1, flipX = false }: { position: [number, number, number]; scale?: number; flipX?: boolean }) {
    return (
        <group position={position} scale={[flipX ? -scale : scale, scale, scale]}>
            {[0, 0.3, 0.6, 0.9, 1.2].map((angle, i) => (
                <mesh key={i} rotation={[0, 0, -angle * 0.8]}>
                    <planeGeometry args={[0.02, 1.5 - i * 0.2]} />
                    <meshStandardMaterial color="#888888" transparent opacity={0.08 + i * 0.02} side={THREE.DoubleSide} />
                </mesh>
            ))}
            {[0.3, 0.6, 0.9].map((r, i) => (
                <mesh key={`c${i}`} position={[-r * 0.3, -r * 0.5, 0]} rotation={[0, 0, 0.5]}>
                    <planeGeometry args={[r * 0.8, 0.01]} />
                    <meshStandardMaterial color="#999999" transparent opacity={0.06} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Generic Proximity Prompt ────────────────────────────
function PromptText({ position, text, visible }: { position: [number, number, number]; text: string; visible: boolean }) {
    const textRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    useFrame((_, delta) => {
        const target = visible ? 1 : 0;
        opacity.current += (target - opacity.current) * 4 * delta;
        opacity.current = THREE.MathUtils.clamp(opacity.current, 0, 1);
        if (textRef.current) {
            const mat = textRef.current.material as THREE.MeshBasicMaterial;
            if (mat) mat.opacity = opacity.current;
        }
    });

    return (
        <Billboard position={position} follow>
            <Text
                ref={textRef}
                fontSize={0.3}
                font={FONT_CREEPSTER}
                letterSpacing={0.12}
                color="#e8d8c0"
                anchorX="center"
                anchorY="middle"
                material-transparent
                material-opacity={0}
            >
                {text}
            </Text>
        </Billboard>
    );
}

// ─── Chaotic Flickering Blood Light ──────────────────────
function FlickeringLight({ position = [0, 3, 3] as [number, number, number] }: { position?: [number, number, number] }) {
    const lightRef = useRef<THREE.PointLight>(null!);
    useFrame((state) => {
        if (!lightRef.current) return;
        const t = state.clock.elapsedTime;
        const flicker = Math.sin(t * 30) * Math.cos(t * 43) * Math.sin(t * 17);
        lightRef.current.intensity = 8.0 + (flicker > 0.6 ? flicker * 12 : flicker * 3.0);
    });
    return <pointLight ref={lightRef} position={position} color="#ff0a0a" distance={25} decay={1.5} />;
}

// ─── Exit Door (reusable on both floors) ─────────────────
function ExitDoor({ position }: { position: [number, number, number] }) {
    const doorTexture = useTexture("/assets/door.png");
    doorTexture.magFilter = THREE.NearestFilter;
    doorTexture.minFilter = THREE.NearestFilter;

    const glowRef = useRef<THREE.PointLight>(null!);
    useFrame((state) => {
        if (!glowRef.current) return;
        glowRef.current.intensity = 2.0 + Math.sin(state.clock.elapsedTime * 1.5) * 1.5;
    });

    return (
        <group position={position}>
            <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[2.0, 3.8, 0.3]} />
                <meshStandardMaterial color="#1a1614" emissive="#2a1a10" emissiveIntensity={0.45} roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.75, 0.16]}>
                <planeGeometry args={[1.55, 3.2]} />
                <meshStandardMaterial map={doorTexture} transparent roughness={0.85} metalness={0.05} />
            </mesh>
            <pointLight ref={glowRef} position={[0, 2, -0.5]} color="#ff4400" intensity={2.0} distance={6} decay={2} />
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  PIXELATED HORROR PROPS (low-poly, blocky aesthetic)
// ═══════════════════════════════════════════════════════════

// ─── Pixelated Table ─────────────────────────────────────
function PixelTable({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Table top */}
            <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[1.2, 0.08, 0.6]} />
                <meshStandardMaterial color="#2a1a0a" roughness={0.9} metalness={0.05} />
            </mesh>
            {/* Legs */}
            {[[-0.5, 0.35, -0.22], [0.5, 0.35, -0.22], [-0.5, 0.35, 0.22], [0.5, 0.35, 0.22]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.06, 0.7, 0.06]} />
                    <meshStandardMaterial color="#1a0a00" roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Pixelated Chair ─────────────────────────────────────
function PixelChair({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.4, 0]}>
                <boxGeometry args={[0.4, 0.05, 0.4]} />
                <meshStandardMaterial color="#3a2010" roughness={0.9} />
            </mesh>
            {/* Back */}
            <mesh position={[0, 0.65, -0.18]}>
                <boxGeometry args={[0.4, 0.5, 0.05]} />
                <meshStandardMaterial color="#2a1508" roughness={0.9} />
            </mesh>
            {/* Legs */}
            {[[-0.15, 0.2, -0.15], [0.15, 0.2, -0.15], [-0.15, 0.2, 0.15], [0.15, 0.2, 0.15]].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.04, 0.4, 0.04]} />
                    <meshStandardMaterial color="#1a0800" roughness={0.9} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Pixelated Skull ─────────────────────────────────────
function PixelSkull({ position }: { position: [number, number, number] }) {
    const skullRef = useRef<THREE.Group>(null!);
    useFrame((state) => {
        if (!skullRef.current) return;
        // Subtle eerie float
        skullRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    });

    return (
        <group ref={skullRef} position={position}>
            {/* Cranium */}
            <mesh>
                <boxGeometry args={[0.2, 0.22, 0.18]} />
                <meshStandardMaterial color="#d4c8a0" emissive="#2a1500" emissiveIntensity={0.3} roughness={0.8} />
            </mesh>
            {/* Eye sockets */}
            <mesh position={[-0.04, 0.02, 0.09]}>
                <boxGeometry args={[0.06, 0.06, 0.02]} />
                <meshStandardMaterial color="#0a0000" emissive="#330000" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.04, 0.02, 0.09]}>
                <boxGeometry args={[0.06, 0.06, 0.02]} />
                <meshStandardMaterial color="#0a0000" emissive="#330000" emissiveIntensity={2} />
            </mesh>
            {/* Jaw */}
            <mesh position={[0, -0.1, 0.02]}>
                <boxGeometry args={[0.14, 0.06, 0.12]} />
                <meshStandardMaterial color="#c0b488" roughness={0.85} />
            </mesh>
        </group>
    );
}

// ─── Pixelated Bookshelf ─────────────────────────────────
function PixelBookshelf({ position }: { position: [number, number, number] }) {
    const bookColors = ["#3a0a0a", "#0a2a0a", "#0a0a3a", "#3a2a0a", "#2a0a2a"];
    return (
        <group position={position}>
            {/* Frame */}
            <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[1.0, 2.0, 0.3]} />
                <meshStandardMaterial color="#1a0a02" roughness={0.9} />
            </mesh>
            {/* Shelves */}
            {[0.3, 0.85, 1.4].map((y, si) => (
                <group key={si}>
                    <mesh position={[0, y, 0.02]}>
                        <boxGeometry args={[0.9, 0.04, 0.26]} />
                        <meshStandardMaterial color="#2a1505" roughness={0.9} />
                    </mesh>
                    {/* Books */}
                    {[-0.3, -0.15, 0, 0.12, 0.28].map((bx, bi) => (
                        <mesh key={bi} position={[bx, y + 0.15, 0.02]}>
                            <boxGeometry args={[0.08 + Math.random() * 0.04, 0.2 + Math.random() * 0.1, 0.18]} />
                            <meshStandardMaterial color={bookColors[(si * 5 + bi) % bookColors.length]} roughness={0.85} />
                        </mesh>
                    ))}
                </group>
            ))}
        </group>
    );
}

// ─── Pixelated Barrel ────────────────────────────────────
function PixelBarrel({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.25, 0.3, 0.7, 8]} />
                <meshStandardMaterial color="#3a2010" roughness={0.9} metalness={0.05} />
            </mesh>
            {/* Metal bands */}
            {[0.15, 0.45, 0.6].map((y, i) => (
                <mesh key={i} position={[0, y, 0]}>
                    <torusGeometry args={[0.27, 0.015, 4, 8]} />
                    <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
                </mesh>
            ))}
        </group>
    );
}

// ─── Staircase ───────────────────────────────────────────
function Staircase({ position }: { position: [number, number, number] }) {
    const steps = 6;
    return (
        <group position={position}>
            {Array.from({ length: steps }, (_, i) => (
                <mesh key={i} position={[0, i * 0.3 + 0.15, -i * 0.4]}>
                    <boxGeometry args={[1.5, 0.3, 0.4]} />
                    <meshStandardMaterial
                        color="#1a0e05"
                        emissive="#0a0400"
                        emissiveIntensity={0.2}
                        roughness={0.92}
                        metalness={0.08}
                    />
                </mesh>
            ))}
            {/* Railing left */}
            <mesh position={[-0.8, 1.2, -1]}>
                <boxGeometry args={[0.06, 2.2, 0.06]} />
                <meshStandardMaterial color="#0a0502" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Railing right */}
            <mesh position={[0.8, 1.2, -1]}>
                <boxGeometry args={[0.06, 2.2, 0.06]} />
                <meshStandardMaterial color="#0a0502" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Railing top bar */}
            <mesh position={[0, 2.1, -1]} rotation={[0, 0, 0]}>
                <boxGeometry args={[1.7, 0.05, 0.05]} />
                <meshStandardMaterial color="#1a0a02" metalness={0.3} roughness={0.8} />
            </mesh>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  INTERIOR PLAYER
// ═══════════════════════════════════════════════════════════

function InteriorPlayer({ keys }: { keys: React.MutableRefObject<Record<string, boolean>> }) {
    const groupRef = useRef<THREE.Group>(null!);
    const velocity = useRef(0);
    const walkTime = useRef(0);
    const facingDir = useRef(1); // 1 = right, -1 = left
    const leftLegRef = useRef<THREE.Mesh>(null!);
    const rightLegRef = useRef<THREE.Mesh>(null!);
    const leftArmRef = useRef<THREE.Mesh>(null!);
    const rightArmRef = useRef<THREE.Mesh>(null!);
    const prevFloor = useRef(0);

    const SPEED = 3.5;
    const BOUNDS_LEFT = -8;
    const BOUNDS_RIGHT = 8;
    const Z_POS = 1;

    // Ground floor zones
    const EXIT_X = -5.5;
    const STAIRS_X = 7.0;

    // Upper floor zones
    const GO_DOWN_X = -6.0;
    const UPPER_DOOR_X = 7.0;

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const state = getGameState();
        if (state.gameMode !== "interior" || state.isDead) return;

        // Spawn on left side when switching to upper floor
        if (state.currentFloor !== prevFloor.current) {
            if (state.currentFloor === 1) {
                groupRef.current.position.x = -5;
            } else {
                groupRef.current.position.x = 0;
            }
            prevFloor.current = state.currentFloor;
        }

        let dir = 0;
        if (keys.current["a"] || keys.current["arrowleft"]) dir -= 1;
        if (keys.current["d"] || keys.current["arrowright"]) dir += 1;

        // Update facing direction
        if (dir !== 0) facingDir.current = dir;

        velocity.current += (dir * SPEED - velocity.current) * 0.1;
        if (Math.abs(dir) < 0.01) velocity.current *= 0.85;
        if (Math.abs(velocity.current) < 0.01) velocity.current = 0;

        groupRef.current.position.x += velocity.current * delta;
        groupRef.current.position.x = THREE.MathUtils.clamp(groupRef.current.position.x, BOUNDS_LEFT, BOUNDS_RIGHT);
        groupRef.current.position.z = Z_POS;

        // Apply facing direction via scale.x flip
        groupRef.current.scale.x = facingDir.current;

        // Walking animation — swing legs and arms when moving
        const isMoving = Math.abs(velocity.current) > 0.3;
        if (isMoving) {
            walkTime.current += delta * 8;
            const swing = Math.sin(walkTime.current) * 0.4;
            if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
            if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
            if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
            if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
        } else {
            walkTime.current = 0;
            if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
            if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
            if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
            if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
        }

        const px = groupRef.current.position.x;

        if (state.currentFloor === 0) {
            const nearExit = px <= EXIT_X;
            const nearStairs = px >= STAIRS_X;
            if (nearExit !== state.isNearExit) setGameState({ isNearExit: nearExit });
            if (nearStairs !== state.isNearStairs) setGameState({ isNearStairs: nearStairs });
            if (state.isNearUpperDoor) setGameState({ isNearUpperDoor: false });
        } else {
            const nearGoDown = px <= GO_DOWN_X;
            const nearUpperDoor = px >= UPPER_DOOR_X;
            if (nearGoDown !== state.isNearStairs) setGameState({ isNearStairs: nearGoDown });
            if (nearUpperDoor !== state.isNearUpperDoor) setGameState({ isNearUpperDoor: nearUpperDoor });
            if (state.isNearExit) setGameState({ isNearExit: false });
        }
    });

    return (
        <group ref={groupRef} position={[0, 0.6, Z_POS]}>
            {/* Rotate inner group 90° so character faces sideways */}
            <group rotation={[0, Math.PI / 2, 0]}>
                {/* ─── Pixel Head ─── */}
                <mesh position={[0, 0.55, 0]}>
                    <boxGeometry args={[0.25, 0.25, 0.25]} />
                    <meshStandardMaterial color="#c4a882" emissive="#3a1500" emissiveIntensity={0.5} roughness={0.7} />
                </mesh>
                {/* Eyes */}
                <mesh position={[-0.06, 0.57, 0.127]}>
                    <boxGeometry args={[0.05, 0.04, 0.01]} />
                    <meshStandardMaterial color="#220000" emissive="#ff0000" emissiveIntensity={2} />
                </mesh>
                <mesh position={[0.06, 0.57, 0.127]}>
                    <boxGeometry args={[0.05, 0.04, 0.01]} />
                    <meshStandardMaterial color="#220000" emissive="#ff0000" emissiveIntensity={2} />
                </mesh>

                {/* ─── Pixel Body ─── */}
                <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[0.3, 0.4, 0.2]} />
                    <meshStandardMaterial color="#4a2020" emissive="#1a0000" emissiveIntensity={1.0} roughness={0.8} />
                </mesh>

                {/* ─── Left Arm ─── */}
                <mesh ref={leftArmRef} position={[-0.22, 0.2, 0]}>
                    <boxGeometry args={[0.1, 0.35, 0.12]} />
                    <meshStandardMaterial color="#c4a882" roughness={0.7} />
                </mesh>
                {/* ─── Right Arm ─── */}
                <mesh ref={rightArmRef} position={[0.22, 0.2, 0]}>
                    <boxGeometry args={[0.1, 0.35, 0.12]} />
                    <meshStandardMaterial color="#c4a882" roughness={0.7} />
                </mesh>

                {/* ─── Left Leg ─── */}
                <mesh ref={leftLegRef} position={[-0.08, -0.15, 0]}>
                    <boxGeometry args={[0.12, 0.35, 0.14]} />
                    <meshStandardMaterial color="#2a1510" roughness={0.85} />
                </mesh>
                {/* ─── Right Leg ─── */}
                <mesh ref={rightLegRef} position={[0.08, -0.15, 0]}>
                    <boxGeometry args={[0.12, 0.35, 0.14]} />
                    <meshStandardMaterial color="#2a1510" roughness={0.85} />
                </mesh>
            </group>

            {/* Shadow on ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]}>
                <circleGeometry args={[0.3, 8]} />
                <meshStandardMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  FLOOR FADE TRANSITION
// ═══════════════════════════════════════════════════════════

function FloorFadeOverlay() {
    const pendingFloor = useGameStore((s) => s.pendingFloor);
    const overlayRef = useRef<THREE.Mesh>(null!);
    const fadePhase = useRef<"idle" | "fading-out" | "fading-in">("idle");
    const fadeProgress = useRef(0);

    useFrame((_, delta) => {
        if (!overlayRef.current) return;
        const mat = overlayRef.current.material as THREE.MeshBasicMaterial;
        const state = getGameState();

        if (pendingFloor !== null && fadePhase.current === "idle") {
            fadePhase.current = "fading-out";
            fadeProgress.current = 0;
        }

        if (fadePhase.current === "fading-out") {
            fadeProgress.current += delta * 3; // ~0.33s to full black
            mat.opacity = Math.min(fadeProgress.current, 1);

            if (fadeProgress.current >= 1) {
                // At peak black — switch floors
                if (state.pendingFloor !== null) {
                    setGameState({
                        currentFloor: state.pendingFloor as 0 | 1,
                        pendingFloor: null,
                        isNearStairs: false,
                    });
                }
                fadePhase.current = "fading-in";
                fadeProgress.current = 0;
            }
        } else if (fadePhase.current === "fading-in") {
            fadeProgress.current += delta * 2.5; // ~0.4s fade from black
            mat.opacity = Math.max(1 - fadeProgress.current, 0);

            if (fadeProgress.current >= 1) {
                mat.opacity = 0;
                fadePhase.current = "idle";
            }
        } else {
            mat.opacity = 0;
        }
    });

    return (
        <mesh ref={overlayRef} position={[0, 6, 8]} renderOrder={9980}>
            <planeGeometry args={[60, 40]} />
            <meshBasicMaterial color="#000000" transparent opacity={0} depthTest={false} />
        </mesh>
    );
}

// ═══════════════════════════════════════════════════════════
//  DEATH SCREEN
// ═══════════════════════════════════════════════════════════

function DeathScreen() {
    const isDead = useGameStore((s) => s.isDead);
    const overlayRef = useRef<THREE.Mesh>(null!);
    const opacity = useRef(0);

    useFrame((_, delta) => {
        const target = isDead ? 0.85 : 0;
        opacity.current += (target - opacity.current) * 2 * delta;
        if (overlayRef.current) {
            const mat = overlayRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = opacity.current;
        }
    });

    if (!isDead) return null;

    return (
        <group>
            {/* Opaque dark red overlay */}
            <mesh ref={overlayRef} position={[0, 6, 5]} renderOrder={9990}>
                <planeGeometry args={[60, 40]} />
                <meshBasicMaterial color="#1a0000" transparent opacity={0} depthTest={false} />
            </mesh>

            {/* Death text */}
            <Billboard position={[0, 7, 7]} follow>
                <Text
                    fontSize={0.45}
                    font={FONT_NOSIFER}
                    color="#ff1a1a"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={12}
                    textAlign="center"
                    lineHeight={2.0}
                    renderOrder={9991}
                >
                    {"You committed suicide"}
                </Text>
            </Billboard>

            <Billboard position={[0, 5.5, 7]} follow>
                <Text
                    fontSize={0.3}
                    font={FONT_CREEPSTER}
                    color="#ff4a4a"
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={9991}
                >
                    {"Press  [ X ]  to restart"}
                </Text>
            </Billboard>
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  SHARED FLOOR ENVIRONMENT (lighting, ceiling, floor, fog)
// ═══════════════════════════════════════════════════════════

function InteriorFog() {
    const { scene } = useThree();
    useFrame(() => {
        if (!scene.fog) scene.fog = new THREE.FogExp2("#0a0202", 0.02);
    });
    return null;
}

function SharedLighting() {
    return (
        <>
            <ambientLight intensity={2.5} color="#2a0808" />
            <directionalLight position={[5, 10, 8]} intensity={20.0} color="#6a2a2a" />
            <FlickeringLight />
            <pointLight position={[-3, 4, 10]} color="#6a1a1a" intensity={25.0} distance={60} decay={2} />
            <pointLight position={[10, 5, 4]} color="#3a0030" intensity={15.0} distance={30} decay={2} />
            {/* Under-light for dramatic uplight on characters & furniture */}
            <pointLight position={[0, 0.5, 4]} color="#6a3020" intensity={20.0} distance={20} decay={2} />
            <pointLight position={[-6, 0.5, 3]} color="#5a2010" intensity={15.0} distance={15} decay={2} />
            <pointLight position={[6, 0.5, 3]} color="#5a2010" intensity={15.0} distance={15} decay={2} />
            {/* Top-down fill to brighten mid-section */}
            <pointLight position={[0, 8, 2]} color="#3a1515" intensity={12.0} distance={20} decay={2} />
        </>
    );
}

function FloorSurface({ yOffset = 0 }: { yOffset?: number }) {
    const wallTex = useTexture("/assets/wall_HOI.png");
    const floorTex = wallTex.clone();
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(6, 2);

    return (
        <>
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset, 2]} receiveShadow>
                <planeGeometry args={[40, 12]} />
                <meshStandardMaterial map={floorTex} color="#5a3528" roughness={0.9} metalness={0.08} />
            </mesh>
            {/* Grime */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yOffset + 0.005, 2]}>
                <planeGeometry args={[40, 12]} />
                <meshStandardMaterial color="#0a0202" transparent opacity={0.15} roughness={1.0} />
            </mesh>
            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, yOffset + 10, 0]}>
                <planeGeometry args={[40, 12]} />
                <meshStandardMaterial color="#050101" roughness={1.0} />
            </mesh>
            {/* Baseboard */}
            <mesh position={[0, yOffset + 0.15, -2.95]}>
                <boxGeometry args={[40, 0.3, 0.12]} />
                <meshStandardMaterial color="#0a0503" emissive="#1a0800" emissiveIntensity={0.2} roughness={0.9} metalness={0.15} />
            </mesh>
        </>
    );
}

// ═══════════════════════════════════════════════════════════
//  GROUND FLOOR
// ═══════════════════════════════════════════════════════════

function GroundFloor() {
    const isNearExit = useGameStore((s) => s.isNearExit);
    const isNearStairs = useGameStore((s) => s.isNearStairs);
    const currentFloor = useGameStore((s) => s.currentFloor);
    const gameMode = useGameStore((s) => s.gameMode);

    if (currentFloor !== 0) return null;

    return (
        <group>
            <FloorSurface yOffset={0} />
            <DustParticles yOffset={0} />
            <BloodDrips yOffset={0} />

            {/* Candles */}
            <WallCandle position={[-7, 4, -2.7]} delay={0} />
            <WallCandle position={[0, 4.5, -2.7]} delay={1.3} />
            <WallCandle position={[7, 4, -2.7]} delay={2.7} />

            {/* Cobwebs */}
            <Cobweb position={[-14, 9, -2.8]} scale={1.5} />
            <Cobweb position={[14, 9, -2.8]} scale={1.2} flipX />

            {/* Profile Wall */}
            <ProfileWall />

            {/* ─── Horror Props ─── */}
            <PixelTable position={[3, 0, 0.5]} />
            <PixelChair position={[3.8, 0, 1.2]} rotation={0.3} />
            <PixelChair position={[2.2, 0, 1.0]} rotation={-0.4} />
            <PixelSkull position={[3.1, 0.78, 0.5]} />
            <PixelBookshelf position={[-3, 0, -2.6]} />
            <PixelBarrel position={[5.5, 0, -2.0]} />

            {/* ─── Staircase (right side) ─── */}
            <Staircase position={[8, 0, -1.5]} />

            {/* ─── Exit door (left side) ─── */}
            <ExitDoor position={[-9, 0, -2.8]} />

            {/* ─── Prompts ─── */}
            <PromptText
                position={[-7, 3.5, 1.5]}
                text="[ X ]  EXIT"
                visible={isNearExit && gameMode === "interior"}
            />
            <PromptText
                position={[8, 3.5, 0]}
                text="[ X ]  CLIMB UP"
                visible={isNearStairs && gameMode === "interior"}
            />
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  UPPER FLOOR
// ═══════════════════════════════════════════════════════════

function UpperFloorWall() {
    const wallTex = useTexture("/assets/wall_HOI.png");
    wallTex.wrapS = THREE.ClampToEdgeWrapping;
    wallTex.wrapT = THREE.ClampToEdgeWrapping;

    return (
        <mesh position={[0, 4.8, -3.1]}>
            <planeGeometry args={[40, 20]} />
            <meshStandardMaterial
                map={wallTex}
                color="#ffffff"
                emissive="#220000"
                emissiveIntensity={0.4}
                roughness={0.95}
                metalness={0.05}
            />
        </mesh>
    );
}

function UpperFloor() {
    const isNearStairs = useGameStore((s) => s.isNearStairs);
    const isNearUpperDoor = useGameStore((s) => s.isNearUpperDoor);
    const currentFloor = useGameStore((s) => s.currentFloor);
    const gameMode = useGameStore((s) => s.gameMode);

    if (currentFloor !== 1) return null;

    return (
        <group>
            <FloorSurface yOffset={0} />
            <UpperFloorWall />
            <DustParticles yOffset={0} />
            <BloodDrips yOffset={0} />

            {/* More intense candles on upper floor */}
            <WallCandle position={[-6, 4, -2.7]} delay={0.5} />
            <WallCandle position={[-2, 4.5, -2.7]} delay={1.8} />
            <WallCandle position={[3, 4, -2.7]} delay={0.9} />
            <WallCandle position={[7, 4.5, -2.7]} delay={2.2} />

            {/* Cobwebs everywhere */}
            <Cobweb position={[-14, 9, -2.8]} scale={2.0} />
            <Cobweb position={[14, 9, -2.8]} scale={1.8} flipX />
            <Cobweb position={[-10, 9.5, -2.5]} scale={1.0} />
            <Cobweb position={[10, 9.5, -2.5]} scale={1.2} flipX />

            {/* ─── Creepy empty room props ─── */}
            <PixelTable position={[-2, 0, 0.5]} />
            <PixelSkull position={[-1.9, 0.78, 0.5]} />
            <PixelSkull position={[4, 0, -2.2]} />
            <PixelBarrel position={[-5, 0, -2.0]} />
            <PixelBarrel position={[3, 0, -2.2]} />
            <PixelChair position={[-1.5, 0, 1.0]} rotation={2.5} />

            {/* ─── "Empty Room" text on the wall ─── */}
            <Text
                position={[0, 5.5, -2.8]}
                fontSize={0.5}
                font={FONT_NOSIFER}
                color="#4a0a0a"
                anchorX="center"
                anchorY="middle"
            >
                NO ESCAPE
            </Text>

            {/* ─── Blood writing on wall ─── */}
            <Text
                position={[0, 4.5, -2.8]}
                fontSize={0.2}
                font={FONT_CREEPSTER}
                color="#5a1010"
                anchorX="center"
                anchorY="middle"
                maxWidth={8}
                textAlign="center"
                lineHeight={1.6}
            >
                {"The door was always locked...\n...from the inside."}
            </Text>

            {/* ─── Door (right side) — the suicide door ─── */}
            <ExitDoor position={[9, 0, -2.8]} />

            {/* ─── Prompts ─── */}
            <PromptText
                position={[-7, 3.5, 1.5]}
                text="[ X ]  GO DOWN"
                visible={isNearStairs && gameMode === "interior"}
            />
            <PromptText
                position={[8, 4.5, 0]}
                text="Nothing behind this door..."
                visible={isNearUpperDoor && gameMode === "interior"}
            />
            <PromptText
                position={[8, 3.5, 0]}
                text="[ X ]  JUMP"
                visible={isNearUpperDoor && gameMode === "interior"}
            />

            {/* Extra flickering for upper floor — more chaotic */}
            <FlickeringLight position={[5, 2, 2]} />
        </group>
    );
}

// ═══════════════════════════════════════════════════════════
//  INTERIOR WORLD (main export)
// ═══════════════════════════════════════════════════════════

export default function InteriorWorld({
    keys,
}: {
    keys: React.MutableRefObject<Record<string, boolean>>;
}) {
    const camRef = useRef<THREE.OrthographicCamera>(null!);

    return (
        <group>
            <OrthographicCamera
                ref={camRef}
                makeDefault
                position={[0, 4, 15]}
                zoom={80}
                near={0.1}
                far={100}
            />

            <InteriorFog />
            <SharedLighting />

            {/* ─── Floor-specific content ─── */}
            <GroundFloor />
            <UpperFloor />

            {/* ─── Shared elements ─── */}
            <InteriorPlayer keys={keys} />
            <FloorFadeOverlay />
            <DeathScreen />

            {/* ─── Parallax Camera Controller ─── */}
            <InteriorCameraController camRef={camRef} />
        </group>
    );
}

// ─── Parallax camera for interior ────────────────────────
function InteriorCameraController({
    camRef,
}: {
    camRef: React.RefObject<THREE.OrthographicCamera>;
}) {
    useFrame((state) => {
        if (!camRef.current) return;
        const t = state.clock.elapsedTime;
        camRef.current.position.x = Math.sin(t * 0.3) * 0.3;
        camRef.current.position.y = 6.0 + Math.sin(t * 0.5) * 0.1;
        camRef.current.lookAt(0, 6.0, 0);
    });

    return null;
}
