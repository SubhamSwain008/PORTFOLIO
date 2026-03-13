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
import { NIGHT_ENV, PORTAL } from "./settings/settings";
import EnemySystem from "./EnemySystem";

import { useGameStore } from "./useGameStore";

interface WorldProps {
  playerPosRef?: React.MutableRefObject<THREE.Vector3>;
  playerAngleRef?: React.MutableRefObject<number>;
}



export default function World({ playerPosRef, playerAngleRef }: WorldProps) {
  const props = ENV_PROPS;
  const grassTexture = useTexture("/assets/grass.png");
  const portalVideo = useVideoTexture("/assets/portal.mp4", {
    muted: true,
    loop: true,
    start: false, // Don't auto-play — toggled by proximity
    crossOrigin: "anonymous",
  });

  // Play/pause portal video based on camera distance (30 units)
  const portalWorldPos = useMemo(() => new THREE.Vector3(...PORTAL.PORTAL_POS), []);
  useFrame(({ camera }) => {
    if (!portalVideo?.image) return;
    const dist = camera.position.distanceTo(portalWorldPos);
    const video = portalVideo.image as HTMLVideoElement;
    if (dist < PORTAL.VIDEO_DISTANCE && video.paused) {
      video.play().catch(() => {});
    } else if (dist >= PORTAL.VIDEO_DISTANCE && !video.paused) {
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
    // Keep the same ratio as 4 repeats per 60 units -> (1600 / 60) * 4 = 106.666
    t.repeat.set(1600 / 15, 1600 / 15);
    t.needsUpdate = true;
    return t;
  }, [grassTexture]);

  return (
    <group>
      {/* Outer ground (extends to camera horizon) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[1600, 1600]} />
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
      <InstancedGrass realm="night" baseColor={NIGHT_ENV.GRASS_COLOR} count={NIGHT_ENV.GRASS_COUNT} treePositions={ENV_PROPS.filter(e => e.type === 'tree').map(e => e.pos)} />

      {/* ─── Portal video on back wall of Main Hall ─── */}
      <mesh position={[0, 2.5, -4.26]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4, 5]} />
        <meshBasicMaterial map={portalVideo} color="#ffffff" toneMapped={false} />
      </mesh>

      {/* ─── Enemy System (dynamic spawning) ─── */}
      {playerPosRef && playerAngleRef && <EnemySystem playerPosRef={playerPosRef} playerAngleRef={playerAngleRef} />}

      {/* ─── Collectible Items ─── */}
      {playerPosRef && <WorldItems playerPosRef={playerPosRef} realm="night" />}
    </group>
  );
}