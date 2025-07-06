// src/components/Map.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import RouteFlowChart from "./FlowChart";

// load both the places & marker libs
const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

export interface RouteStop {
  place_id: string;
  arrival_time: string;
  coords: { lat: number; lng: number };
  name: string;
  address: string;
}

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
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Map instance
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  // Advanced markers for "you" + stores
  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;
    markerRefs.current.forEach(m => (m.map = null));
    markerRefs.current = [];

    markerRefs.current.push(
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: userPos,
        title: "You are here",
      })
    );
    stores.forEach(s => {
      markerRefs.current.push(
        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: s.lat, lng: s.lng },
          title: s.name,
        })
      );
    });
  }, [map, stores, userPos]);

  // Directions state
  const [directionsResult, setDirectionsResult] =
    useState<google.maps.DirectionsResult | null>(null);

  // reset when routeOrder changes
  useEffect(() => setDirectionsResult(null), [routeOrder]);

  const directionsCallback = useCallback(
    (res: google.maps.DirectionsResult | null) => {
      if (res) setDirectionsResult(res);
      else console.error("DirectionsService returned no result");
    },
    []
  );

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  const shouldRoute = routeOrder.length > 0;
  const origin      = userPos;
  const destination = shouldRoute ? routeOrder[routeOrder.length - 1].coords : undefined;
  const waypoints   = shouldRoute
    ? routeOrder.slice(0, -1).map(stop => ({ location: stop.coords, stopover: true }))
    : [];

  return (
    <div className="flex flex-col h-[100vh]">
      {/* Map with fixed height */}
      <div className="h-[50vh] flex-shrink-0">
        <GoogleMap
          onLoad={onMapLoad}
          center={userPos}
          zoom={12}
          mapContainerClassName="w-full h-full"
          options={{
            fullscreenControl: false,
            mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
          }}
        >
          {shouldRoute && destination && !directionsResult && (
            <DirectionsService
              options={{
                origin,
                destination,
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: false,
              }}
              callback={directionsCallback}
            />
          )}

          {directionsResult && (
            <DirectionsRenderer
              options={{
                directions: directionsResult,
                suppressMarkers: true,
                draggable: true,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Custom flow-chart at the bottom with flexible height */}
      <div className="flex-1 overflow-auto bg-white border-t mt-2 min-h-[25vh] max-h-[40vh]">
        <RouteFlowChart
          routeStops={routeOrder}
          directions={directionsResult}
          stores={stores}
        />
      </div>
    </div>
  );
}
