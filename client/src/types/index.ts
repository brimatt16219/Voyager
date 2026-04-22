export interface Store {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  address: string;
}

export interface RouteStop {
  place_id: string;
  arrival_time: string;
  coords: { lat: number; lng: number };
  name: string;
  address: string;
}

export interface SearchParams {
  chains: string[];
  radiusMiles: number;
}

export interface OptimizeRouteResponse {
  order: RouteStop[];
  optimization_stats: {
    total_distance_meters: number;
    total_duration_seconds: number;
    optimization_time_ms: number;
  };
}