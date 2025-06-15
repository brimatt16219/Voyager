import { useRef, useState, useEffect } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer,
  DirectionsService,
  Marker,
  Polyline,
} from "@react-google-maps/api";

const libraries = ["places", "geometry"] as const;

export interface RouteStop {
  place_id: string;
  arrival_time: string; // ISO string
  coords: { lat: number; lng: number };
}

interface RouteMapProps {
  directions: google.maps.DirectionsResult;
  routeOrder?: RouteStop[];
  userPos: { lat: number; lng: number };
}

export default function RouteMap({ directions, routeOrder, userPos }: RouteMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [navDestination, setNavDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [navDirections, setNavDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    setNavDestination(null);
    setNavDirections(null);
  }, [directions]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (!directions.routes?.length) return;
    const bounds = new google.maps.LatLngBounds();
    directions.routes[0].legs.forEach((leg) => {
      bounds.extend(leg.start_location);
      bounds.extend(leg.end_location);
    });
    map.fitBounds(bounds);
  };

  const handleMarkerClick = (coords: { lat: number; lng: number }) => {
    setNavDestination(coords);
    setNavDirections(null);
  };

  if (!isLoaded) return <div>Loading map…</div>;

  // Decode overview_polyline if available
  let overviewPath: google.maps.LatLngLiteral[] = [];
  const route = directions.routes?.[0];
  if (route?.overview_polyline?.points && window.google?.maps?.geometry?.encoding) {
    const decoded = window.google.maps.geometry.encoding.decodePath(
      route.overview_polyline.points
    );
    overviewPath = decoded.map((pt: google.maps.LatLng) => ({ lat: pt.lat(), lng: pt.lng() }));
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "80vh" }}
      onLoad={onMapLoad}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {/* Base optimized route without default markers */}
      <DirectionsRenderer
        directions={directions}
        options={{ preserveViewport: true, suppressMarkers: true }}
      />

      {/* Border and main red line for the route */}
      {overviewPath.length > 0 && (
        <>
          <Polyline
            path={overviewPath}
            options={{
              strokeColor: "#052a88",
              strokeOpacity: 1,
              strokeWeight: 8,
              zIndex: 1,
            }}
          />
          <Polyline
            path={overviewPath}
            options={{
              strokeColor: "#0049ff",
              strokeOpacity: 1,
              strokeWeight: 4,
              zIndex: 2,
            }}
          />
        </>
      )}

      {/* Stop markers */}
      {routeOrder?.map((stop, idx) => (
        <Marker
          key={stop.place_id}
          position={stop.coords}
          label={{ text: `${idx + 1}`, color: "white", fontSize: "14px", fontWeight: "bold" }}
          title={`Stop ${idx + 1}\nETA: ${new Date(stop.arrival_time).toLocaleTimeString()}`}
          onClick={() => handleMarkerClick(stop.coords)}
        />
      ))}

      {/* Navigation to highlighted stop */}
      {navDestination && (
        <DirectionsService
          options={{ origin: userPos, destination: navDestination, travelMode: google.maps.TravelMode.DRIVING }}
          callback={(res, status) => {
            if (status === "OK" && res) setNavDirections(res);
          }}
        />
      )}

      {/* Render navigation polyline */}
      {navDirections && (
        <DirectionsRenderer
          directions={navDirections}
          options={{
            preserveViewport: true,
            suppressMarkers: false,
            polylineOptions: { strokeColor: "#FF0000", strokeWeight: 4 },
          }}
        />
      )}
    </GoogleMap>
  );
}
