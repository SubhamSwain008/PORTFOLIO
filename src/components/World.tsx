"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ProfileBuilding from "./ProfileBuilding";
import { ENV_PROPS } from "../lib/environment";

// Enhanced low-poly leafy tree with variants
function LeafyTree({
  position,
  scale = 1,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  variant?: number;
}) {
  const configs = [
    { color: "#1a2a20", shape: "sphere", height: 2.0, radius: 1.2 },
    { color: "#15241d", shape: "cone", height: 2.8, radius: 1.1 },
    { color: "#362217", shape: "sphere", height: 1.8, radius: 1.4 },
    { color: "#232e2a", shape: "sphere", height: 2.4, radius: 1.0 },
    { color: "#272e1c", shape: "cone", height: 2.2, radius: 1.3 },
  ];

  const conf = configs[variant % configs.length];

  const leafTex = useTexture("/assets/leaf.png");
  leafTex.wrapS = THREE.RepeatWrapping;
  leafTex.wrapT = THREE.RepeatWrapping;
  // Repeat to make the leaf texture fit nicely on the low-poly shapes
  leafTex.repeat.set(4, 4);
  leafTex.magFilter = THREE.NearestFilter;
  leafTex.minFilter = THREE.NearestFilter;
  // Update texture needsUpdate
  leafTex.needsUpdate = true;

  const leafMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(conf.color).offsetHSL(
          (variant % 3) * 0.01,
          0,
          (variant % 2) * 0.03
        ),
        map: leafTex,
        roughness: 0.85,
        metalness: 0.04,
        flatShading: true,
      }),
    [conf.color, variant, leafTex]
  );

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, conf.height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.18, conf.height, 6]} />
        <meshStandardMaterial
          color="#2d241c"
          roughness={0.9}
          metalness={0}
          flatShading
        />
      </mesh>

      {/* Main canopy */}
      <mesh
        position={[
          0,
          conf.shape === "cone"
            ? conf.height + conf.radius
            : conf.height + conf.radius / 1.6,
          0,
        ]}
        castShadow
      >
        {conf.shape === "sphere" ? (
          <icosahedronGeometry args={[conf.radius, 1]} />
        ) : (
          <coneGeometry args={[conf.radius, conf.radius * 2.1, 6]} />
        )}
        <primitive object={leafMaterial} attach="material" />
      </mesh>

      {/* Extra foliage clusters for sphere trees */}
      {conf.shape === "sphere" && (
        <>
          <mesh position={[0.4, conf.height + conf.radius * 0.9, 0.2]} castShadow>
            <icosahedronGeometry args={[conf.radius * 0.55, 0]} />
            <primitive object={leafMaterial} attach="material" />
          </mesh>

          <mesh position={[-0.35, conf.height + conf.radius * 0.8, -0.25]} castShadow>
            <icosahedronGeometry args={[conf.radius * 0.45, 0]} />
            <primitive object={leafMaterial} attach="material" />
          </mesh>

          <mesh position={[0.15, conf.height + conf.radius * 1.1, -0.35]} castShadow>
            <icosahedronGeometry args={[conf.radius * 0.35, 0]} />
            <primitive object={leafMaterial} attach="material" />
          </mesh>
        </>
      )}

      {/* Secondary cone layer for pine variants */}
      {conf.shape === "cone" && (
        <mesh position={[0, conf.height + conf.radius * 0.6, 0]} castShadow>
          <coneGeometry args={[conf.radius * 0.75, conf.radius * 1.4, 6]} />
          <primitive object={leafMaterial} attach="material" />
        </mesh>
      )}
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

// Greyish picket fence segment
function FenceSegment({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const picketCount = 12;
  const segmentWidth = 4;
  const spacing = segmentWidth / picketCount;

  return (
    <group position={position} rotation={rotation}>
      {/* Top rail */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[segmentWidth, 0.06, 0.04]} />
        <meshStandardMaterial color="#7a7c80" roughness={0.7} metalness={0.02} />
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[segmentWidth, 0.06, 0.04]} />
        <meshStandardMaterial color="#7a7c80" roughness={0.7} metalness={0.02} />
      </mesh>
      {/* Pickets */}
      {Array.from({ length: picketCount }, (_, i) => {
        const x = -segmentWidth / 2 + spacing / 2 + i * spacing;
        const height = 0.9 + (i % 3 === 0 ? 0.12 : 0); // varied heights
        return (
          <mesh key={i} position={[x, height / 2, 0]}>
            <boxGeometry args={[0.08, height, 0.03]} />
            <meshStandardMaterial color="#6b6d73" roughness={0.75} metalness={0.02} />
          </mesh>
        );
      })}
    </group>
  );
}

function FencePerimeter() {
  const halfSize = 29; // slightly inside 60/2=30
  const segmentWidth = 4;
  const segments = Math.ceil((halfSize * 2) / segmentWidth);

  return (
    <group>
      {/* North fence (back) */}
      {Array.from({ length: segments }, (_, i) => (
        <FenceSegment
          key={`n${i}`}
          position={[-halfSize + segmentWidth / 2 + i * segmentWidth, 0, -halfSize]}
        />
      ))}
      {/* South fence (front) */}
      {Array.from({ length: segments }, (_, i) => (
        <FenceSegment
          key={`s${i}`}
          position={[-halfSize + segmentWidth / 2 + i * segmentWidth, 0, halfSize]}
        />
      ))}
      {/* West fence (left) */}
      {Array.from({ length: segments }, (_, i) => (
        <FenceSegment
          key={`w${i}`}
          position={[-halfSize, 0, -halfSize + segmentWidth / 2 + i * segmentWidth]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
      {/* East fence (right) */}
      {Array.from({ length: segments }, (_, i) => (
        <FenceSegment
          key={`e${i}`}
          position={[halfSize, 0, -halfSize + segmentWidth / 2 + i * segmentWidth]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
    </group>
  );
}

// The PortalGateway video component has been removed in favor of a static image texture.

export default function World() {
  const props = ENV_PROPS;

  const grassTexture = useTexture("/assets/grass.png");
  const portalVideo = useVideoTexture("/assets/portal.mp4", {
    muted: true,
    loop: true,
    start: true,
    crossOrigin: "anonymous",
  });

  // Clone textures with appropriate repetitions for the different sized planes
  // to ensure consistent visual scaling of the grass.
  const texBase = useMemo(() => {
    const t = grassTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4); // 60x60 plane
    t.needsUpdate = true;
    return t;
  }, [grassTexture]);

  const texInner = useMemo(() => {
    const t = grassTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 4); // 30x30 plane
    t.needsUpdate = true;
    return t;
  }, [grassTexture]);

  const texBuilding = useMemo(() => {
    const t = grassTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5.6, 5.6); // 14x14 plane
    t.needsUpdate = true;
    return t;
  }, [grassTexture]);

  const texOuter = useMemo(() => {
    const t = grassTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // Keep the same ratio as 4 repeats per 60 units -> (400 / 60) * 4 = 26.666
    t.repeat.set(400 / 15, 400 / 15);
    t.needsUpdate = true;
    return t;
  }, [grassTexture]);

  return (
    <group>
      {/* Outer ground (extends to camera horizon) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          map={texOuter}
          color="#b8b8b8ff"
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          map={texBase}
          color="#b8b8b8ff"
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>

      {/* Inner ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          map={texInner}
          color="#c5c5c5ff"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* Building area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial
          map={texBuilding}
          color="#aaaaaa"
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* Building */}
      <ProfileBuilding />

      {/* White Picket Fence around perimeter */}
      <FencePerimeter />

      {/* Environment */}
      {props.map((item, i) =>
        item.type === "tree" ? (
          <LeafyTree
            key={`tree-${i}`}
            position={item.pos}
            scale={item.scale}
            variant={item.variant}
          />
        ) : (
          <Rock key={`rock-${i}`} position={item.pos} scale={item.scale} />
        )
      )}

      {/* ─── Back Fence Portal Gateway ─── */}
      <group position={[0, 0, -28.9]}>
        {/* Portal Frame / Backing */}
        <mesh position={[0, 2.1, 0.1]}>
          <boxGeometry args={[3.1, 4.3, 0.4]} />
          <meshStandardMaterial color="#0a0515" emissive="#0a0515" emissiveIntensity={0.2} roughness={0.9} />
        </mesh>

        {/* Portal Inner Void — video texture */}
        <mesh position={[0, 2.1, 0.31]}>
          <planeGeometry args={[3.1, 4.3]} />
          <meshBasicMaterial map={portalVideo} color="#ffffff" toneMapped={false} />
        </mesh>

        {/* Portal Light */}
        <pointLight
          position={[0, 3, 1]}
          color="#6a3a9a"
          intensity={5}
          distance={15}
          decay={2}
        />
      </group>
    </group>
  );
}