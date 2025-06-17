// src/components/Map.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import type { RouteStop } from "./RouteMap";

// Load necessary libraries statically
const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

interface Store {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  address: string;
}

interface MapProps {
  stores: Store[];
  userPos: google.maps.LatLngLiteral;
  routeOrder: RouteStop[];
}

export default function Map({ stores, userPos, routeOrder }: MapProps) {
  const { isLoaded, loadError, loadError: error } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // State for the Directions result
  const [directionsResult, setDirectionsResult] = useState<
    google.maps.DirectionsResult | null
  >(null);

  // Reset directionsResult any time routeOrder changes, so new route will re-render
  useEffect(() => {
    setDirectionsResult(null);
  }, [routeOrder]);

  // Callback when DirectionsService returns
  const directionsCallback = useCallback(
    (res: google.maps.DirectionsResult | null) => {
      if (res) setDirectionsResult(res);
      else console.error("Directions callback returned no result");
    },
    []
  );

  // Imperative refs for advanced markers
  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Manage advanced markers whenever map, stores, or userPos change
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  useEffect(() => {
    if (!map) return;
    // Clear existing markers
    markerRefs.current.forEach((m) => (m.map = null));
    markerRefs.current = [];

    // Add user location marker
    const userMarker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: userPos,
      title: "You are here",
    });
    markerRefs.current.push(userMarker);

    // Add store markers
    stores.forEach((s) => {
      const m = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: s.lat, lng: s.lng },
        title: s.name,
      });
      markerRefs.current.push(m);
    });
  }, [map, stores, userPos]);

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded)
    return (
      <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-md mx-auto">
        <p className="flex items-center justify-center h-full text-gray-500">
          Loading Map…
        </p>
      </div>
    );

  // Determine if we should request directions
  const shouldRoute = routeOrder.length > 0;
  const origin = userPos;
  const destination = shouldRoute
    ? routeOrder[routeOrder.length - 1].coords
    : null;
  const waypoints = shouldRoute
    ? routeOrder.slice(0, -1).map((stop) => ({
        location: stop.coords,
        stopover: true,
      }))
    : [];

  return (
    <div className="w-full max-w-md h-96 bg-white rounded-lg shadow-md mx-auto">
      <GoogleMap
        onLoad={onMapLoad}
        center={userPos}
        zoom={12}
        mapContainerClassName="w-full h-full rounded-lg"
        options={{
          fullscreenControl: false,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
        }}
      >
        {/* Search for a new route if needed */}
        {shouldRoute && !directionsResult && (
          <DirectionsService
            options={{
              origin,
              destination: destination!,
              waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={directionsCallback}
          />
        )}

        {/* Render the updated route */}
        {directionsResult && (
          <DirectionsRenderer
            options={{
              directions: directionsResult,
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
