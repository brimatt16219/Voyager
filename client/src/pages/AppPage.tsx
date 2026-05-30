import { useState, useEffect } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { useGeolocation } from "../hooks/useGeolocation";
import { useStoreSearch } from "../hooks/useStoreSearch";
import { useRouteOptimizer } from "../hooks/useRouteOptimizer";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import ChainPicker from "../components/ChainPicker";
import RouteFlowChart from "../components/FlowChart";
import Map from "../components/Map";

// ── Shared logo SVG ──────────────────────────────────────────────
function Logo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.5)" strokeWidth="2" />
      <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
      <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
      <circle cx="40" cy="40" r="3" fill="white" />
    </svg>
  );
}

// ── Shared search form content ───────────────────────────────────
function SearchPanel({
  radiusMiles,
  setRadiusMiles,
  handleSubmit,
  isBusy,
  userPos,
  chains,
  stores,
  routeOrder,
  isSearching,
  isOptimizing,
  error,
}: {
  radiusMiles: number;
  setRadiusMiles: (v: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isBusy: boolean;
  userPos: { lat: number; lng: number } | null;
  chains: string[];
  stores: { name: string }[];
  routeOrder: unknown[];
  isSearching: boolean;
  isOptimizing: boolean;
  error: string | null;
}) {
  const mono = { fontFamily: "'Space Mono', monospace" } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <ChainPicker />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", ...mono, fontSize: 11, letterSpacing: "0.12em", color: "#6b6a80", marginBottom: 6, textTransform: "uppercase" }}>
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
            ...mono,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isBusy || !userPos || chains.length === 0}
        style={{
          width: "100%",
          padding: "12px",
          background: isBusy || chains.length === 0 ? "rgba(124,106,255,0.1)" : "linear-gradient(135deg,#7c6aff,#00e5c8)",
          border: "1px solid",
          borderColor: isBusy || chains.length === 0 ? "rgba(124,106,255,0.15)" : "transparent",
          borderRadius: 8,
          color: isBusy || chains.length === 0 ? "#6b6a80" : "#0a0a0f",
          ...mono,
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

      <div style={{ ...mono, fontSize: 11, color: error ? "#ff4d6d" : "#3a3a50", letterSpacing: "0.07em", minHeight: 14, lineHeight: 1.5 }}>
        {error
          ? `ERR: ${error}`
          : stores.length
          ? `${stores.length} location${stores.length > 1 ? "s" : ""} found${routeOrder.length ? " — route ready" : ""}`
          : userPos ? "Ready" : "Acquiring GPS…"
        }
      </div>
    </form>
  );
}

// ── User section ─────────────────────────────────────────────────
function UserSection({ user, signOut }: { user: { uid: string; photoURL?: string | null; displayName?: string | null; email?: string | null }; signOut: () => void }) {
  const navigate = useNavigate();
  const mono = { fontFamily: "'Space Mono', monospace" } as React.CSSProperties;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {user.photoURL && (
        <img src={user.photoURL} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(124,106,255,0.3)", flexShrink: 0 }} />
      )}
      <div onClick={() => navigate(`/profile/${user.uid}`)} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...mono, fontSize: 11, color: "#c8c6e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.displayName}
        </div>
        <div style={{ ...mono, fontSize: 10, color: "#3a3a50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.email}
        </div>
      </div>
      <button
        onClick={signOut}
        style={{ background: "none", border: "1px solid rgba(124,106,255,0.15)", borderRadius: 6, color: "#6b6a80", ...mono, fontSize: 10, letterSpacing: "0.08em", padding: "5px 8px", cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,77,109,0.4)"; e.currentTarget.style.color = "#ff4d6d"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(124,106,255,0.15)"; e.currentTarget.style.color = "#6b6a80"; }}
      >
        OUT
      </button>
    </div>
  );
}

// ── Empty route placeholder ──────────────────────────────────────
function RoutePlaceholder() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
      <svg width="36" height="36" viewBox="0 0 80 80" opacity={0.2}>
        <circle cx="40" cy="40" r="36" fill="none" stroke="#7c6aff" strokeWidth="2" />
        <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
        <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
        <circle cx="40" cy="40" r="3" fill="white" />
      </svg>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#3a3a50", letterSpacing: "0.1em", textAlign: "center", lineHeight: 1.8, textTransform: "uppercase" }}>
        Plot a route to see your voyage
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
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

  const searchMutation    = useStoreSearch();
  const { user, signOut } = useAuth();
  const isMobile          = useIsMobile();

  const [radiusMiles, setRadiusMiles]       = useState(1);
  const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
  const [mobileTab, setMobileTab]           = useState<"search" | "map" | "route">("search");

  const isBusy   = isSearching || isOptimizing;
  const hasRoute = routeOrder.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPos || !chains.length || radiusMiles <= 0) return;
    setDirectionsResult(null);
    searchMutation.mutate({ lat: userPos.lat, lng: userPos.lng, chains, radiusMiles });
    setSearchParams({ radiusMiles });
    if (isMobile) setMobileTab("map");
  }

  // Auto-switch to route tab on mobile when route is ready
  useEffect(() => {
    if (isMobile && hasRoute) setMobileTab("route");
  }, [hasRoute, isMobile]);

  // Google Maps needs a resize event when its container becomes visible
  useEffect(() => {
    if (mobileTab === "map") {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    }
  }, [mobileTab]);

  const mono = { fontFamily: "'Space Mono', monospace" } as React.CSSProperties;

  const sharedFormProps = { radiusMiles, setRadiusMiles, handleSubmit, isBusy, userPos, chains, stores, routeOrder, isSearching, isOptimizing, error };

  // ── MOBILE LAYOUT ─────────────────────────────────────────────
  if (isMobile) {
    const TAB_BAR_H = 64;
    const HEADER_H  = 52;

    return (
      <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          height: HEADER_H,
          flexShrink: 0,
          background: "rgba(10,10,20,0.97)",
          borderBottom: "1px solid rgba(124,106,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={18} />
            <span style={{ ...mono, fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: "#e8e6ff" }}>VOYAGER</span>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.photoURL && (
                <img src={user.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(124,106,255,0.3)" }} />
              )}
              <button
                onClick={signOut}
                style={{ background: "none", border: "1px solid rgba(124,106,255,0.15)", borderRadius: 6, color: "#6b6a80", ...mono, fontSize: 10, padding: "4px 8px", cursor: "pointer" }}
              >
                OUT
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

          {/* Map — always mounted so Google Maps doesn't reload */}
          <div style={{
            position: "absolute", inset: 0,
            zIndex: mobileTab === "map" ? 2 : 1,
            visibility: mobileTab === "map" ? "visible" : "hidden",
          }}>
            {userPos
              ? <Map stores={stores} userPos={userPos} routeOrder={routeOrder} onDirections={setDirectionsResult} />
              : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...mono, color: "#3a3a50", fontSize: 12, letterSpacing: "0.1em" }}>
                  ACQUIRING POSITION…
                </div>
              )
            }
          </div>

          {/* Search panel */}
          {mobileTab === "search" && (
            <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "#0a0a0f", overflowY: "auto", padding: "20px 16px" }}>
              <SearchPanel {...sharedFormProps} />
            </div>
          )}

          {/* Route panel */}
          {mobileTab === "route" && (
            <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "#0a0a0f", overflowY: "auto" }}>
              {hasRoute
                ? <RouteFlowChart routeStops={routeOrder} directions={directionsResult} stores={stores} />
                : <RoutePlaceholder />
              }
            </div>
          )}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          height: TAB_BAR_H,
          flexShrink: 0,
          background: "rgba(10,10,20,0.97)",
          borderTop: "1px solid rgba(124,106,255,0.12)",
          display: "flex",
          alignItems: "stretch",
          zIndex: 20,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {(["search", "map", "route"] as const).map((tab) => {
            const labels = { search: "SEARCH", map: "MAP", route: "ROUTE" };
            const icons  = {
              search: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ),
              map: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              ),
              route: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" />
                  <path d="M12 19H6.5a3.5 3.5 0 0 1 0-7h11a3.5 3.5 0 0 0 0-7H12" />
                </svg>
              ),
            };
            const isActive = mobileTab === tab;
            const showDot  = tab === "route" && hasRoute && !isActive;

            return (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "#7c6aff" : "#3a3a50",
                  transition: "color 0.2s",
                  position: "relative",
                  padding: 0,
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: 2, background: "linear-gradient(90deg,#7c6aff,#00e5c8)", borderRadius: "0 0 2px 2px" }} />
                )}
                {/* New route notification dot */}
                {showDot && (
                  <div style={{ position: "absolute", top: 10, right: "28%", width: 6, height: 6, borderRadius: "50%", background: "#00e5c8" }} />
                )}
                {icons[tab]}
                <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em" }}>{labels[tab]}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0a0a0f", overflow: "hidden" }}>

      {/* Left sidebar */}
      <div style={{ width: 300, flexShrink: 0, height: "100%", background: "rgba(10,10,20,0.97)", borderRight: "1px solid rgba(124,106,255,0.12)", display: "flex", flexDirection: "column", padding: "24px 18px", overflowY: "auto", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <Logo size={20} />
          <span style={{ ...mono, fontSize: 15, fontWeight: 700, letterSpacing: "0.14em", color: "#e8e6ff" }}>VOYAGER</span>
        </div>

        <SearchPanel {...sharedFormProps} />

        <div style={{ flex: 1 }} />

        {user && (
          <div style={{ borderTop: "1px solid rgba(124,106,255,0.1)", paddingTop: 16, marginTop: 16 }}>
            <UserSection user={user} signOut={signOut} />
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        {userPos
          ? <Map stores={stores} userPos={userPos} routeOrder={routeOrder} onDirections={setDirectionsResult} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...mono, color: "#3a3a50", fontSize: 12, letterSpacing: "0.1em" }}>
              ACQUIRING POSITION…
            </div>
          )
        }
      </div>

      {/* Right sidebar */}
      <div style={{ width: 300, flexShrink: 0, height: "100%", background: "rgba(10,10,20,0.97)", borderLeft: "1px solid rgba(124,106,255,0.12)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10 }}>
        {hasRoute
          ? <RouteFlowChart routeStops={routeOrder} directions={directionsResult} stores={stores} />
          : <RoutePlaceholder />
        }
      </div>
    </div>
  );
}
