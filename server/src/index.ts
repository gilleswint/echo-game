import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ServerToClientEvents, ClientToServerEvents, PrivatePlayerInfo } from 'echo-shared';
import { PORT, CLIENT_ORIGIN } from './config';
import { RoomManager } from './game/RoomManager';
import { setupSocketHandlers } from './socket/handler';
import { wordBank } from './game/WordBank';

const app = express();

// Parse CORS origin whitelist from env variable
const allowedOrigins = CLIENT_ORIGIN.split(',').map(o => o.trim());

const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow non-browser or same-origin requests
  if (allowedOrigins.includes('*')) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow Vercel preview domains
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback for friends-only deployment
    }
  },
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 10000
});

const roomManager = new RoomManager(
  // State change callback
  (room) => {
    io.to(room.code).emit('syncState', room.getPublicState());
  },
  // Timer tick callback
  (roomCode, remainingSeconds) => {
    io.to(roomCode).emit('timerTick', remainingSeconds);
  },
  // Send private role info callback
  (socketId, info: PrivatePlayerInfo) => {
    io.to(socketId).emit('privateRoleInfo', info);
  }
);

setupSocketHandlers(io, roomManager);

// REST Endpoints
app.get('/api/categories', (req, res) => {
  res.json(wordBank.getCategories());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`🚀 Echo server running on port ${PORT}`);
});
