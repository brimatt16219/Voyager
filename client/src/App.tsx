// App.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import RouteMap from "./components/RouteMap";
import type { RouteStop } from "./components/RouteMap";

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

  // Phase 4 state
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeOrder, setRouteOrder] = useState<RouteStop[]>([]);

  const fetchAndOptimize = async (chains: string[], miles: number) => {
    if (!userPos) return;
    const radiusMeters = Math.round(miles * 1609.34);

    try {
      // 1) fetch stores
      const { data: storeData } = await axios.get<Store[]>("/api/stores", {
        params: { lat: userPos.lat, lng: userPos.lng, chains: chains.join(","), radius: radiusMeters },
      });
      setStores(storeData);

      if (!storeData.length) {
        setDirections(null);
        setRouteOrder([]);
        return;
      }

      // 2) optimize
      const { data: opt } = await axios.post("/api/optimize-route", {
        start: userPos,
        stores: storeData,
      });
      setRouteOrder(opt.order);
      setDirections(opt.directions);
    } catch (err) {
      console.error("Error fetching or optimizing:", err);
    }
  };

  // on load & when radius changes
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(coords);
      // initial fetch/optimize
      fetchAndOptimize(storeInput.split(",").map(s => s.trim()), radiusMiles);
    });
  }, [radiusMiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAndOptimize(storeInput.split(",").map(s => s.trim()), radiusMiles);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
        <label>
          Stores (separate with commas):
          <input
            type="text"
            value={storeInput}
            onChange={(e) => setStoreInput(e.target.value)}
            style={{ margin: "0 1rem" }}
          />
        </label>
        <label>
          Radius (miles):
          <input
            type="number"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(Number(e.target.value))}
            style={{ width: "4rem", margin: "0 1rem" }}
          />
        </label>
        <button type="submit">Search</button>
      </form>

      {userPos && directions ? (
        <RouteMap directions={directions} routeOrder={routeOrder} userPos={userPos} />
      ) : (
        <div style={{ padding: "1rem" }}>
          {stores.length
            ? "Optimizing route..."
            : "No stores to display (or still loading)."}
        </div>
      )}
    </div>
  );
}

export default App;
