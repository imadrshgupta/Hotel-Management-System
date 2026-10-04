import { useEffect } from "react";
import { wsClient } from "@/lib/websocket";
import { useNotificationStore } from "@/store/notification.store";

/**
 * Subscribes to real-time `notification` events broadcast by the backend
 * (user/property room). Notifications are stored client-side in the tray —
 * nothing is fetched or faked; the tray stays empty until events arrive.
 */
export function useNotifications() {
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    return wsClient.on("notification", (data: any) => {
      if (!data || !data.title) return;
      push({
        id: data.id,
        type: data.type || "info",
        title: data.title,
        message: data.message || "",
        referenceType: data.reference_type ?? data.referenceType ?? null,
        referenceId: data.reference_id ?? data.referenceId ?? null,
      });
    });
  }, [push]);
}