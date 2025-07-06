/*// src/components/RouteMap.tsx
import { useEffect } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer
} from "@react-google-maps/api";

interface RouteMapProps {
  directions: google.maps.DirectionsResult;
}

// Only the "places" library is needed for rendering directions
const LIBRARIES = ["places"] as const;

export default function RouteMap({ directions }: RouteMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "80vh" }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Render the given directions *//*}
      <DirectionsRenderer
        directions={directions}
        options={{ suppressMarkers: false }}
      />
    </GoogleMap>
  );
}*/
