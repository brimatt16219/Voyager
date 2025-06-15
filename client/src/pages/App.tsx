// App.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Map from "../components/Map";

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-6xl font-semibold mb-6">Voyager</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Locations
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
          className="w-full bg-black hover:bg-gray-700 text-white font-medium py-2 rounded focus:outline-none focus:ring-2 focus:ring-grey-700"
        >
          Search
        </button>
      </form>

      {userPos && (
        <div className="w-full max-w-4xl flex-1">
          <Map stores={stores} />
        </div>
      )}
    </div>
  );
}

export default App;
