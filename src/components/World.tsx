"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTexture, useVideoTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ProfileBuilding from "./ProfileBuilding";
import { ENV_PROPS } from "../lib/environment";
import { InstancedTrees, InstancedRocks, InstancedFencePerimeter } from "./InstancedNightEnv";

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
      <InstancedFencePerimeter />

      {/* Environment */}
      <InstancedTrees items={props} />
      <InstancedRocks items={props} />

      {/* ─── Back Fence Portal Gateway ─── */}
      <group position={[-10, 0, -28.9]}>
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