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
    <div style={{ display: "flex", height: "100%", minHeight: 0, overflow: "hidden" }}>

      {/* Horizontal timeline */}
      <div style={{ flex: 1, padding: "14px 16px", overflowX: "auto", overflowY: "hidden" }}>
        <div style={{
          ...mono,
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "#6b6a80",
          marginBottom: 12,
          textTransform: "uppercase",
        }}>
          Optimized Route
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>

          {/* Start node */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginRight: 6 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, #00e5c8, #7c6aff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#0a0a0f", ...mono, letterSpacing: "0.05em",
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 8px" }}>
                  <div style={{ ...mono, fontSize: 11, color: "#8b8aa0", marginBottom: 4, whiteSpace: "nowrap" }}>
                    {leg ? leg.duration?.text : "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <div style={{ width: 28, height: 1, background: "rgba(124,106,255,0.4)" }} />
                    <div style={{
                      width: 5, height: 5,
                      borderTop: "1.5px solid rgba(124,106,255,0.6)",
                      borderRight: "1.5px solid rgba(124,106,255,0.6)",
                      transform: "rotate(45deg)",
                    }} />
                  </div>
                  <div style={{ ...mono, fontSize: 11, color: "#8b8aa0", marginTop: 4, whiteSpace: "nowrap" }}>
                    {leg ? leg.distance?.text : "—"}
                  </div>
                </div>

                {/* Stop card */}
                <button
                  onClick={() => setSelected(isSelected ? null : i)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(124,106,255,0.3), rgba(0,229,200,0.15))"
                      : "rgba(255,255,255,0.06)",
                    border: isSelected
                      ? "1px solid rgba(124,106,255,0.7)"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    minWidth: 130,
                    maxWidth: 160,
                  }}
                >
                  <div style={{ ...mono, fontSize: 11, color: "#a89aff", letterSpacing: "0.08em", marginBottom: 4 }}>
                    STOP {i + 1}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e6ff", lineHeight: 1.3 }}>
                    {store?.name ?? "Unknown"}
                  </div>
                  <div style={{ ...mono, fontSize: 11, color: "#6b6a80", marginTop: 4 }}>
                    {new Date(stop.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </button>
              </div>
            );
          })}

          {/* End node */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 6 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(255,77,109,0.2)",
              border: "1px solid rgba(255,77,109,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#ff4d6d", ...mono, letterSpacing: "0.05em",
            }}>END</div>
          </div>
        </div>
      </div>

      {/* Step-by-step panel — only shows when a stop is selected */}
      {selected !== null && legs[selected] && (() => {
        const store = getStore(routeStops[selected].place_id);
        return (
          <div style={{
            width: 320,
            borderLeft: "1px solid rgba(124,106,255,0.15)",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 18px",
            flexShrink: 0,
            maxHeight: "55vh",
          }}>
            {/* Panel header */}
            <div style={{ ...mono, fontSize: 11, letterSpacing: "0.14em", color: "#a89aff", marginBottom: 10, textTransform: "uppercase" }}>
              Stop {selected + 1} Directions
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#e8e6ff", marginBottom: 3 }}>
              {store?.name}
            </div>
            <div style={{ ...mono, fontSize: 11, color: "#6b6a80", marginBottom: 14 }}>
              {legs[selected].duration?.text} · {legs[selected].distance?.text}
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {legs[selected].steps.map((step, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {/* Step number */}
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "rgba(124,106,255,0.2)",
                    border: "1px solid rgba(124,106,255,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#a89aff", flexShrink: 0, marginTop: 2, ...mono,
                  }}>{idx + 1}</div>

                  {/* Instruction + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c8c6e0",
                        lineHeight: 1.6,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                      dangerouslySetInnerHTML={{ __html: step.instructions }}
                    />
                    <div style={{ ...mono, fontSize: 11, color: "#6b6a80", marginTop: 4 }}>
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
