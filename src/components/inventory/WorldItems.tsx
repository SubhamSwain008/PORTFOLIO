"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getItemDef, SpawnedItem } from "./types";
import { ItemModel } from "./models";
import {
  generateWorldItems,
  collectItem,
  useInventoryStore,
  nearestItemPrompt,
} from "./inventory";

interface WorldItemsProps {
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  realm: "night" | "day";
}

const COLLECT_RADIUS = 3.5;
const MODEL_RADIUS_SQ = 22 * 22;  // show full 3D model within 22 units

// Reusable objects
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

// ─── Instanced indicator geometry (tiny glowing orb on ground) ───
const indicatorGeo = new THREE.SphereGeometry(0.2, 6, 6);

// Ground ring
const ringGeo = new THREE.RingGeometry(0.35, 0.55, 12);
const ringMat = new THREE.MeshBasicMaterial({
  color: "#ffffff",
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide,
});

// Deterministic phase offset
function hashPhase(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 628) / 100;
}

export default function WorldItems({ playerPosRef, realm }: WorldItemsProps) {
  const nearestRef = useRef<{ spawnId: string; itemId: string } | null>(null);
  const indicatorRef = useRef<THREE.InstancedMesh>(null!);
  const ringRef = useRef<THREE.InstancedMesh>(null!);

  // Items near enough to show full 3D model (updated every ~12 frames)
  const [nearbyItems, setNearbyItems] = useState<SpawnedItem[]>([]);

  // Generate spawn positions (just data)
  useMemo(() => generateWorldItems(realm), [realm]);

  // Subscribe to inventory
  const realmItems = useInventoryStore((s) => s.worldItems[realm] || []);
  const activeItems = useMemo(
    () => realmItems.filter((si) => !si.collected),
    [realmItems]
  );

  const maxInstances = 40;

  // Set per-instance colors when activeItems changes
  useEffect(() => {
    if (!indicatorRef.current) return;

    const colorArr = new Float32Array(maxInstances * 3);
    for (let i = 0; i < activeItems.length; i++) {
      const def = getItemDef(activeItems[i].itemId);
      if (def) {
        tempColor.set(def.emissive);
        tempColor.toArray(colorArr, i * 3);
      }
    }

    // Hide unused slots
    for (let i = activeItems.length; i < maxInstances; i++) {
      tempObject.position.set(0, -1000, 0);
      tempObject.scale.set(0, 0, 0);
      tempObject.updateMatrix();
      indicatorRef.current.setMatrixAt(i, tempObject.matrix);
      if (ringRef.current) ringRef.current.setMatrixAt(i, tempObject.matrix);
    }

    indicatorRef.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colorArr, 3)
    );
    indicatorRef.current.instanceMatrix.needsUpdate = true;
    if (ringRef.current) ringRef.current.instanceMatrix.needsUpdate = true;
  }, [activeItems, maxInstances]);

  // X-key collection
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "x" || e.repeat) return;
      const nearest = nearestRef.current;
      if (!nearest) return;
      collectItem(nearest.itemId, realm, nearest.spawnId);
      nearestRef.current = null;
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [realm]);

  const frameCount = useRef(0);

  // ─── useFrame: update instanced indicators + find near items ───
  useFrame(() => {
    if (!indicatorRef.current || !playerPosRef.current) return;

    const px = playerPosRef.current.x;
    const pz = playerPosRef.current.z;
    const time = performance.now() * 0.001;

    let closestDist = COLLECT_RADIUS;
    let closestItem: SpawnedItem | null = null;
    const nearModels: SpawnedItem[] = [];

    for (let i = 0; i < activeItems.length; i++) {
      const si = activeItems[i];
      const dx = px - si.position[0];
      const dz = pz - si.position[2];
      const distSq = dx * dx + dz * dz;

      if (distSq < MODEL_RADIUS_SQ) {
        // ─── NEAR: hide the indicator (the 3D model replaces it) ───
        tempObject.position.set(0, -1000, 0);
        tempObject.scale.set(0, 0, 0);
        tempObject.updateMatrix();
        indicatorRef.current.setMatrixAt(i, tempObject.matrix);
        if (ringRef.current) ringRef.current.setMatrixAt(i, tempObject.matrix);

        nearModels.push(si);

        // Check collect proximity
        if (distSq < closestDist * closestDist) {
          const dist = Math.sqrt(distSq);
          if (dist < closestDist) {
            closestDist = dist;
            closestItem = si;
          }
        }
      } else {
        // ─── FAR: show as glowing indicator orb + ring ───
        const phase = i * 2.37 + time * 2.0;
        const bobY = 0.6 + Math.sin(phase) * 0.15;

        tempObject.position.set(si.position[0], bobY, si.position[2]);
        tempObject.rotation.set(0, 0, 0);
        tempObject.scale.set(1, 1, 1);
        tempObject.updateMatrix();
        indicatorRef.current.setMatrixAt(i, tempObject.matrix);

        // Ground ring
        if (ringRef.current) {
          tempObject.position.set(si.position[0], 0.05, si.position[2]);
          tempObject.rotation.set(-Math.PI / 2, 0, time * 0.2 + i);
          tempObject.scale.set(1, 1, 1);
          tempObject.updateMatrix();
          ringRef.current.setMatrixAt(i, tempObject.matrix);
        }
      }
    }

    indicatorRef.current.instanceMatrix.needsUpdate = true;
    if (ringRef.current) ringRef.current.instanceMatrix.needsUpdate = true;

    // Update prompt (mutable — no React re-render)
    if (closestItem) {
      nearestRef.current = { spawnId: closestItem.id, itemId: closestItem.itemId };
      const def = getItemDef(closestItem.itemId);
      nearestItemPrompt.visible = true;
      nearestItemPrompt.name = def?.name || "Item";
    } else {
      nearestRef.current = null;
      nearestItemPrompt.visible = false;
    }

    // Update nearby model list (throttled — every ~12 frames)
    frameCount.current++;
    if (frameCount.current % 12 === 0) {
      setNearbyItems((prev) => {
        if (prev.length !== nearModels.length) return nearModels;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== nearModels[i].id) return nearModels;
        }
        return prev; // unchanged
      });
    }
  });

  return (
    <group>
      {/* Instanced indicators for ALL items — 1 draw call */}
      <instancedMesh
        ref={indicatorRef}
        args={[indicatorGeo, undefined, maxInstances]}
        frustumCulled={false}
      >
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Ground rings — 1 draw call */}
      <instancedMesh
        ref={ringRef}
        args={[ringGeo, ringMat, maxInstances]}
        frustumCulled={false}
      />

      {/* Full 3D models ONLY for nearby items (2-3 max) */}
      {nearbyItems.map((si) => {
        const def = getItemDef(si.itemId);
        if (!def) return null;
        return (
          <ItemModel
            key={si.id}
            item={def}
            position={si.position}
            phaseOffset={hashPhase(si.id)}
          />
        );
      })}
    </group>
  );
}
