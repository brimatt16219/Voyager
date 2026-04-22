// src/pages/AppPage.tsx
import { useState } from "react";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { useGeolocation } from "../hooks/useGeolocation";
import { fetchStores, optimizeRoute } from "../api/voyager";
import Map from "../components/Map";

export default function AppPage() {
  // Initialize geolocation — writes directly to store
  useGeolocation();

  // Read from store
  const userPos      = useVoyagerStore((s) => s.userPos);
  const stores       = useVoyagerStore((s) => s.stores);
  const routeOrder   = useVoyagerStore((s) => s.routeOrder);
  const isSearching  = useVoyagerStore((s) => s.isSearching);
  const isOptimizing = useVoyagerStore((s) => s.isOptimizing);
  const error        = useVoyagerStore((s) => s.error);

  // Store actions
  const setStores      = useVoyagerStore((s) => s.setStores);
  const setRouteOrder  = useVoyagerStore((s) => s.setRouteOrder);
  const setIsSearching = useVoyagerStore((s) => s.setIsSearching);
  const setIsOptimizing = useVoyagerStore((s) => s.setIsOptimizing);
  const setError       = useVoyagerStore((s) => s.setError);
  const reset          = useVoyagerStore((s) => s.reset);

  // Local form state — only the raw string inputs, not results
  const [storeInput, setStoreInput]   = useState("");
  const [radiusMiles, setRadiusMiles] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPos) { alert("Waiting on location…"); return; }

    const chains = storeInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!chains.length) { alert("Enter at least one store chain."); return; }
    if (radiusMiles <= 0) { alert("Radius must be greater than zero."); return; }

    reset();
    setError(null);

    try {
      setIsSearching(true);
      const storeData = await fetchStores({ lat: userPos.lat, lng: userPos.lng, chains, radiusMiles });
      setStores(storeData);
      setIsSearching(false);

      if (!storeData.length) return;

      setIsOptimizing(true);
      const result = await optimizeRoute({ start: userPos, stores: storeData });
      setRouteOrder(result.order);
    } catch (err) {
      setError("Something went wrong. Check the console.");
      console.error(err);
    } finally {
      setIsSearching(false);
      setIsOptimizing(false);
    }
  }

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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Radius (miles)</label>
          <input
            type="number"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || isOptimizing}
          className="w-full bg-black hover:bg-gray-700 disabled:opacity-50 text-white font-medium py-2 rounded"
        >
          {isSearching ? "Finding stores…" : isOptimizing ? "Optimizing route…" : "Search"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {userPos && (
        <div className="w-full max-w-4xl flex-1">
          <Map stores={stores} userPos={userPos} routeOrder={routeOrder} />
        </div>
      )}
    </div>
  );
}