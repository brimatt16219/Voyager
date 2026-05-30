import { create } from "zustand";
import type { Store, RouteStop, SearchParams } from "../types";

interface VoyagerState {
  // location
  userPos: { lat: number; lng: number } | null;
  setUserPos: (pos: { lat: number; lng: number }) => void;

  // search params
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  addChain: (chain: string) => void;
  removeChain: (chain: string) => void;

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

  // Add a chain — silently ignores duplicates
  addChain: (chain) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        chains: state.searchParams.chains.includes(chain)
          ? state.searchParams.chains
          : [...state.searchParams.chains, chain],
      },
    })),

  // Remove a chain by name
  removeChain: (chain) =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        chains: state.searchParams.chains.filter((c) => c !== chain),
      },
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

  reset: () => set({ stores: [], routeOrder: [], error: null }),
}));