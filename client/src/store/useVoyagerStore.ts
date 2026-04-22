import { create } from "zustand";
import type { Store, RouteStop, SearchParams } from "../types";

interface VoyagerState {
  // location
  userPos: { lat: number; lng: number } | null;
  setUserPos: (pos: { lat: number; lng: number }) => void;

  // search params
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;

  // results
  stores: Store[];
  routeOrder: RouteStop[];

  // loading / error
  isSearching: boolean;
  isOptimizing: boolean;
  error: string | null;

  // actions
  setStores: (stores: Store[]) => void;
  setRouteOrder: (order: RouteStop[]) => void;
  setIsSearching: (v: boolean) => void;
  setIsOptimizing: (v: boolean) => void;
  setError: (msg: string | null) => void;
  reset: () => void;
}

const DEFAULT_SEARCH: SearchParams = {
  chains: [],
  radiusMiles: 1,
};

export const useVoyagerStore = create<VoyagerState>()((set) => ({
  userPos: null,
  setUserPos: (pos) => set({ userPos: pos }),

  searchParams: DEFAULT_SEARCH,
  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  stores: [],
  routeOrder: [],

  isSearching: false,
  isOptimizing: false,
  error: null,

  setStores: (stores) => set({ stores }),
  setRouteOrder: (order) => set({ routeOrder: order }),
  setIsSearching: (v) => set({ isSearching: v }),
  setIsOptimizing: (v) => set({ isOptimizing: v }),
  setError: (msg) => set({ error: msg }),

  reset: () =>
    set({
      stores: [],
      routeOrder: [],
      error: null,
    }),
}));