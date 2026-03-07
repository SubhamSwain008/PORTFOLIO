"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InventoryItemDef } from "./types";

// ─── Shared materials (created ONCE, reused across ALL items) ─────
const matCache = new Map<string, THREE.MeshStandardMaterial>();
function getSharedMat(color: string, emissive: string, emissiveIntensity: number, roughness = 0.5, metalness = 0.1): THREE.MeshStandardMaterial {
  const key = `${color}_${emissive}_${emissiveIntensity}_${roughness}_${metalness}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity, roughness, metalness,
    }));
  }
  return matCache.get(key)!;
}

// Shared basic materials
const stemMat = new THREE.MeshStandardMaterial({ color: "#5a3a20", roughness: 0.9, metalness: 0 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#2a8a30", emissive: "#1a5a20", emissiveIntensity: 0.3, roughness: 0.7 });
const mushroomStemMat = new THREE.MeshStandardMaterial({ color: "#d8d0c8", roughness: 0.8 });
const handleMat = new THREE.MeshStandardMaterial({ color: "#5a4030", roughness: 0.85 });
const torchHandleMat = new THREE.MeshStandardMaterial({ color: "#4a3a28", roughness: 0.9 });

// Shared geometries (created ONCE)
const sphereGeo = new THREE.SphereGeometry(0.3, 6, 6);
const smallSphereGeo = new THREE.SphereGeometry(0.07, 4, 4);
const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.12, 4);
const leafGeo = new THREE.BoxGeometry(0.12, 0.02, 0.06);
const breadGeo = new THREE.BoxGeometry(0.5, 0.25, 0.3);
const mushroomStemGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 4);
const mushroomCapGeo = new THREE.SphereGeometry(0.22, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2);
const cheeseGeo = new THREE.BoxGeometry(0.4, 0.2, 0.3);
const pickHandleGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
const pickHeadGeo = new THREE.BoxGeometry(0.45, 0.1, 0.08);
const torchBodyGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 4);
const flameGeo = new THREE.SphereGeometry(0.1, 4, 4);
const compassBaseGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 8);
const needleGeo = new THREE.ConeGeometry(0.03, 0.14, 3);

// ─── Simplified Food Models (no castShadow, no lights) ──────

function AppleModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.4), [color, emissive]);
  return (
    <group>
      <mesh geometry={sphereGeo}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={stemGeo} position={[0, 0.3, 0]}><primitive object={stemMat} attach="material" /></mesh>
      <mesh geometry={leafGeo} position={[0.06, 0.34, 0]} rotation={[0, 0, 0.4]}><primitive object={leafMat} attach="material" /></mesh>
    </group>
  );
}

function BreadModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.3, 0.7, 0.05), [color, emissive]);
  return (
    <mesh geometry={breadGeo}><primitive object={mat} attach="material" /></mesh>
  );
}

function MushroomModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.6, 0.5, 0.1), [color, emissive]);
  return (
    <group>
      <mesh geometry={mushroomStemGeo} position={[0, -0.05, 0]}><primitive object={mushroomStemMat} attach="material" /></mesh>
      <mesh geometry={mushroomCapGeo} position={[0, 0.12, 0]}><primitive object={mat} attach="material" /></mesh>
    </group>
  );
}

function BerryModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.7, 0.35, 0.15), [color, emissive]);
  return (
    <group>
      <mesh geometry={smallSphereGeo} position={[0, 0, 0]}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={smallSphereGeo} position={[0.1, 0.05, 0.05]}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={smallSphereGeo} position={[-0.08, 0.04, 0.06]}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={smallSphereGeo} position={[0.04, 0.08, -0.06]}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={leafGeo} position={[0, 0.12, 0]}><primitive object={leafMat} attach="material" /></mesh>
    </group>
  );
}

function CheeseModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.4, 0.6, 0.05), [color, emissive]);
  return (
    <mesh geometry={cheeseGeo} rotation={[0, 0, -0.15]}><primitive object={mat} attach="material" /></mesh>
  );
}

// ─── Simplified Tool Models ──────

function PickaxeModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.6, 0.2, 0.6), [color, emissive]);
  return (
    <group rotation={[0, 0, 0.5]}>
      <mesh geometry={pickHandleGeo} position={[0, -0.15, 0]}><primitive object={handleMat} attach="material" /></mesh>
      <mesh geometry={pickHeadGeo} position={[0, 0.12, 0]}><primitive object={mat} attach="material" /></mesh>
    </group>
  );
}

function TorchModel({ color, emissive }: { color: string; emissive: string }) {
  const flameMat = useMemo(() => getSharedMat(color, emissive, 2.5, 0.1, 0), [color, emissive]);
  return (
    <group>
      <mesh geometry={torchBodyGeo} position={[0, -0.1, 0]}><primitive object={torchHandleMat} attach="material" /></mesh>
      <mesh geometry={flameGeo} position={[0, 0.22, 0]}><primitive object={flameMat} attach="material" /></mesh>
    </group>
  );
}

function CompassModel({ color, emissive }: { color: string; emissive: string }) {
  const mat = useMemo(() => getSharedMat(color, emissive, 0.3, 0.4, 0.6), [color, emissive]);
  const needleMat = useMemo(() => getSharedMat("#cc2222", "#ff3333", 0.6), []);
  return (
    <group>
      <mesh geometry={compassBaseGeo}><primitive object={mat} attach="material" /></mesh>
      <mesh geometry={needleGeo} position={[0, 0.04, 0.06]} rotation={[Math.PI / 2, 0, 0]}><primitive object={needleMat} attach="material" /></mesh>
    </group>
  );
}

// ─── Model Selector ──────────────────────────────────────
const MODEL_MAP: Record<string, React.FC<{ color: string; emissive: string }>> = {
  mystic_apple: AppleModel,
  golden_bread: BreadModel,
  shadow_mushroom: MushroomModel,
  ember_berry: BerryModel,
  moon_cheese: CheeseModel,
  crystal_pickaxe: PickaxeModel,
  torch: TorchModel,
  ancient_compass: CompassModel,
};

// ─── Animated Item Wrapper (lightweight — no lights, no shadows) ─
interface ItemModelProps {
  item: InventoryItemDef;
  position: [number, number, number];
  phaseOffset: number; // pre-computed random offset
}

export function ItemModel({ item, position, phaseOffset }: ItemModelProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.001;
    groupRef.current.position.y = position[1] + Math.sin(phaseOffset + t * 1.5) * 0.12;
    groupRef.current.rotation.y = (phaseOffset + t * 0.6) % (Math.PI * 2);
  });

  const ModelComponent = MODEL_MAP[item.id];
  if (!ModelComponent) return null;

  return (
    <group ref={groupRef} position={position}>
      <ModelComponent color={item.color} emissive={item.emissive} />
    </group>
  );
}
