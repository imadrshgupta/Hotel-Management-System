import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi, roomTypesApi, floorsApi } from "@/services/api";
import { useAppStore } from "@/store/app.store";
import type { PaginationParams } from "@/types";

export function useRooms(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => roomsApi.list(params),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsApi.get(id),
    enabled: !!id,
  });
}

export function useRoomStatusSummary() {
  return useQuery({
    queryKey: ["rooms", "status-summary"],
    queryFn: () => roomsApi.getStatusSummary(),
  });
}

export function useRoomStatusHistory(id: string) {
  return useQuery({
    queryKey: ["rooms", id, "status-history"],
    queryFn: () => roomsApi.getStatusHistory(id),
    enabled: !!id,
  });
}

export function useChangeRoomStatus() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      roomsApi.changeStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      addToast("Room status updated", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to update room status", "error");
    },
  });
}

export function useRoomTypes() {
  return useQuery({
    queryKey: ["room-types"],
    queryFn: () => roomTypesApi.list(),
  });
}

export function useRoomType(id: string) {
  return useQuery({
    queryKey: ["room-types", id],
    queryFn: () => roomTypesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: roomTypesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      addToast("Room type created", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to create room type", "error");
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      addToast("Room type updated", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to update room type", "error");
    },
  });
}

export function useDeleteRoomType() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: roomTypesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      addToast("Room type deleted", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to delete room type", "error");
    },
  });
}

export function useFloors() {
  return useQuery({
    queryKey: ["floors"],
    queryFn: () => floorsApi.list(),
  });
}

export function useCreateFloor() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: floorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      addToast("Floor created", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to create floor", "error");
    },
  });
}

export function useUpdateFloor() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => floorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      addToast("Floor updated", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to update floor", "error");
    },
  });
}

export function useDeleteFloor() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: floorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      addToast("Floor deleted", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to delete floor", "error");
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      addToast("Room created", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to create room", "error");
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  const addToast = useAppStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      addToast("Room updated", "success");
    },
    onError: (error: any) => {
      addToast(error?.response?.data?.message || "Failed to update room", "error");
    },
  });
}
