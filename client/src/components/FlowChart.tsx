import { useState, useMemo } from "react";
import type { RouteStop, Store } from "../types";

interface Props {
  routeStops: RouteStop[];
  directions: google.maps.DirectionsResult | null;
  stores: Store[];
}

const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

export default function RouteFlowChart({ routeStops, directions, stores }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  const legs = useMemo(() => directions?.routes[0]?.legs ?? [], [directions]);
  const getStore = (placeId: string) => stores.find((s) => s.place_id === placeId);

  const totalDuration = legs.reduce((acc, l) => acc + (l.duration?.value ?? 0), 0);
  const totalDistance = legs.reduce((acc, l) => acc + (l.distance?.value ?? 0), 0);

  function fmtDuration(secs: number) {
    const mins = Math.round(secs / 60);
    return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
  }

  function fmtDistance(meters: number) {
    return `${(meters / 1609.34).toFixed(1)} mi`;
  }

  // Dot shared style
  const dot = (color: string, border: string): React.CSSProperties => ({
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    background: color, border,
    display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 18px 12px",
        borderBottom: "1px solid rgba(124,106,255,0.1)",
        flexShrink: 0,
      }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", color: "#6b6a80", marginBottom: 8, textTransform: "uppercase" }}>
          Optimized Route
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div>
            <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: "#e8e6ff" }}>{routeStops.length}</div>
            <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.08em" }}>STOPS</div>
          </div>
          {totalDuration > 0 && (<>
            <div style={{ width: 1, background: "rgba(124,106,255,0.15)" }} />
            <div>
              <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: "#7c6aff" }}>{fmtDuration(totalDuration)}</div>
              <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.08em" }}>TOTAL</div>
            </div>
            <div style={{ width: 1, background: "rgba(124,106,255,0.15)" }} />
            <div>
              <div style={{ ...mono, fontSize: 18, fontWeight: 700, color: "#00e5c8" }}>{fmtDistance(totalDistance)}</div>
              <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.08em" }}>DISTANCE</div>
            </div>
          </>)}
        </div>
      </div>

      {/* ── Scrollable list ── */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 16px 16px 14px" }}>

        {/* YOU node */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 0 }}>
          <div style={dot("linear-gradient(135deg,#00e5c8,#7c6aff)", "none")}>
            <span style={{ ...mono, fontSize: 8, fontWeight: 700, color: "#0a0a0f", letterSpacing: "0.04em" }}>YOU</span>
          </div>
          <span style={{ ...mono, fontSize: 11, color: "#6b6a80" }}>Starting point</span>
        </div>

        {routeStops.map((stop, i) => {
          const store  = getStore(stop.place_id);
          const leg    = legs[i];
          const isOpen = selected === i;

          return (
            <div key={stop.place_id}>

              {/*
                ── Connector row ──
                Left column:  a thin vertical line (flex:1 fills the space between badges)
                Right column: travel time label
              */}
              <div style={{ display: "flex", gap: 10 }}>
                {/* Line lives in its own column, centered under the badge above */}
                <div style={{
                  width: 32, flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    background: "rgba(124,106,255,0.3)",
                  }} />
                </div>

                {/* Travel time label */}
                {leg && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <span style={{ ...mono, fontSize: 10, color: "#8b8aa0", whiteSpace: "nowrap" }}>{leg.duration?.text}</span>
                    <span style={{ ...mono, fontSize: 10, color: "#3a3a50" }}>·</span>
                    <span style={{ ...mono, fontSize: 10, color: "#8b8aa0", whiteSpace: "nowrap" }}>{leg.distance?.text}</span>
                  </div>
                )}
              </div>

              {/* ── Stop row: [badge+line] [card] ── */}
              <div style={{ display: "flex", gap: 10, minWidth: 0 }}>

                {/* Left column: badge on top, line below fills height of card */}
                <div style={{
                  width: 32, flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  {/* Badge */}
                  <div
                    onClick={() => setSelected(isOpen ? null : i)}
                    style={{
                      ...dot(
                        isOpen ? "linear-gradient(135deg,rgba(124,106,255,0.4),rgba(0,229,200,0.2))" : "rgba(124,106,255,0.12)",
                        isOpen ? "1px solid rgba(124,106,255,0.7)" : "1px solid rgba(124,106,255,0.25)"
                      ),
                      cursor: "pointer",
                      fontSize: 12, fontWeight: 700,
                      color: isOpen ? "#e8e6ff" : "#7c6aff",
                      ...mono, transition: "all 0.2s",
                    }}
                  >
                    {i + 1}
                  </div>
                  {/* Line below badge — fills remaining column height so it meets the next connector */}
                  <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 8,
                    background: "rgba(124,106,255,0.3)",
                  }} />
                </div>

                {/* Right column: card */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
                  <button
                    onClick={() => setSelected(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      background: isOpen ? "rgba(124,106,255,0.1)" : "rgba(255,255,255,0.04)",
                      border: isOpen ? "1px solid rgba(124,106,255,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "block",
                    }}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(124,106,255,0.07)"; }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  >
                    <div style={{ ...mono, fontSize: 10, color: "#7c6aff", letterSpacing: "0.1em", marginBottom: 3 }}>
                      STOP {i + 1}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e6ff", lineHeight: 1.3, marginBottom: 4, wordBreak: "break-word" }}>
                      {store?.name ?? "Unknown"}
                    </div>
                    <div style={{ ...mono, fontSize: 10, color: "#6b6a80" }}>
                      🕐 {new Date(stop.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {store?.address && (
                      <div style={{ ...mono, fontSize: 10, color: "#3a3a50", marginTop: 2, wordBreak: "break-word" }}>
                        {store.address}
                      </div>
                    )}
                  </button>

                  {/* Expanded directions */}
                  {isOpen && leg && (
                    <div style={{
                      marginTop: 4,
                      padding: "12px 14px",
                      background: "rgba(10,10,20,0.6)",
                      border: "1px solid rgba(124,106,255,0.15)",
                      borderRadius: 8,
                    }}>
                      <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
                        Turn-by-turn
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {leg.steps.map((step, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                              background: "rgba(124,106,255,0.15)",
                              border: "1px solid rgba(124,106,255,0.25)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, color: "#a89aff", ...mono,
                            }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{ fontSize: 12, color: "#c8c6e0", lineHeight: 1.6, wordBreak: "break-word" }}
                                dangerouslySetInnerHTML={{ __html: step.instructions }}
                              />
                              <div style={{ ...mono, fontSize: 10, color: "#3a3a50", marginTop: 2 }}>
                                {step.distance?.text} · {step.duration?.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* End connector */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ width: 32, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 2, minHeight: 20, background: "rgba(255,77,109,0.3)" }} />
          </div>
        </div>

        {/* END node */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={dot("rgba(255,77,109,0.12)", "1px solid rgba(255,77,109,0.4)")}>
            <span style={{ ...mono, fontSize: 8, fontWeight: 700, color: "#ff4d6d", letterSpacing: "0.04em" }}>END</span>
          </div>
          <span style={{ ...mono, fontSize: 11, color: "#6b6a80" }}>Voyage complete</span>
        </div>

      </div>
    </div>
  );
}
