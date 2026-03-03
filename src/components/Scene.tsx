"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import World from "./World";
import Player from "./Player";
import CameraController from "./CameraController";

export default function Scene() {
  const keys = useRef<Record<string, boolean>>({});
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0.6, 8));

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setPlayerPos(pos.clone());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f" }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        camera={{
          fov: 48,
          near: 0.1,
          far: 200,
          position: [0, 14, 18],
        }}
      >
        {/* Fog — pushed far back, only softens horizon */}
        <fog attach="fog" args={["#12141c", 40, 120]} />

        {/* Ambient light — enough to see the whole world */}
        <ambientLight intensity={0.5} color="#4a4a65" />

        {/* Primary directional moonlight — secondary to flashlight */}
        <directionalLight
          position={[15, 30, 10]}
          intensity={1.8}
          color="#b0c0ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-camera-near={0.5}
          shadow-camera-far={100}
          shadow-bias={-0.0003}
        />

        {/* Rim light (behind building) — purple tint silhouette definition */}
        <directionalLight
          position={[-12, 20, -15]}
          intensity={0.6}
          color="#7a5a9a"
        />

        {/* Warm ground-bounce fill */}
        <directionalLight
          position={[5, 8, 20]}
          intensity={0.35}
          color="#5a4a40"
        />

        {/* Hemisphere light for overall fill */}
        <hemisphereLight
          color="#445577"
          groundColor="#1a1520"
          intensity={0.4}
        />

        {/* World: ground, building, props */}
        <World />

        {/* Player */}
        <Player onPositionChange={handlePositionChange} keys={keys} />

        {/* Camera Controller */}
        <CameraController playerPosition={playerPos} />
      </Canvas>
    </div>
  );
}
