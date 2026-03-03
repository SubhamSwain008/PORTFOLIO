"use client";

import { useMemo } from "react";
import * as THREE from "three";
import ProfileBuilding from "./ProfileBuilding";

// Sparse dead tree
function DeadTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.15, 2.4, 5]} />
        <meshStandardMaterial color="#302820" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Branch 1 */}
      <mesh position={[0.3, 2.0, 0]} rotation={[0, 0, 0.8]} castShadow>
        <cylinderGeometry args={[0.03, 0.06, 1.0, 4]} />
        <meshStandardMaterial color="#302820" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Branch 2 */}
      <mesh position={[-0.2, 1.8, 0.1]} rotation={[0.3, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.8, 4]} />
        <meshStandardMaterial color="#302820" roughness={0.95} metalness={0.02} />
      </mesh>
      {/* Branch 3 */}
      <mesh position={[0.1, 2.3, -0.15]} rotation={[0.4, 0.5, 0.3]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.6, 4]} />
        <meshStandardMaterial color="#302820" roughness={0.95} metalness={0.02} />
      </mesh>
    </group>
  );
}

// Low-poly rock
function Rock({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial
        color="#2a2530"
        roughness={0.9}
        metalness={0.08}
        flatShading
      />
    </mesh>
  );
}

export default function World() {
  // Generate sparse environmental props
  const props = useMemo(() => {
    const items: { type: "tree" | "rock"; pos: [number, number, number]; scale?: number }[] = [];
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };
    const random = rng(42);

    // Sparse dead trees
    const treePositions: [number, number, number][] = [
      [-18, 0, -12],
      [15, 0, -20],
      [-22, 0, 10],
      [20, 0, 18],
      [-10, 0, -22],
      [25, 0, -5],
      [-14, 0, 20],
      [8, 0, -18],
    ];
    treePositions.forEach((pos) => items.push({ type: "tree", pos }));

    // Scattered rocks
    for (let i = 0; i < 20; i++) {
      const x = (random() - 0.5) * 56;
      const z = (random() - 0.5) * 56;
      // Don't place too close to center building
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
      const scale = 0.5 + random() * 1.2;
      items.push({ type: "rock", pos: [x, scale * 0.15, z], scale });
    }

    return items;
  }, []);

  return (
    <group>
      {/* Ground Plane — dark muted brown/blue-grey, NOT black */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#1a1820"
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Inner ground area — slightly different tone, worn stone feel */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#201c26"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Paved area around building — lighter, deliberate */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          color="#28242e"
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* Profile Building (center of world) */}
      <ProfileBuilding />

      {/* Environmental props */}
      {props.map((item, i) =>
        item.type === "tree" ? (
          <DeadTree key={`tree-${i}`} position={item.pos} />
        ) : (
          <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} />
        )
      )}
    </group>
  );
}
