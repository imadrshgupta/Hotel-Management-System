import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { wsClient } from "@/lib/websocket";

/**
 * Subscribes to real-time WebSocket events and invalidates the given query-key
 * prefixes whenever an event arrives. This keeps screens live without polling
 * and without full page reloads.
 *
 * Example:
 *   useRealtimeInvalidate({
 *     "room:status_changed": [["rooms"], ["reports"]],
 *     "payment:created": [["folios"], ["payments"]],
 *   });
 *
 * Each value is an array of query-key prefixes passed to
 * `invalidateQueries({ queryKey: prefix })`.
 */
export function useRealtimeInvalidate(
  handlers: Record<string, unknown[][]>
) {
  const queryClient = useQueryClient();
  // Keep the latest handlers without re-subscribing on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const unsubscribers = Object.keys(handlersRef.current).map((event) =>
      wsClient.on(event, () => {
        const keys = handlersRef.current[event] || [];
        keys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key as string[] });
        });
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
    // Subscribe once per mounted screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);
}