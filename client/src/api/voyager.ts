import axios from "axios";
import { auth } from "../lib/firebase";
import type { Store, OptimizeRouteResponse } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "";

// Attach the Firebase ID token to every request if a user is logged in
async function authHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
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
    headers: await authHeaders(),
  });
  return data;
}

export async function optimizeRoute(params: {
  start: { lat: number; lng: number };
  stores: Store[];
}): Promise<OptimizeRouteResponse> {
  const { data } = await axios.post<OptimizeRouteResponse>(
    `${BASE}/api/optimize-route`,
    params,
    { headers: await authHeaders() }
  );
  return data;
}

export async function saveVoyage(params: {
  startLocation: { lat: number; lng: number };
  stores: Store[];
  routeOrder: { place_id: string; arrival_time: string; coords: { lat: number; lng: number }; name: string; address: string }[];
  stats: { total_distance_meters: number; total_duration_seconds: number; optimization_time_ms: number };
}): Promise<void> {
  const { data } = await axios.post(
    `${BASE}/api/voyages`,
    params,
    { headers: await authHeaders() }
  );
  return data;
}

export async function fetchProfile(userId: string): Promise<{
  user: {
    uid: string;
    displayName: string;
    photoURL: string;
    totalVoyages: number;
    totalDistanceMeters: number;
    totalDurationSeconds: number;
  };
  voyages: {
    id: string;
    createdAt: string;
    stores: Store[];
    stats: { total_distance_meters: number; total_duration_seconds: number };
  }[];
}> {
  const { data } = await axios.get(`${BASE}/api/profile/${userId}`, {
    headers: await authHeaders(),
  });
  return data;
}