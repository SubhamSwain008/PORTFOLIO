"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraControllerProps {
  playerPosition: THREE.Vector3;
}

export default function CameraController({ playerPosition }: CameraControllerProps) {
  const offset = useRef(new THREE.Vector3(0, 14, 14));
  const targetPosition = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    // Target camera position = player position + fixed offset
    targetPosition.current.set(
      playerPosition.x + offset.current.x,
      offset.current.y,
      playerPosition.z + offset.current.z
    );

    // Smooth lerp follow
    camera.position.lerp(targetPosition.current, 0.05);

    // Smooth look-at
    lookAtTarget.current.set(playerPosition.x, 0, playerPosition.z);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);

    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
