"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ProfileBuilding from "./ProfileBuilding";
import { ENV_PROPS } from "../lib/environment";
import { InstancedTrees, InstancedRocks, InstancedFencePerimeter } from "./InstancedNightEnv";
import WorldItems from "./inventory/WorldItems";
import InstancedGrass from "./InstancedGrass";

import { useGameStore } from "./useGameStore";

interface WorldProps {
  playerPosRef?: React.MutableRefObject<THREE.Vector3>;
}

// ─── Glowing Portal Frame (Night) ───
// Reads proximity state and animates glow intensity
function PortalGlow() {
  const isNear = useGameStore((s) => s.isNearPortal);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const intensity = useRef(0);

  // Build a frame out of 4 thin boxes
  const thick = 0.08;
  const w = 3.2;
  const h = 4.4;
  const d = 0.2;

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const target = isNear ? 2.5 : 0.0;
    intensity.current += (target - intensity.current) * 6 * delta;
    materialRef.current.emissiveIntensity = THREE.MathUtils.clamp(intensity.current, 0, 3);
  });

  return (
    <group position={[0, 2.1, 0.2]}>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial ref={materialRef} color="#9a6aff" emissive="#b08fff" emissiveIntensity={0} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, -h / 2, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color="#9a6aff" emissive="#b08fff" emissiveIntensity={intensity.current} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[w / 2, 0, 0]}>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color="#9a6aff" emissive="#b08fff" emissiveIntensity={intensity.current} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh position={[-w / 2, 0, 0]}>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color="#9a6aff" emissive="#b08fff" emissiveIntensity={intensity.current} toneMapped={false} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export default function World({ playerPosRef }: WorldProps) {
  const props = ENV_PROPS;
  const grassTexture = useTexture("/assets/grass.png");
  const portalVideo = useVideoTexture("/assets/portal.mp4", {
    muted: true,
    loop: true,
    start: false, // Don't auto-play — toggled by proximity
    crossOrigin: "anonymous",
  });

  // Play/pause portal video based on camera distance (30 units)
  const portalWorldPos = useMemo(() => new THREE.Vector3(0, 0, -4.01), []);
  useFrame(({ camera }) => {
    if (!portalVideo?.image) return;
    const dist = camera.position.distanceTo(portalWorldPos);
    const video = portalVideo.image as HTMLVideoElement;
    if (dist < 60 && video.paused) {
      video.play().catch(() => {});
    } else if (dist >= 60 && !video.paused) {
      video.pause();
    }
  });

  // Clone textures with appropriate repetitions for the different sized planes
  // to ensure consistent visual scaling of the grass.
  const texBase = useMemo(() => {
    const t = grassTexture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2); // 60x60 plane
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
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial
          map={texOuter}
          color="#b8b8b8ff"
          roughness={0.88}
          metalness={0.06}
        />
      </mesh>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
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
      <InstancedFencePerimeter />

      {/* Environment */}
      <InstancedTrees items={props} />
      <InstancedRocks items={props} />
      <InstancedGrass realm="night" baseColor="#0d1a0e" count={12000} treePositions={ENV_PROPS.filter(e => e.type === 'tree').map(e => e.pos)} />

      {/* ─── Portal attached to back wall of Main Hall ─── */}
      <group position={[0, 0, -4.01]} rotation={[0, Math.PI, 0]}>
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

        {/* Glowing Purple Frame */}
        <PortalGlow />

        {/* Portal Light */}
        <pointLight
          position={[0, 3, 1]}
          color="#6a3a9a"
          intensity={5}
          distance={15}
          decay={2}
        />
      </group>

      {/* ─── Collectible Items ─── */}
      {playerPosRef && <WorldItems playerPosRef={playerPosRef} realm="night" />}
    </group>
  );
}