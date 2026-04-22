// src/components/Map.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import RouteFlowChart from "./FlowChart";
import type { Store, RouteStop } from "../types";

const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

interface MapProps {
  stores: Store[];
  userPos: google.maps.LatLngLiteral;
  routeOrder: RouteStop[];
}

// Dark map style — matches the mission control aesthetic
// const DARK_STYLE: google.maps.MapTypeStyle[] = [
//   { elementType: "geometry",        stylers: [{ color: "#0f0f1a" }] },
//   { elementType: "labels.text.stroke", stylers: [{ color: "#0f0f1a" }] },
//   { elementType: "labels.text.fill",   stylers: [{ color: "#4a4a6a" }] },
//   { featureType: "road",            elementType: "geometry",      stylers: [{ color: "#1a1a2e" }] },
//   { featureType: "road",            elementType: "geometry.stroke", stylers: [{ color: "#0d0d1a" }] },
//   { featureType: "road.highway",    elementType: "geometry",      stylers: [{ color: "#2a1a5e" }] },
//   { featureType: "water",           elementType: "geometry",      stylers: [{ color: "#0a0a1a" }] },
//   { featureType: "poi",             elementType: "labels",        stylers: [{ visibility: "off" }] },
//   { featureType: "transit",         elementType: "labels",        stylers: [{ visibility: "off" }] },
// ];

export default function Map({ stores, userPos, routeOrder }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  const markerRefs = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;
    markerRefs.current.forEach(m => (m.map = null));
    markerRefs.current = [];

    markerRefs.current.push(
      new window.google.maps.marker.AdvancedMarkerElement({
        map, position: userPos, title: "You are here",
      })
    );
    stores.forEach(s => {
      markerRefs.current.push(
        new window.google.maps.marker.AdvancedMarkerElement({
          map, position: { lat: s.lat, lng: s.lng }, title: s.name,
        })
      );
    });
  }, [map, stores, userPos]);

  const [directionsResult, setDirectionsResult] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => setDirectionsResult(null), [routeOrder]);

  const directionsCallback = useCallback(
    (res: google.maps.DirectionsResult | null) => {
      if (res) setDirectionsResult(res);
    }, []
  );

  if (loadError) return (
    <div style={{ color: "#ff4d6d", padding: 20, fontFamily: "Space Mono, monospace", fontSize: 12 }}>
      MAP LOAD ERROR
    </div>
  );
  if (!isLoaded) return (
    <div style={{ color: "#6b6a80", padding: 20, fontFamily: "Space Mono, monospace", fontSize: 12 }}>
      LOADING MAP…
    </div>
  );

  const shouldRoute  = routeOrder.length > 0;
  const origin       = userPos;
  const destination  = shouldRoute ? routeOrder[routeOrder.length - 1].coords : undefined;
  const waypoints    = shouldRoute
    ? routeOrder.slice(0, -1).map(stop => ({ location: stop.coords, stopover: true }))
    : [];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Full-screen map */}
      <GoogleMap
        onLoad={onMapLoad}
        center={userPos}
        zoom={13}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControlOptions: { position: 7 }, // right-center
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
        }}
      >
        {shouldRoute && destination && !directionsResult && (
          <DirectionsService
            options={{
              origin, destination, waypoints,
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
              polylineOptions: {
                strokeColor: "#7c6aff",
                strokeWeight: 4,
                strokeOpacity: 0.85,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Route timeline — floating strip at the bottom */}
      {routeOrder.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: 340,   // clears the search panel
          right: 20,
          background: "rgba(10,10,20,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(124,106,255,0.2)",
          borderRadius: 12,
          zIndex: 10,
          maxHeight: 260,
          overflow: "hidden",
        }}>
          <RouteFlowChart
            routeStops={routeOrder}
            directions={directionsResult}
            stores={stores}
          />
        </div>
      )}
    </div>
  );
}