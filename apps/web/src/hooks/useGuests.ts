import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { guestsApi } from "@/services/api";
import { useAppStore } from "@/store/app.store";
import type { PaginationParams } from "@/types";

export function useGuests(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["guests", params],
    queryFn: () => guestsApi.list(params),
  });
}

export function useGuest(id: string) {
  return useQuery({
    queryKey: ["guests", id],
    queryFn: () => guestsApi.get(id),
    enabled: !!id,
  });
}

export function useSearchGuestDuplicates(params: { email?: string; phone?: string }) {
  return useQuery({
    queryKey: ["guests", "duplicate", params],
    queryFn: () => guestsApi.searchDuplicate(params),
    enabled: !!(params.email || params.phone),
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: guestsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      addToast("Guest created", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to create guest", "error");
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => guestsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      queryClient.invalidateQueries({ queryKey: ["guests", id] });
      addToast("Guest updated", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to update guest", "error");
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: guestsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      addToast("Guest deleted", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to delete guest", "error");
    },
  });
}
