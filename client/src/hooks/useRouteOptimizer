import { useEffect } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { optimizeRoute } from "../api/voyager";

export function useRouteOptimizer() {
  const stores          = useVoyagerStore((s) => s.stores);
  const userPos         = useVoyagerStore((s) => s.userPos);
  const setRouteOrder   = useVoyagerStore((s) => s.setRouteOrder);
  const setIsOptimizing = useVoyagerStore((s) => s.setIsOptimizing);
  const setError        = useVoyagerStore((s) => s.setError);

  useEffect(() => {
    if (!stores.length || !userPos) return;

    const pos = userPos; // captured reference — no ! needed
    let cancelled = false;

    async function optimize() {
      try {
        setIsOptimizing(true);
        setError(null);
        const result = await optimizeRoute({ start: pos, stores });
        if (!cancelled) {
          setRouteOrder(result.order);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Route optimization failed:", err);
          setError("Could not optimize route. Try again.");
        }
      } finally {
        if (!cancelled) {
          setIsOptimizing(false);
        }
      }
    }

    optimize();

    return () => {
      cancelled = true;
      setIsOptimizing(false);
    };
  }, [stores, userPos]);
}