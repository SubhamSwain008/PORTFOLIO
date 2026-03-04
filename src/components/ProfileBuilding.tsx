"use client";

import * as THREE from "three";

import { useTexture } from "@react-three/drei";
import WallCandle from "./WallCandle";

export default function ProfileBuilding() {
  const WIDTH = 8;
  const DEPTH = 8;
  const HEIGHT = 14;
  const WALL_THICKNESS = 0.5;
  const DOOR_WIDTH = 2;
  const DOOR_HEIGHT = 4;

  const doorTex = useTexture("/assets/door.png");
  doorTex.magFilter = THREE.NearestFilter;
  doorTex.minFilter = THREE.NearestFilter;

  const brickWallTex = useTexture("/assets/brickWall.png");
  brickWallTex.wrapS = THREE.RepeatWrapping;
  brickWallTex.wrapT = THREE.RepeatWrapping;
  brickWallTex.repeat.set(2, 3);
  brickWallTex.magFilter = THREE.NearestFilter;
  brickWallTex.minFilter = THREE.NearestFilter;

  // Dark charcoal stone — NOT black, with blue undertone
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: "#6b6170", // lightened to let texture show
    map: brickWallTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Slightly lighter stone for edges / variation
  const stoneVariant = new THREE.MeshStandardMaterial({
    color: "#7a6f7a",
    map: brickWallTex,
    roughness: 0.75,
    metalness: 0.12,
  });

  // Darkest stone for deep recesses
  const stoneDeep = new THREE.MeshStandardMaterial({
    color: "#4a404f",
    map: brickWallTex,
    roughness: 0.85,
    metalness: 0.08,
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main building body */}
      <mesh position={[0, HEIGHT / 2, 0]} castShadow receiveShadow material={stoneMaterial}>
        <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
      </mesh>

      {/* Slight step / base */}
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow material={stoneVariant}>
        <boxGeometry args={[WIDTH + 1, 0.6, DEPTH + 1]} />
      </mesh>

      {/* Upper step / crown */}
      <mesh position={[0, HEIGHT + 0.4, 0]} castShadow material={stoneVariant}>
        <boxGeometry args={[WIDTH + 0.6, 0.8, DEPTH + 0.6]} />
      </mesh>

      {/* Pinnacles at corners */}
      {[
        [WIDTH / 2 + 0.1, 0, DEPTH / 2 + 0.1],
        [-WIDTH / 2 - 0.1, 0, DEPTH / 2 + 0.1],
        [WIDTH / 2 + 0.1, 0, -DEPTH / 2 - 0.1],
        [-WIDTH / 2 - 0.1, 0, -DEPTH / 2 - 0.1],
      ].map((pos, i) => (
        <mesh
          key={`pinnacle-${i}`}
          position={[pos[0], HEIGHT + 1.5, pos[2]]}
          castShadow
          material={stoneDeep}
        >
          <boxGeometry args={[0.6, 2.2, 0.6]} />
        </mesh>
      ))}

      {/* Doorway frame backing */}
      <mesh position={[0, DOOR_HEIGHT / 2 + 0.1, DEPTH / 2 + 0.01]}>
        <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT + 0.2, 0.3]} />
        <meshStandardMaterial color="#1a1614" emissive="#2a1a10" emissiveIntensity={0.2} roughness={0.9} />
      </mesh>

      {/* Doorway image plane */}
      <mesh position={[0, DOOR_HEIGHT / 2 + 0.05, DEPTH / 2 + 0.17]}>
        <planeGeometry args={[1.65, 3.4]} />
        <meshStandardMaterial map={doorTex} transparent roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Side accent strips — lighter edges for definition */}
      <mesh position={[WIDTH / 2 + 0.01, HEIGHT / 2, 0]} castShadow material={stoneVariant}>
        <boxGeometry args={[0.15, HEIGHT, DEPTH - 0.5]} />
      </mesh>
      <mesh position={[-WIDTH / 2 - 0.01, HEIGHT / 2, 0]} castShadow material={stoneVariant}>
        <boxGeometry args={[0.15, HEIGHT, DEPTH - 0.5]} />
      </mesh>

      {/* Door frame - left pillar */}
      <mesh
        position={[-DOOR_WIDTH / 2 - 0.2, DOOR_HEIGHT / 2, DEPTH / 2 + 0.15]}
        castShadow
        material={stoneVariant}
      >
        <boxGeometry args={[0.4, DOOR_HEIGHT + 0.5, 0.3]} />
      </mesh>

      {/* Door frame - right pillar */}
      <mesh
        position={[DOOR_WIDTH / 2 + 0.2, DOOR_HEIGHT / 2, DEPTH / 2 + 0.15]}
        castShadow
        material={stoneVariant}
      >
        <boxGeometry args={[0.4, DOOR_HEIGHT + 0.5, 0.3]} />
      </mesh>

      {/* Door frame - top lintel */}
      <mesh
        position={[0, DOOR_HEIGHT + 0.3, DEPTH / 2 + 0.15]}
        castShadow
        material={stoneVariant}
      >
        <boxGeometry args={[DOOR_WIDTH + 0.8, 0.5, 0.3]} />
      </mesh>

      {/* Pointed arch above door (triangular shape) */}
      <mesh
        position={[0, DOOR_HEIGHT + 1.2, DEPTH / 2 + 0.1]}
        castShadow
        material={stoneVariant}
      >
        <coneGeometry args={[1.8, 1.5, 4]} />
      </mesh>

      {/* Mysterious Candles on Exterior Walls */}
      <group position={[0, 0, 0]}>
        {/* Front wall - outside the door */}
        <WallCandle position={[-2.5, 2.8, DEPTH / 2 + 0.04]} delay={0.2} />
        <WallCandle position={[2.5, 2.8, DEPTH / 2 + 0.04]} delay={1.5} />
        {/* <WallCandle position={[-3.6, 5.5, DEPTH / 2 + 0.04]} delay={0.8} />
        <WallCandle position={[3.6, 5.5, DEPTH / 2 + 0.04]} delay={2.1} /> */}

        {/* Left wall */}
        {/* <group rotation={[0, -Math.PI / 2, 0]}>
          <WallCandle position={[0, 3.5, WIDTH / 2 + 0.04]} delay={1.1} />
          <WallCandle position={[-2.5, 6.5, WIDTH / 2 + 0.04]} delay={2.5} />
          <WallCandle position={[2.5, 6.5, WIDTH / 2 + 0.04]} delay={0.5} />
        </group> */}

        {/* Right wall */}
        {/* <group rotation={[0, Math.PI / 2, 0]}>
          <WallCandle position={[0, 3.5, WIDTH / 2 + 0.04]} delay={0.7} />
          <WallCandle position={[-2.5, 6.5, WIDTH / 2 + 0.04]} delay={1.8} />
          <WallCandle position={[2.5, 6.5, WIDTH / 2 + 0.04]} delay={2.9} />
        </group> */}

        {/* Back wall */}
        {/* <group rotation={[0, Math.PI, 0]}>
          <WallCandle position={[-2, 4.5, DEPTH / 2 + 0.04]} delay={0.4} />
          <WallCandle position={[2, 4.5, DEPTH / 2 + 0.04]} delay={1.9} />
        </group> */}
      </group>

      {/* Warm torchlight near entrance — boosted for readability */}
      <pointLight
        position={[0, 3, DEPTH / 2 + 2]}
        color="#ffd19a"
        intensity={8}
        distance={18}
        decay={1.8}
        castShadow={false}
      />

      {/* Deep interior glow — dark red, ominous */}
      <pointLight
        position={[0, 2, DEPTH / 2 - 1]}
        color="#4a1515"
        intensity={2}
        distance={6}
        decay={2}
      />

      {/* Subtle uplight at base — defines building footprint */}
      <pointLight
        position={[0, 0.5, DEPTH / 2 + 0.5]}
        color="#553322"
        intensity={1}
        distance={5}
        decay={2}
      />
    </group>
  );
}
