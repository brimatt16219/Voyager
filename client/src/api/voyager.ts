import axios from "axios";
import { auth } from "../lib/firebase";
import type { Store, OptimizeRouteResponse } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "";

// Attach the Firebase ID token to every request
async function authHeaders() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

export async function saveVoyage(params: {
  startLocation: { lat: number; lng: number };
  stores: Store[];
  routeOrder: OptimizeRouteResponse["order"];
  stats: OptimizeRouteResponse["optimization_stats"];
}): Promise<{ voyageId: string }> {
  const headers = await authHeaders();
  const { data } = await axios.post<{ voyageId: string }>(
    `${BASE}/api/voyages`,
    params,
    { headers }
  );
  return data;
}

export async function fetchProfile(userId: string): Promise<{
  user: {
    uid: string;
    displayName: string;
    photoURL: string;
    email: string;
    totalVoyages: number;
    totalDistanceMeters: number;
    totalDurationSeconds: number;
  };
  voyages: {
    id: string;
    createdAt: { _seconds: number };
    stores: Store[];
    stats: {
      total_distance_meters: number;
      total_duration_seconds: number;
    }
  }[];
}> {
  const { data } = await axios.get(`${BASE}/api/profile/${userId}`);
  return data;
}