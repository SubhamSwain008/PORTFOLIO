"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { HALL_INTERIOR } from "../../settings/settings";

// ─── Fireplace Component ─────────────────────────────────
function Fireplace() {
    const pos = HALL_INTERIOR.FIREPLACE_POS;
    const fireRef = useRef<THREE.PointLight>(null!);
    const flame1Ref = useRef<THREE.Mesh>(null!);
    const flame2Ref = useRef<THREE.Mesh>(null!);
    const flame3Ref = useRef<THREE.Mesh>(null!);
    const emberRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        // Firelight flicker
        if (fireRef.current) {
            const flicker =
                Math.sin(t * 3.2) * 0.3 +
                Math.sin(t * 5.7) * 0.2 +
                Math.sin(t * 9.1) * 0.1;
            fireRef.current.intensity = HALL_INTERIOR.FIRE_INTENSITY + flicker * 4;
        }
        // Flame animation
        if (flame1Ref.current) {
            flame1Ref.current.scale.y = 1.0 + Math.sin(t * 5.5) * 0.3;
            flame1Ref.current.scale.x = 1.0 + Math.sin(t * 7) * 0.15;
            flame1Ref.current.position.y = 0.55 + Math.sin(t * 4) * 0.03;
        }
        if (flame2Ref.current) {
            flame2Ref.current.scale.y = 1.0 + Math.sin(t * 6.2 + 1) * 0.25;
            flame2Ref.current.scale.x = 1.0 + Math.sin(t * 8 + 1) * 0.12;
            flame2Ref.current.position.y = 0.45 + Math.sin(t * 5 + 1) * 0.025;
        }
        if (flame3Ref.current) {
            flame3Ref.current.scale.y = 1.0 + Math.sin(t * 4.8 + 2) * 0.35;
            flame3Ref.current.scale.x = 1.0 + Math.sin(t * 6.5 + 2) * 0.18;
            flame3Ref.current.position.y = 0.5 + Math.sin(t * 3.5 + 2) * 0.03;
        }
        // Embers glow
        if (emberRef.current) {
            const mat = emberRef.current.material as THREE.MeshStandardMaterial;
            if (mat) mat.emissiveIntensity = 3 + Math.sin(t * 2) * 1.5;
        }
    });

    return (
        <group position={[pos[0], pos[1], pos[2]]} scale={[1.4, 1.4, 1.4]}>
            {/* Fireplace back wall / chimney surround */}
            <mesh position={[0, 1.2, -0.1]} castShadow receiveShadow>
                <boxGeometry args={[2.0, 2.4, 0.3]} />
                <meshStandardMaterial color="#2a2020" roughness={0.95} metalness={0.05} />
            </mesh>

            {/* Fireplace opening arch */}
            <mesh position={[0, 0.7, 0.05]}>
                <boxGeometry args={[1.4, 1.4, 0.15]} />
                <meshStandardMaterial color="#0a0505" roughness={1} />
            </mesh>

            {/* Fireplace mantel */}
            <mesh position={[0, 1.5, 0.15]} castShadow>
                <boxGeometry args={[2.3, 0.15, 0.5]} />
                <meshStandardMaterial color="#3a2515" roughness={0.7} metalness={0.1} />
            </mesh>

            {/* Hearth / base */}
            <mesh position={[0, 0.05, 0.3]} receiveShadow>
                <boxGeometry args={[2.0, 0.1, 0.8]} />
                <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
            </mesh>

            {/* Log 1 */}
            <mesh position={[-0.2, 0.2, 0.15]} rotation={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.7, 6]} />
                <meshStandardMaterial color="#2a1a0a" roughness={0.95} />
            </mesh>
            {/* Log 2 */}
            <mesh position={[0.15, 0.2, 0.2]} rotation={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.07, 0.09, 0.65, 6]} />
                <meshStandardMaterial color="#321e0c" roughness={0.95} />
            </mesh>
            {/* Log 3 (on top) */}
            <mesh position={[0, 0.32, 0.17]} rotation={[0, 0.1, Math.PI / 6]}>
                <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
                <meshStandardMaterial color="#281508" roughness={0.95} />
            </mesh>

            {/* Flames */}
            <mesh ref={flame1Ref} position={[0, 0.55, 0.15]}>
                <sphereGeometry args={[0.12, 6, 8]} />
                <meshStandardMaterial
                    color="#ff2200"
                    emissive="#ff6600"
                    emissiveIntensity={6}
                    transparent
                    opacity={0.85}
                />
            </mesh>
            <mesh ref={flame2Ref} position={[-0.15, 0.45, 0.18]}>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshStandardMaterial
                    color="#ff4400"
                    emissive="#ffaa00"
                    emissiveIntensity={5}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <mesh ref={flame3Ref} position={[0.12, 0.5, 0.12]}>
                <sphereGeometry args={[0.1, 6, 6]} />
                <meshStandardMaterial
                    color="#ff3300"
                    emissive="#ff8800"
                    emissiveIntensity={5.5}
                    transparent
                    opacity={0.82}
                />
            </mesh>

            {/* Ember bed */}
            <mesh ref={emberRef} position={[0, 0.12, 0.17]}>
                <boxGeometry args={[0.8, 0.06, 0.4]} />
                <meshStandardMaterial
                    color="#1a0500"
                    emissive="#ff3300"
                    emissiveIntensity={3}
                    roughness={1}
                />
            </mesh>

            {/* ─── Cooking Pot ─── */}
            <group position={[0.5, 0, 0.5]}>
                {/* Pot tripod legs */}
                {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
                    <mesh
                        key={`leg-${i}`}
                        position={[Math.sin(angle) * 0.15, 0.3, Math.cos(angle) * 0.15]}
                        rotation={[Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2]}
                    >
                        <cylinderGeometry args={[0.015, 0.02, 0.6, 4]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.6} />
                    </mesh>
                ))}
                {/* Pot body */}
                <mesh position={[0, 0.45, 0]}>
                    <cylinderGeometry args={[0.18, 0.15, 0.22, 12]} />
                    <meshStandardMaterial color="#1c1c1c" roughness={0.7} metalness={0.5} />
                </mesh>
                {/* Pot rim */}
                <mesh position={[0, 0.57, 0]}>
                    <torusGeometry args={[0.18, 0.02, 8, 16]} />
                    <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.6} />
                </mesh>
                {/* Steam wisps (subtle) */}
                <mesh position={[0, 0.7, 0]}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshStandardMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.15}
                        emissive="#aaaaaa"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </group>

            {/* Firelight */}
            <pointLight
                ref={fireRef}
                position={[0, 0.8, 0.5]}
                color={HALL_INTERIOR.FIRE_COLOR}
                intensity={HALL_INTERIOR.FIRE_INTENSITY}
                distance={HALL_INTERIOR.FIRE_DISTANCE}
                decay={1.8}
                castShadow
                shadow-mapSize-width={256}
                shadow-mapSize-height={256}
            />

            {/* Secondary warm fill from fire */}
            <pointLight
                position={[0, 0.3, 0.4]}
                color="#ff4400"
                intensity={4}
                distance={6}
                decay={2}
            />
        </group>
    );
}

// ─── Cozy Bed ────────────────────────────────────────────
function CozyBed() {
    const pos = HALL_INTERIOR.BED_POS;

    return (
        <group position={[pos[0], pos[1], pos[2]]} rotation={[0, 0.3, 0]} scale={[1.5, 1.5, 1.5]}>
            {/* Bed frame base */}
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.25, 2.0]} />
                <meshStandardMaterial color="#3a2010" roughness={0.85} metalness={0.1} />
            </mesh>

            {/* Bed legs */}
            {[
                [-0.5, 0.075, -0.85],
                [0.5, 0.075, -0.85],
                [-0.5, 0.075, 0.85],
                [0.5, 0.075, 0.85],
            ].map((p, i) => (
                <mesh key={`leg-${i}`} position={[p[0], p[1], p[2]]}>
                    <boxGeometry args={[0.1, 0.15, 0.1]} />
                    <meshStandardMaterial color="#2a1508" roughness={0.9} />
                </mesh>
            ))}

            {/* Mattress */}
            <mesh position={[0, 0.38, 0]} castShadow>
                <boxGeometry args={[1.1, 0.12, 1.9]} />
                <meshStandardMaterial color="#8a7060" roughness={0.95} metalness={0} />
            </mesh>

            {/* Blanket / comforter (draped look) */}
            <mesh position={[0, 0.48, 0.15]} castShadow>
                <boxGeometry args={[1.15, 0.08, 1.4]} />
                <meshStandardMaterial color="#4a2a2a" roughness={0.9} metalness={0} />
            </mesh>

            {/* Pillow */}
            <mesh position={[0, 0.5, -0.7]} castShadow>
                <boxGeometry args={[0.7, 0.12, 0.35]} />
                <meshStandardMaterial color="#c8b8a0" roughness={0.95} metalness={0} />
            </mesh>

            {/* Second pillow (slightly offset) */}
            <mesh position={[0.15, 0.52, -0.72]} rotation={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[0.55, 0.1, 0.3]} />
                <meshStandardMaterial color="#b8a890" roughness={0.95} metalness={0} />
            </mesh>

            {/* Headboard */}
            <mesh position={[0, 0.7, -0.95]} castShadow>
                <boxGeometry args={[1.3, 0.8, 0.1]} />
                <meshStandardMaterial color="#2a1508" roughness={0.85} metalness={0.1} />
            </mesh>

            {/* Headboard detail (carved panel) */}
            <mesh position={[0, 0.7, -0.89]}>
                <boxGeometry args={[0.9, 0.5, 0.02]} />
                <meshStandardMaterial color="#3a2010" roughness={0.8} metalness={0.1} />
            </mesh>
        </group>
    );
}

// ─── Interior Wall Candle ────────────────────────────────
function InteriorCandle({
    position,
    delay = 0,
}: {
    position: [number, number, number];
    delay?: number;
}) {
    const lightRef = useRef<THREE.PointLight>(null!);
    const flameRef = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.elapsedTime + delay;
        if (lightRef.current) {
            const flicker =
                Math.sin(t * 4.5) * 0.3 +
                Math.sin(t * 7.1) * 0.15 +
                Math.sin(t * 11.3) * 0.1;
            lightRef.current.intensity = 40.0 + flicker * 20.5;
        }
        if (flameRef.current) {
            flameRef.current.scale.y = 1.0 + Math.sin(t * 6) * 0.2;
            flameRef.current.scale.x = 1.0 + Math.sin(t * 8) * 0.1;
            flameRef.current.position.y = 0.35 + Math.sin(t * 5) * 0.02;
        }
    });

    return (
        <group position={position}>
            {/* Bracket */}
            <mesh>
                <boxGeometry args={[0.15, 0.3, 0.08]} />
                <meshStandardMaterial color="#1a1008" roughness={0.9} metalness={0.4} />
            </mesh>
            {/* Candle stick */}
            <mesh position={[0, 0.2, 0.04]}>
                <cylinderGeometry args={[0.03, 0.04, 0.25, 6]} />
                <meshStandardMaterial color="#c8b890" roughness={0.8} />
            </mesh>
            {/* Flame */}
            <mesh ref={flameRef} position={[0, 0.35, 0.04]}>
                <sphereGeometry args={[0.04, 6, 6]} />
                <meshStandardMaterial
                    color="#ff4400"
                    emissive="#ffaa00"
                    emissiveIntensity={8}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            {/* Light */}
            <pointLight
                ref={lightRef}
                position={[0, 0.5, 0.2]}
                color="#ff9944"
                intensity={4.0}
                distance={6}
                decay={2}
            />
        </group>
    );
}

// ─── Small Table with Items ──────────────────────────────
function SmallTable() {
    const W = HALL_INTERIOR.ROOM_WIDTH;
    const D = HALL_INTERIOR.ROOM_DEPTH;
    return (
        <group position={[W / 2 - 2.5, 0, -D / 4]} scale={[1.5, 1.5, 1.5]}>
            {/* Table top */}
            <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.06, 0.6]} />
                <meshStandardMaterial color="#3a2515" roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Legs */}
            {[
                [-0.33, 0.32, -0.23],
                [0.33, 0.32, -0.23],
                [-0.33, 0.32, 0.23],
                [0.33, 0.32, 0.23],
            ].map((p, i) => (
                <mesh key={`tl-${i}`} position={[p[0], p[1], p[2]]}>
                    <boxGeometry args={[0.06, 0.64, 0.06]} />
                    <meshStandardMaterial color="#2a1508" roughness={0.9} />
                </mesh>
            ))}
            {/* Cup/mug on table */}
            <mesh position={[0.15, 0.78, 0.05]}>
                <cylinderGeometry args={[0.05, 0.04, 0.12, 8]} />
                <meshStandardMaterial color="#5a4a3a" roughness={0.7} metalness={0.3} />
            </mesh>
            {/* Book on table */}
            <mesh position={[-0.15, 0.72, -0.05]} rotation={[0, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.04, 0.15]} />
                <meshStandardMaterial color="#4a2020" roughness={0.9} />
            </mesh>
        </group>
    );
}

// ─── Wooden Chair ────────────────────────────────────────
function WoodenChair() {
    return (
        <group scale={[1.4, 1.4, 1.4]}>
            {/* Seat */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.45, 0.05, 0.45]} />
                <meshStandardMaterial color="#3a2515" roughness={0.85} />
            </mesh>
            {/* Legs */}
            {[
                [-0.18, 0.2, -0.18],
                [0.18, 0.2, -0.18],
                [-0.18, 0.2, 0.18],
                [0.18, 0.2, 0.18],
            ].map((p, i) => (
                <mesh key={`cl-${i}`} position={[p[0], p[1], p[2]]}>
                    <boxGeometry args={[0.05, 0.4, 0.05]} />
                    <meshStandardMaterial color="#2a1508" roughness={0.9} />
                </mesh>
            ))}
            {/* Backrest */}
            <mesh position={[0, 0.7, -0.2]} castShadow>
                <boxGeometry args={[0.45, 0.55, 0.05]} />
                <meshStandardMaterial color="#3a2515" roughness={0.85} />
            </mesh>
        </group>
    );
}

// ─── Dining Table ────────────────────────────────────────
function DiningTable() {
    return (
        <group position={[0, 0, 0]} scale={[1.6, 1.6, 1.6]}>
            {/* Table top */}
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.0, 0.1, 1.5]} />
                <meshStandardMaterial color="#3a2515" roughness={0.8} metalness={0.1} />
            </mesh>
            {/* Legs */}
            {[
                [-1.3, 0.4, -0.6],
                [1.3, 0.4, -0.6],
                [-1.3, 0.4, 0.6],
                [1.3, 0.4, 0.6],
            ].map((p, i) => (
                <mesh key={`dtl-${i}`} position={[p[0], p[1], p[2]]}>
                    <boxGeometry args={[0.1, 0.8, 0.1]} />
                    <meshStandardMaterial color="#2a1508" roughness={0.9} />
                </mesh>
            ))}
            {/* Chairs */}
            {[-0.8, 0, 0.8].map((x, i) => (
                <group key={`dtc1-${i}`} position={[x, 0, -1.0]}>
                    <WoodenChair />
                </group>
            ))}
            {[-0.8, 0, 0.8].map((x, i) => (
                <group key={`dtc2-${i}`} position={[x, 0, 1.0]} rotation={[0, Math.PI, 0]}>
                    <WoodenChair />
                </group>
            ))}
            {/* Centerpiece Candle */}
            <InteriorCandle position={[0, 0.85, 0]} delay={3.0} />
            {/* Additional candles for fully lightened table */}
            <InteriorCandle position={[-1.0, 0.85, 0]} delay={4.0} />
            <InteriorCandle position={[1.0, 0.85, 0]} delay={5.0} />
        </group>
    );
}

// ─── Fur Rug ─────────────────────────────────────────────
function FurRug() {
    const D = HALL_INTERIOR.ROOM_DEPTH;
    const carpetTex = useTexture("/assets/carpet.png");

    return (
        <mesh position={[0, 0.01, -D / 2 + 3.0]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow scale={[1.5, 1.5, 1.5]}>
            <circleGeometry args={[1.2, 24]} />
            <meshStandardMaterial map={carpetTex} roughness={1} metalness={0} />
        </mesh>
    );
}

// ─── Main World Component ────────────────────────────────
export default function HallInteriorWorld() {
    const W = HALL_INTERIOR.ROOM_WIDTH;
    const D = HALL_INTERIOR.ROOM_DEPTH;
    const H = HALL_INTERIOR.ROOM_HEIGHT;
    const T = HALL_INTERIOR.WALL_THICKNESS;

    const brickTex = useTexture("/assets/brickWall.png");
    brickTex.wrapS = THREE.RepeatWrapping;
    brickTex.wrapT = THREE.RepeatWrapping;
    brickTex.magFilter = THREE.NearestFilter;
    brickTex.minFilter = THREE.NearestFilter;

    // Create cloned textures for different wall sizes
    const wallTexSide = useMemo(() => {
        const t = brickTex.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(2, 2);
        t.needsUpdate = true;
        return t;
    }, [brickTex]);

    const wallTexFront = useMemo(() => {
        const t = brickTex.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(2, 2);
        t.needsUpdate = true;
        return t;
    }, [brickTex]);

    const ceilingTex = useMemo(() => {
        const t = brickTex.clone();
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(3, 3);
        t.needsUpdate = true;
        return t;
    }, [brickTex]);

    const floorTex = useTexture("/assets/floor.png");
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.magFilter = THREE.NearestFilter;
    floorTex.minFilter = THREE.NearestFilter;
    floorTex.repeat.set(4, 4);

    const stoneMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: "#6b6170",
                map: wallTexSide,
                roughness: 0.8,
                metalness: 0.1,
            }),
        [wallTexSide]
    );

    const stoneMatFront = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: "#6b6170",
                map: wallTexFront,
                roughness: 0.8,
                metalness: 0.1,
            }),
        [wallTexFront]
    );

    const floorMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: HALL_INTERIOR.FLOOR_COLOR,
                map: floorTex,
                roughness: 0.9,
                metalness: 0.05,
            }),
        [floorTex]
    );

    const ceilingMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: "#3a3035",
                map: ceilingTex,
                roughness: 0.85,
                metalness: 0.05,
            }),
        [ceilingTex]
    );

    const DOOR_WIDTH = 1.6;
    const DOOR_HEIGHT = 3.5;

    return (
        <group>
            {/* ═══ FLOOR ═══ */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow material={floorMat}>
                <planeGeometry args={[W, D]} />
            </mesh>

            {/* ═══ CEILING ═══ */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow material={ceilingMat}>
                <planeGeometry args={[W, D]} />
            </mesh>

            {/* Ceiling beams */}
            {[-1.5, 0, 1.5].map((x, i) => (
                <mesh key={`beam-${i}`} position={[x, H - 0.1, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.2, D]} />
                    <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
                </mesh>
            ))}

            {/* ═══ BACK WALL (z = -D/2) — fireplace wall ═══ */}
            <mesh
                position={[0, H / 2, -D / 2]}
                castShadow
                receiveShadow
                material={stoneMat}
            >
                <boxGeometry args={[W, H, T]} />
            </mesh>

            {/* ═══ LEFT WALL (x = -W/2) ═══ */}
            <mesh
                position={[-W / 2, H / 2, 0]}
                castShadow
                receiveShadow
                material={stoneMat}
            >
                <boxGeometry args={[T, H, D]} />
            </mesh>

            {/* ═══ RIGHT WALL (x = +W/2) ═══ */}
            <mesh
                position={[W / 2, H / 2, 0]}
                castShadow
                receiveShadow
                material={stoneMat}
            >
                <boxGeometry args={[T, H, D]} />
            </mesh>

            {/* ═══ FRONT WALL (z = +D/2) — with door opening ═══ */}
            {/* Left section */}
            <mesh
                position={[-(DOOR_WIDTH / 2 + (W / 2 - DOOR_WIDTH / 2) / 2), H / 2, D / 2]}
                castShadow
                receiveShadow
                material={stoneMatFront}
            >
                <boxGeometry args={[(W / 2 - DOOR_WIDTH / 2), H, T]} />
            </mesh>
            {/* Right section */}
            <mesh
                position={[(DOOR_WIDTH / 2 + (W / 2 - DOOR_WIDTH / 2) / 2), H / 2, D / 2]}
                castShadow
                receiveShadow
                material={stoneMatFront}
            >
                <boxGeometry args={[(W / 2 - DOOR_WIDTH / 2), H, T]} />
            </mesh>
            {/* Top section above door */}
            <mesh
                position={[0, DOOR_HEIGHT + (H - DOOR_HEIGHT) / 2, D / 2]}
                castShadow
                receiveShadow
                material={stoneMatFront}
            >
                <boxGeometry args={[DOOR_WIDTH, H - DOOR_HEIGHT, T]} />
            </mesh>

            {/* Door frame accent */}
            <mesh position={[-DOOR_WIDTH / 2 - 0.08, DOOR_HEIGHT / 2, D / 2 + 0.05]}>
                <boxGeometry args={[0.12, DOOR_HEIGHT + 0.2, 0.12]} />
                <meshStandardMaterial color="#2a1508" roughness={0.85} metalness={0.15} />
            </mesh>
            <mesh position={[DOOR_WIDTH / 2 + 0.08, DOOR_HEIGHT / 2, D / 2 + 0.05]}>
                <boxGeometry args={[0.12, DOOR_HEIGHT + 0.2, 0.12]} />
                <meshStandardMaterial color="#2a1508" roughness={0.85} metalness={0.15} />
            </mesh>
            <mesh position={[0, DOOR_HEIGHT + 0.1, D / 2 + 0.05]}>
                <boxGeometry args={[DOOR_WIDTH + 0.3, 0.15, 0.12]} />
                <meshStandardMaterial color="#2a1508" roughness={0.85} metalness={0.15} />
            </mesh>

            {/* ═══ FURNITURE ═══ */}
            <Fireplace />
            <CozyBed />
            <SmallTable />
            <DiningTable />
            <group position={[W / 2 - 2.8, 0, -D / 4 + 1.2]} rotation={[0, -0.8, 0]}>
                <WoodenChair />
            </group>
            <FurRug />

            {/* ═══ WALL CANDLES — lined all around ═══ */}
            {/* Left wall (x = -W/2) — candles face +X */}
            <group rotation={[0, Math.PI / 2, 0]}>
                <InteriorCandle position={[-D / 2 + 2, 2.2, W / 2 - 0.12]} delay={0.1} />
                <InteriorCandle position={[-D / 4, 2.8, W / 2 - 0.12]} delay={0.7} />
                <InteriorCandle position={[0.0, 2.2, W / 2 - 0.12]} delay={1.3} />
                <InteriorCandle position={[D / 4, 2.8, W / 2 - 0.12]} delay={1.9} />
                <InteriorCandle position={[D / 2 - 2, 2.2, W / 2 - 0.12]} delay={2.5} />
            </group>

            {/* Right wall (x = +W/2) — candles face -X */}
            <group rotation={[0, -Math.PI / 2, 0]}>
                <InteriorCandle position={[-D / 2 + 2, 2.2, W / 2 - 0.12]} delay={0.3} />
                <InteriorCandle position={[-D / 4, 2.8, W / 2 - 0.12]} delay={0.9} />
                <InteriorCandle position={[0.0, 2.2, W / 2 - 0.12]} delay={1.5} />
                <InteriorCandle position={[D / 4, 2.8, W / 2 - 0.12]} delay={2.1} />
                <InteriorCandle position={[D / 2 - 2, 2.2, W / 2 - 0.12]} delay={2.7} />
            </group>

            {/* Back wall (z = -D/2) — candles face +Z, flanking fireplace */}
            <group rotation={[0, Math.PI, 0]}>
                <InteriorCandle position={[-W / 2 + 1.5, 2.5, D / 2 - 0.12]} delay={0.2} />
                <InteriorCandle position={[-W / 4, 3.2, D / 2 - 0.12]} delay={0.8} />
                <InteriorCandle position={[W / 4, 3.2, D / 2 - 0.12]} delay={1.4} />
                <InteriorCandle position={[W / 2 - 1.5, 2.5, D / 2 - 0.12]} delay={2.0} />
            </group>

            {/* Front wall (z = +D/2) — candles face -Z, flanking door */}
            <InteriorCandle position={[-W / 2 + 1.5, 2.3, D / 2 - 0.12]} delay={0.4} />
            <InteriorCandle position={[-W / 4, 2.8, D / 2 - 0.12]} delay={1.0} />
            <InteriorCandle position={[W / 4, 2.8, D / 2 - 0.12]} delay={1.6} />
            <InteriorCandle position={[W / 2 - 1.5, 2.3, D / 2 - 0.12]} delay={2.2} />

            {/* Corner candles — lower, tucked into corners for warmth */}
            <group rotation={[0, Math.PI / 4, 0]}>
                <InteriorCandle position={[0, 1.5, Math.min(W, D) * 0.68]} delay={0.6} />
            </group>
            <group rotation={[0, -Math.PI / 4, 0]}>
                <InteriorCandle position={[0, 1.5, Math.min(W, D) * 0.68]} delay={1.2} />
            </group>
            <group rotation={[0, Math.PI + Math.PI / 4, 0]}>
                <InteriorCandle position={[0, 1.5, Math.min(W, D) * 0.68]} delay={1.8} />
            </group>
            <group rotation={[0, Math.PI - Math.PI / 4, 0]}>
                <InteriorCandle position={[0, 1.5, Math.min(W, D) * 0.68]} delay={2.4} />
            </group>

            {/* ═══ LIGHTING ═══ */}
            {/* Ambient warm fill */}
            <ambientLight
                color={HALL_INTERIOR.AMBIENT_COLOR}
                intensity={HALL_INTERIOR.AMBIENT_INTENSITY}
            />

            {/* Hemisphere for subtle color grading */}
            <hemisphereLight
                color="#f0deb4"
                groundColor="#2a1a00"
                intensity={1.0}
            />

            {/* Overhead fill to avoid pure black corners */}
            <pointLight
                position={[0, H - 0.5, 0]}
                color="#ffebc2"
                intensity={40}
                distance={40}
                decay={1.2}
            />
            {/* Corner fill lights */}
            <pointLight position={[-W / 2 + 2, H - 1, -D / 2 + 2]} color="#ffebc2" intensity={15} distance={20} decay={1.5} />
            <pointLight position={[W / 2 - 2, H - 1, -D / 2 + 2]} color="#ffebc2" intensity={15} distance={20} decay={1.5} />
            <pointLight position={[-W / 2 + 2, H - 1, D / 2 - 2]} color="#ffebc2" intensity={15} distance={20} decay={1.5} />
            <pointLight position={[W / 2 - 2, H - 1, D / 2 - 2]} color="#ffebc2" intensity={15} distance={20} decay={1.5} />

            {/* Doorway light (moonlight spilling in) */}
            <spotLight
                position={[0, 3, D / 2 + 2]}
                target-position={[0, 0, D / 2 - 1]}
                color="#6688cc"
                intensity={3}
                distance={8}
                angle={0.5}
                penumbra={0.8}
                decay={2}
            />
        </group>
    );
}
