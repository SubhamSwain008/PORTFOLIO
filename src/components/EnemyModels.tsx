"use client";

import { useMemo } from "react";
import * as THREE from "three";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  SHARED MATERIALS (created once, reused across all enemies)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const darkFurMat = new THREE.MeshStandardMaterial({
  color: "#1a1015",
  roughness: 0.95,
  metalness: 0.05,
});
const redEyeMat = new THREE.MeshStandardMaterial({
  color: "#ff2020",
  emissive: "#ff0000",
  emissiveIntensity: 2.5,
});
const clawMat = new THREE.MeshStandardMaterial({
  color: "#2a2020",
  roughness: 0.7,
  metalness: 0.3,
});
const spiderBodyMat = new THREE.MeshStandardMaterial({
  color: "#0d0a08",
  roughness: 0.85,
  metalness: 0.1,
});
const spiderLegMat = new THREE.MeshStandardMaterial({
  color: "#1a1510",
  roughness: 0.9,
  metalness: 0.05,
});
const spiderFangMat = new THREE.MeshStandardMaterial({
  color: "#e8e0d0",
  roughness: 0.4,
  metalness: 0.4,
});
const ghostMat = new THREE.MeshStandardMaterial({
  color: "#a8c8e8",
  emissive: "#4466aa",
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.45,
  roughness: 0.3,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const ghostEyeMat = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#88bbff",
  emissiveIntensity: 3.0,
});
const wraithMat = new THREE.MeshStandardMaterial({
  color: "#15101a",
  emissive: "#2a1540",
  emissiveIntensity: 0.5,
  transparent: true,
  opacity: 0.7,
  roughness: 0.9,
  metalness: 0.0,
});
const wraithGlowMat = new THREE.MeshStandardMaterial({
  color: "#8844cc",
  emissive: "#aa55ff",
  emissiveIntensity: 2.0,
  transparent: true,
  opacity: 0.6,
});
const skullMat = new THREE.MeshStandardMaterial({
  color: "#d8d0c0",
  emissive: "#443322",
  emissiveIntensity: 0.3,
  roughness: 0.6,
  metalness: 0.1,
});
const skullGlowMat = new THREE.MeshStandardMaterial({
  color: "#44ff88",
  emissive: "#22ff66",
  emissiveIntensity: 3.0,
});
const skullTrailMat = new THREE.MeshStandardMaterial({
  color: "#22aa55",
  emissive: "#11cc44",
  emissiveIntensity: 1.0,
  transparent: true,
  opacity: 0.35,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  1. HELLHOUND — 4-legged dark beast with glowing red eyes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Hellhound({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── BODY (main torso) ── */}
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[0.7, 0.5, 1.4]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>
      {/* Ribcage detail */}
      <mesh castShadow position={[0, 0.75, 0.15]}>
        <boxGeometry args={[0.75, 0.4, 0.6]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>
      {/* Spine ridge */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={`spine-${i}`} castShadow position={[0, 1.0, z]}>
          <coneGeometry args={[0.06, 0.2, 4]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      ))}

      {/* ── HEAD ── */}
      <group position={[0, 0.85, 0.85]}>
        {/* Skull */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.35, 0.45]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        {/* Snout */}
        <mesh castShadow position={[0, -0.08, 0.3]}>
          <boxGeometry args={[0.25, 0.2, 0.3]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        {/* Upper jaw */}
        <mesh castShadow position={[0, -0.12, 0.38]}>
          <boxGeometry args={[0.22, 0.06, 0.2]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        {/* Teeth (left row) */}
        {[0.08, 0.16, 0.24].map((z, i) => (
          <mesh key={`tooth-l-${i}`} position={[-0.1, -0.2, 0.22 + z * 0.4]}>
            <coneGeometry args={[0.02, 0.08, 4]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
          </mesh>
        ))}
        {/* Teeth (right row) */}
        {[0.08, 0.16, 0.24].map((z, i) => (
          <mesh key={`tooth-r-${i}`} position={[0.1, -0.2, 0.22 + z * 0.4]}>
            <coneGeometry args={[0.02, 0.08, 4]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.4} />
          </mesh>
        ))}
        {/* Eyes */}
        <mesh position={[-0.12, 0.06, 0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <primitive object={redEyeMat} attach="material" />
        </mesh>
        <mesh position={[0.12, 0.06, 0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <primitive object={redEyeMat} attach="material" />
        </mesh>
        {/* Ears */}
        <mesh castShadow position={[-0.15, 0.2, -0.05]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.06, 0.18, 4]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0.15, 0.2, -0.05]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.18, 4]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
      </group>

      {/* ── NECK ── */}
      <mesh castShadow position={[0, 0.8, 0.6]}>
        <boxGeometry args={[0.35, 0.3, 0.3]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>

      {/* ── TAIL ── */}
      <mesh castShadow position={[0, 0.8, -0.8]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.6, 6]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 1.0, -1.05]} rotation={[0.8, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.4, 6]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>

      {/* ── FRONT LEFT LEG ── */}
      <group position={[-0.25, 0.42, 0.4]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.14, 0.35, 0.14]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.38, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.12]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        {/* Paw */}
        <mesh castShadow position={[0, -0.48, 0.03]}>
          <boxGeometry args={[0.16, 0.06, 0.18]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      </group>

      {/* ── FRONT RIGHT LEG ── */}
      <group position={[0.25, 0.42, 0.4]}>
        <mesh castShadow position={[0, -0.15, 0]}>
          <boxGeometry args={[0.14, 0.35, 0.14]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.38, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.12]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.48, 0.03]}>
          <boxGeometry args={[0.16, 0.06, 0.18]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      </group>

      {/* ── BACK LEFT LEG ── */}
      <group position={[-0.25, 0.42, -0.4]}>
        <mesh castShadow position={[0, -0.12, 0.05]}>
          <boxGeometry args={[0.16, 0.3, 0.16]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.35, -0.03]}>
          <boxGeometry args={[0.12, 0.22, 0.12]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.48, 0.03]}>
          <boxGeometry args={[0.16, 0.06, 0.18]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      </group>

      {/* ── BACK RIGHT LEG ── */}
      <group position={[0.25, 0.42, -0.4]}>
        <mesh castShadow position={[0, -0.12, 0.05]}>
          <boxGeometry args={[0.16, 0.3, 0.16]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.35, -0.03]}>
          <boxGeometry args={[0.12, 0.22, 0.12]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.48, 0.03]}>
          <boxGeometry args={[0.16, 0.06, 0.18]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  2. SHADOW SPIDER — massive 8-legged arachnid with armored body
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ShadowSpider({ position }: { position: [number, number, number] }) {
  // 8 legs: 4 per side, arranged front-to-back
  const legs = [
    // Left side (negative X)
    { side: -1, zOff: 0.45, angle: 0.5, len1: 0.7, len2: 0.65 },
    { side: -1, zOff: 0.15, angle: 0.65, len1: 0.8, len2: 0.75 },
    { side: -1, zOff: -0.15, angle: 0.7, len1: 0.85, len2: 0.8 },
    { side: -1, zOff: -0.45, angle: 0.6, len1: 0.7, len2: 0.65 },
    // Right side (positive X)
    { side: 1, zOff: 0.45, angle: -0.5, len1: 0.7, len2: 0.65 },
    { side: 1, zOff: 0.15, angle: -0.65, len1: 0.8, len2: 0.75 },
    { side: 1, zOff: -0.15, angle: -0.7, len1: 0.85, len2: 0.8 },
    { side: 1, zOff: -0.45, angle: -0.6, len1: 0.7, len2: 0.65 },
  ];

  return (
    <group position={position}>
      {/* ── ABDOMEN (massive rear segment) ── */}
      <mesh castShadow position={[0, 0.7, -0.65]}>
        <sphereGeometry args={[0.7, 12, 12]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      {/* Abdomen top armor plate */}
      <mesh castShadow position={[0, 1.1, -0.65]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color="#1a1008" roughness={0.75} metalness={0.2} />
      </mesh>
      {/* Abdomen markings — red hourglass */}
      <mesh position={[0, 0.7, -0.02]}>
        <boxGeometry args={[0.08, 0.15, 0.02]} />
        <meshStandardMaterial color="#cc1111" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      {/* Abdomen back spikes */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={`abd-spike-${i}`} castShadow position={[x, 1.15, -0.7 - i * 0.1]} rotation={[-0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.2, 4]} />
          <primitive object={clawMat} attach="material" />
        </mesh>
      ))}
      {/* Spinnerets */}
      <mesh castShadow position={[0, 0.4, -1.25]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.03, 0.2, 6]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>

      {/* ── CEPHALOTHORAX (armored front body) ── */}
      <mesh castShadow position={[0, 0.6, 0.2]}>
        <sphereGeometry args={[0.45, 12, 10]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      {/* Armored carapace plate */}
      <mesh castShadow position={[0, 0.85, 0.2]}>
        <boxGeometry args={[0.5, 0.1, 0.6]} />
        <meshStandardMaterial color="#1a1008" roughness={0.7} metalness={0.25} />
      </mesh>

      {/* ── HEAD ── */}
      <mesh castShadow position={[0, 0.62, 0.65]}>
        <boxGeometry args={[0.35, 0.3, 0.3]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>

      {/* Eyes — 8 eyes in cluster */}
      {[
        [-0.1, 0.75, 0.78], [0.1, 0.75, 0.78],      // top pair (large)
        [-0.06, 0.7, 0.8], [0.06, 0.7, 0.8],         // middle pair
        [-0.12, 0.68, 0.76], [0.12, 0.68, 0.76],     // outer pair
        [-0.04, 0.65, 0.82], [0.04, 0.65, 0.82],     // lower pair (small)
      ].map((pos, i) => (
        <mesh key={`sp-eye-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[i < 2 ? 0.045 : i < 4 ? 0.035 : 0.025, 6, 6]} />
          <primitive object={redEyeMat} attach="material" />
        </mesh>
      ))}

      {/* ── CHELICERAE (massive fangs) ── */}
      {/* Fang base (chelicera body) */}
      <mesh castShadow position={[-0.1, 0.5, 0.82]} rotation={[0.2, 0, 0.1]}>
        <boxGeometry args={[0.08, 0.12, 0.1]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.1, 0.5, 0.82]} rotation={[0.2, 0, -0.1]}>
        <boxGeometry args={[0.08, 0.12, 0.1]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      {/* Fang tips */}
      <mesh castShadow position={[-0.1, 0.38, 0.88]} rotation={[0.5, 0, 0.1]}>
        <coneGeometry args={[0.025, 0.25, 4]} />
        <primitive object={spiderFangMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.1, 0.38, 0.88]} rotation={[0.5, 0, -0.1]}>
        <coneGeometry args={[0.025, 0.25, 4]} />
        <primitive object={spiderFangMat} attach="material" />
      </mesh>

      {/* ── PEDIPALPS (small feeler arms) ── */}
      <mesh castShadow position={[-0.18, 0.55, 0.78]} rotation={[0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.02, 0.03, 0.2, 5]} />
        <primitive object={spiderLegMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.18, 0.55, 0.78]} rotation={[0.3, -0.3, -0.2]}>
        <cylinderGeometry args={[0.02, 0.03, 0.2, 5]} />
        <primitive object={spiderLegMat} attach="material" />
      </mesh>

      {/* ── 8 LEGS (proper spider legs — 3 segments each) ── */}
      {legs.map((leg, i) => {
        const s = leg.side;
        const ang = leg.angle;
        return (
          <group key={`sp-leg-${i}`} position={[s * 0.3, 0.55, leg.zOff]}>
            {/* Coxa (hip segment) */}
            <mesh castShadow position={[s * 0.15, 0.02, 0]} rotation={[0, 0, ang * 0.5]}>
              <cylinderGeometry args={[0.04, 0.05, 0.25, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Femur (upper leg) — angled up then out */}
            <mesh castShadow position={[s * 0.35, 0.15, 0]} rotation={[0, 0, ang]}>
              <cylinderGeometry args={[0.03, 0.045, leg.len1, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Joint (knee) */}
            <mesh castShadow position={[s * 0.6, 0.25, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Tibia (lower leg — angled down to ground) */}
            <mesh castShadow position={[s * 0.72, -0.05, 0]} rotation={[0, 0, ang * 0.3]}>
              <cylinderGeometry args={[0.02, 0.035, leg.len2, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Tarsus (foot) — pointed claw */}
            <mesh castShadow position={[s * 0.8, -0.4, 0.02]}>
              <coneGeometry args={[0.025, 0.1, 4]} />
              <primitive object={clawMat} attach="material" />
            </mesh>
            {/* Leg hair/spike */}
            <mesh position={[s * 0.5, 0.22, 0.04]}>
              <coneGeometry args={[0.01, 0.06, 3]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
          </group>
        );
      })}

      {/* ── Venom sac glow (under head) ── */}
      <mesh position={[0, 0.42, 0.7]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#44ff22" emissive="#33cc11" emissiveIntensity={2.0} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  3. BANSHEE GHOST — horrifying wailing spirit with torn shroud
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FloatingGhost({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── HEAD (larger, distorted) ── */}
      <mesh position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Skull ridges */}
      <mesh position={[0, 2.65, -0.05]}>
        <boxGeometry args={[0.3, 0.12, 0.35]} />
        <meshStandardMaterial color="#90b0d0" emissive="#4466aa" emissiveIntensity={0.4} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Eyes — large hollow voids with intense glow */}
      <mesh position={[-0.13, 2.42, 0.32]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#000015" emissive="#001133" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.13, 2.42, 0.32]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#000015" emissive="#001133" emissiveIntensity={1.5} />
      </mesh>
      {/* Eye glow cores */}
      <mesh position={[-0.13, 2.42, 0.37]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <primitive object={ghostEyeMat} attach="material" />
      </mesh>
      <mesh position={[0.13, 2.42, 0.37]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <primitive object={ghostEyeMat} attach="material" />
      </mesh>

      {/* Wailing mouth (stretched open, screaming) */}
      <mesh position={[0, 2.18, 0.3]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#000020" emissive="#001133" emissiveIntensity={1.2} />
      </mesh>
      {/* Mouth inner void */}
      <mesh position={[0, 2.18, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#000005" emissive="#000822" emissiveIntensity={0.5} />
      </mesh>

      {/* ── NECK ── */}
      <mesh position={[0, 2.05, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.2, 8]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>

      {/* ── UPPER BODY (broader shoulders) ── */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.5, 8]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Shoulder pads (torn shawl draping) */}
      <mesh position={[-0.3, 1.9, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.2, 0.15, 0.25]} />
        <meshStandardMaterial color="#90b8d8" emissive="#3355aa" emissiveIntensity={0.3} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.3, 1.9, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.2, 0.15, 0.25]} />
        <meshStandardMaterial color="#90b8d8" emissive="#3355aa" emissiveIntensity={0.3} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* ── ARMS (long, skeletal, reaching forward) ── */}
      {/* Left arm — upper */}
      <mesh position={[-0.5, 1.9, 0.15]} rotation={[0.2, 0, 0.7]}>
        <cylinderGeometry args={[0.04, 0.08, 0.6, 6]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Left arm — forearm (bony) */}
      <mesh position={[-0.85, 1.75, 0.3]} rotation={[0.4, 0, 1.0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.5, 6]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Left hand — skeletal clawed fingers */}
      <mesh position={[-1.05, 1.55, 0.45]}>
        <boxGeometry args={[0.08, 0.05, 0.06]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Finger claws left */}
      {[0, 0.03, -0.03].map((off, i) => (
        <mesh key={`lf-${i}`} position={[-1.1, 1.52, 0.48 + off]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.008, 0.08, 3]} />
          <meshStandardMaterial color="#b0d0e8" emissive="#4466aa" emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Right arm — upper */}
      <mesh position={[0.5, 1.9, 0.15]} rotation={[0.2, 0, -0.7]}>
        <cylinderGeometry args={[0.04, 0.08, 0.6, 6]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Right arm — forearm */}
      <mesh position={[0.85, 1.75, 0.3]} rotation={[0.4, 0, -1.0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.5, 6]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Right hand */}
      <mesh position={[1.05, 1.55, 0.45]}>
        <boxGeometry args={[0.08, 0.05, 0.06]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Finger claws right */}
      {[0, 0.03, -0.03].map((off, i) => (
        <mesh key={`rf-${i}`} position={[1.1, 1.52, 0.48 + off]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.008, 0.08, 3]} />
          <meshStandardMaterial color="#b0d0e8" emissive="#4466aa" emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ── FLOWING ROBE (multi-layered) ── */}
      {/* Main robe body */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.5, 1.0, 10]} />
        <primitive object={ghostMat} attach="material" />
      </mesh>
      {/* Inner robe layer */}
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.55, 0.8, 8]} />
        <meshStandardMaterial color="#8ab8e0" emissive="#3355aa" emissiveIntensity={0.3} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Tattered bottom edges */}
      {[0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((angle, i) => (
        <mesh key={`ghost-tatter-${i}`} position={[Math.sin(angle) * 0.45, 0.65, Math.cos(angle) * 0.45]} rotation={[0.4 * Math.cos(angle), angle, 0.2 * Math.sin(angle)]}>
          <boxGeometry args={[0.08, 0.4, 0.03]} />
          <meshStandardMaterial color="#90b8e0" emissive="#3355aa" emissiveIntensity={0.3} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── WISPY TAIL (dissolving into mist) ── */}
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.25, 0.7, 8]} />
        <meshStandardMaterial color="#8abbe8" emissive="#3355aa" emissiveIntensity={0.4} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.12, 0.4, 6]} />
        <meshStandardMaterial color="#8abbe8" emissive="#3355aa" emissiveIntensity={0.3} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* ── ECTOPLASM DRIPS (hanging from arms and body) ── */}
      {[-0.3, 0, 0.25, -0.6, 0.55].map((x, i) => (
        <mesh key={`ecto-${i}`} position={[x, 1.0 + i * 0.15, 0.1 + i * 0.03]}>
          <cylinderGeometry args={[0.01, 0.005, 0.15 + i * 0.04, 4]} />
          <meshStandardMaterial color="#88ccee" emissive="#4488cc" emissiveIntensity={1.0} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* ── GLOW AURA (larger and more intense) ── */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial color="#6688cc" emissive="#4466aa" emissiveIntensity={0.5} transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner bright core */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color="#88aadd" emissive="#5577bb" emissiveIntensity={0.8} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  4. SHADOW WRAITH — Grim Reaper with scythe and chains
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ShadowWraith({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── HOOD (deep, layered) ── */}
      <mesh castShadow position={[0, 2.4, -0.05]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Hood peak (pointed) */}
      <mesh castShadow position={[0, 2.7, -0.12]}>
        <coneGeometry args={[0.22, 0.35, 6]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Hood rim */}
      <mesh castShadow position={[0, 2.2, 0.15]}>
        <torusGeometry args={[0.25, 0.04, 6, 12, Math.PI]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>

      {/* Face void (pitch black) */}
      <mesh position={[0, 2.3, 0.28]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#030008" roughness={1.0} />
      </mesh>
      {/* Glowing eyes (intense purple) */}
      <mesh position={[-0.09, 2.35, 0.4]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <primitive object={wraithGlowMat} attach="material" />
      </mesh>
      <mesh position={[0.09, 2.35, 0.4]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <primitive object={wraithGlowMat} attach="material" />
      </mesh>
      {/* Eye trails (glowing streaks below eyes) */}
      <mesh position={[-0.09, 2.22, 0.38]}>
        <cylinderGeometry args={[0.01, 0.02, 0.15, 4]} />
        <meshStandardMaterial color="#8844cc" emissive="#aa55ff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.09, 2.22, 0.38]}>
        <cylinderGeometry args={[0.01, 0.02, 0.15, 4]} />
        <meshStandardMaterial color="#8844cc" emissive="#aa55ff" emissiveIntensity={1.5} transparent opacity={0.5} />
      </mesh>

      {/* ── SHOULDERS (broad, armored shoulders) ── */}
      <mesh castShadow position={[0, 1.95, 0]}>
        <boxGeometry args={[0.95, 0.3, 0.4]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Shoulder spikes */}
      <mesh castShadow position={[-0.45, 2.15, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.45, 2.15, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>

      {/* ── EXPOSED RIBCAGE (visible under open cloak) ── */}
      {[-0.08, 0, 0.08].map((z, i) => (
        <group key={`rib-${i}`}>
          <mesh position={[-0.12, 1.55 + i * 0.12, z + 0.1]}>
            <boxGeometry args={[0.03, 0.06, 0.04]} />
            <meshStandardMaterial color="#4a3850" emissive="#2a1540" emissiveIntensity={0.4} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.12, 1.55 + i * 0.12, z + 0.1]}>
            <boxGeometry args={[0.03, 0.06, 0.04]} />
            <meshStandardMaterial color="#4a3850" emissive="#2a1540" emissiveIntensity={0.4} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── BODY CLOAK (layered) ── */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.32, 0.5, 0.9, 10]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>

      {/* ── LOWER CLOAK (flowing, massive) ── */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <coneGeometry args={[0.65, 1.5, 10]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Tattered hem strips (many, varied) */}
      {[0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6].map((angle, i) => (
        <mesh key={`wt-${i}`} position={[Math.sin(angle) * 0.5, 0.1 + (i % 3) * 0.08, Math.cos(angle) * 0.5]} rotation={[0.3 * Math.cos(angle), 0, 0.2 * Math.sin(angle)]}>
          <boxGeometry args={[0.1, 0.3 + (i % 2) * 0.15, 0.02]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
      ))}

      {/* ── LEFT ARM (holding scythe) ── */}
      <mesh castShadow position={[-0.55, 1.9, 0.15]} rotation={[0.2, 0, 0.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      <mesh castShadow position={[-0.78, 1.7, 0.3]} rotation={[0.4, 0, 0.3]}>
        <cylinderGeometry args={[0.025, 0.04, 0.45, 6]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Skeletal hand */}
      <mesh position={[-0.9, 1.5, 0.42]}>
        <boxGeometry args={[0.1, 0.06, 0.08]} />
        <meshStandardMaterial color="#3a2a45" emissive="#2a1540" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Bony fingers */}
      {[-0.03, 0, 0.03].map((off, i) => (
        <mesh key={`wlf-${i}`} position={[-0.93, 1.47, 0.45 + off]}>
          <cylinderGeometry args={[0.006, 0.008, 0.08, 3]} />
          <meshStandardMaterial color="#5a4a6a" emissive="#2a1540" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── SCYTHE (held in left hand area) ── */}
      {/* Shaft */}
      <mesh castShadow position={[-0.95, 1.8, 0.3]} rotation={[0.1, 0, 0.15]}>
        <cylinderGeometry args={[0.025, 0.03, 2.5, 6]} />
        <meshStandardMaterial color="#2a2020" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Blade (curved — made from a ring slice) */}
      <mesh castShadow position={[-0.9, 3.0, 0.5]} rotation={[0.8, 0.3, 0.2]}>
        <torusGeometry args={[0.4, 0.015, 4, 12, Math.PI * 0.6]} />
        <meshStandardMaterial color="#556677" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Blade fill (flat) */}
      <mesh castShadow position={[-0.75, 2.85, 0.65]} rotation={[0.6, 0.2, 0.1]}>
        <boxGeometry args={[0.35, 0.01, 0.25]} />
        <meshStandardMaterial color="#445566" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ── RIGHT ARM (reaching forward) ── */}
      <mesh castShadow position={[0.55, 1.9, 0.2]} rotation={[0.3, 0, -0.5]}>
        <cylinderGeometry args={[0.04, 0.06, 0.5, 6]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.78, 1.7, 0.4]} rotation={[0.5, 0, -0.3]}>
        <cylinderGeometry args={[0.025, 0.04, 0.45, 6]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Right hand */}
      <mesh position={[0.9, 1.5, 0.55]}>
        <boxGeometry args={[0.1, 0.06, 0.08]} />
        <meshStandardMaterial color="#3a2a45" emissive="#2a1540" emissiveIntensity={0.4} transparent opacity={0.7} />
      </mesh>
      {/* Fingers reaching */}
      {[-0.03, 0, 0.03].map((off, i) => (
        <mesh key={`wrf-${i}`} position={[0.93, 1.47, 0.58 + off]}>
          <cylinderGeometry args={[0.006, 0.008, 0.1, 3]} />
          <meshStandardMaterial color="#5a4a6a" emissive="#2a1540" emissiveIntensity={0.3} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── CHAIN (dangling from waist) ── */}
      {[0, 0.12, 0.24, 0.36, 0.48].map((off, i) => (
        <mesh key={`chain-${i}`} position={[0.2, 1.1 - off, 0.35 + Math.sin(off * 5) * 0.05]}>
          <torusGeometry args={[0.03, 0.008, 4, 8]} />
          <meshStandardMaterial color="#3a3540" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ── SOUL ORB (floating near chest) ── */}
      <mesh position={[0, 1.65, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#bb66ff" emissive="#9933ff" emissiveIntensity={3.0} transparent opacity={0.7} />
      </mesh>
      {/* Soul orb outer glow */}
      <mesh position={[0, 1.65, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#8844cc" emissive="#7733bb" emissiveIntensity={1.0} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* ── DARK AURA (larger) ── */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.1, 12, 12]} />
        <meshStandardMaterial color="#1a0030" emissive="#220044" emissiveIntensity={0.4} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  5. SKULL SPECTER — floating skull with ethereal trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SkullSpecter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* ── SKULL ── */}
      {/* Cranium */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <primitive object={skullMat} attach="material" />
      </mesh>
      {/* Forehead ridge */}
      <mesh castShadow position={[0, 2.15, 0.15]}>
        <boxGeometry args={[0.35, 0.1, 0.2]} />
        <primitive object={skullMat} attach="material" />
      </mesh>
      {/* Face plate */}
      <mesh castShadow position={[0, 1.9, 0.2]}>
        <boxGeometry args={[0.28, 0.25, 0.15]} />
        <primitive object={skullMat} attach="material" />
      </mesh>

      {/* Eye sockets */}
      <mesh position={[-0.08, 1.95, 0.28]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#050505" roughness={1.0} />
      </mesh>
      <mesh position={[0.08, 1.95, 0.28]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#050505" roughness={1.0} />
      </mesh>
      {/* Eye glows */}
      <mesh position={[-0.08, 1.95, 0.3]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <primitive object={skullGlowMat} attach="material" />
      </mesh>
      <mesh position={[0.08, 1.95, 0.3]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <primitive object={skullGlowMat} attach="material" />
      </mesh>

      {/* Nasal cavity */}
      <mesh position={[0, 1.85, 0.28]}>
        <boxGeometry args={[0.06, 0.08, 0.04]} />
        <meshStandardMaterial color="#1a1510" roughness={1.0} />
      </mesh>

      {/* Jaw (slightly separated from skull) */}
      <mesh castShadow position={[0, 1.72, 0.15]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.24, 0.1, 0.18]} />
        <primitive object={skullMat} attach="material" />
      </mesh>
      {/* Teeth row */}
      {[-0.08, -0.03, 0.03, 0.08].map((x, i) => (
        <mesh key={`skull-tooth-${i}`} position={[x, 1.78, 0.26]}>
          <boxGeometry args={[0.03, 0.05, 0.02]} />
          <primitive object={skullMat} attach="material" />
        </mesh>
      ))}

      {/* ── ETHEREAL TRAIL (flowing downward) ── */}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <primitive object={skullTrailMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.15, 0.6, 6]} />
        <meshStandardMaterial
          color="#11aa44"
          emissive="#0d9933"
          emissiveIntensity={0.6}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wispy tendrils */}
      {[0, 1.5, 3.0, 4.5].map((angle, i) => (
        <mesh key={`tendril-${i}`} position={[Math.sin(angle) * 0.15, 1.1 - i * 0.15, Math.cos(angle) * 0.15]}>
          <cylinderGeometry args={[0.02, 0.01, 0.3, 4]} />
          <primitive object={skullTrailMat} attach="material" />
        </mesh>
      ))}

      {/* ── GLOW AURA ── */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.6, 10, 10]} />
        <meshStandardMaterial
          color="#22cc55"
          emissive="#11aa33"
          emissiveIntensity={0.5}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  NAMED EXPORTS — used by EnemySystem for dynamic spawning
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { Hellhound, ShadowSpider, FloatingGhost, ShadowWraith, SkullSpecter };
