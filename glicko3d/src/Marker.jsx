// src/Marker.jsx
import React, { useRef, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function Marker({ position = [0,0,0], person, onSelect, isSelected }) {
  const ref = useRef();
  const hoverTimeoutRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Called when pointer enters the interactive area
  function handlePointerOver(e) {
    e.stopPropagation();
    // cancel any pending hide
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  }

  // Called when pointer leaves the interactive area: delay clearing
  function handlePointerOut(e) {
    e.stopPropagation();
    // small delay to avoid flicker on micro-movements
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHovered(false);
      hoverTimeoutRef.current = null;
    }, 180); // 120-250 ms is a good range; tweak to taste
  }

  // click handler
  function handleClick(e) {
    e.stopPropagation();
    onSelect?.(person);
  }

  return (
    <group position={position}>
      {/* main visible sphere */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ffd700" : hovered ? "#ff8800" : "#3399ff"}
          emissive={isSelected ? "#ffd700" : hovered ? "#ff8800" : "#3399ff"}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.6 : 0.4}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* subtle glow (visual only) */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#ffd700" : hovered ? "#ff8800" : "#3399ff"}
          transparent
          opacity={isSelected ? 0.32 : hovered ? 0.26 : 0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* invisible, slightly bigger hitbox so cursor has leeway */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* tooltip: sprite + pointerEvents none so it doesn't steal focus */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10} center transform sprite>
          <div
            className={`tooltip ${isSelected ? "selected" : ""}`}
            // IMPORTANT: don't allow the tooltip DOM to accept pointer events
            style={{
              pointerEvents: "none",
              width: 220,
              userSelect: "none",
            }}
          >
            <img src={person.photo} alt={person.name} />
            <div className="info">
              <strong>{person.name}</strong>
              <div style={{ fontSize: 12 }}>Rizz: {person.rizz}</div>
              <div style={{ fontSize: 12 }}>Tizz: {person.tizz}</div>
              <div style={{ fontSize: 12 }}>Freak: {person.freak}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
