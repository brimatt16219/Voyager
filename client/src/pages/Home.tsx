import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Star field */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Glow orb behind content */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,106,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ position: "relative", textAlign: "center", zIndex: 1 }}>

        {/* Compass SVG */}
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: 24 }}>
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(124,106,255,0.3)" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(124,106,255,0.15)" strokeWidth="1" />
          {/* N S E W ticks */}
          {[0,90,180,270].map(deg => {
            const rad = (deg - 90) * Math.PI / 180;
            return <line key={deg}
              x1={40 + 28 * Math.cos(rad)} y1={40 + 28 * Math.sin(rad)}
              x2={40 + 36 * Math.cos(rad)} y2={40 + 36 * Math.sin(rad)}
              stroke="rgba(124,106,255,0.6)" strokeWidth="2" strokeLinecap="round" />;
          })}
          {/* Needle */}
          <polygon points="40,14 43.5,40 40,46 36.5,40" fill="#7c6aff" opacity="0.9" />
          <polygon points="40,66 43.5,40 40,46 36.5,40" fill="#00e5c8" opacity="0.7" />
          <circle cx="40" cy="40" r="3" fill="#e8e6ff" />
        </svg>

        <h1 style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "clamp(48px, 8vw, 80px)",
          fontWeight: 700,
          letterSpacing: "-2px",
          background: "linear-gradient(135deg, #e8e6ff 0%, #7c6aff 50%, #00e5c8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 12,
          lineHeight: 1.1,
        }}>
          VOYAGER
        </h1>

        <p style={{
          color: "#6b6a80",
          fontSize: 15,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 48,
          fontFamily: "'Space Mono', monospace",
        }}>
          Optimal routes. Zero detours.
        </p>

        <button
          onClick={() => navigate("/app")}
          style={{
            padding: "14px 40px",
            background: "linear-gradient(135deg, #7c6aff, #00e5c8)",
            border: "none",
            borderRadius: 8,
            color: "#0a0a0f",
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
            transition: "opacity 0.2s, transform 0.2s",
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.opacity = "0.85"; (e.target as HTMLButtonElement).style.transform = "scale(1.03)"; }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = "1"; (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          LAUNCH ›
        </button>
      </div>

      {/* Bottom coordinates decoration */}
      <div style={{
        position: "absolute",
        bottom: 28,
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: "#3a3a50",
        letterSpacing: "0.1em",
      }}>
        SYS:READY ── ROUTE ENGINE ONLINE ── v2.0
      </div>
    </div>
  );
}