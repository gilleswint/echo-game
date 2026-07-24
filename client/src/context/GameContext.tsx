import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  PublicGameState,
  PrivatePlayerInfo,
  CategoryData,
  ServerToClientEvents,
  ClientToServerEvents
} from 'echo-shared';

interface GameContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  gameState: PublicGameState | null;
  privateInfo: PrivatePlayerInfo | null;
  categories: CategoryData[];
  toastMessage: { text: string; type?: 'error' | 'info' | 'success' } | null;
  myPlayerId: string | null;
  mySessionId: string | null;
  isHost: boolean;
  createRoom: (name: string, color: string, icon: string) => void;
  joinRoom: (code: string, name: string, color: string, icon: string) => void;
  leaveRoom: () => void;
  selectCategory: (categoryId: string) => void;
  startGame: () => void;
  playerReady: () => void;
  submitClue: (clueText: string) => void;
  submitVote: (targetId: string) => void;
  guessWord: (word: string) => void;
  nextRound: () => void;
  returnToLobby: () => void;
  kickPlayer: (playerId: string) => void;
  skipCategory: () => void;
  clearToast: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [privateInfo, setPrivateInfo] = useState<PrivatePlayerInfo | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'error' | 'info' | 'success' } | null>(null);
  const [mySessionId, setMySessionId] = useState<string | null>(() => localStorage.getItem('echo_session_id'));

  const showToast = useCallback((text: string, type: 'error' | 'info' | 'success' = 'info') => {
    setToastMessage({ text, type });
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 
    (window.location.origin.includes('localhost') ? 'http://localhost:4000' : window.location.origin);

  // Fetch initial categories REST endpoint
  useEffect(() => {
    fetch(`${backendUrl}/api/categories`)
      .then(res => res.json())
      .then((data: CategoryData[]) => setCategories(data))
      .catch(() => {
        // Fallback default if server endpoint not immediately reached
      });
  }, [backendUrl]);

  // Initialize Socket connection
  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      // Check if player can reconnect to existing room stored in sessionStorage
      const savedCode = sessionStorage.getItem('echo_room_code');
      const savedSession = localStorage.getItem('echo_session_id');

      if (savedCode && savedSession) {
        newSocket.emit('reconnectPlayer', { roomCode: savedCode, sessionId: savedSession });
      }
    });

    newSocket.on('roomCreated', ({ roomCode, sessionId, state }) => {
      localStorage.setItem('echo_session_id', sessionId);
      sessionStorage.setItem('echo_room_code', roomCode);
      setMySessionId(sessionId);
      setGameState(state);
      showToast(`Room created! Code: ${roomCode}`, 'success');
    });

    newSocket.on('roomJoined', ({ roomCode, sessionId, state }) => {
      localStorage.setItem('echo_session_id', sessionId);
      sessionStorage.setItem('echo_room_code', roomCode);
      setMySessionId(sessionId);
      setGameState(state);
      showToast(`Joined room ${roomCode}`, 'success');
    });

    newSocket.on('syncState', (state) => {
      setGameState(state);
    });

    newSocket.on('timerTick', (remainingSeconds) => {
      setGameState(prev => prev ? { ...prev, timerRemaining: remainingSeconds } : null);
    });

    newSocket.on('privateRoleInfo', (info) => {
      setPrivateInfo(info);
    });

    newSocket.on('errorNotice', ({ message }) => {
      showToast(message, 'error');
    });

    newSocket.on('kicked', ({ reason }) => {
      showToast(reason, 'error');
      sessionStorage.removeItem('echo_room_code');
      setGameState(null);
      setPrivateInfo(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [showToast]);

  const createRoom = (playerName: string, avatarColor: string, avatarIcon: string) => {
    socket?.emit('createRoom', { playerName, avatarColor, avatarIcon });
  };

  const joinRoom = (roomCode: string, playerName: string, avatarColor: string, avatarIcon: string) => {
    socket?.emit('joinRoom', { roomCode, playerName, avatarColor, avatarIcon });
  };

  const leaveRoom = () => {
    socket?.emit('leaveRoom');
    sessionStorage.removeItem('echo_room_code');
    setGameState(null);
    setPrivateInfo(null);
  };

  const selectCategory = (categoryId: string) => {
    socket?.emit('selectCategory', { categoryId });
  };

  const startGame = () => {
    setPrivateInfo(null);
    socket?.emit('startGame');
  };

  const playerReady = () => {
    socket?.emit('playerReady');
  };

  const submitClue = (clueText: string) => {
    socket?.emit('submitClue', { clueText });
  };

  const submitVote = (targetId: string) => {
    socket?.emit('submitVote', { targetId });
  };

  const guessWord = (word: string) => {
    socket?.emit('guessWord', { word });
  };

  const nextRound = () => {
    setPrivateInfo(null);
    socket?.emit('nextRound');
  };

  const returnToLobby = () => {
    setPrivateInfo(null);
    socket?.emit('returnToLobby');
  };

  const kickPlayer = (playerId: string) => {
    socket?.emit('kickPlayer', playerId);
  };

  const skipCategory = () => {
    socket?.emit('skipCategory');
    showToast('Skipping category & selecting a new secret word...', 'info');
  };

  const myPlayerId = socket?.id || null;
  const isHost = gameState ? gameState.hostId === myPlayerId : false;

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        privateInfo,
        categories,
        toastMessage,
        myPlayerId,
        mySessionId,
        isHost,
        createRoom,
        joinRoom,
        leaveRoom,
        selectCategory,
        startGame,
        playerReady,
        submitClue,
        submitVote,
        guessWord,
        nextRound,
        returnToLobby,
        kickPlayer,
        skipCategory,
        clearToast
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
