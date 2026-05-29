import { useState } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { useGeolocation } from "../hooks/useGeolocation";
import { useStoreSearch } from "../hooks/useStoreSearch";
import { useRouteOptimizer } from "../hooks/useRouteOptimizer";
import { useAuth } from "../context/AuthContext";
import ChainPicker from "../components/ChainPicker";
import RouteFlowChart from "../components/FlowChart";
import Map from "../components/Map";

export default function AppPage() {
  useGeolocation();
  useRouteOptimizer();

  const userPos         = useVoyagerStore((s) => s.userPos);
  const stores          = useVoyagerStore((s) => s.stores);
  const routeOrder      = useVoyagerStore((s) => s.routeOrder);
  const chains          = useVoyagerStore((s) => s.searchParams.chains);
  const isSearching     = useVoyagerStore((s) => s.isSearching);
  const isOptimizing    = useVoyagerStore((s) => s.isOptimizing);
  const error           = useVoyagerStore((s) => s.error);
  const setSearchParams = useVoyagerStore((s) => s.setSearchParams);

  const searchMutation  = useStoreSearch();
  const { user, signOut } = useAuth();

  const [radiusMiles, setRadiusMiles] = useState(1);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPos || !chains.length || radiusMiles <= 0) return;
    setDirectionsResult(null);
    searchMutation.mutate({ lat: userPos.lat, lng: userPos.lng, chains, radiusMiles });
    setSearchParams({ radiusMiles });
  }

  const isBusy     = isSearching || isOptimizing;
  const hasRoute   = routeOrder.length > 0;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0a0a0f", overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: 300,
        flexShrink: 0,
        height: "100%",
        background: "rgba(10,10,20,0.97)",
        borderRight: "1px solid rgba(124,106,255,0.12)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 18px",
        overflowY: "auto",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <svg width="20" height="20" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.5)" strokeWidth="2" />
            <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
            <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
            <circle cx="40" cy="40" r="3" fill="white" />
          </svg>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#e8e6ff",
          }}>
            VOYAGER
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Chain picker */}
          <ChainPicker />

          {/* Radius */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block",
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#6b6a80",
              marginBottom: 6,
              textTransform: "uppercase",
            }}>
              Radius (miles)
            </label>
            <input
              type="number"
              value={radiusMiles}
              min={0.1}
              step={0.1}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              style={{
                width: 90,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,106,255,0.2)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "#e8e6ff",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Space Mono', monospace",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isBusy || !userPos || chains.length === 0}
            style={{
              width: "100%",
              padding: "11px",
              background: isBusy || chains.length === 0
                ? "rgba(124,106,255,0.1)"
                : "linear-gradient(135deg, #7c6aff, #00e5c8)",
              border: "1px solid",
              borderColor: isBusy || chains.length === 0
                ? "rgba(124,106,255,0.15)"
                : "transparent",
              borderRadius: 8,
              color: isBusy || chains.length === 0 ? "#6b6a80" : "#0a0a0f",
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: isBusy || chains.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginBottom: 12,
            }}
          >
            {isSearching ? "SCANNING…" : isOptimizing ? "ROUTING…" : "PLOT ROUTE"}
          </button>

          {/* Status */}
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: error ? "#ff4d6d" : "#3a3a50",
            letterSpacing: "0.07em",
            minHeight: 14,
            lineHeight: 1.5,
          }}>
            {error
              ? `ERR: ${error}`
              : stores.length
              ? `${stores.length} location${stores.length > 1 ? "s" : ""} found`
              : userPos
              ? "Ready"
              : "Acquiring GPS…"
            }
          </div>
        </form>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User section */}
        {user && (
          <div style={{
            borderTop: "1px solid rgba(124,106,255,0.1)",
            paddingTop: 16,
            marginTop: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    border: "1px solid rgba(124,106,255,0.3)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: "#c8c6e8",
                  letterSpacing: "0.05em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: 2,
                }}>
                  {user.displayName}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  color: "#3a3a50",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "1px solid rgba(124,106,255,0.15)",
                  borderRadius: 6,
                  color: "#6b6a80",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  padding: "5px 8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,77,109,0.4)";
                  e.currentTarget.style.color = "#ff4d6d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(124,106,255,0.15)";
                  e.currentTarget.style.color = "#6b6a80";
                }}
              >
                OUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MAP ── */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {userPos
          ? <Map
              stores={stores}
              userPos={userPos}
              routeOrder={routeOrder}
              onDirections={setDirectionsResult}
            />
          : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Space Mono', monospace", color: "#3a3a50",
              fontSize: 12, letterSpacing: "0.1em",
            }}>
              ACQUIRING POSITION…
            </div>
          )
        }
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div style={{
        width: 300,
        flexShrink: 0,
        height: "100%",
        background: "rgba(10,10,20,0.97)",
        borderLeft: "1px solid rgba(124,106,255,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10,
      }}>
        {hasRoute
          ? (
            <RouteFlowChart
              routeStops={routeOrder}
              directions={directionsResult}
              stores={stores}
            />
          )
          : (
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 24,
            }}>
              <svg width="36" height="36" viewBox="0 0 80 80" opacity={0.2}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="#7c6aff" strokeWidth="2" />
                <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
                <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
                <circle cx="40" cy="40" r="3" fill="white" />
              </svg>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: "#3a3a50",
                letterSpacing: "0.1em",
                textAlign: "center",
                lineHeight: 1.8,
                textTransform: "uppercase",
              }}>
                Plot a route to see your voyage
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}