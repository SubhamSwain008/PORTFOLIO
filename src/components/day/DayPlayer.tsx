"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DAY_ENV_PROPS } from "../../lib/dayEnvironment";

import { getGameState, setGameState } from "../useGameStore";

interface DayPlayerProps {
    positionRef: React.MutableRefObject<THREE.Vector3>;
    keys: React.MutableRefObject<Record<string, boolean>>;
}

// ─── Shared materials — daytime-appropriate colors ───
const skinMat = new THREE.MeshStandardMaterial({
    color: "#d4b89a",
    roughness: 0.65,
    metalness: 0.03,
});
const shirtMat = new THREE.MeshStandardMaterial({
    color: "#4a5a70",
    roughness: 0.7,
    metalness: 0.08,
});
const pantsMat = new THREE.MeshStandardMaterial({
    color: "#3a4550",
    roughness: 0.8,
    metalness: 0.06,
});
const shoeMat = new THREE.MeshStandardMaterial({
    color: "#2a2a2f",
    roughness: 0.9,
    metalness: 0.12,
});
const hairMat = new THREE.MeshStandardMaterial({
    color: "#1c1820",
    roughness: 0.95,
    metalness: 0.0,
});

export default function DayPlayer({ positionRef, keys }: DayPlayerProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const currentAngle = useRef(0);
    const walkTime = useRef(0);
    const isMoving = useRef(false);

    // Body part refs
    const bodyGroupRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Group>(null!);
    const leftArmRef = useRef<THREE.Group>(null!);
    const rightArmRef = useRef<THREE.Group>(null!);
    const leftLegRef = useRef<THREE.Group>(null!);
    const rightLegRef = useRef<THREE.Group>(null!);

    const SPEED = 7;
    const PORTAL_POS = new THREE.Vector3(-10, 0, -44.9);
    const ENTRANCE_RADIUS = 4;

    // ─── Fence gate positions (center of each side) ───
    const GATE_POSITIONS = [
        { pos: new THREE.Vector3(0, 0, -45), dir: new THREE.Vector3(0, 0, -1) },  // North
        { pos: new THREE.Vector3(0, 0, 45), dir: new THREE.Vector3(0, 0, 1) },   // South
        { pos: new THREE.Vector3(-45, 0, 0), dir: new THREE.Vector3(-1, 0, 0) }, // West
        { pos: new THREE.Vector3(45, 0, 0), dir: new THREE.Vector3(1, 0, 0) },   // East
    ];
    const GATE_DETECT_RADIUS = 4;
    const gateCrossingTarget = useRef<THREE.Vector3 | null>(null);
    const gateCrossingDir = useRef<THREE.Vector3>(new THREE.Vector3());
    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const state = getGameState();

        // ─── Auto-walk through gate ───
        if (state.isDayCrossingGate && gateCrossingTarget.current) {
            const target = gateCrossingTarget.current;
            const dir = gateCrossingDir.current;
            const pos = groupRef.current.position;

            const moveSpeed = SPEED * 0.8;
            pos.x += dir.x * moveSpeed * delta;
            pos.z += dir.z * moveSpeed * delta;

            const targetAngle = Math.atan2(dir.x, dir.z);
            currentAngle.current = targetAngle;
            groupRef.current.rotation.y = currentAngle.current;

            walkTime.current += delta * 9;
            isMoving.current = true;

            const toTarget = new THREE.Vector3().subVectors(target, pos);
            const dot = toTarget.dot(dir);
            if (dot <= 0) {
                setGameState({ isDayCrossingGate: false, isNearDayGate: false });
                gateCrossingTarget.current = null;
            }

            positionRef.current.copy(groupRef.current.position);

            // Animate body during crossing
            const t = walkTime.current;
            const walkCycle = Math.sin(t);
            const bodyBob = Math.abs(Math.sin(t * 2)) * 0.03;
            const bodySway = Math.sin(t) * 0.015;
            if (bodyGroupRef.current) { bodyGroupRef.current.position.y = bodyBob; bodyGroupRef.current.rotation.z = bodySway; }
            if (headRef.current) { headRef.current.rotation.z = Math.sin(t * 0.5) * 0.03; headRef.current.rotation.x = Math.sin(t * 2) * 0.015; }
            const armSwing = walkCycle * 0.5;
            if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing;
            const legSwing = walkCycle * 0.55;
            if (leftLegRef.current) leftLegRef.current.rotation.x = -legSwing;
            if (rightLegRef.current) rightLegRef.current.rotation.x = legSwing;
            return;
        }

        // --- Movement direction ---
        direction.current.set(0, 0, 0);
        if (keys.current["w"] || keys.current["arrowup"]) direction.current.z -= 1;
        if (keys.current["s"] || keys.current["arrowdown"]) direction.current.z += 1;
        if (keys.current["a"] || keys.current["arrowleft"]) direction.current.x -= 1;
        if (keys.current["d"] || keys.current["arrowright"]) direction.current.x += 1;

        const ACCEL_RATE = 12;
        const DECEL_RATE = 10;
        const ROT_RATE = 15;

        const hasInput = direction.current.length() > 0;

        if (hasInput) {
            direction.current.normalize();
            isMoving.current = true;

            const targetVX = direction.current.x * SPEED;
            const targetVZ = direction.current.z * SPEED;

            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, targetVX, 1 - Math.exp(-ACCEL_RATE * delta));
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, targetVZ, 1 - Math.exp(-ACCEL_RATE * delta));

            const targetAngle = Math.atan2(direction.current.x, direction.current.z);
            let angleDiff = targetAngle - currentAngle.current;

            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            currentAngle.current += angleDiff * (1 - Math.exp(-ROT_RATE * delta));
            groupRef.current.rotation.y = currentAngle.current;
        } else {
            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, 1 - Math.exp(-DECEL_RATE * delta));
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, 1 - Math.exp(-DECEL_RATE * delta));

            if (
                Math.abs(velocity.current.x) < 0.05 &&
                Math.abs(velocity.current.z) < 0.05
            ) {
                velocity.current.set(0, 0, 0);
                isMoving.current = false;
            }
        }

        const nextX = groupRef.current.position.x + velocity.current.x * delta;
        const nextZ = groupRef.current.position.z + velocity.current.z * delta;

        const BOUNDS = 220;
        let finalX = nextX;
        let finalZ = nextZ;

        // Building collision
        const BUILDING_HALF_X = 4.8;
        const BUILDING_HALF_Z = 4.8;

        if (
            finalX > -BUILDING_HALF_X &&
            finalX < BUILDING_HALF_X &&
            finalZ > -BUILDING_HALF_Z &&
            finalZ < BUILDING_HALF_Z
        ) {
            const penLeft = Math.abs(finalX - -BUILDING_HALF_X);
            const penRight = Math.abs(BUILDING_HALF_X - finalX);
            const penBottom = Math.abs(finalZ - -BUILDING_HALF_Z);
            const penTop = Math.abs(BUILDING_HALF_Z - finalZ);

            const minPen = Math.min(penLeft, penRight, penBottom, penTop);

            if (minPen === penLeft) finalX = -BUILDING_HALF_X;
            else if (minPen === penRight) finalX = BUILDING_HALF_X;
            else if (minPen === penBottom) finalZ = -BUILDING_HALF_Z;
            else finalZ = BUILDING_HALF_Z;
        }

        // Tree & Rock collision
        const PLAYER_RADIUS = 0.3;

        for (const item of DAY_ENV_PROPS) {
            let objectRadius = 0;

            if (item.type === "tree") {
                objectRadius = 0.4;
            } else if (item.type === "rock") {
                objectRadius = 0.4 * (item.scale || 1) * 0.8;
            } else {
                continue;
            }

            const minDist = PLAYER_RADIUS + objectRadius;

            const objX = item.pos[0];
            const objZ = item.pos[2];

            const dx = finalX - objX;
            const dz = finalZ - objZ;
            const distSq = dx * dx + dz * dz;

            if (distSq < minDist * minDist) {
                const dist = Math.sqrt(distSq);
                if (dist === 0) {
                    finalX += minDist;
                    continue;
                }

                const overlap = minDist - dist;
                const nx = dx / dist;
                const nz = dz / dist;

                finalX += nx * overlap;
                finalZ += nz * overlap;
            }
        }

        // ─── Fence wall collision (only where fence exists: ±29 extent) ───
        const FENCE = 45;
        const GATE_HALF = 4;
        const PUSH = 0.05;
        const prevX = groupRef.current.position.x;
        const prevZ = groupRef.current.position.z;

        if (Math.abs(finalX) <= FENCE && Math.abs(finalX) > GATE_HALF) {
            if (prevZ > -FENCE && finalZ <= -FENCE) finalZ = -FENCE + PUSH;
            else if (prevZ < -FENCE && finalZ >= -FENCE) finalZ = -FENCE - PUSH;
        }
        if (Math.abs(finalX) <= FENCE && Math.abs(finalX) > GATE_HALF) {
            if (prevZ < FENCE && finalZ >= FENCE) finalZ = FENCE - PUSH;
            else if (prevZ > FENCE && finalZ <= FENCE) finalZ = FENCE + PUSH;
        }
        if (Math.abs(finalZ) <= FENCE && Math.abs(finalZ) > GATE_HALF) {
            if (prevX > -FENCE && finalX <= -FENCE) finalX = -FENCE + PUSH;
            else if (prevX < -FENCE && finalX >= -FENCE) finalX = -FENCE - PUSH;
        }
        if (Math.abs(finalZ) <= FENCE && Math.abs(finalZ) > GATE_HALF) {
            if (prevX < FENCE && finalX >= FENCE) finalX = FENCE - PUSH;
            else if (prevX > FENCE && finalX <= FENCE) finalX = FENCE + PUSH;
        }

        // Enforce world bounds
        groupRef.current.position.x = THREE.MathUtils.clamp(finalX, -BOUNDS, BOUNDS);
        groupRef.current.position.z = THREE.MathUtils.clamp(finalZ, -BOUNDS, BOUNDS);

        // Report position
        positionRef.current.copy(groupRef.current.position);

        // ─── Walk cycle animation ───
        if (isMoving.current) {
            walkTime.current += delta * 9;
        } else {
            walkTime.current *= 0.88;
        }

        const t = walkTime.current;
        const walkCycle = Math.sin(t);

        const bodyBob = Math.abs(Math.sin(t * 2)) * 0.03;
        const bodySway = Math.sin(t) * 0.015;

        if (bodyGroupRef.current) {
            bodyGroupRef.current.position.y = bodyBob;
            bodyGroupRef.current.rotation.z = bodySway;
        }

        if (headRef.current) {
            headRef.current.rotation.z = Math.sin(t * 0.5) * 0.03;
            headRef.current.rotation.x = Math.sin(t * 2) * 0.015;
        }

        // Arm swing
        const armSwing = walkCycle * 0.5;

        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = armSwing;
        }
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -armSwing;
        }

        // Leg swing
        const legSwing = walkCycle * 0.55;

        if (leftLegRef.current) {
            leftLegRef.current.rotation.x = -legSwing;
        }
        if (rightLegRef.current) {
            rightLegRef.current.rotation.x = legSwing;
        }

        // ─── Portal proximity detection ───
        const portalDist = groupRef.current.position.distanceTo(PORTAL_POS);
        const nearPortal = portalDist < ENTRANCE_RADIUS;
        if (nearPortal !== state.isNearDayPortal) {
            setGameState({ isNearDayPortal: nearPortal });
        }

        // ─── Gate proximity detection ───
        let nearAnyGate = false;
        for (const gate of GATE_POSITIONS) {
            const gateDist = groupRef.current.position.distanceTo(gate.pos);
            if (gateDist < GATE_DETECT_RADIUS) {
                nearAnyGate = true;
                break;
            }
        }
        if (nearAnyGate !== state.isNearDayGate && !state.isDayCrossingGate) {
            setGameState({ isNearDayGate: nearAnyGate });
        }
    });

    // ─── Gate X-key handler ───
    useEffect(() => {
        const handleGateKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== "x" || e.repeat) return;
            const currentState = getGameState();
            if (!currentState.isNearDayGate || currentState.isDayCrossingGate) return;

            let closestGate = GATE_POSITIONS[0];
            let closestDist = Infinity;
            const playerPos = groupRef.current.position;
            for (const gate of GATE_POSITIONS) {
                const d = playerPos.distanceTo(gate.pos);
                if (d < closestDist) {
                    closestDist = d;
                    closestGate = gate;
                }
            }

            const isInside = Math.abs(playerPos.x) < 45 && Math.abs(playerPos.z) < 45;
            const crossDir = isInside
                ? closestGate.dir.clone()
                : closestGate.dir.clone().negate();

            gateCrossingTarget.current = playerPos.clone().add(crossDir.clone().multiplyScalar(6));
            gateCrossingDir.current.copy(crossDir);
            setGameState({ isDayCrossingGate: true });
        };

        window.addEventListener("keydown", handleGateKey);
        return () => window.removeEventListener("keydown", handleGateKey);
    }, []);

    return (
        <group ref={groupRef} position={[0, 1.3, 8]}>
            <group ref={bodyGroupRef}>

                {/* ════════════ TORSO ════════════ */}
                <mesh castShadow position={[0, 0.15, 0]}>
                    <boxGeometry args={[0.5, 0.45, 0.28]} />
                    <primitive object={shirtMat} attach="material" />
                </mesh>
                <mesh castShadow position={[0, 0.32, 0]}>
                    <boxGeometry args={[0.56, 0.12, 0.26]} />
                    <primitive object={shirtMat} attach="material" />
                </mesh>
                <mesh castShadow position={[0, -0.12, 0]}>
                    <boxGeometry args={[0.42, 0.2, 0.24]} />
                    <primitive object={shirtMat} attach="material" />
                </mesh>
                {/* Belt */}
                <mesh castShadow position={[0, -0.2, 0]}>
                    <boxGeometry args={[0.44, 0.06, 0.26]} />
                    <meshStandardMaterial color="#2a2420" roughness={0.5} metalness={0.3} />
                </mesh>
                <mesh castShadow position={[0, -0.2, 0.13]}>
                    <boxGeometry args={[0.06, 0.05, 0.02]} />
                    <meshStandardMaterial color="#b8a060" roughness={0.3} metalness={0.7} />
                </mesh>

                {/* ════════════ HIPS ════════════ */}
                <mesh castShadow position={[0, -0.32, 0]}>
                    <boxGeometry args={[0.42, 0.15, 0.24]} />
                    <primitive object={pantsMat} attach="material" />
                </mesh>

                {/* ════════════ HEAD GROUP ════════════ */}
                <group ref={headRef} position={[0, 0.6, 0]}>
                    <mesh castShadow position={[0, -0.12, 0]}>
                        <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, 0.08, 0]}>
                        <boxGeometry args={[0.26, 0.28, 0.26]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.02, 0.02]}>
                        <boxGeometry args={[0.22, 0.08, 0.22]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    {/* Hair */}
                    <mesh castShadow position={[0, 0.2, -0.01]}>
                        <boxGeometry args={[0.28, 0.08, 0.28]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, 0.1, -0.12]}>
                        <boxGeometry args={[0.27, 0.22, 0.06]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[-0.13, 0.1, -0.02]}>
                        <boxGeometry args={[0.04, 0.18, 0.2]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0.13, 0.1, -0.02]}>
                        <boxGeometry args={[0.04, 0.18, 0.2]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    {/* Eyes */}
                    <mesh position={[-0.07, 0.1, 0.13]}>
                        <sphereGeometry args={[0.03, 6, 6]} />
                        <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
                    </mesh>
                    <mesh position={[-0.07, 0.1, 0.155]}>
                        <sphereGeometry args={[0.015, 6, 6]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    <mesh position={[0.07, 0.1, 0.13]}>
                        <sphereGeometry args={[0.03, 6, 6]} />
                        <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
                    </mesh>
                    <mesh position={[0.07, 0.1, 0.155]}>
                        <sphereGeometry args={[0.015, 6, 6]} />
                        <meshStandardMaterial color="#1a1a1a" />
                    </mesh>
                    {/* Nose */}
                    <mesh position={[0, 0.06, 0.14]}>
                        <boxGeometry args={[0.04, 0.06, 0.04]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    {/* Mouth */}
                    <mesh position={[0, -0.0, 0.135]}>
                        <boxGeometry args={[0.08, 0.015, 0.01]} />
                        <meshStandardMaterial color="#8a6060" roughness={0.8} />
                    </mesh>
                    {/* Eyebrows */}
                    <mesh position={[-0.07, 0.15, 0.13]}>
                        <boxGeometry args={[0.06, 0.015, 0.02]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    <mesh position={[0.07, 0.15, 0.13]}>
                        <boxGeometry args={[0.06, 0.015, 0.02]} />
                        <primitive object={hairMat} attach="material" />
                    </mesh>
                    {/* Ears */}
                    <mesh castShadow position={[-0.14, 0.06, 0]}>
                        <boxGeometry args={[0.04, 0.08, 0.06]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0.14, 0.06, 0]}>
                        <boxGeometry args={[0.04, 0.08, 0.06]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                </group>

                {/* ════════════ LEFT ARM ════════════ */}
                <group ref={leftArmRef} position={[-0.33, 0.28, 0]}>
                    <mesh castShadow position={[0, -0.16, 0]}>
                        <boxGeometry args={[0.13, 0.3, 0.13]} />
                        <primitive object={shirtMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.3, 0]}>
                        <sphereGeometry args={[0.06, 6, 6]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.43, 0]}>
                        <boxGeometry args={[0.11, 0.24, 0.11]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.58, 0]}>
                        <boxGeometry args={[0.1, 0.08, 0.08]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.64, 0]}>
                        <boxGeometry args={[0.08, 0.06, 0.06]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                </group>

                {/* ════════════ RIGHT ARM (no flashlight — swings freely) ════════════ */}
                <group ref={rightArmRef} position={[0.33, 0.28, 0]}>
                    <mesh castShadow position={[0, -0.16, 0]}>
                        <boxGeometry args={[0.13, 0.3, 0.13]} />
                        <primitive object={shirtMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.3, 0]}>
                        <sphereGeometry args={[0.06, 6, 6]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.43, 0]}>
                        <boxGeometry args={[0.11, 0.24, 0.11]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.58, 0]}>
                        <boxGeometry args={[0.1, 0.08, 0.08]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.64, 0]}>
                        <boxGeometry args={[0.08, 0.06, 0.06]} />
                        <primitive object={skinMat} attach="material" />
                    </mesh>
                </group>

                {/* ════════════ LEFT LEG ════════════ */}
                <group ref={leftLegRef} position={[-0.12, -0.40, 0]}>
                    <mesh castShadow position={[0, -0.18, 0]}>
                        <boxGeometry args={[0.18, 0.36, 0.18]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.36, 0]}>
                        <sphereGeometry args={[0.075, 6, 6]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.56, 0]}>
                        <boxGeometry args={[0.16, 0.34, 0.16]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.73, 0]}>
                        <sphereGeometry args={[0.07, 6, 6]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.82, 0.04]}>
                        <boxGeometry args={[0.16, 0.09, 0.26]} />
                        <primitive object={shoeMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.88, 0.04]}>
                        <boxGeometry args={[0.17, 0.025, 0.28]} />
                        <meshStandardMaterial color="#111115" roughness={0.95} />
                    </mesh>
                </group>

                {/* ════════════ RIGHT LEG ════════════ */}
                <group ref={rightLegRef} position={[0.12, -0.40, 0]}>
                    <mesh castShadow position={[0, -0.18, 0]}>
                        <boxGeometry args={[0.18, 0.36, 0.18]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.36, 0]}>
                        <sphereGeometry args={[0.075, 6, 6]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.56, 0]}>
                        <boxGeometry args={[0.16, 0.34, 0.16]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.73, 0]}>
                        <sphereGeometry args={[0.07, 6, 6]} />
                        <primitive object={pantsMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.82, 0.04]}>
                        <boxGeometry args={[0.16, 0.09, 0.26]} />
                        <primitive object={shoeMat} attach="material" />
                    </mesh>
                    <mesh castShadow position={[0, -0.88, 0.04]}>
                        <boxGeometry args={[0.17, 0.025, 0.28]} />
                        <meshStandardMaterial color="#111115" roughness={0.95} />
                    </mesh>
                </group>

            </group>
        </group>
    );
}
