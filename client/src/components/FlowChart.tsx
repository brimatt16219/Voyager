import { useState, useMemo } from "react";
import type { RouteStop, Store } from "../types";

interface Props {
  routeStops: RouteStop[];
  directions: google.maps.DirectionsResult | null;
  stores: Store[];
}

export default function RouteFlowChart({ routeStops, directions, stores }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const legs = useMemo(
    () => directions?.routes[0]?.legs ?? [],
    [directions]
  );

  const getStore = (placeId: string) =>
    stores.find(s => s.place_id === placeId);

  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>

      {/* Horizontal timeline */}
      <div style={{ flex: 1, padding: "14px 16px", overflowX: "auto", overflowY: "hidden" }}>
        <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", color: "#3a3a50", marginBottom: 10, textTransform: "uppercase" }}>
          Optimized Route
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>

          {/* Start node */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginRight: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5c8, #7c6aff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#0a0a0f", ...mono, letterSpacing: "0.05em",
            }}>YOU</div>
          </div>

          {/* Stops */}
          {routeStops.map((stop, i) => {
            const store = getStore(stop.place_id);
            const leg   = legs[i];
            const isSelected = selected === i;

            return (
              <div key={stop.place_id} style={{ display: "flex", alignItems: "center" }}>
                {/* Connector with travel time */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px" }}>
                  <div style={{ ...mono, fontSize: 9, color: "#3a3a50", marginBottom: 3, whiteSpace: "nowrap" }}>
                    {leg ? leg.duration?.text : "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <div style={{ width: 24, height: 1, background: "rgba(124,106,255,0.35)" }} />
                    <div style={{ width: 4, height: 4, borderTop: "1px solid rgba(124,106,255,0.5)", borderRight: "1px solid rgba(124,106,255,0.5)", transform: "rotate(45deg)" }} />
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "#3a3a50", marginTop: 3, whiteSpace: "nowrap" }}>
                    {leg ? leg.distance?.text : "—"}
                  </div>
                </div>

                {/* Stop card */}
                <button
                  onClick={() => setSelected(isSelected ? null : i)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(124,106,255,0.25), rgba(0,229,200,0.15))"
                      : "rgba(255,255,255,0.05)",
                    border: isSelected
                      ? "1px solid rgba(124,106,255,0.6)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    minWidth: 120,
                    maxWidth: 150,
                  }}
                >
                  <div style={{ ...mono, fontSize: 9, color: "#7c6aff", letterSpacing: "0.08em", marginBottom: 3 }}>
                    STOP {i + 1}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#e8e6ff", lineHeight: 1.3 }}>
                    {store?.name ?? "Unknown"}
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "#3a3a50", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {new Date(stop.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
              </div>
            );
          })}

          {/* End node */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,77,109,0.2)",
              border: "1px solid rgba(255,77,109,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#ff4d6d", ...mono, letterSpacing: "0.05em",
            }}>END</div>
          </div>
        </div>
      </div>

      {/* Step-by-step panel — only shows when a stop is selected */}
      {selected !== null && legs[selected] && (() => {
        const store = getStore(routeStops[selected].place_id);
        return (
          <div style={{
            width: 240,
            borderLeft: "1px solid rgba(124,106,255,0.15)",
            overflowY: "auto",
            padding: "14px 14px",
            flexShrink: 0,
          }}>
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", color: "#7c6aff", marginBottom: 8, textTransform: "uppercase" }}>
              Stop {selected + 1} Directions
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#e8e6ff", marginBottom: 2 }}>
              {store?.name}
            </div>
            <div style={{ ...mono, fontSize: 9, color: "#3a3a50", marginBottom: 12 }}>
              {legs[selected].duration?.text} · {legs[selected].distance?.text}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {legs[selected].steps.map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "rgba(124,106,255,0.2)",
                    border: "1px solid rgba(124,106,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, color: "#7c6aff", flexShrink: 0, marginTop: 1, ...mono,
                  }}>{idx + 1}</div>
                  <div>
                    <div
                      style={{ fontSize: 11, color: "#b8b6d0", lineHeight: 1.5 }}
                      dangerouslySetInnerHTML={{ __html: step.instructions }}
                    />
                    <div style={{ ...mono, fontSize: 9, color: "#3a3a50", marginTop: 2 }}>
                      {step.distance?.text} · {step.duration?.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}