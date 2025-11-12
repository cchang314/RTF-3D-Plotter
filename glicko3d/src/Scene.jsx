// src/Scene.jsx — with nice 3D axis labels + central raycast hover
import React, { Suspense, useEffect, useRef, useState } from "react";
import Marker from "./Marker";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";

function normalizeToRange(value, inMin = 0, inMax = 100, outMin = 0, outMax = 10) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

function distancePointToRay(point, rayOrigin, rayDir) {
  const v = new THREE.Vector3().subVectors(point, rayOrigin);
  const t = v.dot(rayDir);
  const closest = new THREE.Vector3().copy(rayDir).multiplyScalar(t).add(rayOrigin);
  return point.distanceTo(closest);
}

export default function Scene({ data, selected, setSelected, setTooltip }) {
  const { camera, gl, size } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const markersRef = useRef([]);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    markersRef.current = data.map((m) => {
      const x = normalizeToRange(m.rizz);
      const y = normalizeToRange(m.tizz);
      const z = normalizeToRange(m.freak);
      return { id: m.id, pos: new THREE.Vector3(x, y, z), item: m };
    });
  }, [data]);

  useEffect(() => {
    const dom = gl.domElement;
    if (!dom) return;

    function getNDCFromEvent(e) {
      const rect = dom.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    }

    function findBestUnderPointer(ndc) {
      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(ndc, camera);
      const origin = raycaster.ray.origin.clone();
      const dir = raycaster.ray.direction.clone();

      let best = { id: null, dist: Infinity, item: null, pos: null };
      for (const m of markersRef.current) {
        const d = distancePointToRay(m.pos, origin, dir);
        if (d < best.dist) best = { id: m.id, dist: d, item: m.item, pos: m.pos };
      }
      return { best, origin, dir };
    }

    function handlePointerMove(e) {
      const ndc = getNDCFromEvent(e);
      const { best } = findBestUnderPointer(ndc);

      if (best.id) {
        const camDist = camera.position.distanceTo(best.pos);
        const baseThreshold = 0.55;
        const adaptiveThreshold = baseThreshold * (camDist / 10);
        if (best.dist <= adaptiveThreshold) {
          if (hoveredId !== best.id) setHoveredId(best.id);
          setTooltip({
            visible: true,
            x: e.clientX - dom.getBoundingClientRect().left,
            y: e.clientY - dom.getBoundingClientRect().top,
            item: best.item,
          });
          return;
        }
      }

      if (hoveredId !== null) setHoveredId(null);
      setTooltip({ visible: false, x: 0, y: 0, item: null });
    }

    function handlePointerOut() {
      setHoveredId(null);
      setTooltip({ visible: false, x: 0, y: 0, item: null });
    }

    function handlePointerDown(e) {
      const ndc = getNDCFromEvent(e);
      const { best } = findBestUnderPointer(ndc);
      if (best.id) {
        const camDist = camera.position.distanceTo(best.pos);
        const baseThreshold = 0.55;
        const adaptiveThreshold = baseThreshold * (camDist / 10);
        if (best.dist <= adaptiveThreshold) {
          setSelected(best.item);
          return;
        }
      }
      setSelected(null);
    }

    dom.addEventListener("pointermove", handlePointerMove, { passive: true });
    dom.addEventListener("pointerout", handlePointerOut);
    dom.addEventListener("pointerdown", handlePointerDown);
    return () => {
      dom.removeEventListener("pointermove", handlePointerMove);
      dom.removeEventListener("pointerout", handlePointerOut);
      dom.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [camera, gl, size, hoveredId, setSelected, setTooltip]);

  return (
    <group>
      {/* Axes lines */}
      <axesHelper args={[12]} position={[0, 0, 0]} />

      {/* Fancy axis labels */}
      <Text
        position={[11.5, 0.3, 0]}
        fontSize={0.7}
        color="#79a1ffff"
        outlineColor="#003366"
        outlineWidth={0.02}
        anchorX="center"
        anchorY="middle"
      >
        Rizz →
      </Text>
      <Text
        position={[0, 11.5, 0]}
        rotation={[0, 0, Math.PI / 2]}
        fontSize={0.7}
        color="#79a1ffff"
        outlineColor="#003366"
        outlineWidth={0.02}
        anchorX="center"
        anchorY="middle"
      >
        Tizz →
      </Text>
      <Text
        position={[0, 0.3, 11.5]}
        rotation={[-Math.PI / 2, Math.PI / 2, Math.PI / 2]}
        fontSize={0.7}
        color="#79a1ffff"
        outlineColor="#003366"
        outlineWidth={0.02}
        anchorX="center"
        anchorY="middle"
      >
        ← Freak
      </Text>

      {/* Grids for visual depth */}
      <gridHelper args={[12, 12, "#888888", "#222222"]} rotation={[Math.PI / 2, 0, 0]} position={[6, 6, 0]} />
      <gridHelper args={[12, 12, "#666666", "#111111"]} position={[6, 0, 6]} />
      <gridHelper args={[12, 12, "#666666", "#111111"]} rotation={[0, 0, Math.PI / 2]} position={[0, 6, 6]} />

      <Suspense fallback={null}>
        {data.map((m) => {
          const x = normalizeToRange(m.rizz);
          const y = normalizeToRange(m.tizz);
          const z = normalizeToRange(m.freak);
          return (
            <Marker
              key={m.id}
              id={m.id}
              position={[x, y, z]}
              person={m}
              isSelected={selected?.id === m.id}
              isHovered={hoveredId === m.id}
            />
          );
        })}
      </Suspense>
    </group>
  );
}
