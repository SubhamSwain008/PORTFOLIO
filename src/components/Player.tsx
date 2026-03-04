"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGameState, setGameState, useGameStore } from "./useGameStore";
import { ENV_PROPS } from "../lib/environment";

interface PlayerProps {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  keys: React.MutableRefObject<Record<string, boolean>>;
}

export default function Player({ positionRef, keys }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  // ... other refs remain the same
  const currentAngle = useRef(0);
  const walkTime = useRef(0);
  const isMoving = useRef(false);

  // Flashlight refs
  const spotlightRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);
  const flickerTime = useRef(0);
  const baseFlashlightIntensity = 8;

  // Body part refs for walk bob
  const bodyRef = useRef<THREE.Mesh>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const armRef = useRef<THREE.Mesh>(null!);

  const SPEED = 7;
  const WORLD_HALF = 28;

  // Door position (front face of building)
  const DOOR_POS = new THREE.Vector3(0, 0, 4.5);
  // Portal Door position (back face fence)
  const PORTAL_POS = new THREE.Vector3(0, 0, -28.9);
  const ENTRANCE_RADIUS = 4;

  const gameMode = useGameStore((s) => s.gameMode);

  useFrame((stateContext, delta) => {
    if (!groupRef.current) return;

    const state = getGameState();

    // ─── Lock movement during transitions ───
    if (
      state.gameMode === "transitioning-in" ||
      state.gameMode === "transitioning-out"
    ) {
      // During transition-in: dim flashlight
      if (state.gameMode === "transitioning-in" && spotlightRef.current) {
        spotlightRef.current.intensity *= 0.92; // exponential dim
      }
      positionRef.current.copy(groupRef.current.position);
      return;
    }

    // Don't process if not in explore mode
    if (state.gameMode !== "explore") {
      positionRef.current.copy(groupRef.current.position);
      return;
    }

    // --- Movement direction ---
    direction.current.set(0, 0, 0);
    if (keys.current["w"] || keys.current["arrowup"]) direction.current.z -= 1;
    if (keys.current["s"] || keys.current["arrowdown"]) direction.current.z += 1;
    if (keys.current["a"] || keys.current["arrowleft"]) direction.current.x -= 1;
    if (keys.current["d"] || keys.current["arrowright"]) direction.current.x += 1;

    // ─── Frame-independent Physics Constants ───
    const ACCEL_RATE = 12; // How fast we reach top speed
    const DECEL_RATE = 10; // How fast we stop
    const ROT_RATE = 15;   // How fast we turn

    const hasInput = direction.current.length() > 0;

    if (hasInput) {
      direction.current.normalize();
      isMoving.current = true;

      // Frame-independent Exponential Dampening to target speed
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
      // Frame-independent friction
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

    // World bounds
    const BOUNDS = 28;

    let finalX = nextX;
    let finalZ = nextZ;

    // Building collision
    // Building base is 9x9 (half-size 4.5). Add player radius 0.3 = 4.8
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

    for (const item of ENV_PROPS) {
      let objectRadius = 0;

      if (item.type === "tree") {
        objectRadius = 0.4;
      } else if (item.type === "rock") {
        // Rocks have varying scales. Base dodecahedron radius is 0.4
        objectRadius = 0.4 * (item.scale || 1) * 0.8; // 0.8 is a tweak factor to make collision feel tighter
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
        // Collision! Push player outside the circle
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

    // Enforce world bounds
    groupRef.current.position.x = THREE.MathUtils.clamp(finalX, -BOUNDS, BOUNDS);
    groupRef.current.position.z = THREE.MathUtils.clamp(finalZ, -BOUNDS, BOUNDS);

    // Report position BEFORE walk bob so camera doesn't shake
    positionRef.current.copy(groupRef.current.position);

    // ─── Walk bob animation ───
    if (isMoving.current) {
      walkTime.current += delta * 8;
    } else {
      walkTime.current *= 0.9;
    }

    const bobAmount = Math.sin(walkTime.current) * 0.04;
    const swayAmount = Math.sin(walkTime.current * 0.5) * 0.02;

    if (bodyRef.current) bodyRef.current.position.y = bobAmount;
    if (headRef.current) {
      headRef.current.position.y = 0.65 + bobAmount * 1.2;
      headRef.current.rotation.z = swayAmount;
    }
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(walkTime.current) * 0.08;
      armRef.current.position.y = 0.15 + bobAmount * 0.5;
    }

    // ─── Flashlight target ───
    const facingDir = new THREE.Vector3(
      Math.sin(currentAngle.current),
      0,
      Math.cos(currentAngle.current)
    );

    if (targetRef.current) {
      targetRef.current.position.set(
        groupRef.current.position.x + facingDir.x * 15,
        -1.0,
        groupRef.current.position.z + facingDir.z * 15
      );
    }

    // ─── Flashlight flicker ───
    flickerTime.current += delta;
    if (spotlightRef.current) {
      const flicker =
        1.0 +
        Math.sin(flickerTime.current * 3.7) * 0.03 +
        Math.sin(flickerTime.current * 7.3) * 0.02 +
        Math.sin(flickerTime.current * 13.1) * 0.015;
      spotlightRef.current.intensity = baseFlashlightIntensity * flicker;
    }

    // ─── Entrance proximity detection ───
    const dist = groupRef.current.position.distanceTo(DOOR_POS);
    const nearEntrance = dist < ENTRANCE_RADIUS;
    if (nearEntrance !== state.isNearEntrance) {
      setGameState({ isNearEntrance: nearEntrance });
    }

    // ─── Portal proximity detection ───
    const portalDist = groupRef.current.position.distanceTo(PORTAL_POS);
    const nearPortal = portalDist < ENTRANCE_RADIUS;
    if (nearPortal !== state.isNearPortal) {
      setGameState({ isNearPortal: nearPortal });
    }
  });

  // Wire spotlight target after mount
  useEffect(() => {
    if (spotlightRef.current && targetRef.current) {
      spotlightRef.current.target = targetRef.current;
    }
  });

  return (
    <>
      {/* Spotlight target */}
      <object3D ref={targetRef} position={[0, -0.5, 3]} />

      <group ref={groupRef} position={[0, 0, 8]}>
        {/* Torso */}
        <mesh ref={bodyRef} castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.25, 0.6, 4, 8]} />
          <meshStandardMaterial
            color="#4a4555"
            emissive="#0e0c12"
            emissiveIntensity={0.2}
            roughness={0.75}
            metalness={0.15}
          />
        </mesh>

        {/* Legs */}
        <mesh castShadow position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 6]} />
          <meshStandardMaterial
            color="#35303e"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>

        {/* Head */}
        <mesh ref={headRef} castShadow position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color="#8a8090"
            emissive="#151218"
            emissiveIntensity={0.1}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>

        {/* Right arm */}
        <mesh
          ref={armRef}
          castShadow
          position={[0.35, 0.15, 0.15]}
          rotation={[0.3, 0, 0]}
        >
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial
            color="#3a3545"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Flashlight cylinder */}
        <mesh
          position={[0.35, 0.1, 0.35]}
          rotation={[Math.PI / 2 - 0.3, 0, 0]}
        >
          <cylinderGeometry args={[0.04, 0.06, 0.25, 6]} />
          <meshStandardMaterial
            color="#2a2a30"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Flashlight spotlight */}
        <spotLight
          ref={spotlightRef}
          position={[0.35, 0.25, 0.5]}
          color="#fff5dd"
          intensity={baseFlashlightIntensity}
          distance={120}
          angle={0.4}
          penumbra={0.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.001}
          decay={1.2}
        />

        {/* Overhead fill */}
        <pointLight
          position={[0, 3, 0]}
          color="#8888cc"
          intensity={5.5}
          distance={18}
          decay={0.5}
        />
      </group>
    </>
  );
}
