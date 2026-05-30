import type { CSSProperties } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/voyager";
import { useAuth } from "../context/AuthContext";

const mono: CSSProperties = { fontFamily: "'Space Mono', monospace" };

function fmtDistance(meters: number) {
  return `${(meters / 1609.34).toFixed(1)} mi`;
}
function fmtDuration(secs: number) {
  const mins = Math.round(secs / 60);
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;
}
function fmtDate(seconds: number) {
  return new Date(seconds * 1000).toLocaleDateString([], {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 12, letterSpacing: "0.14em", color: "#3a3a50" }}>
      LOADING…
    </div>
  );

  if (isError || !data) return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 12, letterSpacing: "0.14em", color: "#ff4d6d" }}>
      PROFILE NOT FOUND
    </div>
  );

  const { user, voyages } = data;
  const isOwnProfile = authUser?.uid === userId;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e6ff" }}>

      {/* Header bar */}
      <div style={{
        height: 56, background: "rgba(10,10,20,0.97)",
        borderBottom: "1px solid rgba(124,106,255,0.12)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
      }}>
        <button
          onClick={() => navigate("/app")}
          style={{ background: "none", border: "none", color: "#7c6aff", ...mono, fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          ← BACK TO APP
        </button>
        {isOwnProfile && (
          <span style={{ ...mono, fontSize: 10, color: "#3a3a50", letterSpacing: "0.08em" }}>YOUR PROFILE</span>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>

        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid rgba(124,106,255,0.4)" }} />
          )}
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#e8e6ff", marginBottom: 4 }}>{user.displayName}</div>
            <div style={{ ...mono, fontSize: 11, color: "#3a3a50", letterSpacing: "0.08em" }}>{user.email}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12, marginBottom: 40,
        }}>
          {[
            { label: "VOYAGES", value: user.totalVoyages, color: "#e8e6ff" },
            { label: "DISTANCE", value: fmtDistance(user.totalDistanceMeters), color: "#00e5c8" },
            { label: "DRIVE TIME", value: fmtDuration(user.totalDurationSeconds), color: "#7c6aff" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(124,106,255,0.12)",
              borderRadius: 10, padding: "20px 16px", textAlign: "center",
            }}>
              <div style={{ ...mono, fontSize: 22, fontWeight: 700, color, marginBottom: 6 }}>{value}</div>
              <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.12em" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Voyage history */}
        <div style={{ ...mono, fontSize: 10, color: "#6b6a80", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          Voyage History
        </div>

        {voyages.length === 0 ? (
          <div style={{ ...mono, fontSize: 12, color: "#3a3a50", letterSpacing: "0.08em", padding: "32px 0", textAlign: "center" }}>
            NO VOYAGES YET
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {voyages.map((voyage) => (
              <div key={voyage.id} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(124,106,255,0.1)",
                borderRadius: 10, padding: "16px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e6ff", marginBottom: 4 }}>
                    {voyage.stores.map(s => s.name).join(", ")}
                  </div>
                  <div style={{ ...mono, fontSize: 10, color: "#3a3a50", letterSpacing: "0.06em" }}>
                    {fmtDate(voyage.createdAt._seconds)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#00e5c8" }}>
                      {fmtDistance(voyage.stats.total_distance_meters)}
                    </div>
                    <div style={{ ...mono, fontSize: 10, color: "#3a3a50" }}>DISTANCE</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#7c6aff" }}>
                      {fmtDuration(voyage.stats.total_duration_seconds)}
                    </div>
                    <div style={{ ...mono, fontSize: 10, color: "#3a3a50" }}>DRIVE TIME</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}