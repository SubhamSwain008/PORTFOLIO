"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerProps {
  onPositionChange: (pos: THREE.Vector3) => void;
  keys: React.MutableRefObject<Record<string, boolean>>;
}

export default function Player({ onPositionChange, keys }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
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
  const ACCELERATION = 0.1;
  const DECELERATION = 0.88;
  const ROTATION_LERP = 0.12;
  const WORLD_HALF = 28;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // --- Movement direction ---
    direction.current.set(0, 0, 0);
    if (keys.current["w"] || keys.current["arrowup"]) direction.current.z -= 1;
    if (keys.current["s"] || keys.current["arrowdown"]) direction.current.z += 1;
    if (keys.current["a"] || keys.current["arrowleft"]) direction.current.x -= 1;
    if (keys.current["d"] || keys.current["arrowright"]) direction.current.x += 1;

    const hasInput = direction.current.length() > 0;

    if (hasInput) {
      direction.current.normalize();
      isMoving.current = true;

      // Smooth acceleration
      velocity.current.x +=
        (direction.current.x * SPEED - velocity.current.x) * ACCELERATION;
      velocity.current.z +=
        (direction.current.z * SPEED - velocity.current.z) * ACCELERATION;

      // Smooth rotation toward movement direction (lerp, no snap)
      const targetAngle = Math.atan2(direction.current.x, direction.current.z);
      let angleDiff = targetAngle - currentAngle.current;

      // Normalize angle difference to [-PI, PI]
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      currentAngle.current += angleDiff * ROTATION_LERP;
      groupRef.current.rotation.y = currentAngle.current;
    } else {
      // Smooth deceleration
      velocity.current.x *= DECELERATION;
      velocity.current.z *= DECELERATION;

      if (
        Math.abs(velocity.current.x) < 0.01 &&
        Math.abs(velocity.current.z) < 0.01
      ) {
        velocity.current.set(0, 0, 0);
        isMoving.current = false;
      }
    }

    // Compute next position from velocity
    const nextX = groupRef.current.position.x + velocity.current.x * delta;
    const nextZ = groupRef.current.position.z + velocity.current.z * delta;

    // Simple building collision: prevent entering the central building box
    // Building footprint centered at origin: approx 8x8 (half-extents ~4)
    const BUILDING_HALF_X = 4.2; // small margin
    const BUILDING_HALF_Z = 4.2;

    if (
      nextX > -BUILDING_HALF_X &&
      nextX < BUILDING_HALF_X &&
      nextZ > -BUILDING_HALF_Z &&
      nextZ < BUILDING_HALF_Z
    ) {
      // Player would be inside building — push to nearest exterior edge
      const penLeft = Math.abs(nextX - -BUILDING_HALF_X);
      const penRight = Math.abs(BUILDING_HALF_X - nextX);
      const penBottom = Math.abs(nextZ - -BUILDING_HALF_Z);
      const penTop = Math.abs(BUILDING_HALF_Z - nextZ);

      const minPen = Math.min(penLeft, penRight, penBottom, penTop);

      let finalX = nextX;
      let finalZ = nextZ;
      if (minPen === penLeft) finalX = -BUILDING_HALF_X;
      else if (minPen === penRight) finalX = BUILDING_HALF_X;
      else if (minPen === penBottom) finalZ = -BUILDING_HALF_Z;
      else finalZ = BUILDING_HALF_Z;

      groupRef.current.position.x = finalX;
      groupRef.current.position.z = finalZ;
    } else {
      groupRef.current.position.x = nextX;
      groupRef.current.position.z = nextZ;
    }

    // Clamp to world bounds
    groupRef.current.position.x = THREE.MathUtils.clamp(
      groupRef.current.position.x,
      -WORLD_HALF,
      WORLD_HALF
    );
    groupRef.current.position.z = THREE.MathUtils.clamp(
      groupRef.current.position.z,
      -WORLD_HALF,
      WORLD_HALF
    );

    // --- Walk bob animation ---
    if (isMoving.current) {
      walkTime.current += delta * 8;
    } else {
      // Settle bob back to rest
      walkTime.current *= 0.9;
    }

    const bobAmount = Math.sin(walkTime.current) * 0.04;
    const swayAmount = Math.sin(walkTime.current * 0.5) * 0.02;

    if (bodyRef.current) {
      bodyRef.current.position.y = bobAmount;
    }
    if (headRef.current) {
      headRef.current.position.y = 0.65 + bobAmount * 1.2;
      headRef.current.rotation.z = swayAmount;
    }
    if (armRef.current) {
      armRef.current.rotation.x = Math.sin(walkTime.current) * 0.08;
      armRef.current.position.y = 0.15 + bobAmount * 0.5;
    }

    // --- Flashlight target ---
    // Point flashlight in facing direction, slightly downward
    const facingDir = new THREE.Vector3(
      Math.sin(currentAngle.current),
      0,
      Math.cos(currentAngle.current)
    );

    if (targetRef.current) {
      targetRef.current.position.set(
        groupRef.current.position.x + facingDir.x * 15,
        -1.0, // aim slightly into the ground ahead
        groupRef.current.position.z + facingDir.z * 15
      );
    }

    // --- Flashlight flicker ---
    flickerTime.current += delta;
    if (spotlightRef.current) {
      const flicker =
        1.0 +
        Math.sin(flickerTime.current * 3.7) * 0.03 +
        Math.sin(flickerTime.current * 7.3) * 0.02 +
        Math.sin(flickerTime.current * 13.1) * 0.015;
      spotlightRef.current.intensity = baseFlashlightIntensity * flicker;
    }

    // Report position
    onPositionChange(groupRef.current.position);
  });

  // Wire spotlight target after mount
  useEffect(() => {
    if (spotlightRef.current && targetRef.current) {
      spotlightRef.current.target = targetRef.current;
    }
  });

  return (
    <>
      {/* Spotlight target (scene-level, not parented to group so it stays world-space) */}
      <object3D ref={targetRef} position={[0, -0.5, 3]} />

      <group ref={groupRef} position={[0, 0, 8]}>
        {/* === CHARACTER BODY === */}

        {/* Torso / coat — dark desaturated gray-blue */}
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

        {/* Lower body / legs */}
        <mesh castShadow position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 6]} />
          <meshStandardMaterial
            color="#35303e"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>

        {/* Head — pale muted tone */}
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

        {/* Right arm holding flashlight */}
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

        {/* Flashlight cylinder (visual) */}
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

        {/* === FLASHLIGHT SPOTLIGHT === */}
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

        {/* Overhead fill so character is always clearly visible */}
        <pointLight
          position={[0, 3, 0]}
          color="#8888cc"
          intensity={5.5}
          distance={18}
          decay={.5}
        />
      </group>
    </>
  );
}
