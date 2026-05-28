import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Already logged in — send straight to app
  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading]);

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
    }
  }

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Starfield background dots */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            borderRadius: "50%",
            background: "white",
            opacity: Math.random() * 0.5 + 0.1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }} />
        ))}
      </div>

      {/* Login card */}
      <div style={{
        position: "relative",
        width: 340,
        background: "rgba(10,10,20,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(124,106,255,0.25)",
        borderRadius: 16,
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <svg width="48" height="48" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.5)" strokeWidth="2" />
            <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" />
            <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" />
            <circle cx="40" cy="40" r="3" fill="white" />
          </svg>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "#e8e6ff",
          }}>
            VOYAGER
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#6b6a80",
            textAlign: "center",
          }}>
            OPTIMIZE YOUR VOYAGE
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "rgba(124,106,255,0.15)" }} />

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "12px 20px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(124,106,255,0.3)",
            borderRadius: 8,
            color: "#e8e6ff",
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,106,255,0.15)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,106,255,0.6)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,106,255,0.3)";
          }}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.5 35.7 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.3 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          SIGN IN WITH GOOGLE
        </button>

        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "#3a3a50",
          textAlign: "center",
        }}>
          YOUR VOYAGES ARE SAVED TO YOUR ACCOUNT
        </span>
      </div>
    </div>
  );
}