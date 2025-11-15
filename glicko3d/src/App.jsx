// src/App.jsx
import React, { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Scene from "./Scene";
import fetchAllRatings from "./fetchRatings";
import localData from "./data";
import SearchBar from "./SearchBar";
import "./index.css";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, item: null });

  // small signaling prop — when we want Scene to focus camera on a member we set this id
  const [focusId, setFocusId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchAllRatings();
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) setData(rows);
        else setData(localData);
      } catch (err) {
        console.error("Failed to fetch ratings, using fallback data:", err);
        setData(localData);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function handleSelectFromUI(member) {
    setSelected(member);
    if (member?.id) {
      // request Scene to focus this id
      setFocusId(member.id);
      // clear focusId after short delay so repeated same-id clicks still work
      setTimeout(() => setFocusId(null), 600);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h2 style={{ margin: 0 }}>Cube RTF Scores</h2>
        <div style={{ marginLeft: "auto", color: "var(--muted)" }}>
          {loading ? "Loading…" : `${data.length} members`}
        </div>
      </div>

      <div className="canvas-wrap" style={{ gridColumn: "1 / 2", position: "relative" }}>
        <Canvas camera={{ position: [12, 12, 18], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 10]} intensity={0.8} />

          <Suspense fallback={null}>
            <Scene
              data={data}
              selected={selected}
              setSelected={setSelected}
              setTooltip={setTooltip}
              focusId={focusId}
            />
          </Suspense>

          <OrbitControls
            enableDamping={false}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.0}
            minDistance={5}
            maxDistance={40}
            target={[6, 6, 6]}
            makeDefault
          />
        </Canvas>

        {tooltip.visible && tooltip.item && (
          <div
            className="tooltip tooltip-overlay"
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -120%)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <img src={tooltip.item.photo} alt={tooltip.item.name} />
            <div className="info">
              <strong>{tooltip.item.name}</strong>
              <div style={{ fontSize: 12 }}>Rizz: {tooltip.item.rizz}</div>
              <div style={{ fontSize: 12 }}>Tizz: {tooltip.item.tizz}</div>
              <div style={{ fontSize: 12 }}>Freak: {tooltip.item.freak}</div>
            </div>
          </div>
        )}
      </div>

      <aside className="sidepanel">
        <div style={{ marginBottom: 12 }}>
          <SearchBar
            data={data}
            onSelect={(m) => handleSelectFromUI(m)}
            placeholder="Search members by name..."
          />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 64, height: 64 }}>
            {selected ? (
              <img
                src={selected.photo}
                alt={selected.name}
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
              />
            ) : (
              <div style={{ width: 64, height: 64, background: "#1b2736", borderRadius: 8 }} />
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{selected ? selected.name : "No selection"}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Click a dot to inspect</div>
          </div>
        </div>

        <hr style={{ border: "none", height: 1, background: "rgba(255,255,255,0.04)", margin: "12px 0" }} />

        <div style={{ fontSize: 13 }}>
          <strong>Quick list</strong>
          <ul style={{ paddingLeft: 16 }}>
            {data.slice(0, 8).map((m) => (
              <li
                key={m.id}
                style={{ margin: "6px 0", cursor: "pointer" }}
                onClick={() => handleSelectFromUI(m)}
              >
                {m.name} — r:{m.rizz} t:{m.tizz} f:{m.freak}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 12 }}>
          Sources: local sample or Supabase. If Supabase is misconfigured you'll see fallback values in the console.
        </div>
      </aside>
    </div>
  );
}
