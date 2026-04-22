import { useEffect } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";

// Fallback to UCF (matches your existing fallback)
const FALLBACK = { lat: 28.5383, lng: -81.3792 };

export function useGeolocation() {
  const setUserPos = useVoyagerStore((s) => s.setUserPos);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserPos(FALLBACK);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation failed:", err.code, err.message);
        setUserPos(FALLBACK);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setUserPos]);
}