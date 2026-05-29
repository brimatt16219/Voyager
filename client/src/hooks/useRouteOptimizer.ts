import { useEffect } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { optimizeRoute, saveVoyage } from "../api/voyager";
import { useAuth } from "../context/AuthContext";

export function useRouteOptimizer() {
  const stores          = useVoyagerStore((s) => s.stores);
  const userPos         = useVoyagerStore((s) => s.userPos);
  const setRouteOrder   = useVoyagerStore((s) => s.setRouteOrder);
  const setIsOptimizing = useVoyagerStore((s) => s.setIsOptimizing);
  const setError        = useVoyagerStore((s) => s.setError);

  const { user } = useAuth();

  useEffect(() => {
    if (!stores.length || !userPos) return;

    const pos = userPos;
    let cancelled = false;

    async function optimize() {
      try {
        setIsOptimizing(true);
        setError(null);

        const result = await optimizeRoute({ start: pos, stores });

        if (!cancelled) {
          setRouteOrder(result.order);

          // Auto-save if user is logged in
          if (user) {
            try {
              await saveVoyage({
                startLocation: pos,
                stores,
                routeOrder: result.order,
                stats: result.optimization_stats,
              });
              console.log("[voyager] voyage auto-saved");
            } catch (saveErr) {
              // Don't surface save errors to the user — route still works
              console.warn("[voyager] auto-save failed:", saveErr);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Route optimization failed:", err);
          setError("Could not optimize route. Try again.");
        }
      } finally {
        if (!cancelled) setIsOptimizing(false);
      }
    }

    optimize();

    return () => {
      cancelled = true;
      setIsOptimizing(false);
    };
  }, [stores, userPos]);
}