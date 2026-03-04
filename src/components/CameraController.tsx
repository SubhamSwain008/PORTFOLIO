"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface CameraControllerProps {
  targetRef: React.MutableRefObject<THREE.Vector3>;
}

export default function CameraController({
  targetRef,
}: CameraControllerProps) {
  const camRef = useRef<THREE.PerspectiveCamera>(null!);
  const offset = useRef(new THREE.Vector3(0, 14, 14));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!camRef.current) return;

    const pos = targetRef.current;

    // Target camera position = player position + fixed offset
    targetPosition.current.set(
      pos.x + offset.current.x,
      offset.current.y,
      pos.z + offset.current.z
    );

    // Smooth lerp follow — low values = smoother, less shake
    camRef.current.position.lerp(targetPosition.current, 0.03);

    // Smooth look-at — dampened to avoid jitter
    targetLookAt.current.set(pos.x, 0, pos.z);
    currentLookAt.current.lerp(targetLookAt.current, 0.04);

    camRef.current.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={48}
      near={0.1}
      far={200}
      position={[0, 14, 18]}
    />
  );
}
