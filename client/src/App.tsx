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
  const [storeInput, setStoreInput] = useState<string>("");

  const fetchStores = (chains: string[]) => {
    if (!userPos) return;
  
    axios
      .get("/api/stores", {
        params: {
          lat: userPos.lat,
          lng: userPos.lng,
          chains: chains.join(",")
        }
      })
      .then((res) => {
        console.log("Stores fetched:", res.data);
        if (Array.isArray(res.data)) {
          setStores(res.data);
        } else {
          console.error("Expected array but got:", typeof res.data, res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch stores:", err);
      });
  };
  

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      setUserPos(coords);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chains = storeInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s !== "");
    fetchStores(chains);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
        <label htmlFor="stores">Enter store names (comma-separated): </label>
        <input
          type="text"
          id="stores"
          value={storeInput}
          onChange={(e) => setStoreInput(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.25rem" }}
        />
        <button type="submit">Search</button>
      </form>

      {userPos && <Map stores={stores} />}
    </div>
  );
}

export default App;
