"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HALL_INTERIOR, PLAYER, WALK_ANIM } from "../../settings/settings";
import { setGameState, getGameState } from "../../useGameStore";
import PlayerBodyMesh from "../../PlayerBodyMesh";

interface HallInteriorPlayerProps {
    positionRef: React.MutableRefObject<THREE.Vector3>;
    keys: React.MutableRefObject<Record<string, boolean>>;
    angleRef: React.MutableRefObject<number>;
    onNearExit: (near: boolean) => void;
}

export default function HallInteriorPlayer({
    positionRef,
    keys,
    angleRef,
    onNearExit,
}: HallInteriorPlayerProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const currentAngle = useRef(HALL_INTERIOR.SPAWN_ANGLE);
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

    const SPEED = HALL_INTERIOR.WALK_SPEED;
    const W = HALL_INTERIOR.ROOM_WIDTH;
    const D = HALL_INTERIOR.ROOM_DEPTH;

    // Room bounds with padding
    const ROOM_MIN_X = -W / 2 + 0.5;
    const ROOM_MAX_X = W / 2 - 0.5;
    const ROOM_MIN_Z = -D / 2 + 0.5;
    const ROOM_MAX_Z = D / 2 - 0.3;

    // Exit detection
    const EXIT_POS = new THREE.Vector3(...HALL_INTERIOR.EXIT_POS);
    const EXIT_RADIUS = HALL_INTERIOR.EXIT_RADIUS;

    // Set initial position
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.set(
                HALL_INTERIOR.SPAWN_POS[0],
                HALL_INTERIOR.SPAWN_POS[1],
                HALL_INTERIOR.SPAWN_POS[2]
            );
            groupRef.current.rotation.y = HALL_INTERIOR.SPAWN_ANGLE;
            positionRef.current.set(
                HALL_INTERIOR.SPAWN_POS[0],
                HALL_INTERIOR.SPAWN_POS[1],
                HALL_INTERIOR.SPAWN_POS[2]
            );
        }
    }, []);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const fpPos = HALL_INTERIOR.FIREPLACE_POS;

        // Check if being externally controlled (cutscene auto-walk)
        const noInput = !keys.current["w"] && !keys.current["s"] &&
                       !keys.current["a"] && !keys.current["d"] &&
                       !keys.current["arrowup"] && !keys.current["arrowdown"] &&
                       !keys.current["arrowleft"] && !keys.current["arrowright"];
        const extPos = positionRef.current;
        const meshPos = groupRef.current.position;
        const extDist = Math.hypot(extPos.x - meshPos.x, extPos.z - meshPos.z);
        const isExternallyControlled = noInput && extDist > 0.05;

        if (isExternallyControlled) {
            // Sync mesh position & rotation from external refs (cutscene auto-walk)
            groupRef.current.position.copy(extPos);
            currentAngle.current = angleRef.current;
            groupRef.current.rotation.y = currentAngle.current;
            isMoving.current = true;
        } else {
        direction.current.set(0, 0, 0);
        const ROT_SPEED = PLAYER.ROT_SPEED;

        if (keys.current["a"] || keys.current["arrowleft"]) {
            currentAngle.current += ROT_SPEED * delta;
        }
        if (keys.current["d"] || keys.current["arrowright"]) {
            currentAngle.current -= ROT_SPEED * delta;
        }

        while (currentAngle.current > Math.PI * 2) currentAngle.current -= Math.PI * 2;
        while (currentAngle.current < 0) currentAngle.current += Math.PI * 2;

        groupRef.current.rotation.y = currentAngle.current;

        let moveIntensity = 0;
        if (keys.current["w"] || keys.current["arrowup"]) moveIntensity = 1;
        if (keys.current["s"] || keys.current["arrowdown"]) moveIntensity = PLAYER.BACKPEDAL_MULTIPLIER;

        if (moveIntensity !== 0) {
            direction.current.x = Math.sin(currentAngle.current) * moveIntensity;
            direction.current.z = Math.cos(currentAngle.current) * moveIntensity;
            direction.current.normalize();
            isMoving.current = true;

            const targetVX = direction.current.x * SPEED;
            const targetVZ = direction.current.z * SPEED;

            velocity.current.x = THREE.MathUtils.lerp(
                velocity.current.x,
                targetVX,
                1 - Math.exp(-PLAYER.ACCEL_RATE * delta)
            );
            velocity.current.z = THREE.MathUtils.lerp(
                velocity.current.z,
                targetVZ,
                1 - Math.exp(-PLAYER.ACCEL_RATE * delta)
            );
        } else {
            velocity.current.x = THREE.MathUtils.lerp(
                velocity.current.x,
                0,
                1 - Math.exp(-PLAYER.DECEL_RATE * delta)
            );
            velocity.current.z = THREE.MathUtils.lerp(
                velocity.current.z,
                0,
                1 - Math.exp(-PLAYER.DECEL_RATE * delta)
            );

            if (
                Math.abs(velocity.current.x) < PLAYER.VELOCITY_STOP_THRESHOLD &&
                Math.abs(velocity.current.z) < PLAYER.VELOCITY_STOP_THRESHOLD
            ) {
                velocity.current.set(0, 0, 0);
                isMoving.current = false;
            }
        }

        // Apply movement with room bounds
        let nextX = groupRef.current.position.x + velocity.current.x * delta;
        let nextZ = groupRef.current.position.z + velocity.current.z * delta;

        // Furniture collision (simplified)
        // Bed collision (scaled 1.5x)
        const bedPos = HALL_INTERIOR.BED_POS;
        const bedDX = nextX - bedPos[0];
        const bedDZ = nextZ - bedPos[2];
        if (Math.abs(bedDX) < 1.35 && Math.abs(bedDZ) < 1.95) {
            if (Math.abs(bedDX) < Math.abs(bedDZ)) {
                nextZ = bedPos[2] + Math.sign(bedDZ) * 1.95;
            } else {
                nextX = bedPos[0] + Math.sign(bedDX) * 1.35;
            }
        }

        // Fireplace collision (scaled 1.4x)
        if (nextZ < fpPos[2] + 1.4 && Math.abs(nextX - fpPos[0]) < 1.7) {
            nextZ = fpPos[2] + 1.4;
        }

        // Dining Table & Chairs collision (scaled 1.6x)
        // Let's create a combined bounding box of about 5.6 x 5.6 around the center
        if (Math.abs(nextX) < 2.8 && Math.abs(nextZ) < 2.8) {
            if (Math.abs(nextX) > Math.abs(nextZ)) {
                nextX = Math.sign(nextX) * 2.8;
            } else {
                nextZ = Math.sign(nextZ) * 2.8;
            }
        }

        // Single Wooden Chair collision (Right side, scaled 1.4x)
        const chairX = W / 2 - 2.8;
        const chairZ = -D / 4 + 1.2;
        if (Math.abs(nextX - chairX) < 0.7 && Math.abs(nextZ - chairZ) < 0.7) {
            if (Math.abs(nextX - chairX) > Math.abs(nextZ - chairZ)) {
                nextX = chairX + Math.sign(nextX - chairX) * 0.7;
            } else {
                nextZ = chairZ + Math.sign(nextZ - chairZ) * 0.7;
            }
        }

        // Room bounds
        nextX = THREE.MathUtils.clamp(nextX, ROOM_MIN_X, ROOM_MAX_X);
        nextZ = THREE.MathUtils.clamp(nextZ, ROOM_MIN_Z, ROOM_MAX_Z);

        groupRef.current.position.x = nextX;
        groupRef.current.position.z = nextZ;

        positionRef.current.copy(groupRef.current.position);
        angleRef.current = currentAngle.current;
        } // end of normal input block
        // Exit proximity check
        const distToExit = new THREE.Vector2(
            groupRef.current.position.x - EXIT_POS.x,
            groupRef.current.position.z - EXIT_POS.z
        ).length();
        onNearExit(distToExit < EXIT_RADIUS);

        // Fireplace proximity check
        const distToFireplace = new THREE.Vector2(
            groupRef.current.position.x - fpPos[0],
            groupRef.current.position.z - fpPos[2]
        ).length();
        
        const wasNearFP = getGameState().isNearFireplace;
        const isNearFP = distToFireplace < 2.5;
        if (wasNearFP !== isNearFP) {
            setGameState({ isNearFireplace: isNearFP });
            if (!isNearFP) {
               // Auto-close UI if walking away
               setGameState({ isCookingUIOpen: false });
            }
        }

        // Table proximity check
        const tablePos = HALL_INTERIOR.TABLE_POS;
        const distToTable = new THREE.Vector2(
            groupRef.current.position.x - tablePos[0],
            groupRef.current.position.z - tablePos[2]
        ).length();

        const wasNearTable = getGameState().isNearTable;
        const isNearTable = distToTable < HALL_INTERIOR.TABLE_RADIUS;
        if (wasNearTable !== isNearTable) {
            setGameState({ isNearTable: isNearTable });
            if (!isNearTable) {
                setGameState({ isEatingUIOpen: false });
            }
        }
        
        // Bed proximity check
        const sleepBedPos = HALL_INTERIOR.BED_POS;
        const distToBed = new THREE.Vector2(
            groupRef.current.position.x - sleepBedPos[0],
            groupRef.current.position.z - sleepBedPos[2]
        ).length();

        const wasNearBed = getGameState().isNearBed;
        const isNearBed = distToBed < 6.0; // Trigger from further away since the bed is huge
        if (wasNearBed !== isNearBed) {
            setGameState({ isNearBed: isNearBed });
            if (!isNearBed) {
                setGameState({ isSaveUIOpen: false });
            }
        }

        // Walk animation
        if (isMoving.current) {
            walkTime.current += delta * WALK_ANIM.FREQUENCY;
        } else {
            walkTime.current *= 1 - WALK_ANIM.DECAY;
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
        const armSwing = walkCycle * WALK_ANIM.ARM_SWING;
        if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing * WALK_ANIM.ARM_SWING_RIGHT;
        const legSwing = walkCycle * WALK_ANIM.LEG_SWING;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -legSwing;
        if (rightLegRef.current) rightLegRef.current.rotation.x = legSwing;

        // Knee bending
        if (leftKneeRef.current && leftLegRef.current) {
            leftKneeRef.current.rotation.x = leftLegRef.current.rotation.x > 0 ? leftLegRef.current.rotation.x * 1.5 : 0;
        }
        if (rightKneeRef.current && rightLegRef.current) {
            rightKneeRef.current.rotation.x = rightLegRef.current.rotation.x > 0 ? rightLegRef.current.rotation.x * 1.5 : 0;
        }
    });

    return (
        <group ref={groupRef}>
            <group position={[0, 1.3, 0]}>
              <PlayerBodyMesh
                  bodyGroupRef={bodyGroupRef}
                  headRef={headRef}
                  leftArmRef={leftArmRef}
                  rightArmRef={rightArmRef}
                  leftLegRef={leftLegRef}
                  rightLegRef={rightLegRef}
                  leftKneeRef={leftKneeRef}
                  rightKneeRef={rightKneeRef}
                  flashlightGroupRef={undefined}
                  hasTorch={false}
              />
            </group>

            {/* Player overhead light (subtle, so player is visible in interior) */}
            <pointLight
                position={[0, 2.5, 0]}
                color="#887766"
                intensity={2}
                distance={5}
                decay={2}
            />
        </group>
    );
}
