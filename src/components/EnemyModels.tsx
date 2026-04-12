"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  color: "#0a0c14",
  emissive: "#0d1530",
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.88,
  roughness: 0.95,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const ghostInnerMat = new THREE.MeshStandardMaterial({
  color: "#151828",
  emissive: "#1a2a70",
  emissiveIntensity: 0.9,
  transparent: true,
  opacity: 0.5,
  roughness: 0.9,
  side: THREE.DoubleSide,
});
const ghostEyeMat = new THREE.MeshStandardMaterial({
  color: "#000000",
  roughness: 1.0,
});
const ghostEyeGlowMat = new THREE.MeshStandardMaterial({
  color: "#c0dfff",
  emissive: "#88aaff",
  emissiveIntensity: 6.0,
  transparent: true,
  opacity: 0.92,
});
const ghostMouthMat = new THREE.MeshStandardMaterial({
  color: "#000000",
  roughness: 1.0,
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
  const groupRef = useRef<THREE.Group>(null!);
  const chestRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  
  // Leg refs for walk cycle
  const flLeg = useRef<THREE.Group>(null!);
  const frLeg = useRef<THREE.Group>(null!);
  const blLeg = useRef<THREE.Group>(null!);
  const brLeg = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Aggressive breathing in chest
    if (chestRef.current) {
      chestRef.current.scale.x = 1 + Math.sin(t * 6) * 0.03;
      chestRef.current.scale.y = 1 + Math.sin(t * 6) * 0.04;
    }
    
    // Low head bobbing and twitching
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 4) * 0.1;
      headRef.current.rotation.y = Math.cos(t * 2.5) * 0.05; // slight snarl twist
    }

    // Creeping / prowling walk cycle
    const walkSpeed = 6;
    const stride = 0.5;
    
    // Diagonal pairs move together
    if (flLeg.current) flLeg.current.rotation.x = Math.sin(t * walkSpeed) * stride;
    if (brLeg.current) brLeg.current.rotation.x = Math.sin(t * walkSpeed) * stride;
    
    // The other pair moves opposite
    if (frLeg.current) frLeg.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * stride;
    if (blLeg.current) blLeg.current.rotation.x = Math.sin(t * walkSpeed + Math.PI) * stride;

    // Heavy body bobbing synchronized with the footsteps
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * walkSpeed)) * 0.12;
    }
  });

  return (
    // Scaled up to 1.4 to make it MASSIVE and dangerous
    <group ref={groupRef} position={position} scale={[1.4, 1.4, 1.4]}>
      
      {/* ── BODY (Sharp, Angular Torso) ── */}
      <group ref={chestRef} position={[0, 0.9, 0.3]}>
        {/* Massive Chest / Ribcage */}
        <mesh castShadow rotation={[-0.1, 0, 0]}>
          <boxGeometry args={[0.5, 0.55, 0.8]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        
        {/* Giant Jagged Spine Spikes */}
        {[-0.3, -0.1, 0.1, 0.3].map((z, i) => (
          <mesh key={`spine-${i}`} castShadow position={[0, 0.35, z]} rotation={[0.2, 0, 0]}>
            <coneGeometry args={[0.08, 0.35, 4]} />
            <primitive object={clawMat} attach="material" />
          </mesh>
        ))}
      </group>
      
      {/* Thin, gaunt hips (creates a muscular greyhound/wolf profile) */}
      <mesh castShadow position={[0, 0.8, -0.4]}>
        <boxGeometry args={[0.35, 0.4, 0.6]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>

      {/* ── NECK & HEAD ── */}
      <group position={[0, 0.9, 0.7]}>
        {/* Thick, powerful angled neck */}
        <mesh castShadow position={[0, 0.1, 0.2]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.3, 0.35, 0.4]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>

        <group ref={headRef} position={[0, 0.25, 0.45]}>
          {/* Angular Skull */}
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.35, 0.35, 0.4]} />
            <primitive object={darkFurMat} attach="material" />
          </mesh>
          {/* Long prominent snout */}
          <mesh castShadow position={[0, -0.05, 0.35]}>
            <boxGeometry args={[0.25, 0.2, 0.4]} />
            <primitive object={darkFurMat} attach="material" />
          </mesh>
          {/* Lower Jaw (hanging open aggressively) */}
          <mesh castShadow position={[0, -0.18, 0.3]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.22, 0.1, 0.35]} />
            <primitive object={darkFurMat} attach="material" />
          </mesh>
          
          {/* Giant Sharp Fangs Overhanging from Upper Jaw */}
          {[-0.1, 0.1].map((x, i) => (
            <mesh key={`fang1-${i}`} position={[x, -0.18, 0.48]} rotation={[-0.1, 0, 0]}>
              <coneGeometry args={[0.03, 0.22, 4]} />
              <meshStandardMaterial color="#e8d8c0" roughness={0.4} />
            </mesh>
          ))}
          {/* Large Lower Tusks sticking up */}
          {[-0.1, 0.1].map((x, i) => (
            <mesh key={`fang2-${i}`} position={[x, -0.1, 0.42]} rotation={[0.1, 0, 0]}>
              <coneGeometry args={[0.02, 0.15, 4]} />
              <meshStandardMaterial color="#e8d8c0" roughness={0.4} />
            </mesh>
          ))}

          {/* Glowing Red Demonic Eyes (angled slightly) */}
          <mesh position={[-0.15, 0.1, 0.2]} rotation={[0, -0.1, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.05]} />
            <primitive object={redEyeMat} attach="material" />
          </mesh>
          <mesh position={[0.15, 0.1, 0.2]} rotation={[0, 0.1, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.05]} />
            <primitive object={redEyeMat} attach="material" />
          </mesh>

          {/* Sharp Horn-like Ears */}
          <mesh castShadow position={[-0.15, 0.3, -0.1]} rotation={[-0.4, 0, 0.3]}>
            <coneGeometry args={[0.06, 0.35, 4]} />
            <primitive object={darkFurMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0.15, 0.3, -0.1]} rotation={[-0.4, 0, -0.3]}>
            <coneGeometry args={[0.06, 0.35, 4]} />
            <primitive object={darkFurMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ── DEMONIC TAIL (Straight and aggressive) ── */}
      <mesh castShadow position={[0, 0.9, -0.8]} rotation={[0.4, 0, 0]}>
        <coneGeometry args={[0.05, 0.7, 4]} />
        <primitive object={darkFurMat} attach="material" />
      </mesh>

      {/* ── 4 ARTICULATED LEGS (Proper walk animation) ── */}

      {/* Front Left */}
      <group position={[-0.22, 0.8, 0.4]} ref={flLeg}>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.6, 0.15]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.16, 0.15, 0.2]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
      </group>

      {/* Front Right */}
      <group position={[0.22, 0.8, 0.4]} ref={frLeg}>
        <mesh castShadow position={[0, -0.3, 0]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.12, 0.6, 0.15]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0.05]}>
          <boxGeometry args={[0.16, 0.15, 0.2]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
      </group>

      {/* Back Left */}
      <group position={[-0.18, 0.8, -0.55]} ref={blLeg}>
        <mesh castShadow position={[0, -0.3, -0.1]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.14, 0.65, 0.16]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0]}>
          <boxGeometry args={[0.16, 0.15, 0.2]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
      </group>

      {/* Back Right */}
      <group position={[0.18, 0.8, -0.55]} ref={brLeg}>
        <mesh castShadow position={[0, -0.3, -0.1]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.14, 0.65, 0.16]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.65, 0]}>
          <boxGeometry args={[0.16, 0.15, 0.2]} />
          <primitive object={darkFurMat} attach="material" />
        </mesh>
      </group>

    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  2. SHADOW SPIDER — massive 8-legged arachnid with armored body
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ShadowSpider({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<THREE.Group>(null!);
  const abdomenRef = useRef<THREE.Group>(null!);
  const fangsLeftRef = useRef<THREE.Group>(null!);
  const fangsRightRef = useRef<THREE.Group>(null!);
  const pedipalpLeftRef = useRef<THREE.Group>(null!);
  const pedipalpRightRef = useRef<THREE.Group>(null!);
  
  // Refs for 8 legs
  const legRefs = useRef<(THREE.Group | null)[]>([]);

  const rT = useMemo(() => Math.random() * 100, []);

  // 8 legs configuration
  const legConfigs = useMemo(() => [
    { side: -1, zOff: 0.45, angle: 0.5, len1: 0.7, len2: 0.65 },
    { side: -1, zOff: 0.15, angle: 0.7, len1: 0.8, len2: 0.75 },
    { side: -1, zOff: -0.15, angle: 0.8, len1: 0.85, len2: 0.8 },
    { side: -1, zOff: -0.45, angle: 0.6, len1: 0.7, len2: 0.65 },
    { side: 1, zOff: 0.45, angle: -0.5, len1: 0.7, len2: 0.65 },
    { side: 1, zOff: 0.15, angle: -0.7, len1: 0.8, len2: 0.75 },
    { side: 1, zOff: -0.15, angle: -0.8, len1: 0.85, len2: 0.8 },
    { side: 1, zOff: -0.45, angle: -0.6, len1: 0.7, len2: 0.65 },
  ], []);

  useFrame((state) => {
    const t = state.clock.elapsedTime + rT;
    
    // Body bob and breathing
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 8) * 0.04;
      bodyRef.current.rotation.x = Math.sin(t * 4) * 0.02;
      bodyRef.current.rotation.z = Math.cos(t * 3) * 0.01;
    }

    if (abdomenRef.current) {
      const pulse = 1 + Math.sin(t * 5) * 0.03 + Math.sin(t * 12) * 0.01;
      abdomenRef.current.scale.set(pulse, pulse, pulse);
    }

    // Fangs twitching aggressively
    if (fangsLeftRef.current && fangsRightRef.current) {
      const twitch = Math.max(0, Math.sin(t * 15)) * 0.3;
      fangsLeftRef.current.rotation.z = twitch;
      fangsRightRef.current.rotation.z = -twitch;
    }

    // Pedipalps feeling around
    if (pedipalpLeftRef.current && pedipalpRightRef.current) {
      pedipalpLeftRef.current.rotation.x = 0.2 + Math.sin(t * 6) * 0.2;
      pedipalpRightRef.current.rotation.x = 0.2 + Math.cos(t * 5) * 0.2;
    }

    // Alternating leg stepping (Skittering)
    legRefs.current.forEach((leg, i) => {
      if (!leg) return;
      // 0,2,5,7 move together; 1,3,4,6 move together
      const isGroupA = (i === 0 || i === 2 || i === 5 || i === 7);
      const phaseOffset = isGroupA ? 0 : Math.PI;
      const legT = t * 12 + phaseOffset;
      
      const step = Math.sin(legT);
      const lift = Math.max(0, Math.cos(legT));
      
      // Swing front/back
      leg.rotation.y = step * 0.2;
      // Lift up
      leg.rotation.z = lift * -0.3;
    });
  });

  return (
    <group position={position} ref={bodyRef}>
      {/* ── ABDOMEN ── */}
      <group ref={abdomenRef} position={[0, 0.7, -0.65]}>
        <mesh castShadow>
          <sphereGeometry args={[0.7, 16, 16]} />
          <primitive object={spiderBodyMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.4, 10, 10]} />
          <meshStandardMaterial color="#1a1008" roughness={0.75} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.65, 0.4]}>
          <boxGeometry args={[0.12, 0.25, 0.04]} />
          <meshStandardMaterial color="#cc1111" emissive="#ff0000" emissiveIntensity={2.0} />
        </mesh>
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={`abd-spike-${i}`} castShadow position={[x, 0.5, -0.5]} rotation={[-0.4, 0, x * 0.5]}>
            <coneGeometry args={[0.06, 0.3, 4]} />
            <primitive object={clawMat} attach="material" />
          </mesh>
        ))}
        <mesh castShadow position={[0, -0.3, -0.6]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.04, 0.3, 6]} />
          <primitive object={spiderBodyMat} attach="material" />
        </mesh>
      </group>

      {/* ── CEPHALOTHORAX ── */}
      <mesh castShadow position={[0, 0.6, 0.2]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0.2]}>
        <boxGeometry args={[0.5, 0.15, 0.6]} />
        <meshStandardMaterial color="#2d1a10" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* ── HEAD & EYES ── */}
      <mesh castShadow position={[0, 0.62, 0.65]}>
        <boxGeometry args={[0.4, 0.35, 0.35]} />
        <primitive object={spiderBodyMat} attach="material" />
      </mesh>
      {[
        [-0.12, 0.78, 0.78], [0.12, 0.78, 0.78],
        [-0.06, 0.72, 0.82], [0.06, 0.72, 0.82],
        [-0.15, 0.68, 0.76], [0.15, 0.68, 0.76],
        [-0.04, 0.64, 0.84], [0.04, 0.64, 0.84],
      ].map((pos, i) => (
        <mesh key={`sp-eye-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[i < 2 ? 0.05 : i < 4 ? 0.04 : 0.03, 8, 8]} />
          <primitive object={redEyeMat} attach="material" />
        </mesh>
      ))}

      {/* ── FANGS (CHELICERAE) ── */}
      <group ref={fangsLeftRef} position={[-0.12, 0.5, 0.82]} rotation={[0.2, 0, 0.1]}>
        <mesh castShadow position={[0, -0.06, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.12]} />
          <primitive object={spiderBodyMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.2, 0.04]} rotation={[0.5, 0, -0.1]}>
          <coneGeometry args={[0.03, 0.3, 4]} />
          <primitive object={spiderFangMat} attach="material" />
        </mesh>
      </group>
      <group ref={fangsRightRef} position={[0.12, 0.5, 0.82]} rotation={[0.2, 0, -0.1]}>
        <mesh castShadow position={[0, -0.06, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.12]} />
          <primitive object={spiderBodyMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.2, 0.04]} rotation={[0.5, 0, 0.1]}>
          <coneGeometry args={[0.03, 0.3, 4]} />
          <primitive object={spiderFangMat} attach="material" />
        </mesh>
      </group>

      {/* ── PEDIPALPS ── */}
      <group ref={pedipalpLeftRef} position={[-0.22, 0.55, 0.78]} rotation={[0.3, 0.4, 0.2]}>
        <mesh castShadow position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.3, 6]} />
          <primitive object={spiderLegMat} attach="material" />
        </mesh>
      </group>
      <group ref={pedipalpRightRef} position={[0.22, 0.55, 0.78]} rotation={[0.3, -0.4, -0.2]}>
        <mesh castShadow position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.3, 6]} />
          <primitive object={spiderLegMat} attach="material" />
        </mesh>
      </group>

      {/* ── LEGS ── */}
      {legConfigs.map((leg, i) => {
        const s = leg.side;
        const ang = leg.angle;
        return (
          <group 
            key={`sp-leg-${i}`} 
            position={[s * 0.3, 0.55, leg.zOff]} 
            ref={(el) => { legRefs.current[i] = el; }}
          >
            {/* Coxa */}
            <mesh castShadow position={[s * 0.15, 0.02, 0]} rotation={[0, 0, ang * 0.5]}>
              <cylinderGeometry args={[0.05, 0.06, 0.3, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Femur */}
            <mesh castShadow position={[s * 0.35, 0.15, 0]} rotation={[0, 0, ang]}>
              <cylinderGeometry args={[0.035, 0.055, leg.len1, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Knee joint */}
            <mesh castShadow position={[s * 0.6, 0.25, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Tibia */}
            <mesh castShadow position={[s * 0.72, -0.05, 0]} rotation={[0, 0, ang * 0.3]}>
              <cylinderGeometry args={[0.025, 0.04, leg.len2, 6]} />
              <primitive object={spiderLegMat} attach="material" />
            </mesh>
            {/* Tarsus Foot */}
            <mesh castShadow position={[s * 0.82, -0.45, 0.02]}>
              <coneGeometry args={[0.03, 0.15, 4]} />
              <primitive object={clawMat} attach="material" />
            </mesh>
            {/* Thorny spines */}
            {[0.2, 0.4, 0.6].map((spineOffset, j) => (
              <mesh key={`spine-${i}-${j}`} position={[s * (0.35 + spineOffset * 0.4), 0.15 - spineOffset * 0.2, 0.04]} rotation={[s * 0.5, 0, 0]}>
                <coneGeometry args={[0.015, 0.08, 4]} />
                <primitive object={clawMat} attach="material" />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Venom sac glow */}
      <mesh position={[0, 0.38, 0.7]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#44ff22" emissive="#44ff11" emissiveIntensity={2.5} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  3. BANSHEE GHOST — Clean, elegant low-poly flowing spirit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FloatingGhost({ position }: { position: [number, number, number] }) {
  const ghostRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ghostRef.current) {
      ghostRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.18;
      ghostRef.current.rotation.z = Math.sin(t * 1.1) * 0.06;
      ghostRef.current.rotation.y = Math.sin(t * 0.65) * 0.14;
    }
    // Disturbing erratic head tilt
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 3.6) * 0.14 + Math.sin(t * 7.3) * 0.05;
      headRef.current.rotation.x = Math.cos(t * 2.9) * 0.09;
    }
  });

  return (
    <group ref={ghostRef} position={position}>
      <group position={[0, 1.6, 0]}>

        {/* ── COLD INNER LIGHT ── */}
        <pointLight position={[0, 0.5, 0]} color="#6688cc" intensity={2.2} distance={4} decay={2} />

        {/* ── FLOWING HAIR TENDRILS (long, sinuous, drifting upward) ── */}
        <mesh position={[0, 1.55, -0.08]} rotation={[0.12, 0, 0]}>
          <coneGeometry args={[0.038, 0.95, 5, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[-0.2, 1.45, -0.05]} rotation={[0.08, 0, 0.28]}>
          <coneGeometry args={[0.03, 0.78, 5, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[0.2, 1.45, -0.05]} rotation={[0.08, 0, -0.28]}>
          <coneGeometry args={[0.03, 0.78, 5, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[-0.38, 1.3, 0]} rotation={[0.04, 0, 0.52]}>
          <coneGeometry args={[0.022, 0.62, 4, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[0.38, 1.3, 0]} rotation={[0.04, 0, -0.52]}>
          <coneGeometry args={[0.022, 0.62, 4, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[-0.54, 1.14, 0.04]} rotation={[0, 0, 0.75]}>
          <coneGeometry args={[0.016, 0.5, 4, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        <mesh position={[0.54, 1.14, 0.04]} rotation={[0, 0, -0.75]}>
          <coneGeometry args={[0.016, 0.5, 4, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>

        {/* ── HEAD — tall elongated skull, leaning forward ── */}
        <group ref={headRef} position={[0, 0.82, 0.05]} rotation={[0.14, 0, 0]}>
          {/* Skull — elongated vertically */}
          <mesh scale={[1, 1.28, 0.88]}>
            <sphereGeometry args={[0.42, 14, 12]} />
            <primitive object={ghostMat} attach="material" />
          </mesh>

          {/* ── DEEP EYE SOCKETS — large, dominating the face ── */}
          {/* Left void */}
          <mesh position={[-0.155, 0.1, 0.36]}>
            <circleGeometry args={[0.12, 10]} />
            <primitive object={ghostEyeMat} attach="material" />
          </mesh>
          {/* Left glow flicker from within */}
          <mesh position={[-0.155, 0.1, 0.34]} scale={[0.7, 1, 1]}>
            <ringGeometry args={[0.07, 0.12, 10]} />
            <primitive object={ghostEyeGlowMat} attach="material" />
          </mesh>
          {/* Right void */}
          <mesh position={[0.155, 0.1, 0.36]}>
            <circleGeometry args={[0.12, 10]} />
            <primitive object={ghostEyeMat} attach="material" />
          </mesh>
          {/* Right glow flicker */}
          <mesh position={[0.155, 0.1, 0.34]} scale={[0.7, 1, 1]}>
            <ringGeometry args={[0.07, 0.12, 10]} />
            <primitive object={ghostEyeGlowMat} attach="material" />
          </mesh>

          {/* ── UNHINGED JAW — wide screaming mouth ── */}
          {/* Drooping lower jaw */}
          <mesh position={[0, -0.28, 0.28]} rotation={[0.32, 0, 0]} scale={[0.92, 0.8, 0.65]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <primitive object={ghostMat} attach="material" />
          </mesh>
          {/* Mouth void — wide dark opening */}
          <mesh position={[0, -0.14, 0.38]} scale={[1, 0.52, 1]}>
            <circleGeometry args={[0.155, 12]} />
            <primitive object={ghostMouthMat} attach="material" />
          </mesh>
          {/* Cold light spilling from inside the maw */}
          <mesh position={[0, -0.14, 0.36]} scale={[1, 0.52, 1]}>
            <ringGeometry args={[0.12, 0.165, 12]} />
            <primitive object={ghostEyeGlowMat} attach="material" />
          </mesh>
          {/* Upper jagged teeth */}
          {[-0.09, -0.03, 0.03, 0.09].map((x, i) => (
            <mesh key={`ut-${i}`} position={[x, -0.075, 0.4]}>
              <coneGeometry args={[0.016, 0.06, 4]} />
              <meshStandardMaterial color="#b8c8d8" roughness={0.5} />
            </mesh>
          ))}
          {/* Lower teeth pointing up */}
          {[-0.065, 0.0, 0.065].map((x, i) => (
            <mesh key={`lt-${i}`} position={[x, -0.21, 0.39]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.013, 0.048, 4]} />
              <meshStandardMaterial color="#a8b8c8" roughness={0.5} />
            </mesh>
          ))}
        </group>

        {/* ── DARK SHROUD BODY ── */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.3, 0.92, 1.52, 12, 2, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* inner depth */}
        <mesh position={[0, 0.1, 0]} scale={[0.84, 1, 0.84]}>
          <cylinderGeometry args={[0.26, 0.76, 1.44, 10, 1, true]} />
          <primitive object={ghostInnerMat} attach="material" />
        </mesh>

        {/* ── LONG SKELETAL REACHING ARMS ── */}
        {/* Left upper arm */}
        <mesh position={[-0.55, 0.22, 0.12]} rotation={[0.12, 0, 0.7]}>
          <cylinderGeometry args={[0.035, 0.075, 0.62, 6]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* Left forearm (angled further out) */}
        <mesh position={[-0.88, 0.0, 0.18]} rotation={[0.2, 0, 0.95]}>
          <cylinderGeometry args={[0.022, 0.038, 0.48, 5]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* Left claw fingers */}
        {[[-1.1, -0.12, 0.22], [-1.14, -0.04, 0.14], [-1.06, -0.2, 0.12]].map(([x, y, z], i) => (
          <mesh key={`lf-${i}`} position={[x, y, z]} rotation={[0.1, 0, 0.9 + i * 0.1]}>
            <coneGeometry args={[0.012, 0.16, 4]} />
            <primitive object={ghostMat} attach="material" />
          </mesh>
        ))}
        {/* Right upper arm */}
        <mesh position={[0.55, 0.22, 0.12]} rotation={[0.12, 0, -0.7]}>
          <cylinderGeometry args={[0.035, 0.075, 0.62, 6]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* Right forearm */}
        <mesh position={[0.88, 0.0, 0.18]} rotation={[0.2, 0, -0.95]}>
          <cylinderGeometry args={[0.022, 0.038, 0.48, 5]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* Right claw fingers */}
        {[[1.1, -0.12, 0.22], [1.14, -0.04, 0.14], [1.06, -0.2, 0.12]].map(([x, y, z], i) => (
          <mesh key={`rf-${i}`} position={[x, y, z]} rotation={[0.1, 0, -0.9 - i * 0.1]}>
            <coneGeometry args={[0.012, 0.16, 4]} />
            <primitive object={ghostMat} attach="material" />
          </mesh>
        ))}

        {/* ── TATTERED SHROUD BOTTOM — jagged uneven drips ── */}
        <mesh position={[0, -1.06, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.9, 0.52, 12, 1, true]} />
          <primitive object={ghostMat} attach="material" />
        </mesh>
        {/* Irregular tatter drips of varying length */}
        {[
          [0,     -1.38, 0.1,  0,     0    ],
          [-0.26, -1.34, 0.06, 0,     0.14 ],
          [0.26,  -1.34, 0.06, 0,    -0.14 ],
          [-0.5,  -1.25, 0.02, 0,     0.28 ],
          [0.5,   -1.25, 0.02, 0,    -0.28 ],
          [-0.72, -1.14, 0,    0,     0.44 ],
          [0.72,  -1.14, 0,    0,    -0.44 ],
        ].map(([x, y, z, rx, rz], i) => (
          <mesh key={`t-${i}`} position={[x, y, z]} rotation={[Math.PI + rx, 0, rz]}>
            <coneGeometry args={[0.055 + (i % 3) * 0.012, 0.28 + (i % 4) * 0.1, 5, 1, true]} />
            <primitive object={ghostMat} attach="material" />
          </mesh>
        ))}

      </group>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  4. SHADOW WRAITH — Grim Reaper with scythe and chains
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ShadowWraith({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<THREE.Group>(null!);
  const chestRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const scytheRef = useRef<THREE.Group>(null!);
  const orbRef = useRef<THREE.Mesh>(null!);
  const orbGlowRef = useRef<THREE.Mesh>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  
  const cloakRefs = useRef<(THREE.Mesh | null)[]>([]);
  const chainRefs = useRef<(THREE.Mesh | null)[]>([]);

  const rT = useMemo(() => Math.random() * 100, []);

  // Complex Extruded Scythe Blade
  const scytheShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0.5, 0.8, 1.2, 1.6, 1.5); // Outer menacing curve
    shape.bezierCurveTo(0.7, 0.8, 0.2, 0.2, -0.1, -0.3); // Inner sharp edge returning
    shape.lineTo(0, 0);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.015,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.005,
    bevelThickness: 0.005,
  }), []);

  // Undulating Tube Cloak Paths (Slim wisps)
  const cloakPaths = useMemo(() => {
    const paths: THREE.CatmullRomCurve3[] = [];
    const numWisps = 15;
    for (let i = 0; i < numWisps; i++) {
      const angle = (i / numWisps) * Math.PI * 2;
      const points = [];
      for (let j = 0; j <= 4; j++) {
        const h = 1.0 - j * 0.45; // Height drop
        const r = 0.15 + j * 0.25; // Flaring outward
        const twist = j * 0.6;     // Noticeable twisting vortex effect
        points.push(new THREE.Vector3(
          Math.cos(angle + twist) * r,
          h,
          Math.sin(angle + twist) * r
        ));
      }
      paths.push(new THREE.CatmullRomCurve3(points));
    }
    return paths;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime + rT;

    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 1.5) * 0.15;
      bodyRef.current.rotation.x = Math.sin(t * 1.2) * 0.05;
      bodyRef.current.rotation.z = Math.cos(t * 0.8) * 0.03;
    }

    if (chestRef.current) {
      const breath = 1 + Math.sin(t * 2) * 0.03;
      chestRef.current.scale.set(breath, breath, breath);
    }

    if (leftArmRef.current && rightArmRef.current && scytheRef.current) {
      leftArmRef.current.rotation.x = 0.2 + Math.sin(t * 1.5) * 0.1;
      leftArmRef.current.rotation.z = 0.5 + Math.cos(t * 2) * 0.05;
      
      rightArmRef.current.rotation.x = 0.3 + Math.sin(t * 1.5 + Math.PI) * 0.1;
      
      scytheRef.current.rotation.x = 0.1 + Math.sin(t * 1.5) * 0.15;
      scytheRef.current.rotation.z = 0.15 + Math.cos(t * 1.5) * 0.05;
    }

    if (orbRef.current && orbGlowRef.current) {
      const pulse = 1 + Math.sin(t * 6) * 0.15;
      orbRef.current.scale.set(pulse, pulse, pulse);
      orbGlowRef.current.scale.set(pulse, pulse, pulse);
      
      orbRef.current.position.y = 1.65 + Math.sin(t * 3) * 0.05;
      orbGlowRef.current.position.y = 1.65 + Math.sin(t * 3) * 0.05;
    }

    if (auraRef.current) {
      const aScale = 1 + Math.sin(t * 0.5) * 0.05;
      auraRef.current.scale.set(aScale, aScale, aScale);
      auraRef.current.rotation.y += 0.01;
    }

    // Tube Cloak Waving
    cloakRefs.current.forEach((cloak, i) => {
      if (!cloak) return;
      cloak.rotation.y = Math.sin(t * 2 + i) * 0.1;
      cloak.rotation.z = Math.cos(t * 1.5 + i) * 0.05;
    });

    // Chains dangling
    chainRefs.current.forEach((chain, i) => {
      if (!chain) return;
      chain.rotation.x = Math.sin(t * 2 + i * 0.5) * 0.2;
      chain.rotation.z = Math.cos(t * 1.8 + i * 0.5) * 0.15;
    });
  });

  return (
    <group position={position} ref={bodyRef}>
      {/* ── HOOD (layered, deep) ── */}
      <mesh castShadow position={[0, 2.4, -0.05]} rotation={[-0.1, 0, 0]}>
        <sphereGeometry args={[0.38, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Hood backing/crest */}
      <mesh castShadow position={[0, 2.5, -0.2]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>
      {/* Hood rim */}
      <mesh castShadow position={[0, 2.2, 0.15]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.28, 0.05, 6, 12, Math.PI]} />
        <primitive object={wraithMat} attach="material" />
      </mesh>

      {/* ── SKULL VISAGE ── */}
      <group position={[0, 2.25, 0.15]}>
        {/* Upper skull casing */}
        <mesh castShadow position={[0, 0.08, 0.05]}>
          <sphereGeometry args={[0.18, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        {/* Jaw blocks */}
        <mesh castShadow position={[-0.06, -0.1, 0.08]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.04, 0.12, 0.08]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.06, -0.1, 0.08]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.04, 0.12, 0.08]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        {/* Dark eye sockets */}
        <mesh position={[-0.07, 0.05, 0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#050005" roughness={1.0} />
        </mesh>
        <mesh position={[0.07, 0.05, 0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#050005" roughness={1.0} />
        </mesh>
        {/* Glowing irises */}
        <mesh position={[-0.07, 0.05, 0.23]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <primitive object={wraithGlowMat} attach="material" />
        </mesh>
        <mesh position={[0.07, 0.05, 0.23]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <primitive object={wraithGlowMat} attach="material" />
        </mesh>
        {/* Eye trails */}
        <mesh position={[-0.07, -0.05, 0.22]} rotation={[0.2, 0, 0.1]}>
          <planeGeometry args={[0.04, 0.25]} />
          <meshStandardMaterial color="#8844cc" emissive="#aa55ff" emissiveIntensity={1.5} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.07, -0.05, 0.22]} rotation={[0.2, 0, -0.1]}>
          <planeGeometry args={[0.04, 0.25]} />
          <meshStandardMaterial color="#8844cc" emissive="#aa55ff" emissiveIntensity={1.5} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ── SHOULDERS & CHEST ── */}
      <group ref={chestRef} position={[0, 1.95, 0]}>
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.4, 0.55, 0.35, 8]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
        <mesh castShadow position={[-0.45, 0.15, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.0, 0.25, 0.4, 6]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0.45, 0.15, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.0, 0.25, 0.4, 6]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
        {/* DETAILED SKELETAL RIBCAGE */}
        <group position={[0, -0.2, 0.1]}>
          <mesh castShadow position={[0, -0.1, -0.1]}>
            <cylinderGeometry args={[0.03, 0.02, 0.6, 6]} />
            <meshStandardMaterial color="#bbaa99" roughness={0.9} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const rad = 0.25 - i * 0.035;
            return (
              <mesh key={`true-rib-${i}`} position={[0, -0.05 - i * 0.1, -0.05]} rotation={[Math.PI / 2 + 0.2, 0, Math.PI]}>
                <torusGeometry args={[rad, 0.015, 6, 12, Math.PI]} />
                <meshStandardMaterial color="#bbaa99" roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* ── FLOWING TUBE CLOAK ── */}
      <group position={[0, 0.8, 0]}>
        <mesh castShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.15, 0.4, 1.8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {cloakPaths.map((path, i) => (
          <mesh key={`cloak-tube-${i}`} ref={(el) => { cloakRefs.current[i] = el; }}>
            <tubeGeometry args={[path, 12, 0.025, 5, false]} />
            <primitive object={wraithMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ── LEFT ARM (Skeletal) ── */}
      <group ref={leftArmRef} position={[-0.55, 1.9, 0.15]}>
        <mesh castShadow position={[-0.1, -0.2, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.02, 0.025, 0.5, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.2, -0.55, 0.15]} rotation={[0.4, 0, 0.6]}>
          <cylinderGeometry args={[0.015, 0.02, 0.45, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.25, -0.55, 0.1]} rotation={[0.4, 0, 0.6]}>
          <cylinderGeometry args={[0.01, 0.015, 0.45, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.1, -0.3, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.2, 0.6, 6]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
        <group position={[-0.35, -0.85, 0.35]} rotation={[0.2, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.05, 0.06]} />
            <meshStandardMaterial color="#bbaa99" roughness={0.9} />
          </mesh>
          {[-0.03, 0, 0.03].map((off, i) => (
            <mesh key={`lfing-${i}`} position={[-0.06, -0.04, off]} rotation={[0, 0, 0.4]}>
              <cylinderGeometry args={[0.006, 0.004, 0.1, 4]} />
              <meshStandardMaterial color="#bbaa99" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── RIGHT ARM (Skeletal) ── */}
      <group ref={rightArmRef} position={[0.55, 1.9, 0.2]}>
        <mesh castShadow position={[0.1, -0.2, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.025, 0.5, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.2, -0.55, 0.15]} rotation={[0.4, 0, -0.6]}>
          <cylinderGeometry args={[0.015, 0.02, 0.45, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.25, -0.55, 0.1]} rotation={[0.4, 0, -0.6]}>
          <cylinderGeometry args={[0.01, 0.015, 0.45, 6]} />
          <meshStandardMaterial color="#bbaa99" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.1, -0.3, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.2, 0.6, 6]} />
          <primitive object={wraithMat} attach="material" />
        </mesh>
        <group position={[0.35, -0.85, 0.35]} rotation={[-0.2, -0.2, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.05, 0.06]} />
            <meshStandardMaterial color="#bbaa99" roughness={0.9} />
          </mesh>
          {[-0.03, 0, 0.03].map((off, i) => (
            <mesh key={`rfing-${i}`} position={[0.06, -0.06, off]} rotation={[0.4, 0, -0.4]}>
              <cylinderGeometry args={[0.005, 0.003, 0.15, 4]} />
              <meshStandardMaterial color="#bbaa99" roughness={0.9} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ── CUSTOM EXTRUDED SCYTHE ── */}
      <group ref={scytheRef} position={[-0.8, 1.25, 0.45]}>
        <mesh castShadow position={[0, 0.5, 0]} rotation={[0.1, 0, -0.1]}>
          <cylinderGeometry args={[0.025, 0.035, 3.6, 8]} />
          <meshStandardMaterial color="#1f1818" roughness={0.8} metalness={0.6} />
        </mesh>
        <mesh position={[0, 2.3, 0.05]} rotation={[0.1, 0, -0.1]}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
          <meshStandardMaterial color="#445566" roughness={0.4} metalness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.05, 2.2, 0.05]} rotation={[0, 0.1, 0.3]}>
          <extrudeGeometry args={[scytheShape, extrudeSettings]} />
          <meshStandardMaterial color="#aabbcc" roughness={0.2} metalness={0.9} emissive="#223344" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* ── DANGELING CHAINS ── */}
      {[-0.2, 0, 0.2].map((xOff, i) => (
        <mesh key={`chain-${i}`} position={[xOff, 1.1, 0.35]} ref={(el) => { chainRefs.current[i] = el; }}>
          <cylinderGeometry args={[0.01, 0.01, 0.4, 4]} />
          <meshStandardMaterial color="#3a3540" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* ── SOUL ORB ── */}
      <mesh ref={orbRef} position={[0, 1.65, 0.3]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#bb66ff" emissive="#9933ff" emissiveIntensity={4.0} transparent opacity={0.8} />
      </mesh>
      <mesh ref={orbGlowRef} position={[0, 1.65, 0.3]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#8844cc" emissive="#7733bb" emissiveIntensity={1.5} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* ── DARK AURA ── */}
      <mesh ref={auraRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshStandardMaterial color="#1a0030" emissive="#110022" emissiveIntensity={0.6} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  5. SKULL SPECTER — floating skull with ethereal trail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SkullSpecter({ position }: { position: [number, number, number] }) {
  const skullRef = useRef<THREE.Group>(null!);
  const fireRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (skullRef.current) {
      // Intimidating slow bob
      skullRef.current.position.y = -2.0 + Math.sin(t * 2) * 0.15;
    }

    fireRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      const time = t * 12 + i * Math.PI * 0.25; // Offset phases
      
      // Flames rapidly stretch downwards 
      const stretchY = 1.5 + Math.sin(time) * 1.0; // 0.5 to 2.5 times scale
      const stretchXZ = 0.6 + Math.cos(time * 1.3) * 0.3; // 0.3 to 0.9 times scale
      mesh.scale.set(stretchXZ, stretchY, stretchXZ);
      
      // Keep the top of the flame anchored near the jaw (Y=1.5)
      // Octahedron radius is 0.3, so local top is at +0.3. 
      const topFixedY = 1.5 - stretchY * 0.3;
      
      // Slight spread outward orbiting the center
      const angle = (i / 8) * Math.PI * 2 + t * 2; 
      const spread = 0.15;
      mesh.position.set(
        Math.cos(angle) * spread,
        topFixedY,
        Math.sin(angle) * spread
      );
      
      // Tilt them away from the center to form a jet
      mesh.rotation.x = Math.sin(angle) * 0.3;
      mesh.rotation.z = -Math.cos(angle) * 0.3;
      mesh.rotation.y = time; // Rapid spin 
    });
  });

  return (
    <group position={position}>
      {/* ── HUGE SKULL (Using clean, original proportions, heavily scaled) ── */}
      <group ref={skullRef} scale={[2.0, 2.0, 2.0]} position={[0, -2.0, 0]}>
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
      </group>

      {/* ── DETAILED EJECTING FIRE (Stylized overlapping flames) ── */}
      {/* Central glow core to hide seams */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff3300" emissiveIntensity={3.0} transparent opacity={0.8} />
      </mesh>
      
      {/* 8 Dynamic low-poly flames */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={`fire-${i}`} ref={(el) => { fireRefs.current[i] = el; }}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#ff4400" : "#ffaa00"} 
            emissive={i % 2 === 0 ? "#cc1100" : "#ff6600"} 
            emissiveIntensity={2.5} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      ))}
    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  THE STRANGER — hooded figure at the fence
// ┃  Tall, thin, faceless. Child-sized hands inside adult sleeves.
// ┃  One yellow baby sock. Wet hem. Nothing inside the hood — almost.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Materials unique to the Stranger
const strangerRobeMat = new THREE.MeshStandardMaterial({
  color: "#4a4a52",
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const strangerRobeDarkMat = new THREE.MeshStandardMaterial({
  color: "#1c1c22",
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const strangerHoodVoidMat = new THREE.MeshStandardMaterial({
  color: "#000000",
  emissive: "#000000",
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
});
const strangerHemWetMat = new THREE.MeshStandardMaterial({
  color: "#0a0a0e",
  roughness: 0.35,  // wet sheen
  metalness: 0.2,
  side: THREE.DoubleSide,
});
const strangerSkinMat = new THREE.MeshStandardMaterial({
  color: "#f3c6b4",  // small, soft, too-pink child skin
  roughness: 0.75,
  metalness: 0.0,
});
const strangerSockMat = new THREE.MeshStandardMaterial({
  color: "#f2d35a",  // the yellow baby sock
  roughness: 0.95,
  metalness: 0.0,
});
const strangerHintMat = new THREE.MeshStandardMaterial({
  color: "#1a1a22",
  emissive: "#0a0010",
  emissiveIntensity: 0.3,
  roughness: 1.0,
  metalness: 0.0,
  transparent: true,
  opacity: 0.0,  // hidden by default, flickers via useFrame
});

function TheStranger({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<THREE.Group>(null!);
  const robeRef = useRef<THREE.Group>(null!);
  const hoodRef = useRef<THREE.Group>(null!);
  const chestBreathRef = useRef<THREE.Group>(null!);
  const leftSleeveRef = useRef<THREE.Group>(null!);
  const rightSleeveRef = useRef<THREE.Group>(null!);
  const hoodHintRef = useRef<THREE.Mesh>(null!);
  const wetHemRef = useRef<THREE.Mesh>(null!);
  const underShadowRef = useRef<THREE.Mesh>(null!);

  const wispRefs = useRef<(THREE.Mesh | null)[]>([]);

  const rT = useMemo(() => Math.random() * 100, []);

  // Tall drooping robe wisps (catmull-rom tube paths)
  const robePaths = useMemo(() => {
    const paths: THREE.CatmullRomCurve3[] = [];
    const numWisps = 16;
    for (let i = 0; i < numWisps; i++) {
      const angle = (i / numWisps) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 6; j++) {
        const h = 1.3 - j * 0.34;           // top of robe down to hem
        const flare = 0.22 + j * 0.055;     // gentle flare outward
        const drift = Math.sin(i * 0.7 + j * 0.3) * 0.02;
        points.push(new THREE.Vector3(
          Math.cos(angle) * flare + drift,
          h,
          Math.sin(angle) * flare
        ));
      }
      paths.push(new THREE.CatmullRomCurve3(points));
    }
    return paths;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime + rT;

    // Body: unnaturally still. Only the tiniest sway — like a man who has
    // been waiting so long his body has forgotten how to shift its weight.
    if (bodyRef.current) {
      bodyRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.015;
      bodyRef.current.rotation.z = Math.sin(t * 0.4) * 0.008;
    }

    // Hood turns just a beat behind the body — fabric reluctance
    if (hoodRef.current) {
      hoodRef.current.rotation.y = Math.sin(t * 0.5 - 0.4) * 0.05;
      hoodRef.current.rotation.x = -0.08 + Math.sin(t * 0.3) * 0.015;
    }

    // Chest "breathes" slowly — but it's the wrong rhythm, too low, too deep
    if (chestBreathRef.current) {
      const breath = 1 + Math.sin(t * 1.1) * 0.04;
      chestBreathRef.current.scale.set(breath, 1, breath);
    }

    // Sleeves drift like the robe is slightly heavier than it should be
    if (leftSleeveRef.current) {
      leftSleeveRef.current.rotation.z = 0.05 + Math.sin(t * 0.9) * 0.025;
      leftSleeveRef.current.rotation.x = Math.cos(t * 0.7) * 0.02;
    }
    if (rightSleeveRef.current) {
      rightSleeveRef.current.rotation.z = -0.05 - Math.sin(t * 0.9 + 0.6) * 0.025;
      rightSleeveRef.current.rotation.x = Math.cos(t * 0.7 + 0.3) * 0.02;
    }

    // Robe wisps sway with a delayed, disagreeing motion
    wispRefs.current.forEach((wisp, i) => {
      if (!wisp) return;
      wisp.rotation.y = Math.sin(t * 0.7 + i * 0.4) * 0.04;
      wisp.rotation.x = Math.cos(t * 0.5 + i * 0.25) * 0.02;
    });

    // The hint inside the hood: a pale shape that almost-but-never resolves.
    // Flickers opacity so the player thinks they imagined it.
    if (hoodHintRef.current) {
      const m = hoodHintRef.current.material as THREE.MeshStandardMaterial;
      // Three phases: mostly invisible, rare "bloom" where a shape almost appears
      const pulse = Math.sin(t * 0.23) * 0.5 + 0.5;
      const burst = Math.pow(Math.sin(t * 0.17 + 1.7), 16); // rare sharp peak
      m.opacity = 0.02 + pulse * 0.05 + burst * 0.55;
    }

    // Wet hem shimmer — the dragging dark line
    if (wetHemRef.current) {
      const m = wetHemRef.current.material as THREE.MeshStandardMaterial;
      m.roughness = 0.3 + Math.sin(t * 0.9) * 0.08;
    }

    // Under-shadow: the second, smaller shadow. Counter-rotates subtly
    // against the main body's sway, so the silhouettes never quite agree.
    if (underShadowRef.current) {
      underShadowRef.current.rotation.z = -Math.sin(t * 0.4) * 0.03;
      const s = 1 + Math.sin(t * 0.6) * 0.04;
      underShadowRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group position={position} ref={bodyRef}>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   THE SECOND SHADOW (child-sized, beneath the figure)   */}
      {/*   — a dark disc that hints at a smaller body underneath */}
      {/* ═══════════════════════════════════════════════════════ */}
      <mesh
        ref={underShadowRef}
        position={[0, -1.75, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial
          color="#000000"
          roughness={1.0}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   ROBE — the tall thin body-shape that is mostly air    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <group ref={robeRef} position={[0, 0, 0]}>

        {/* Outer robe (shoulders down to hem) — tall narrow cone */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <coneGeometry args={[0.55, 2.6, 12, 1, true]} />
          <primitive object={strangerRobeMat} attach="material" />
        </mesh>

        {/* Inner robe (darker, slightly smaller) — adds depth */}
        <mesh position={[0, 0.38, 0]}>
          <coneGeometry args={[0.5, 2.5, 12, 1, true]} />
          <primitive object={strangerRobeDarkMat} attach="material" />
        </mesh>

        {/* Chest — the thing that breathes when he doesn't.
            Placed low, near the belly, because what breathes is
            not where a face would put it. */}
        <group ref={chestBreathRef} position={[0, 0.35, 0.05]}>
          <mesh>
            <sphereGeometry args={[0.28, 12, 12]} />
            <primitive object={strangerRobeDarkMat} attach="material" />
          </mesh>
        </group>

        {/* Tube-wisps of robe fabric — delayed-motion vertical folds */}
        {robePaths.map((path, i) => (
          <mesh
            key={`stranger-wisp-${i}`}
            ref={(el) => { wispRefs.current[i] = el; }}
            castShadow
          >
            <tubeGeometry args={[path, 20, 0.022, 5, false]} />
            <primitive object={strangerRobeMat} attach="material" />
          </mesh>
        ))}

        {/* Wet hem — the dragging dark line under the robe */}
        <mesh
          ref={wetHemRef}
          position={[0, -1.25, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.32, 0.58, 32]} />
          <primitive object={strangerHemWetMat} attach="material" />
        </mesh>

        {/* Faint wet streak behind him — short rectangle, very dark */}
        <mesh
          position={[0, -1.76, -0.42]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.18, 0.55]} />
          <meshStandardMaterial
            color="#05050a"
            roughness={0.3}
            metalness={0.15}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   HOOD — deep, cavernous, wrong                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <group ref={hoodRef} position={[0, 1.55, 0]}>

        {/* Outer hood shell — draped cone shape */}
        <mesh castShadow position={[0, 0.08, -0.05]} rotation={[-0.12, 0, 0]}>
          <coneGeometry args={[0.34, 0.7, 12, 1, true]} />
          <primitive object={strangerRobeMat} attach="material" />
        </mesh>

        {/* Hood backing — extra drape behind */}
        <mesh castShadow position={[0, 0.02, -0.15]} rotation={[-0.35, 0, 0]}>
          <coneGeometry args={[0.3, 0.55, 10, 1, true]} />
          <primitive object={strangerRobeDarkMat} attach="material" />
        </mesh>

        {/* Front rim of hood — the dark inner overhang */}
        <mesh position={[0, -0.02, 0.14]} rotation={[0.25, 0, 0]}>
          <torusGeometry args={[0.26, 0.04, 6, 16, Math.PI]} />
          <primitive object={strangerRobeDarkMat} attach="material" />
        </mesh>

        {/* The VOID inside the hood — a black sphere that eats light.
            Deeper than the hood should physically contain. */}
        <mesh position={[0, 0.0, 0.02]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <primitive object={strangerHoodVoidMat} attach="material" />
        </mesh>

        {/* THE HINT — a pale shape that flickers inside the void.
            Almost a face. Almost a skull. Almost an ultrasound.
            Opacity is animated in useFrame. */}
        <mesh ref={hoodHintRef} position={[0, 0.02, 0.08]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <primitive object={strangerHintMat} attach="material" />
        </mesh>

        {/* Two tiny darker pin-pricks inside the hood — could be eyes,
            could be nothing. Almost invisible; the viewer will fill them in. */}
        <mesh position={[-0.045, 0.03, 0.14]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color="#000000" roughness={1.0} />
        </mesh>
        <mesh position={[0.045, 0.03, 0.14]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color="#000000" roughness={1.0} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   SHOULDERS (suggested, not shown) — narrow cape yoke    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <mesh castShadow position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.18, 12]} />
        <primitive object={strangerRobeMat} attach="material" />
      </mesh>

      {/* Collar drape — V-shaped front fold */}
      <mesh position={[0, 1.18, 0.12]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 8, 1, true]} />
        <primitive object={strangerRobeDarkMat} attach="material" />
      </mesh>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   LEFT SLEEVE — adult-sized sleeve, child-sized hand     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <group ref={leftSleeveRef} position={[-0.38, 1.25, 0]}>

        {/* Upper arm sleeve — long, loose, falls from shoulder */}
        <mesh castShadow position={[0, -0.4, 0]} rotation={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8, 10, 1, true]} />
          <primitive object={strangerRobeMat} attach="material" />
        </mesh>

        {/* Sleeve cuff — flares slightly at the wrist */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.1, 10, 1, true]} />
          <primitive object={strangerRobeDarkMat} attach="material" />
        </mesh>

        {/* The dark interior of the sleeve — visible tunnel up the cuff */}
        <mesh position={[0, -0.82, 0]}>
          <cylinderGeometry args={[0.12, 0.11, 0.14, 10, 1, true]} />
          <primitive object={strangerHoodVoidMat} attach="material" />
        </mesh>

        {/* CHILD HAND — small, pink, emerging too late in the sleeve.
            The wrist is inside the cuff; only a small palm and short fingers
            peek out. This is the detail that should haunt the player. */}
        <group position={[0, -0.92, 0.02]}>
          {/* Palm */}
          <mesh castShadow>
            <boxGeometry args={[0.055, 0.07, 0.03]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
          {/* Four little fingers — stubby, child-proportioned */}
          {[-0.018, -0.006, 0.006, 0.018].map((x, i) => (
            <mesh key={`lf-${i}`} position={[x, -0.055, 0.005]} castShadow>
              <boxGeometry args={[0.009, 0.035, 0.012]} />
              <primitive object={strangerSkinMat} attach="material" />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh position={[-0.032, -0.02, 0.012]} rotation={[0, 0, 0.6]} castShadow>
            <boxGeometry args={[0.009, 0.028, 0.012]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   RIGHT SLEEVE — mirror of the left                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      <group ref={rightSleeveRef} position={[0.38, 1.25, 0]}>
        <mesh castShadow position={[0, -0.4, 0]} rotation={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.12, 0.15, 0.8, 10, 1, true]} />
          <primitive object={strangerRobeMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.1, 10, 1, true]} />
          <primitive object={strangerRobeDarkMat} attach="material" />
        </mesh>
        <mesh position={[0, -0.82, 0]}>
          <cylinderGeometry args={[0.12, 0.11, 0.14, 10, 1, true]} />
          <primitive object={strangerHoodVoidMat} attach="material" />
        </mesh>

        {/* CHILD HAND — right side */}
        <group position={[0, -0.92, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.055, 0.07, 0.03]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
          {[-0.018, -0.006, 0.006, 0.018].map((x, i) => (
            <mesh key={`rf-${i}`} position={[x, -0.055, 0.005]} castShadow>
              <boxGeometry args={[0.009, 0.035, 0.012]} />
              <primitive object={strangerSkinMat} attach="material" />
            </mesh>
          ))}
          <mesh position={[0.032, -0.02, 0.012]} rotation={[0, 0, -0.6]} castShadow>
            <boxGeometry args={[0.009, 0.028, 0.012]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*   FEET — bare, child-sized, peeking under the hem        */}
      {/*   Left: one yellow sock half-on. Right: bare pink foot.  */}
      {/* ═══════════════════════════════════════════════════════ */}

      {/* LEFT FOOT — with the yellow baby sock, half-pulled-on */}
      <group position={[-0.1, -1.68, 0.05]}>
        {/* Bare foot beneath */}
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.04, 0.14]} />
          <primitive object={strangerSkinMat} attach="material" />
        </mesh>
        {/* Tiny toes */}
        {[-0.024, -0.008, 0.008, 0.024].map((x, i) => (
          <mesh key={`lt-${i}`} position={[x, 0.005, 0.085]} castShadow>
            <boxGeometry args={[0.012, 0.018, 0.018]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
        ))}
        {/* The YELLOW SOCK — wraps the heel and ankle, slipping off the front */}
        <mesh castShadow position={[0, 0.025, -0.04]}>
          <boxGeometry args={[0.092, 0.05, 0.08]} />
          <primitive object={strangerSockMat} attach="material" />
        </mesh>
        {/* Sock cuff ringing the ankle */}
        <mesh position={[0, 0.08, -0.04]}>
          <cylinderGeometry args={[0.038, 0.04, 0.05, 10]} />
          <primitive object={strangerSockMat} attach="material" />
        </mesh>
      </group>

      {/* RIGHT FOOT — bare, soft, unnaturally clean */}
      <group position={[0.1, -1.68, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.04, 0.14]} />
          <primitive object={strangerSkinMat} attach="material" />
        </mesh>
        {[-0.024, -0.008, 0.008, 0.024].map((x, i) => (
          <mesh key={`rt-${i}`} position={[x, 0.005, 0.085]} castShadow>
            <boxGeometry args={[0.012, 0.018, 0.018]} />
            <primitive object={strangerSkinMat} attach="material" />
          </mesh>
        ))}
      </group>

    </group>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ┃  NAMED EXPORTS — used by EnemySystem for dynamic spawning
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export { Hellhound, ShadowSpider, FloatingGhost, ShadowWraith, SkullSpecter, TheStranger };
