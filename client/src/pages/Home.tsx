import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redirect if already signed in
  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  // Animated star field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    let frame: number;
    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 106, 255, ${s.opacity})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      });
      frame = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); };
  }, []);

  async function handleSignIn() {
    try { await signInWithGoogle(); } catch (err) { console.error("Sign in failed:", err); }
  }

  return (
    <div style={{
      position: "relative", width: "100vw", height: "100vh",
      background: "#0a0a0f", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", overflow: "hidden",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,106,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>

        {/* Compass SVG */}
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: 24 }}>
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.3)" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(124,106,255,0.15)" strokeWidth="1" />
          {[0, 90, 180, 270].map(deg => {
            const rad = (deg - 90) * Math.PI / 180;
            return <line key={deg}
              x1={40 + 28 * Math.cos(rad)} y1={40 + 28 * Math.sin(rad)}
              x2={40 + 36 * Math.cos(rad)} y2={40 + 36 * Math.sin(rad)}
              stroke="rgba(124,106,255,0.6)" strokeWidth="2" strokeLinecap="round" />;
          })}
          <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" opacity="0.9" />
          <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" opacity="0.7" />
          <circle cx="40" cy="40" r="3" fill="#e8e6ff" />
        </svg>

        <h1 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(48px, 8vw, 80px)",
          fontWeight: 700, letterSpacing: "-2px",
          background: "linear-gradient(135deg, #e8e6ff 0%, #7c6aff 50%, #00e5c8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 12, lineHeight: 1.1,
        }}>
          VOYAGER
        </h1>

        <p style={{
          color: "#6b6a80", fontSize: 15, letterSpacing: "0.15em",
          textTransform: "uppercase", marginBottom: 48,
          fontFamily: "'Space Mono', monospace",
        }}>
          Optimal routes. Zero detours.
        </p>

        {/* Google sign-in button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            gap: 12, padding: "14px 36px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(124,106,255,0.35)",
            borderRadius: 8, color: "#e8e6ff",
            fontFamily: "'Space Mono', monospace",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: loading ? 0.5 : 1,
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = "rgba(124,106,255,0.15)";
              e.currentTarget.style.borderColor = "rgba(124,106,255,0.65)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(124,106,255,0.35)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.5 35.7 26.9 36.5 24 36.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.3 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {loading ? "LOADING…" : "SIGN IN WITH GOOGLE"}
        </button>

        <div style={{
          marginTop: 16, fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: "0.08em", color: "#3a3a50",
        }}>
          YOUR VOYAGES ARE SAVED TO YOUR ACCOUNT
        </div>
      </div>

      {/* Bottom status bar */}
      <div style={{
        position: "absolute", bottom: 28,
        fontFamily: "'Space Mono', monospace",
        fontSize: 11, color: "#3a3a50", letterSpacing: "0.1em",
      }}>
        SYS:READY ── ROUTE ENGINE ONLINE ── v1.0
      </div>
    </div>
  );
}
