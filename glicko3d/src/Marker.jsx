// src/Marker.jsx (presentation-only)
import React, { useRef } from "react";
import * as THREE from "three";

export default function Marker({ id, position = [0, 0, 0], person, isSelected, isHovered }) {
  const ref = useRef();

  return (
    <group ref={ref} position={position}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ffd700" : isHovered ? "#ff8800" : "#3399ff"}
          emissive={isSelected ? "#ffd700" : isHovered ? "#ff8800" : "#3399ff"}
          emissiveIntensity={isSelected ? 0.8 : isHovered ? 0.6 : 0.4}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      <mesh raycast={() => null}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#ffd700" : isHovered ? "#ff8800" : "#3399ff"}
          transparent
          opacity={isSelected ? 0.32 : isHovered ? 0.26 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
