import { useEffect, useState } from "react";
import axios from "axios";
import Map from "../components/Map";
import type { RouteStop } from "../components/RouteMap";

interface Store {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  address: string;
}

function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>();
  const [storeInput, setStoreInput] = useState("");
  const [radiusMiles, setRadiusMiles] = useState<number>(1);
  const [routeOrder, setRouteOrder] = useState<RouteStop[]>([]);

  const fetchAndOptimize = async (chains: string[], miles: number) => {
    if (!userPos) return;
    // Convert miles to meters and enforce a minimum
    const radiusMeters = Math.max(Math.round(miles * 1609.34), 1000);

    try {
      // 1) fetch stores
      const { data: storeData } = await axios.get<Store[]>("/api/stores", {
        params: {
          lat: userPos.lat,
          lng: userPos.lng,
          chains: chains.join(","),
          radius: radiusMeters,
        },
      });
      setStores(storeData);

      if (!storeData.length) {
        setRouteOrder([]);
        return;
      }

      // 2) optimize stop order
      const { data: opt } = await axios.post("/api/optimize-route", {
        start: userPos,
        stores: storeData,
      });
      setRouteOrder(opt.order);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(
          "API error:",
          err.response?.status,
          err.response?.data ?? err.message
        );
      } else {
        console.error("Unexpected error:", err);
      }
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn("Geolocation failed:", err.code, err.message);
        setUserPos({ lat: 28.5383, lng: -81.3792});
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chains = storeInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!userPos) {
      alert("Waiting on location…");
      return;
    }
    if (chains.length === 0) {
      alert("Enter at least one store chain.");
      return;
    }
    if (radiusMiles <= 0) {
      alert("Radius must be greater than zero.");
      return;
    }

    fetchAndOptimize(chains, radiusMiles);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-6xl font-semibold mb-6">Voyager</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6"
      >
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
          <label className="block text-gray-700 font-medium mb-2">
            Radius (miles)
          </label>
          <input
            type="number"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black hover:bg-gray-700 text-white font-medium py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
        >
          Search
        </button>
      </form>

      {userPos && (
        <div className="w-full max-w-4xl flex-1">
          <Map stores={stores} userPos={userPos} routeOrder={routeOrder} />
        </div>
      )}
    </div>
  );
}

export default App;
