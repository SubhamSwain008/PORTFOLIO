"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MINIMAP } from "./settings/settings";

interface MiniMapLogicProps {
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
}

export function MiniMapLogic({ playerPosRef }: MiniMapLogicProps) {
  const { camera } = useThree();

  useFrame(() => {
    const arrow = document.getElementById("minimap-arrow");
    if (!arrow || !playerPosRef.current) return;

    const playerPos = playerPosRef.current;
    
    // Main Hall destination (origin)
    const destX = 0;
    const destZ = 0;

    // Vector from player to destination
    const dx = destX - playerPos.x;
    const dz = destZ - playerPos.z;
    const distSq = dx * dx + dz * dz;

    // If we're very close in the hall, fade out the arrow
    if (distSq < MINIMAP.HALL_FADE_DISTANCE_SQ) { // 5 unit radius
        arrow.style.opacity = "0";
        return;
    } else {
        arrow.style.opacity = "1";
    }

    // Absolute angle from player to destination
    const angleToDest = Math.atan2(dx, dz);

    // Absolute angle the camera is facing
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const camAngle = Math.atan2(camDir.x, camDir.z);

    // Relative angle: Camera Angle - Destination Angle
    // This translates the absolute world angles into the 2D screen space rotation
    const relativeAngle = camAngle - angleToDest;
    const rotDeg = (relativeAngle * 180) / Math.PI;

    // Apply rotation
    arrow.style.transform = `translateX(-50%) rotate(${rotDeg}deg)`;
  });

  return null;
}

export function MiniMap() {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: 24,
        width: MINIMAP.SIZE,
        height: MINIMAP.SIZE,
        borderRadius: "50%",
        background: "rgba(10, 10, 15, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(154, 106, 255, 0.1)",
        zIndex: 1000,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer Glow Ring */}
      <div
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "50%",
          border: "1px solid rgba(154, 106, 255, 0.3)",
        }}
      />

      {/* Center dot (Player Position) */}
      <div
        style={{
          position: "absolute",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#9a6aff",
          boxShadow: "0 0 10px #9a6aff, 0 0 20px rgba(154, 106, 255, 0.5)",
          zIndex: 2,
        }}
      />

      {/* Ring / Compass Ticks */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: "50%",
          border: "1px dashed rgba(255, 255, 255, 0.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: "50%",
          border: "1px dotted rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Rotating Arrow Container (Pivots around center) */}
      <div
        id="minimap-arrow"
        style={{
          position: "absolute",
          width: 24,
          height: MINIMAP.SIZE, // Full height of minimap to pivot perfectly at center
          left: "50%",
          transformOrigin: "center",
          transform: "translateX(-50%) rotate(0deg)",
          transition: "opacity 0.3s ease",
          zIndex: 1,
        }}
      >
        {/* The Arrow SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            top: 10, // Padding from top edge of minimap
            left: 0,
            filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
          }}
        >
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </div>

      {/* Main Hall Label */}
      <div
        style={{
          position: "absolute",
          bottom: -24,
          fontSize: "10px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Main Hall
      </div>
    </div>
  );
}
