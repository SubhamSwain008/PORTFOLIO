"use client";

import * as THREE from "three";

// ─── Canonical shared materials ───────────────────────────
const skinMat = new THREE.MeshStandardMaterial({
  color: "#c8a88a",
  roughness: 0.7,
  metalness: 0.05,
});
const shirtMat = new THREE.MeshStandardMaterial({
  color: "#3d3852",
  emissive: "#0e0c12",
  emissiveIntensity: 0.15,
  roughness: 0.75,
  metalness: 0.1,
});
const pantsMat = new THREE.MeshStandardMaterial({
  color: "#2a2535",
  roughness: 0.85,
  metalness: 0.08,
});
const shoeMat = new THREE.MeshStandardMaterial({
  color: "#1a1a1f",
  roughness: 0.9,
  metalness: 0.15,
});
const hairMat = new THREE.MeshStandardMaterial({
  color: "#1c1820",
  roughness: 0.95,
  metalness: 0.0,
});
const backpackMat = new THREE.MeshStandardMaterial({
  color: "#4a5d23",
  roughness: 0.9,
  metalness: 0.1,
});
const strapMat = new THREE.MeshStandardMaterial({
  color: "#2a2a2a",
  roughness: 0.8,
});
const buttonMat = new THREE.MeshStandardMaterial({
  color: "#111111",
  roughness: 0.5,
});
const kneepadMat = new THREE.MeshStandardMaterial({
  color: "#1a1820",
  roughness: 0.8,
});
const watchMat = new THREE.MeshStandardMaterial({
  color: "#111111",
  metalness: 0.6,
  roughness: 0.4,
});
const sweatbandMat = new THREE.MeshStandardMaterial({
  color: "#8b0000",
  roughness: 0.8,
  metalness: 0.05,
});

interface PlayerBodyMeshProps {
  bodyGroupRef: React.RefObject<THREE.Group>;
  headRef: React.RefObject<THREE.Group>;
  leftArmRef: React.RefObject<THREE.Group>;
  rightArmRef: React.RefObject<THREE.Group>;
  leftLegRef: React.RefObject<THREE.Group>;
  rightLegRef: React.RefObject<THREE.Group>;
  leftKneeRef?: React.RefObject<THREE.Group>;
  rightKneeRef?: React.RefObject<THREE.Group>;
  /** Right-arm forearm group ref — night player attaches flashlight here */
  flashlightGroupRef?: React.RefObject<THREE.Group>;
  /** Whether the fire torch item is equipped (night only) */
  hasTorch?: boolean;
}

export default function PlayerBodyMesh({
  bodyGroupRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  leftKneeRef,
  rightKneeRef,
  flashlightGroupRef,
  hasTorch = false,
}: PlayerBodyMeshProps) {
  return (
    <group ref={bodyGroupRef}>

      {/* ════════════ TORSO ════════════ */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[0.5, 0.45, 0.28]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[0.56, 0.12, 0.26]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[0.42, 0.2, 0.24]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>
      {/* Belt */}
      <mesh castShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[0.44, 0.06, 0.26]} />
        <meshStandardMaterial color="#1a1820" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Belt buckle */}
      <mesh castShadow position={[0, -0.2, 0.13]}>
        <boxGeometry args={[0.06, 0.05, 0.02]} />
        <meshStandardMaterial color="#b8a060" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* BackPack */}
      <mesh castShadow position={[0, 0.15, -0.22]}>
        <boxGeometry args={[0.38, 0.45, 0.15]} />
        <primitive object={backpackMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.1, -0.31]}>
        <boxGeometry args={[0.26, 0.25, 0.08]} />
        <primitive object={backpackMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.42, -0.22]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.36, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.15, 0.3, -0.15]}>
        <boxGeometry args={[0.06, 0.2, 0.25]} />
        <primitive object={strapMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.15, 0.3, -0.15]}>
        <boxGeometry args={[0.06, 0.2, 0.25]} />
        <primitive object={strapMat} attach="material" />
      </mesh>
      <mesh castShadow position={[-0.15, 0.15, 0.15]}>
        <boxGeometry args={[0.06, 0.35, 0.02]} />
        <primitive object={strapMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.15, 0.15, 0.15]}>
        <boxGeometry args={[0.06, 0.35, 0.02]} />
        <primitive object={strapMat} attach="material" />
      </mesh>

      {/* Shirt Buttons */}
      <mesh castShadow position={[0, 0.25, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <primitive object={buttonMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.15, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <primitive object={buttonMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <primitive object={buttonMat} attach="material" />
      </mesh>

      {/* Chest Pocket */}
      <mesh castShadow position={[0.12, 0.18, 0.145]}>
        <boxGeometry args={[0.08, 0.08, 0.01]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>

      {/* ════════════ HIPS ════════════ */}
      <mesh castShadow position={[0, -0.32, 0]}>
        <boxGeometry args={[0.42, 0.15, 0.24]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>
      <mesh castShadow position={[-0.22, -0.32, 0]}>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>
      <mesh castShadow position={[0.22, -0.32, 0]}>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>

      {/* ════════════ HEAD GROUP ════════════ */}
      <group ref={headRef} position={[0, 0.6, 0]}>
        {/* Neck */}
        <mesh castShadow position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.12, 8]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[0.26, 0.28, 0.26]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Jaw / chin */}
        <mesh castShadow position={[0, -0.02, 0.02]}>
          <boxGeometry args={[0.22, 0.08, 0.22]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Sweatband */}
        <mesh castShadow position={[0, 0.13, 0]}>
          <boxGeometry args={[0.27, 0.04, 0.27]} />
          <primitive object={sweatbandMat} attach="material" />
        </mesh>
        {/* Hair top */}
        <mesh castShadow position={[0, 0.2, -0.01]}>
          <boxGeometry args={[0.28, 0.08, 0.28]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        {/* Hair back */}
        <mesh castShadow position={[0, 0.1, -0.12]}>
          <boxGeometry args={[0.27, 0.22, 0.06]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        {/* Hair sides */}
        <mesh castShadow position={[-0.13, 0.1, -0.02]}>
          <boxGeometry args={[0.04, 0.18, 0.2]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0.13, 0.1, -0.02]}>
          <boxGeometry args={[0.04, 0.18, 0.2]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        {/* Left eye */}
        <mesh position={[-0.07, 0.1, 0.13]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[-0.07, 0.1, 0.155]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.07, 0.1, 0.13]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#e8e8e8" emissive="#444444" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.07, 0.1, 0.155]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0.06, 0.14]}>
          <boxGeometry args={[0.04, 0.06, 0.04]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.0, 0.135]}>
          <boxGeometry args={[0.08, 0.015, 0.01]} />
          <meshStandardMaterial color="#8a6060" roughness={0.8} />
        </mesh>
        {/* Eyebrows */}
        <mesh position={[-0.07, 0.15, 0.13]}>
          <boxGeometry args={[0.06, 0.015, 0.02]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        <mesh position={[0.07, 0.15, 0.13]}>
          <boxGeometry args={[0.06, 0.015, 0.02]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
        {/* Ears */}
        <mesh castShadow position={[-0.14, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0.14, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
      </group>

      {/* ════════════ LEFT ARM ════════════ */}
      <group ref={leftArmRef} position={[-0.33, 0.28, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.16, 0]}>
          <boxGeometry args={[0.13, 0.3, 0.13]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>
        {/* Rolled sleeve rim */}
        <mesh castShadow position={[0, -0.29, 0]}>
          <boxGeometry args={[0.14, 0.04, 0.14]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>
        {/* Elbow */}
        <mesh castShadow position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Forearm */}
        <mesh castShadow position={[0, -0.43, 0]}>
          <boxGeometry args={[0.11, 0.24, 0.11]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Watch */}
        <mesh castShadow position={[0, -0.52, 0]}>
          <boxGeometry args={[0.115, 0.04, 0.115]} />
          <primitive object={watchMat} attach="material" />
        </mesh>
        <mesh castShadow position={[0, -0.52, 0.06]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
        </mesh>
        {/* Hand */}
        <mesh castShadow position={[0, -0.58, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Fingers */}
        <mesh castShadow position={[0, -0.64, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.06]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Fire Torch (night only) */}
        {hasTorch && (
          <group position={[0, -0.65, 0.1]} rotation={[-Math.PI / 2 + 0.2, 0, 0]}>
            <mesh castShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
              <meshStandardMaterial color="#4a3a28" roughness={0.9} />
            </mesh>
            <mesh castShadow position={[0, -0.1, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
              <meshStandardMaterial color="#2a1a08" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.08, 6, 6]} />
              <meshStandardMaterial color="#ffaa33" emissive="#ff8800" emissiveIntensity={3} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.04, 4, 4]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight position={[0, 0.25, 0]} color="#ffaa33" distance={12} intensity={2} decay={1.5} />
          </group>
        )}
      </group>

      {/* ════════════ RIGHT ARM ════════════ */}
      <group ref={rightArmRef} position={[0.33, 0.28, 0]}>
        {/* Upper arm */}
        <mesh castShadow position={[0, -0.16, 0]}>
          <boxGeometry args={[0.13, 0.3, 0.13]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>
        {/* Rolled sleeve rim */}
        <mesh castShadow position={[0, -0.29, 0]}>
          <boxGeometry args={[0.14, 0.04, 0.14]} />
          <primitive object={shirtMat} attach="material" />
        </mesh>
        {/* Elbow */}
        <mesh castShadow position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        {/* Forearm group — flashlight attached here by night player */}
        <group ref={flashlightGroupRef} position={[0, -0.3, 0]} rotation={flashlightGroupRef ? [0.25, 0, 0] : [0, 0, 0]}>
          <mesh castShadow position={[0, -0.13, 0]}>
            <boxGeometry args={[0.11, 0.24, 0.11]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
          {flashlightGroupRef ? (
            <>
              {/* Hand gripping flashlight */}
              <mesh castShadow position={[0, -0.27, 0.04]}>
                <boxGeometry args={[0.1, 0.1, 0.12]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              {/* Flashlight body */}
              <mesh castShadow position={[0, -0.27, 0.16]}>
                <cylinderGeometry args={[0.035, 0.045, 0.22, 8]} />
                <meshStandardMaterial color="#2a2a30" metalness={0.7} roughness={0.25} />
              </mesh>
              {/* Flashlight head */}
              <mesh castShadow position={[0, -0.27, 0.28]}>
                <cylinderGeometry args={[0.05, 0.035, 0.06, 8]} />
                <meshStandardMaterial color="#3a3a40" metalness={0.6} roughness={0.3} />
              </mesh>
              {/* Lens glow */}
              <mesh position={[0, -0.27, 0.32]}>
                <circleGeometry args={[0.045, 8]} />
                <meshStandardMaterial color="#fff5dd" emissive="#fff5aa" emissiveIntensity={2} />
              </mesh>
            </>
          ) : (
            <>
              {/* Plain hand (day) */}
              <mesh castShadow position={[0, -0.27, 0]}>
                <boxGeometry args={[0.1, 0.08, 0.08]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              <mesh castShadow position={[0, -0.33, 0]}>
                <boxGeometry args={[0.08, 0.06, 0.06]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
            </>
          )}
        </group>
      </group>

      {/* ════════════ LEFT LEG ════════════ */}
      <group ref={leftLegRef} position={[-0.12, -0.40, 0]}>
        {/* Thigh */}
        <mesh castShadow position={[0, -0.18, 0]}>
          <boxGeometry args={[0.18, 0.36, 0.18]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Knee sphere */}
        <mesh castShadow position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.075, 6, 6]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Knee pad */}
        <mesh castShadow position={[0, -0.36, 0.06]}>
          <boxGeometry args={[0.12, 0.12, 0.06]} />
          <primitive object={kneepadMat} attach="material" />
        </mesh>
        {/* Lower leg pivot */}
        <group ref={leftKneeRef} position={[0, -0.36, 0]}>
          <mesh castShadow position={[0, -0.20, 0]}>
            <boxGeometry args={[0.16, 0.34, 0.16]} />
            <primitive object={pantsMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.37, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <primitive object={pantsMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.41, 0.1]}>
            <boxGeometry args={[0.1, 0.04, 0.14]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, -0.46, 0.04]}>
            <boxGeometry args={[0.16, 0.09, 0.26]} />
            <primitive object={shoeMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.52, 0.04]}>
            <boxGeometry args={[0.17, 0.025, 0.28]} />
            <meshStandardMaterial color="#111115" roughness={0.95} />
          </mesh>
        </group>
      </group>

      {/* ════════════ RIGHT LEG ════════════ */}
      <group ref={rightLegRef} position={[0.12, -0.40, 0]}>
        {/* Thigh */}
        <mesh castShadow position={[0, -0.18, 0]}>
          <boxGeometry args={[0.18, 0.36, 0.18]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Knee sphere */}
        <mesh castShadow position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.075, 6, 6]} />
          <primitive object={pantsMat} attach="material" />
        </mesh>
        {/* Knee pad */}
        <mesh castShadow position={[0, -0.36, 0.06]}>
          <boxGeometry args={[0.12, 0.12, 0.06]} />
          <primitive object={kneepadMat} attach="material" />
        </mesh>
        {/* Lower leg pivot */}
        <group ref={rightKneeRef} position={[0, -0.36, 0]}>
          <mesh castShadow position={[0, -0.20, 0]}>
            <boxGeometry args={[0.16, 0.34, 0.16]} />
            <primitive object={pantsMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.37, 0]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <primitive object={pantsMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.41, 0.1]}>
            <boxGeometry args={[0.1, 0.04, 0.14]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, -0.46, 0.04]}>
            <boxGeometry args={[0.16, 0.09, 0.26]} />
            <primitive object={shoeMat} attach="material" />
          </mesh>
          <mesh castShadow position={[0, -0.52, 0.04]}>
            <boxGeometry args={[0.17, 0.025, 0.28]} />
            <meshStandardMaterial color="#111115" roughness={0.95} />
          </mesh>
        </group>
      </group>

    </group>
  );
}
