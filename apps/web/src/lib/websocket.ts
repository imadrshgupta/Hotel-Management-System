type WSEventHandler = (data: any) => void;

class WSClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<WSEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private url: string;
  private propertyId: string | null = null;

  constructor() {
    const baseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
    this.url = baseUrl;
  }

  connect(propertyId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.propertyId = propertyId || localStorage.getItem("propertyId");
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    const wsUrl = `${this.url}/ws?token=${token}${this.propertyId ? `&property_id=${this.propertyId}` : ""}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          // Backend broadcasts use `{ event, data, timestamp }`; older/other
          // senders may use `{ type, data }`. Support both.
          const eventName: string = message.event ?? message.type;
          const handlers = this.handlers.get(eventName);
          if (handlers) {
            handlers.forEach((handler) => handler(message.data));
          }
          // Also trigger wildcard handlers
          const wildcardHandlers = this.handlers.get("*");
          if (wildcardHandlers) {
            wildcardHandlers.forEach((handler) => handler(message));
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            30000
          );
          setTimeout(() => this.connect(propertyId), this.reconnectDelay);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      // Connection failed
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts;
  }

  on(event: string, handler: WSEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
      if (this.handlers.get(event)?.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WSClient();
