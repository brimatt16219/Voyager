// App.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Map from "./components/Map";

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
  const [storeInput, setStoreInput] = useState("target,walmart,bestbuy");
  const [radiusMiles, setRadiusMiles] = useState<number>(1);

  const fetchStores = (chains: string[], miles: number) => {
    if (!userPos) return;
    // convert miles → meters
    const radiusMeters = Math.round(miles * 1609.34);

    axios
      .get("/api/stores", {
        params: {
          lat: userPos.lat,
          lng: userPos.lng,
          chains: chains.join(","),      // comma-separated
          radius: radiusMeters,          // in meters
        },
      })
      .then((res) => setStores(res.data))
      .catch((err) => console.error("Failed to fetch stores:", err));
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(coords);
      // auto-fetch on load
      const chains = storeInput.split(",").map(s => s.trim());
      fetchStores(chains, radiusMiles);
    });
  }, [radiusMiles]); // refetch if radius changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chains = storeInput.split(",").map(s => s.trim());
    fetchStores(chains, radiusMiles);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
        <label>
          Stores (comma­-sep):
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

      {userPos && <Map stores={stores} />}
    </div>
  );
}

export default App;
