"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGameState, setGameState, useGameStore } from "./useGameStore";
import { ENV_PROPS } from "../lib/environment";

interface PlayerProps {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  keys: React.MutableRefObject<Record<string, boolean>>;
}

// ─── Shared materials (created once, reused) ───
const skinMat = new THREE.MeshStandardMaterial({
  color: "#c8a88a",
  roughness: 0.7,
  metalness: 0.05,
});
const shirtMat = new THREE.MeshStandardMaterial({
  color: "#3d3852",
  emissive: "#0e0c12",
  emissiveIntensity: 0.15,
  roughness: 0.75,
  metalness: 0.1,
});
const pantsMat = new THREE.MeshStandardMaterial({
  color: "#2a2535",
  roughness: 0.85,
  metalness: 0.08,
});
const shoeMat = new THREE.MeshStandardMaterial({
  color: "#1a1a1f",
  roughness: 0.9,
  metalness: 0.15,
});
const hairMat = new THREE.MeshStandardMaterial({
  color: "#1c1820",
  roughness: 0.95,
  metalness: 0.0,
});

export default function Player({ positionRef, keys }: PlayerProps) {
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
  const baseFlashlightIntensity = 66;

  // ─── Body part refs for proper walk animation ───
  const bodyGroupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);
  const flashlightGroupRef = useRef<THREE.Group>(null!);

  const SPEED = 7;

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
      if (state.gameMode === "transitioning-in" && spotlightRef.current) {
        spotlightRef.current.intensity *= 0.92;
      }
      positionRef.current.copy(groupRef.current.position);
      return;
    }

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

    const BOUNDS = 28;
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

    for (const item of ENV_PROPS) {
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

    // Enforce world bounds
    groupRef.current.position.x = THREE.MathUtils.clamp(finalX, -BOUNDS, BOUNDS);
    groupRef.current.position.z = THREE.MathUtils.clamp(finalZ, -BOUNDS, BOUNDS);

    // Report position BEFORE walk bob so camera doesn't shake
    positionRef.current.copy(groupRef.current.position);

    // ─── Walk cycle animation ───
    if (isMoving.current) {
      walkTime.current += delta * 9;
    } else {
      walkTime.current *= 0.88;
    }

    const t = walkTime.current;
    const walkCycle = Math.sin(t);
    const walkCycleAbs = Math.abs(walkCycle);

    // Body bob (up/down bounce when walking)
    const bodyBob = Math.abs(Math.sin(t * 2)) * 0.03;
    const bodySway = Math.sin(t) * 0.015;

    if (bodyGroupRef.current) {
      bodyGroupRef.current.position.y = bodyBob;
      bodyGroupRef.current.rotation.z = bodySway;
    }

    // Head bob and look sway
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 0.5) * 0.03;
      headRef.current.rotation.x = Math.sin(t * 2) * 0.015;
    }

    // ─── Arm swing (opposite to legs) ───
    const armSwing = walkCycle * 0.5;

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = armSwing;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = -armSwing * 0.4; // less swing, holding flashlight
    }

    // ─── Leg swing ───
    const legSwing = walkCycle * 0.55;

    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = -legSwing;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = legSwing;
    }

    // ─── Flashlight sway ───
    if (flashlightGroupRef.current) {
      flashlightGroupRef.current.rotation.x = -armSwing * 0.4 + 0.25;
    }

    // ─── Flashlight target ───
    const facingDir = new THREE.Vector3(
      Math.sin(currentAngle.current),
      0,
      Math.cos(currentAngle.current)
    );

    if (targetRef.current) {
      targetRef.current.position.set(
        groupRef.current.position.x + facingDir.x * 12,
        0,
        groupRef.current.position.z + facingDir.z * 12
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
      <object3D ref={targetRef} position={[0, 0.2, 3]} />

      <group ref={groupRef} position={[0, 0, 8]}>
        <group ref={bodyGroupRef}>

          {/* ════════════ TORSO ════════════ */}
          {/* Upper torso / chest */}
          <mesh castShadow position={[0, 0.15, 0]}>
            <boxGeometry args={[0.5, 0.45, 0.28]} />
            <primitive object={shirtMat} attach="material" />
          </mesh>
          {/* Shoulder area (broader top) */}
          <mesh castShadow position={[0, 0.32, 0]}>
            <boxGeometry args={[0.56, 0.12, 0.26]} />
            <primitive object={shirtMat} attach="material" />
          </mesh>
          {/* Lower torso / waist */}
          <mesh castShadow position={[0, -0.12, 0]}>
            <boxGeometry args={[0.42, 0.2, 0.24]} />
            <primitive object={shirtMat} attach="material" />
          </mesh>
          {/* Belt */}
          <mesh castShadow position={[0, -0.2, 0]}>
            <boxGeometry args={[0.44, 0.06, 0.26]} />
            <meshStandardMaterial color="#1a1820" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Belt buckle */}
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
            {/* Neck */}
            <mesh castShadow position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Head */}
            <mesh castShadow position={[0, 0.08, 0]}>
              <boxGeometry args={[0.26, 0.28, 0.26]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Jaw / chin shape */}
            <mesh castShadow position={[0, -0.02, 0.02]}>
              <boxGeometry args={[0.22, 0.08, 0.22]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Hair top */}
            <mesh castShadow position={[0, 0.2, -0.01]}>
              <boxGeometry args={[0.28, 0.08, 0.28]} />
              <primitive object={hairMat} attach="material" />
            </mesh>
            {/* Hair back */}
            <mesh castShadow position={[0, 0.1, -0.12]}>
              <boxGeometry args={[0.27, 0.22, 0.06]} />
              <primitive object={hairMat} attach="material" />
            </mesh>
            {/* Hair sides */}
            <mesh castShadow position={[-0.13, 0.1, -0.02]}>
              <boxGeometry args={[0.04, 0.18, 0.2]} />
              <primitive object={hairMat} attach="material" />
            </mesh>
            <mesh castShadow position={[0.13, 0.1, -0.02]}>
              <boxGeometry args={[0.04, 0.18, 0.2]} />
              <primitive object={hairMat} attach="material" />
            </mesh>
            {/* Left eye */}
            <mesh position={[-0.07, 0.1, 0.13]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
            </mesh>
            {/* Left pupil */}
            <mesh position={[-0.07, 0.1, 0.155]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Right eye */}
            <mesh position={[0.07, 0.1, 0.13]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
            </mesh>
            {/* Right pupil */}
            <mesh position={[0.07, 0.1, 0.155]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Nose */}
            <mesh position={[0, 0.06, 0.14]}>
              <boxGeometry args={[0.04, 0.06, 0.04]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Mouth line */}
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
          {/* Pivot at the shoulder */}
          <group ref={leftArmRef} position={[-0.33, 0.28, 0]}>
            {/* Upper arm */}
            <mesh castShadow position={[0, -0.16, 0]}>
              <boxGeometry args={[0.13, 0.3, 0.13]} />
              <primitive object={shirtMat} attach="material" />
            </mesh>
            {/* Elbow joint */}
            <mesh castShadow position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Forearm */}
            <mesh castShadow position={[0, -0.43, 0]}>
              <boxGeometry args={[0.11, 0.24, 0.11]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Hand */}
            <mesh castShadow position={[0, -0.58, 0]}>
              <boxGeometry args={[0.1, 0.08, 0.08]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Fingers (grouped) */}
            <mesh castShadow position={[0, -0.64, 0]}>
              <boxGeometry args={[0.08, 0.06, 0.06]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
          </group>

          {/* ════════════ RIGHT ARM (holding flashlight) ════════════ */}
          <group ref={rightArmRef} position={[0.33, 0.28, 0]}>
            {/* Upper arm */}
            <mesh castShadow position={[0, -0.16, 0]}>
              <boxGeometry args={[0.13, 0.3, 0.13]} />
              <primitive object={shirtMat} attach="material" />
            </mesh>
            {/* Elbow joint */}
            <mesh castShadow position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.06, 6, 6]} />
              <primitive object={skinMat} attach="material" />
            </mesh>
            {/* Forearm */}
            <group ref={flashlightGroupRef} position={[0, -0.3, 0]} rotation={[0.25, 0, 0]}>
              <mesh castShadow position={[0, -0.13, 0]}>
                <boxGeometry args={[0.11, 0.24, 0.11]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              {/* Hand gripping flashlight */}
              <mesh castShadow position={[0, -0.27, 0.04]}>
                <boxGeometry args={[0.1, 0.1, 0.12]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              {/* Flashlight body */}
              <mesh castShadow position={[0, -0.27, 0.16]}>
                <cylinderGeometry args={[0.035, 0.045, 0.22, 8]} />
                <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.25} />
              </mesh>
              {/* Flashlight head / lens */}
              <mesh castShadow position={[0, -0.27, 0.28]}>
                <cylinderGeometry args={[0.05, 0.035, 0.06, 8]} />
                <meshStandardMaterial color="#3a3a40" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Flashlight lens glow */}
              <mesh position={[0, -0.27, 0.32]}>
                <circleGeometry args={[0.045, 8]} />
                <meshStandardMaterial color="#fff5dd" emissive="#fff5aa" emissiveIntensity={2} />
              </mesh>

            </group>
          </group>

          {/* ════════════ LEFT LEG ════════════ */}
          {/* Pivot at the hip */}
          <group ref={leftLegRef} position={[-0.12, -0.40, 0]}>
            {/* Thigh */}
            <mesh castShadow position={[0, -0.18, 0]}>
              <boxGeometry args={[0.18, 0.36, 0.18]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Knee */}
            <mesh castShadow position={[0, -0.36, 0]}>
              <sphereGeometry args={[0.075, 6, 6]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Shin */}
            <mesh castShadow position={[0, -0.56, 0]}>
              <boxGeometry args={[0.16, 0.34, 0.16]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Ankle */}
            <mesh castShadow position={[0, -0.73, 0]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Shoe */}
            <mesh castShadow position={[0, -0.82, 0.04]}>
              <boxGeometry args={[0.16, 0.09, 0.26]} />
              <primitive object={shoeMat} attach="material" />
            </mesh>
            {/* Shoe sole */}
            <mesh castShadow position={[0, -0.88, 0.04]}>
              <boxGeometry args={[0.17, 0.025, 0.28]} />
              <meshStandardMaterial color="#111115" roughness={0.95} />
            </mesh>
          </group>

          {/* ════════════ RIGHT LEG ════════════ */}
          <group ref={rightLegRef} position={[0.12, -0.40, 0]}>
            {/* Thigh */}
            <mesh castShadow position={[0, -0.18, 0]}>
              <boxGeometry args={[0.18, 0.36, 0.18]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Knee */}
            <mesh castShadow position={[0, -0.36, 0]}>
              <sphereGeometry args={[0.075, 6, 6]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Shin */}
            <mesh castShadow position={[0, -0.56, 0]}>
              <boxGeometry args={[0.16, 0.34, 0.16]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Ankle */}
            <mesh castShadow position={[0, -0.73, 0]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <primitive object={pantsMat} attach="material" />
            </mesh>
            {/* Shoe */}
            <mesh castShadow position={[0, -0.82, 0.04]}>
              <boxGeometry args={[0.16, 0.09, 0.26]} />
              <primitive object={shoeMat} attach="material" />
            </mesh>
            {/* Shoe sole */}
            <mesh castShadow position={[0, -0.88, 0.04]}>
              <boxGeometry args={[0.17, 0.025, 0.28]} />
              <meshStandardMaterial color="#111115" roughness={0.95} />
            </mesh>
          </group>

        </group>

        {/* Flashlight spotlight — placed at player group level so it stays above ground */}
        <spotLight
          ref={spotlightRef}
          position={[0.3, 0.5, 0.3]}
          color="#fff5dd"
          intensity={baseFlashlightIntensity}
          distance={220}
          angle={0.28}
          penumbra={0.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.001}
          decay={1.0}
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
