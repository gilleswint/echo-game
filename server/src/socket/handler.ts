import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, PrivatePlayerInfo } from 'echo-shared';
import { RoomManager } from '../game/RoomManager';
import { Room } from '../game/Room';

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager
) {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    
    // Create new room handler
    socket.on('createRoom', ({ playerName, avatarColor, avatarIcon }) => {
      try {
        const name = playerName.trim();
        if (!name) {
          socket.emit('errorNotice', { message: 'Player name is required.' });
          return;
        }

        const room = roomManager.createRoom();
        const sessionId = `${socket.id}_${Date.now()}`;
        const player = room.addPlayer(socket.id, sessionId, name, avatarColor, avatarIcon);

        socket.join(room.code);
        socket.emit('roomCreated', {
          roomCode: room.code,
          sessionId,
          state: room.getPublicState()
        });
      } catch (err: any) {
        socket.emit('errorNotice', { message: err.message || 'Failed to create room.' });
      }
    });

    // Join room handler
    socket.on('joinRoom', ({ roomCode, playerName, avatarColor, avatarIcon }) => {
      try {
        const code = roomCode.toUpperCase().trim();
        const name = playerName.trim();

        if (!code || !name) {
          socket.emit('errorNotice', { message: 'Room code and player name are required.' });
          return;
        }

        const room = roomManager.getRoom(code);
        if (!room) {
          socket.emit('errorNotice', { message: `Room "${code}" not found.` });
          return;
        }

        // Check if room full (e.g., max 12 players)
        if (room.players.size >= 12) {
          socket.emit('errorNotice', { message: 'Room is full (max 12 players).' });
          return;
        }

        // Check duplicate name
        const nameExists = Array.from(room.players.values()).some(
          p => p.name.toLowerCase() === name.toLowerCase()
        );

        const finalName = nameExists ? `${name} (${room.players.size + 1})` : name;
        const sessionId = `${socket.id}_${Date.now()}`;
        
        room.addPlayer(socket.id, sessionId, finalName, avatarColor, avatarIcon);
        socket.join(room.code);

        socket.emit('roomJoined', {
          roomCode: room.code,
          sessionId,
          state: room.getPublicState()
        });

        io.to(room.code).emit('syncState', room.getPublicState());
      } catch (err: any) {
        socket.emit('errorNotice', { message: err.message || 'Failed to join room.' });
      }
    });

    // Reconnect player handler
    socket.on('reconnectPlayer', ({ roomCode, sessionId }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        socket.emit('errorNotice', { message: 'Session expired or room ended.' });
        return;
      }

      const reconnectedPlayer = room.reconnectPlayer(socket.id, sessionId);
      if (reconnectedPlayer) {
        socket.join(room.code);
        socket.emit('roomJoined', {
          roomCode: room.code,
          sessionId,
          state: room.getPublicState()
        });
        io.to(room.code).emit('syncState', room.getPublicState());
      } else {
        socket.emit('errorNotice', { message: 'Player session not found.' });
      }
    });

    // Category selection
    socket.on('selectCategory', ({ categoryId }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room || room.hostId !== socket.id) return;
      room.setSelectedCategory(categoryId);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Start Game
    socket.on('startGame', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      if (room.hostId !== socket.id) {
        socket.emit('errorNotice', { message: 'Only host can start the game.' });
        return;
      }

      try {
        room.startGame();
        io.to(room.code).emit('syncState', room.getPublicState());
      } catch (err: any) {
        socket.emit('errorNotice', { message: err.message || 'Cannot start game.' });
      }
    });

    // Skip / Reshuffle Category (Host only)
    socket.on('skipCategory', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;

      try {
        room.skipCategory(socket.id);
        io.to(room.code).emit('syncState', room.getPublicState());
      } catch (err: any) {
        socket.emit('errorNotice', { message: err.message || 'Cannot skip category.' });
      }
    });

    // Skip / End Discussion
    socket.on('skipDiscussion', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      room.skipDiscussion(socket.id);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Ready confirm
    socket.on('playerReady', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      room.playerReady(socket.id);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Submit Clue
    socket.on('submitClue', ({ clueText }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      room.submitClue(socket.id, clueText);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Submit Vote
    socket.on('submitVote', ({ targetId }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      room.submitVote(socket.id, targetId);
      socket.emit('playerVoted', { voterId: socket.id });
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Imposter Word Guess
    socket.on('guessWord', ({ word }) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      room.guessWord(socket.id, word);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Next Round (Host only)
    socket.on('nextRound', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room || room.hostId !== socket.id) return;
      try {
        room.startGame();
        io.to(room.code).emit('syncState', room.getPublicState());
      } catch (err: any) {
        socket.emit('errorNotice', { message: err.message });
      }
    });

    // Return to Lobby (Host only)
    socket.on('returnToLobby', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room || room.hostId !== socket.id) return;
      room.returnToLobby();
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Kick Player (Host only)
    socket.on('kickPlayer', (playerIdToKick) => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room || room.hostId !== socket.id) return;
      if (playerIdToKick === socket.id) return;

      const targetSocket = io.sockets.sockets.get(playerIdToKick);
      if (targetSocket) {
        targetSocket.emit('kicked', { reason: 'Host kicked you from the room.' });
        targetSocket.leave(room.code);
      }

      room.removePlayer(playerIdToKick);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Leave Room
    socket.on('leaveRoom', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (!room) return;
      socket.leave(room.code);
      room.handleDisconnect(socket.id);
      io.to(room.code).emit('syncState', room.getPublicState());
    });

    // Disconnect
    socket.on('disconnect', () => {
      const room = roomManager.findRoomBySocketId(socket.id);
      if (room) {
        room.handleDisconnect(socket.id);
        io.to(room.code).emit('syncState', room.getPublicState());
      }
    });
  });
}
