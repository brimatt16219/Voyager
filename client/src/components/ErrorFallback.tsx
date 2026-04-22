import type { FallbackProps } from "react-error-boundary";

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "rgba(255,77,109,0.08)",
        border: "1px solid rgba(255,77,109,0.3)",
        borderRadius: 12,
        padding: "32px 36px",
        maxWidth: 420,
        textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "#ff4d6d",
          marginBottom: 12,
          textTransform: "uppercase",
        }}>
          System Error
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          color: "#6b6a80",
          marginBottom: 24,
          lineHeight: 1.6,
        }}>
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </div>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: "10px 28px",
            background: "linear-gradient(135deg, #7c6aff, #00e5c8)",
            border: "none",
            borderRadius: 6,
            color: "#0a0a0f",
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          RETRY
        </button>
      </div>
    </div>
  );
}