import axios from "axios";
import type { Store, RouteStop, OptimizeRouteResponse } from "../types";

// In dev: Vite proxies /api → localhost:5000
// In prod: set VITE_API_URL=https://your-backend.railway.app
const BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchStores(params: {
  lat: number;
  lng: number;
  chains: string[];
  radiusMiles: number;
}): Promise<Store[]> {
  const radiusMeters = Math.max(Math.round(params.radiusMiles * 1609.34), 1000);
  const { data } = await axios.get<Store[]>(`${BASE}/api/stores`, {
    params: {
      lat: params.lat,
      lng: params.lng,
      chains: params.chains.join(","),
      radius: radiusMeters,
    },
  });
  return data;
}

export async function optimizeRoute(params: {
  start: { lat: number; lng: number };
  stores: Store[];
}): Promise<OptimizeRouteResponse> {
  const { data } = await axios.post<OptimizeRouteResponse>(
    `${BASE}/api/optimize-route`,
    params
  );
  return data;
}