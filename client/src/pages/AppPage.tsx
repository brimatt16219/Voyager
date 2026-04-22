import { useState } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { useGeolocation } from "../hooks/useGeolocation";
import { useStoreSearch } from "../hooks/useStoreSearch";
import { useRouteOptimizer } from "../hooks/useRouteOptimizer";
import Map from "../components/Map";

export default function AppPage() {
  // Side effects — both write to the store, no return value needed here
  useGeolocation();
  useRouteOptimizer();

  // Read state from store
  const userPos      = useVoyagerStore((s) => s.userPos);
  const stores       = useVoyagerStore((s) => s.stores);
  const routeOrder   = useVoyagerStore((s) => s.routeOrder);
  const isSearching  = useVoyagerStore((s) => s.isSearching);
  const isOptimizing = useVoyagerStore((s) => s.isOptimizing);
  const error        = useVoyagerStore((s) => s.error);

  // Mutation hook
  const searchMutation = useStoreSearch();

  // Local form state only — raw text inputs, nothing else
  const [storeInput, setStoreInput]   = useState("");
  const [radiusMiles, setRadiusMiles] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPos) { alert("Waiting on location…"); return; }

    const chains = storeInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!chains.length) { alert("Enter at least one store chain."); return; }
    if (radiusMiles <= 0) { alert("Radius must be greater than zero."); return; }

    // Fire the mutation — useRouteOptimizer picks up automatically
    // when stores land in the Zustand store
    searchMutation.mutate({ lat: userPos.lat, lng: userPos.lng, chains, radiusMiles });
  }

  const isBusy = isSearching || isOptimizing;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-6xl font-semibold mb-6">Voyager</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Locations (comma-separated)
          </label>
          <input
            type="text"
            value={storeInput}
            onChange={(e) => setStoreInput(e.target.value)}
            placeholder="Target, Walmart, Costco"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Radius (miles)
          </label>
          <input
            type="number"
            value={radiusMiles}
            min={0.1}
            step={0.1}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={isBusy || !userPos}
          className="w-full bg-black hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
        >
          {isSearching
            ? "Finding stores…"
            : isOptimizing
            ? "Optimizing route…"
            : "Search"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        {!userPos && (
          <p className="text-gray-400 text-sm mt-3 text-center">
            Getting your location…
          </p>
        )}
      </form>

      {userPos && (
        <div className="w-full max-w-4xl flex-1">
          <Map stores={stores} userPos={userPos} routeOrder={routeOrder} />
        </div>
      )}
    </div>
  );
}