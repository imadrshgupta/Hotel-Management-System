import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyAccessToken } from '../services/token.service';
import { logger } from './logger';

let wss: WebSocketServer | null = null;

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  organizationId?: string;
  propertyId?: string;
  rooms: Set<string>;
}

const clientRooms: Map<string, Set<AuthenticatedSocket>> = new Map();

export function initWebSocket(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: AuthenticatedSocket, req) => {
    try {
      // Authenticate via query param token
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      const payload = await verifyAccessToken(token);
      ws.userId = payload.userId;
      ws.organizationId = payload.organizationId;
      ws.propertyId = payload.propertyId;
      ws.rooms = new Set();

      // Auto-join personal room
      joinRoom(ws, `user:${payload.userId}`);
      // Auto-join organization room
      if (payload.organizationId) {
        joinRoom(ws, `org:${payload.organizationId}`);
      }
      // Auto-join property room
      if (payload.propertyId) {
        joinRoom(ws, `property:${payload.propertyId}`);
      }

      logger.info(`WebSocket connected: user=${payload.userId}`);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleSocketMessage(ws, message);
        } catch {
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        // Remove from all rooms
        for (const roomName of ws.rooms) {
          leaveRoom(ws, roomName);
        }
        logger.info(`WebSocket disconnected: user=${ws.userId}`);
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket error for user ${ws.userId}:`, err);
      });
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  logger.info('WebSocket server initialized');
  return wss;
}

function handleSocketMessage(ws: AuthenticatedSocket, message: any) {
  switch (message.type) {
    case 'join':
      if (message.room) {
        joinRoom(ws, message.room);
        ws.send(JSON.stringify({ type: 'joined', room: message.room }));
      }
      break;
    case 'leave':
      if (message.room) {
        leaveRoom(ws, message.room);
        ws.send(JSON.stringify({ type: 'left', room: message.room }));
      }
      break;
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    default:
      ws.send(JSON.stringify({ error: 'Unknown message type' }));
  }
}

function joinRoom(ws: AuthenticatedSocket, roomName: string) {
  if (!clientRooms.has(roomName)) {
    clientRooms.set(roomName, new Set());
  }
  clientRooms.get(roomName)!.add(ws);
  ws.rooms.add(roomName);
}

function leaveRoom(ws: AuthenticatedSocket, roomName: string) {
  const room = clientRooms.get(roomName);
  if (room) {
    room.delete(ws);
    if (room.size === 0) {
      clientRooms.delete(roomName);
    }
  }
  ws.rooms.delete(roomName);
}

export function broadcastToRoom(roomName: string, event: string, data: any) {
  const room = clientRooms.get(roomName);
  if (!room) return;

  const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function broadcastToOrganization(
  organizationId: string,
  event: string,
  data: any
) {
  broadcastToRoom(`org:${organizationId}`, event, data);
}

export function broadcastToProperty(
  propertyId: string,
  event: string,
  data: any
) {
  broadcastToRoom(`property:${propertyId}`, event, data);
}

export function sendToUser(userId: string, event: string, data: any) {
  broadcastToRoom(`user:${userId}`, event, data);
}

export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}
