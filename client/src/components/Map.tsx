import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";

interface Store {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  address: string;
}

const Map = ({ stores }: { stores: Store[] }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });

  const [userPos, setUserPos] = useState<google.maps.LatLngLiteral>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        console.log("User location obtained:", location);
        setUserPos(location);
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  }, []);

  useEffect(() => {
    console.log("Map loaded status:", isLoaded);
    console.log("Stores received as props:", stores);
  }, [isLoaded, stores]);

  if (!isLoaded || !userPos) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      center={userPos}
      zoom={12}
      mapContainerStyle={{ width: "100%", height: "80vh" }}
      onLoad={() => console.log("Google Map fully rendered.")}
    >
      <Marker position={userPos} />
      {stores.map((store, i) => {
        console.log(`Rendering marker for store ${store.name} at`, store.lat, store.lng);
        return (
          <Marker
            key={store.place_id || i}
            position={{ lat: store.lat, lng: store.lng }}
            title={store.name}
          />
        );
      })}
    </GoogleMap>
  );
};

export default Map;
