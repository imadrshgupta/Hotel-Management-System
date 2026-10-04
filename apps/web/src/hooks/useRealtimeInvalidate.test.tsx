import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useRealtimeInvalidate } from "./useRealtimeInvalidate";

const onMock = vi.fn();
const handlers: Map<string, (data?: any) => void> = new Map();
const unsubscribers: Array<() => void> = [];

vi.mock("@/lib/websocket", () => ({
  wsClient: {
    on: vi.fn((event: string, handler: (data?: any) => void) => {
      onMock(event, handler);
      handlers.set(event, handler);
      const unsub = vi.fn(() => {
        handlers.delete(event);
      });
      unsubscribers.push(unsub);
      return unsub;
    }),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
}

beforeEach(() => {
  onMock.mockClear();
  handlers.clear();
  unsubscribers.length = 0;
});

describe("useRealtimeInvalidate", () => {
  it("subscribes to the given events on mount", () => {
    const { wrapper } = createWrapper();
    renderHook(
      () =>
        useRealtimeInvalidate({
          "room:status_changed": [["rooms"]],
          "payment:created": [["folios"], ["payments"]],
        }),
      { wrapper }
    );

    expect(onMock).toHaveBeenCalledWith("room:status_changed", expect.any(Function));
    expect(onMock).toHaveBeenCalledWith("payment:created", expect.any(Function));
  });

  it("refetches matching queries when an event arrives", async () => {
    const { wrapper } = createWrapper();

    let fetchCount = 0;
    const useHarness = () => {
      useRealtimeInvalidate({ "room:status_changed": [["rooms"]] });
      return useQuery({
        queryKey: ["rooms", "list"],
        queryFn: async () => {
          fetchCount += 1;
          return { rooms: [] };
        },
      });
    };

    const { result } = renderHook(() => useHarness(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchCount).toBe(1);

    const handler = handlers.get("room:status_changed");
    expect(handler).toBeDefined();

    act(() => {
      handler?.({ roomId: "r1", toStatus: "OCCUPIED" });
    });

    // Event arrival triggers invalidation → the mounted query refetches
    await waitFor(() => expect(fetchCount).toBeGreaterThan(1));
  });

  it("does not refetch queries outside the declared key family", async () => {
    const { wrapper } = createWrapper();

    let roomsFetches = 0;
    let staysFetches = 0;
    const useHarness = () => {
      useRealtimeInvalidate({ "room:status_changed": [["rooms"]] });
      useQuery({
        queryKey: ["rooms", "list"],
        queryFn: async () => {
          roomsFetches += 1;
          return [];
        },
      });
      return useQuery({
        queryKey: ["stays", "active"],
        queryFn: async () => {
          staysFetches += 1;
          return [];
        },
      });
    };

    renderHook(() => useHarness(), { wrapper });
    await waitFor(() => expect(staysFetches).toBe(1));

    act(() => {
      handlers.get("room:status_changed")?.({});
    });

    await waitFor(() => expect(roomsFetches).toBeGreaterThan(1));
    // stays query was not invalidated
    expect(staysFetches).toBe(1);
  });

  it("unsubscribes when the component unmounts", () => {
    const { wrapper } = createWrapper();
    const { unmount } = renderHook(
      () => useRealtimeInvalidate({ "room:status_changed": [["rooms"]] }),
      { wrapper }
    );

    expect(unsubscribers.length).toBe(1);
    const unsub = unsubscribers[0];

    unmount();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});