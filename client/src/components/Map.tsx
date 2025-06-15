import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

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
    libraries: ['places'],
  });

  const [userPos, setUserPos] = useState<google.maps.LatLngLiteral>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err)
    );
  }, []);

  // Match the form's max width (max-w-md) and height
  const containerClasses = "w-full max-w-md h-96 bg-white rounded-lg shadow-md overflow-hidden mx-auto";
  const mapClasses = "w-full h-full rounded-lg";

  if (!isLoaded || !userPos) {
    return (
      <div className={`${containerClasses} flex items-center justify-center`}>
        <p className="text-gray-500">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <GoogleMap
        center={userPos}
        zoom={12}
        mapContainerClassName={mapClasses}
        options={{ fullscreenControl: false }}
      >
        <Marker position={userPos} />
        {stores.map((store) => (
          <Marker
            key={store.place_id}
            position={{ lat: store.lat, lng: store.lng }}
            title={store.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;