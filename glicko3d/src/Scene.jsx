import React, { Suspense } from "react";
import Marker from "./Marker";

function normalizeToRange(value, inMin = 0, inMax = 100, outMin = 0, outMax = 10) {
  // linear map from input range to output range (0-100 to 0-10)
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

export default function Scene({ data, selected, setSelected }) {
  return (
    <group>
      {/* axes helpers - positioned at origin */}
      <axesHelper args={[12]} position={[0, 0, 0]} />
      
      {/* grid on XY plane (at z=0) */}
      <gridHelper args={[12, 12, "#888888", "#222222"]} rotation={[Math.PI / 2, 0, 0]} position={[6, 6, 0]} />
      
      {/* grid on XZ plane (at y=0) */}
      <gridHelper args={[12, 12, "#666666", "#111111"]} position={[6, 0, 6]} />
      
      {/* grid on YZ plane (at x=0) */}
      <gridHelper args={[12, 12, "#666666", "#111111"]} rotation={[0, 0, Math.PI / 2]} position={[0, 6, 6]} />

      <Suspense fallback={null}>
        {data.map((m) => {
          const x = normalizeToRange(m.rizz);
          const y = normalizeToRange(m.tizz);
          const z = normalizeToRange(m.freak);
          return (
            <Marker
              key={m.id}
              position={[x, y, z]}
              person={m}
              isSelected={selected?.id === m.id}
              onSelect={() => setSelected(m)}
            />
          );
        })}
      </Suspense>
    </group>
  );
}