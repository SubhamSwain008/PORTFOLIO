"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DAY_ENV_PROPS } from "../../lib/dayEnvironment";
import {
  PLAYER, STAMINA, STAMINA_RECOVERY_RATE, WORLD, GATE, PORTAL,
  WALK_ANIM,
} from "../settings/settings";
import { useSearchParams } from "next/navigation";

import { getGameState, setGameState } from "../useGameStore";
import { getSessionState } from "../useSessionStore";
import { getStaminaState, setStaminaState } from "../useStaminaStore";
import PlayerBodyMesh from "../PlayerBodyMesh";

interface DayPlayerProps {
    positionRef: React.MutableRefObject<THREE.Vector3>;
    keys: React.MutableRefObject<Record<string, boolean>>;
    angleRef?: React.MutableRefObject<number>;
}

export default function DayPlayer({ positionRef, keys, angleRef }: DayPlayerProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const currentAngle = useRef(Math.PI);
    const walkTime = useRef(0);
    const isMoving = useRef(false);

    // Body part refs
    const bodyGroupRef = useRef<THREE.Group>(null!);
    const headRef = useRef<THREE.Group>(null!);
    const leftArmRef = useRef<THREE.Group>(null!);
    const rightArmRef = useRef<THREE.Group>(null!);
    const leftLegRef = useRef<THREE.Group>(null!);
    const rightLegRef = useRef<THREE.Group>(null!);
    const leftKneeRef = useRef<THREE.Group>(null!);
    const rightKneeRef = useRef<THREE.Group>(null!);

    const SPEED = PLAYER.WALK_SPEED;
    const PORTAL_POS = new THREE.Vector3(...PORTAL.PORTAL_POS);
    const ENTRANCE_RADIUS = PORTAL.ENTRANCE_RADIUS;

    // ─── Fence gate positions (center of each side) ───
    const GATE_POSITIONS = GATE.POSITIONS.map((g) => ({
        pos: new THREE.Vector3(...g.pos),
        dir: new THREE.Vector3(...g.dir),
    }));
    const GATE_DETECT_RADIUS = GATE.DETECT_RADIUS;
    const gateCrossingTarget = useRef<THREE.Vector3 | null>(null);
    const gateCrossingDir = useRef<THREE.Vector3>(new THREE.Vector3());
    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const state = getGameState();

        // ─── Pause: freeze everything while tutorial is open ───
        if (state.isPaused) {
            positionRef.current.copy(groupRef.current.position);
            return;
        }

        // ─── Auto-walk through gate ───
        if (state.isDayCrossingGate && gateCrossingTarget.current) {
            const target = gateCrossingTarget.current;
            const dir = gateCrossingDir.current;
            const pos = groupRef.current.position;

            const moveSpeed = SPEED * GATE.CROSSING_SPEED_MULT;
            pos.x += dir.x * moveSpeed * delta;
            pos.z += dir.z * moveSpeed * delta;

            const targetAngle = Math.atan2(dir.x, dir.z);
            currentAngle.current = targetAngle;
            groupRef.current.rotation.y = currentAngle.current;

            walkTime.current += delta * WALK_ANIM.FREQUENCY;
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
            const bodyBob = Math.abs(Math.sin(t * 2)) * WALK_ANIM.BODY_BOB;
            const bodySway = Math.sin(t) * WALK_ANIM.BODY_SWAY;
            if (bodyGroupRef.current) { bodyGroupRef.current.position.y = bodyBob; bodyGroupRef.current.rotation.z = bodySway; }
            if (headRef.current) { headRef.current.rotation.z = Math.sin(t * 0.5) * WALK_ANIM.HEAD_SWAY_Z; headRef.current.rotation.x = Math.sin(t * 2) * WALK_ANIM.HEAD_NOD_X; }
            const armSwing = walkCycle * WALK_ANIM.ARM_SWING;
            if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing;
            if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing;
            const legSwing = walkCycle * WALK_ANIM.LEG_SWING;
            if (leftLegRef.current) leftLegRef.current.rotation.x = -legSwing;
            if (rightLegRef.current) rightLegRef.current.rotation.x = legSwing;
            return;
        }

        // --- Movement direction ---
        direction.current.set(0, 0, 0);
        const ROT_SPEED = PLAYER.ROT_SPEED; // Radians per second

        // Handle Rotation (A/D)
        if (keys.current["a"] || keys.current["arrowleft"]) {
            currentAngle.current += ROT_SPEED * delta;
        }
        if (keys.current["d"] || keys.current["arrowright"]) {
            currentAngle.current -= ROT_SPEED * delta;
        }

        // Keep angle within 0 - 2PI range
        while (currentAngle.current > Math.PI * 2) currentAngle.current -= Math.PI * 2;
        while (currentAngle.current < 0) currentAngle.current += Math.PI * 2;

        // Apply visual rotation immediately
        groupRef.current.rotation.y = currentAngle.current;

        // Handle Forward/Backward Momentum (W/S)
        let moveIntensity = 0;
        if (keys.current["w"] || keys.current["arrowup"]) moveIntensity = 1;
        if (keys.current["s"] || keys.current["arrowdown"]) moveIntensity = PLAYER.BACKPEDAL_MULTIPLIER; // Backpedal slower

        if (moveIntensity !== 0) {
            // Calculate trig vector based on current facing angle
            direction.current.x = Math.sin(currentAngle.current) * moveIntensity;
            direction.current.z = Math.cos(currentAngle.current) * moveIntensity;
        }

        const ACCEL_RATE = PLAYER.ACCEL_RATE;
        const DECEL_RATE = PLAYER.DECEL_RATE;

        const hasInput = direction.current.length() > 0;
        let isSprinting = false;

        if (hasInput) {
            direction.current.normalize();
            isMoving.current = true;

            // --- Stamina Logic ---
            const staminaState = getStaminaState();
            let currentStamina = staminaState.stamina;

            if (keys.current["shift"] && currentStamina > 0) {
                // Sprinting: drain 100 stamina in 20s (5 units/sec)
                isSprinting = true;
                currentStamina = Math.max(0, currentStamina - STAMINA.DRAIN_PER_SECOND * delta);
                setStaminaState({ stamina: currentStamina, isSprinting: true });
            } else {
                // Normal walking: 1x speed
                if (keys.current["shift"]) {
                    if (staminaState.isSprinting) {
                        setStaminaState({ isSprinting: false });
                    }
                } else {
                    // Refill 100 stamina in 30s (~3.33 units/sec)
                    if (currentStamina < STAMINA.MAX) {
                        currentStamina = Math.min(STAMINA.MAX, currentStamina + STAMINA_RECOVERY_RATE * delta);
                        setStaminaState({ stamina: currentStamina, isSprinting: false });
                    } else if (staminaState.isSprinting) {
                        setStaminaState({ isSprinting: false });
                    }
                }
            }

            let speedMultiplier = 1.0;
            if (isSprinting) {
                // Full 2x speed while stamina > 50, then linearly reduce to 1x at 0
                if (currentStamina >= STAMINA.SPRINT_THRESHOLD) {
                    speedMultiplier = STAMINA.SPRINT_MAX_MULTIPLIER;
                } else {
                    speedMultiplier = 1.0 + (currentStamina / STAMINA.SPRINT_THRESHOLD);
                }
            }

            const targetVX = direction.current.x * (SPEED * speedMultiplier);
            const targetVZ = direction.current.z * (SPEED * speedMultiplier);

            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, targetVX, 1 - Math.exp(-ACCEL_RATE * delta));
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, targetVZ, 1 - Math.exp(-ACCEL_RATE * delta));
        } else {
            velocity.current.x = THREE.MathUtils.lerp(velocity.current.x, 0, 1 - Math.exp(-DECEL_RATE * delta));
            velocity.current.z = THREE.MathUtils.lerp(velocity.current.z, 0, 1 - Math.exp(-DECEL_RATE * delta));

            if (
                Math.abs(velocity.current.x) < PLAYER.VELOCITY_STOP_THRESHOLD &&
                Math.abs(velocity.current.z) < PLAYER.VELOCITY_STOP_THRESHOLD
            ) {
                velocity.current.set(0, 0, 0);
                isMoving.current = false;

                // Idle refill stamina
                const staminaState = getStaminaState();
                if (staminaState.stamina < STAMINA.MAX) {
                    const newStamina = Math.min(STAMINA.MAX, staminaState.stamina + STAMINA_RECOVERY_RATE * delta);
                    setStaminaState({ stamina: newStamina, isSprinting: false });
                } else if (staminaState.isSprinting) {
                    setStaminaState({ isSprinting: false });
                }
            }
        }

        const nextX = groupRef.current.position.x + velocity.current.x * delta;
        const nextZ = groupRef.current.position.z + velocity.current.z * delta;

        const BOUNDS = WORLD.BOUNDS;
        let finalX = nextX;
        let finalZ = nextZ;

        // Building collision
        const BUILDING_HALF_X = WORLD.BUILDING_HALF_X;
        const BUILDING_HALF_Z = WORLD.BUILDING_HALF_Z;

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
        const PLAYER_RADIUS = PLAYER.COLLISION_RADIUS;

        for (const item of DAY_ENV_PROPS) {
            let objectRadius = 0;

            if (item.type === "tree") {
                objectRadius = WORLD.TREE_COLLISION_RADIUS;
            } else if (item.type === "rock") {
                objectRadius = WORLD.ROCK_COLLISION_BASE * (item.scale || 1) * WORLD.ROCK_COLLISION_SCALE_MULT;
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
        const FENCE = WORLD.FENCE_DISTANCE;
        const GATE_HALF = WORLD.GATE_HALF_WIDTH;
        const PUSH = WORLD.WALL_PUSH;
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
            let animSpeedMultiplier = 1.0;
            if (isSprinting) {
                const staminaState = getStaminaState();
                animSpeedMultiplier = 1.0 + (staminaState.stamina / STAMINA.MAX);
            }
            walkTime.current += delta * WALK_ANIM.FREQUENCY * animSpeedMultiplier;
        } else {
            walkTime.current *= WALK_ANIM.DECAY;
        }

        const t = walkTime.current;
        const walkCycle = Math.sin(t);

        const bodyBob = Math.abs(Math.sin(t * 2)) * WALK_ANIM.BODY_BOB;
        const bodySway = Math.sin(t) * WALK_ANIM.BODY_SWAY;

        if (bodyGroupRef.current) {
            bodyGroupRef.current.position.y = bodyBob;
            bodyGroupRef.current.rotation.z = bodySway;
        }

        if (headRef.current) {
            headRef.current.rotation.z = Math.sin(t * 0.5) * WALK_ANIM.HEAD_SWAY_Z;
            headRef.current.rotation.x = Math.sin(t * 2) * WALK_ANIM.HEAD_NOD_X;
        }

        // Sync rotational angle to camera
        if (angleRef) {
            angleRef.current = currentAngle.current;
        }

        // Arm swing
        const armSwing = walkCycle * WALK_ANIM.ARM_SWING;

        if (leftArmRef.current) {
            leftArmRef.current.rotation.x = armSwing;
        }
        if (rightArmRef.current) {
            rightArmRef.current.rotation.x = -armSwing;
        }

        // Leg swing
        const legSwing = walkCycle * WALK_ANIM.LEG_SWING;

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

            const isInside = Math.abs(playerPos.x) < WORLD.FENCE_DISTANCE && Math.abs(playerPos.z) < WORLD.FENCE_DISTANCE;
            const crossDir = isInside
                ? closestGate.dir.clone()
                : closestGate.dir.clone().negate();

            gateCrossingTarget.current = playerPos.clone().add(crossDir.clone().multiplyScalar(GATE.WALK_THROUGH_DISTANCE));
            gateCrossingDir.current.copy(crossDir);
            setGameState({ isDayCrossingGate: true });
        };

        window.addEventListener("keydown", handleGateKey);
        return () => window.removeEventListener("keydown", handleGateKey);
    }, []);

    // Read initial position from DB or override via portal search param
    const searchParams = useSearchParams();
    const initPos = useMemo(() => {
        if (searchParams.get("portal") === "true") {
            return [...PORTAL.PORTAL_ARRIVAL_SPAWN] as [number, number, number];
        }
        const session = getSessionState();
        if (session.initialPosition) {
            return [session.initialPosition.x, session.initialPosition.y, session.initialPosition.z] as [number, number, number];
        }
        return [...PORTAL.DEFAULT_SPAWN] as [number, number, number];
    }, [searchParams]);

    return (
        <group ref={groupRef} position={initPos}>
            <PlayerBodyMesh
                bodyGroupRef={bodyGroupRef}
                headRef={headRef}
                leftArmRef={leftArmRef}
                rightArmRef={rightArmRef}
                leftLegRef={leftLegRef}
                rightLegRef={rightLegRef}
                leftKneeRef={leftKneeRef}
                rightKneeRef={rightKneeRef}
            />
        </group>
    );
}
