// src/SearchBar.jsx
import React, { useMemo, useState, useEffect } from "react";

export default function SearchBar({ data = [], onSelect, placeholder = "Search name..." }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const normalized = useMemo(() => q.trim().toLowerCase(), [q]);

  const matches = useMemo(() => {
    if (!normalized) return [];
    return data
      .map((m) => ({ m, name: (m.name || "").toLowerCase() }))
      .map(({ m, name }) => {
        const idx = name.indexOf(normalized);
        return { m, idx, score: idx === -1 ? 9999 : idx + name.length / 1000 };
      })
      .filter((x) => x.idx !== 9999)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.m);
  }, [data, normalized]);

  useEffect(() => {
    setOpen(Boolean(normalized && matches.length > 0));
  }, [normalized, matches.length]);

  function handlePick(m) {
    setQ(m.name);
    setOpen(false);
    onSelect?.(m);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (matches[0]) handlePick(matches[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(Boolean(normalized && matches.length > 0))}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
          color: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
        aria-label="Search members"
      />

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            maxHeight: 220,
            overflow: "auto",
            background: "linear-gradient(180deg, rgba(5,10,18,0.98), rgba(10,18,30,0.98))",
            borderRadius: 8,
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            zIndex: 1500,
            padding: 8,
          }}
        >
          {matches.slice(0, 10).map((m) => (
            <div
              key={m.id}
              role="option"
              onClick={() => handlePick(m)}
              style={{
                display: "flex",
                gap: 8,
                padding: "8px",
                alignItems: "center",
                cursor: "pointer",
                borderRadius: 6,
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <img
                src={m.photo}
                alt={m.name}
                style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  r:{m.rizz} t:{m.tizz} f:{m.freak}
                </div>
              </div>
            </div>
          ))}

          {matches.length === 0 && <div style={{ padding: 8, color: "var(--muted)" }}>No matches</div>}
        </div>
      )}
    </div>
  );
}
