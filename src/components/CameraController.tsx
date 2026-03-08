"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA } from "./settings/settings";

interface CameraControllerProps {
  targetRef: React.MutableRefObject<THREE.Vector3>;
  angleRef?: React.MutableRefObject<number>;
}

export default function CameraController({
  targetRef,
  angleRef,
}: CameraControllerProps) {
  const camRef = useRef<THREE.PerspectiveCamera>(null!);
  const offset = useRef(new THREE.Vector3(0, 6, 9));
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!camRef.current) return;

    const pos = targetRef.current;

    // Default shoulder-cam offset
    const idealOffset = new THREE.Vector3(0, CAMERA.OFFSET_Y, CAMERA.OFFSET_Z);

    // Apply player's Y-axis rotation to the offset to swing camera behind them
    if (angleRef) {
      idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleRef.current);
    }

    // Target camera position = player position + rotated offset
    targetPosition.current.copy(pos).add(idealOffset);

    // Smooth lerp follow — low values = smoother, less shake
    camRef.current.position.lerp(targetPosition.current, CAMERA.POSITION_LERP);

    // Smooth look-at — dampened to avoid jitter
    // Target the hero's upper body instead of their feet to see the horizon
    targetLookAt.current.set(pos.x, CAMERA.LOOK_AT_Y, pos.z);
    currentLookAt.current.lerp(targetLookAt.current, CAMERA.LOOK_AT_LERP);

    camRef.current.lookAt(currentLookAt.current);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={CAMERA.FOV}
      near={CAMERA.NEAR}
      far={Math.max(CAMERA.FAR_NIGHT, CAMERA.FAR_DAY)}
      position={[0, 6, 9]}
    />
  );
}
