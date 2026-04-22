import { useMutation } from "@tanstack/react-query";
import { useVoyagerStore } from "../store/useVoyagerStore";
import { fetchStores } from "../api/voyager";

export function useStoreSearch() {
  const setStores      = useVoyagerStore((s) => s.setStores);
  const setIsSearching = useVoyagerStore((s) => s.setIsSearching);
  const setError       = useVoyagerStore((s) => s.setError);
  const reset          = useVoyagerStore((s) => s.reset);

  const mutation = useMutation({
    mutationFn: fetchStores,

    onMutate: () => {
      reset();
      setIsSearching(true);
      setError(null);
    },

    onSuccess: (data) => {
      setStores(data);
    },

    onError: (err) => {
      console.error("Store search failed:", err);
      setError("Could not find stores. Check your connection and try again.");
    },

    onSettled: () => {
      setIsSearching(false);
    },
  });

  return mutation;
}