import { useState, useRef, useEffect, useCallback } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";

export default function ChainPicker() {
  const chains      = useVoyagerStore((s) => s.searchParams.chains);
  const addChain    = useVoyagerStore((s) => s.addChain);
  const removeChain = useVoyagerStore((s) => s.removeChain);

  const [input, setInput]             = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDrop, setShowDrop]       = useState(false);
  const serviceRef                    = useRef<google.maps.places.AutocompleteService | null>(null);
  const containerRef                  = useRef<HTMLDivElement>(null);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getService() {
    if (!serviceRef.current && window.google?.maps?.places) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
    return serviceRef.current;
  }

  const fetchSuggestions = useCallback((text: string) => {
    if (!text.trim()) { setSuggestions([]); return; }
    const svc = getService();
    if (!svc) return;

    svc.getPlacePredictions(
      { input: text, types: ["establishment"] },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const names = [
            ...new Set(
              predictions
                .map((p) => p.structured_formatting.main_text)
                .filter((name) => !chains.includes(name))
            ),
          ].slice(0, 6);
          setSuggestions(names);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, [chains]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    setShowDrop(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  }

  function handleAdd(chain: string) {
    const trimmed = chain.trim();
    if (!trimmed) return;
    addChain(trimmed);
    setInput("");
    setSuggestions([]);
    setShowDrop(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(input); }
    if (e.key === "Escape") setShowDrop(false);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    // No overflow:hidden here — it would clip the absolute dropdown
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        color: "#6b6a80",
        marginBottom: 6,
        textTransform: "uppercase",
      }}>
        Destinations
      </label>

      <div ref={containerRef} style={{ position: "relative" }}>
        <input
          type="text"
          value={input}
          placeholder="Search for a store…"
          onChange={handleInputChange}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(124,106,255,0.6)";
            setShowDrop(true);
            if (input) fetchSuggestions(input);
          }}
          onBlur={(e) => (e.target.style.borderColor = "rgba(124,106,255,0.2)")}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(124,106,255,0.2)",
            borderRadius: 6,
            padding: "9px 12px",
            color: "#e8e6ff",
            fontSize: 13,
            outline: "none",
            fontFamily: "'Space Mono', monospace",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />

        {/* Suggestions dropdown — sits above other content via zIndex */}
        {showDrop && suggestions.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "rgba(12,12,24,0.98)",
            border: "1px solid rgba(124,106,255,0.25)",
            borderRadius: 8,
            zIndex: 100,
            maxHeight: 220,
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            {suggestions.map((chain) => (
              <div
                key={chain}
                onMouseDown={() => handleAdd(chain)}
                style={{
                  padding: "10px 14px",
                  fontSize: 12,
                  fontFamily: "'Space Mono', monospace",
                  color: "#c8c6e8",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid rgba(124,106,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,106,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#7c6aff", fontSize: 10, flexShrink: 0 }}>+</span>
                {chain}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chips — constrained so they never push sidebar wider */}
      {chains.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 10,
          // Constrain chips to parent width without clipping dropdown above
          maxWidth: "100%",
          overflow: "hidden",
        }}>
          {chains.map((chain) => (
            <div key={chain} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              background: "rgba(124,106,255,0.12)",
              border: "1px solid rgba(124,106,255,0.3)",
              borderRadius: 20,
              fontSize: 11,
              fontFamily: "'Space Mono', monospace",
              color: "#c8c6e8",
              letterSpacing: "0.05em",
              // Prevent individual chips from overflowing
              minWidth: 0,
              maxWidth: "100%",
            }}>
              <span style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {chain}
              </span>
              <button
                onClick={() => removeChain(chain)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6b6a80",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 15,
                  lineHeight: 1,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d6d")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6a80")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
