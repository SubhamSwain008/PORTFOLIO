"use client";

import * as THREE from "three";

export default function ProfileBuilding() {
  const WIDTH = 8;
  const DEPTH = 8;
  const HEIGHT = 14;
  const WALL_THICKNESS = 0.5;
  const DOOR_WIDTH = 2;
  const DOOR_HEIGHT = 4;

  // Dark charcoal stone — NOT black, with blue undertone
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: "#2a252e",
    roughness: 0.8,
    metalness: 0.1,
  });

  // Slightly lighter stone for edges / variation
  const stoneVariant = new THREE.MeshStandardMaterial({
    color: "#352e35",
    roughness: 0.75,
    metalness: 0.12,
  });

  // Darkest stone for deep recesses
  const stoneDeep = new THREE.MeshStandardMaterial({
    color: "#1e1a22",
    roughness: 0.85,
    metalness: 0.08,
  });

  // Doorway interior — emissive dark red glow
  const doorwayMaterial = new THREE.MeshStandardMaterial({
    color: "#100810",
    emissive: "#3a0b0b",
    emissiveIntensity: 0.95,
    roughness: 1,
    metalness: 0,
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

      {/* Doorway indentation (front face, z = DEPTH/2) */}
      <mesh
        position={[0, DOOR_HEIGHT / 2, DEPTH / 2 + 0.01]}
        material={doorwayMaterial}
      >
        <boxGeometry args={[DOOR_WIDTH, DOOR_HEIGHT, WALL_THICKNESS]} />
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
