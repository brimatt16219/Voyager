import { useState } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { useGeolocation } from "../hooks/useGeolocation";
import { useStoreSearch } from "../hooks/useStoreSearch";
import { useRouteOptimizer } from "../hooks/useRouteOptimizer";
import Map from "../components/Map";

export default function AppPage() {
  useGeolocation();
  useRouteOptimizer();

  const userPos      = useVoyagerStore((s) => s.userPos);
  const stores       = useVoyagerStore((s) => s.stores);
  const routeOrder   = useVoyagerStore((s) => s.routeOrder);
  const isSearching  = useVoyagerStore((s) => s.isSearching);
  const isOptimizing = useVoyagerStore((s) => s.isOptimizing);
  const error        = useVoyagerStore((s) => s.error);

  const searchMutation = useStoreSearch();

  const [storeInput, setStoreInput]   = useState("");
  const [radiusMiles, setRadiusMiles] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPos) return;
    const chains = storeInput.split(",").map(s => s.trim()).filter(Boolean);
    if (!chains.length || radiusMiles <= 0) return;
    searchMutation.mutate({ lat: userPos.lat, lng: userPos.lng, chains, radiusMiles });
  }

  const isBusy = isSearching || isOptimizing;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0a0a0f" }}>

      {/* Map — fills entire screen */}
      {userPos
        ? <div style={{ position: "absolute", inset: 0 }}>
            <Map stores={stores} userPos={userPos} routeOrder={routeOrder} />
          </div>
        : <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Mono', monospace", color: "#3a3a50", fontSize: 13,
            letterSpacing: "0.1em",
          }}>
            ACQUIRING POSITION…
          </div>
      }

      {/* Floating search panel — top left */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        width: 300,
        background: "rgba(10,10,20,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(124,106,255,0.25)",
        borderRadius: 12,
        padding: "20px 20px 16px",
        zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.5)" strokeWidth="2" />
            <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
            <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
            <circle cx="40" cy="40" r="3" fill="white" />
          </svg>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#e8e6ff",
          }}>VOYAGER</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Stores input */}
          <div style={{ marginBottom: 12 }}>
            <label style={{
              display: "block",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "#6b6a80",
              marginBottom: 6,
              textTransform: "uppercase",
            }}>
              Destinations
            </label>
            <input
              type="text"
              value={storeInput}
              onChange={e => setStoreInput(e.target.value)}
              placeholder="Target, Walmart, Costco"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,106,255,0.2)",
                borderRadius: 6,
                padding: "9px 12px",
                color: "#e8e6ff",
                fontSize: 13,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(124,106,255,0.6)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(124,106,255,0.2)")}
            />
          </div>

          {/* Radius input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: "block",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
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
              onChange={e => setRadiusMiles(Number(e.target.value))}
              style={{
                width: 100,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(124,106,255,0.2)",
                borderRadius: 6,
                padding: "9px 12px",
                color: "#e8e6ff",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isBusy || !userPos}
            style={{
              width: "100%",
              padding: "10px",
              background: isBusy
                ? "rgba(124,106,255,0.2)"
                : "linear-gradient(135deg, #7c6aff, #00e5c8)",
              border: "none",
              borderRadius: 6,
              color: isBusy ? "#6b6a80" : "#0a0a0f",
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: isBusy ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isSearching ? "SCANNING…" : isOptimizing ? "ROUTING…" : "PLOT ROUTE"}
          </button>
        </form>

        {/* Status line */}
        <div style={{
          marginTop: 12,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: error ? "#ff4d6d" : "#3a3a50",
          letterSpacing: "0.08em",
          minHeight: 14,
        }}>
          {error
            ? `ERR: ${error}`
            : stores.length
            ? `${stores.length} LOCATION${stores.length > 1 ? "S" : ""} FOUND — ${routeOrder.length ? "ROUTE READY" : "OPTIMIZING…"}`
            : userPos
            ? "READY"
            : "ACQUIRING GPS…"
          }
        </div>
      </div>
    </div>
  );
}