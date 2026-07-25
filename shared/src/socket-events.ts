import {
  PublicGameState,
  PrivatePlayerInfo,
  CreateRoomPayload,
  JoinRoomPayload,
  ReconnectPayload,
  SubmitCluePayload,
  SubmitVotePayload,
  GuessWordPayload,
  SelectCategoryPayload
} from './types';

export interface ServerToClientEvents {
  roomCreated: (data: { roomCode: string; sessionId: string; state: PublicGameState }) => void;
  roomJoined: (data: { roomCode: string; sessionId: string; state: PublicGameState }) => void;
  syncState: (state: PublicGameState) => void;
  privateRoleInfo: (info: PrivatePlayerInfo) => void;
  timerTick: (remainingSeconds: number) => void;
  clueSubmitted: (data: { playerId: string; clueText: string }) => void;
  playerVoted: (data: { voterId: string }) => void;
  errorNotice: (data: { message: string }) => void;
  hostTransferred: (data: { newHostId: string; newHostName: string }) => void;
  kicked: (data: { reason: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (payload: CreateRoomPayload) => void;
  joinRoom: (payload: JoinRoomPayload) => void;
  reconnectPlayer: (payload: ReconnectPayload) => void;
  kickPlayer: (playerIdToKick: string) => void;
  selectCategory: (payload: SelectCategoryPayload) => void;
  startGame: () => void;
  playerReady: () => void;
  submitClue: (payload: SubmitCluePayload) => void;
  submitVote: (payload: SubmitVotePayload) => void;
  guessWord: (payload: GuessWordPayload) => void;
  nextRound: () => void;
  returnToLobby: () => void;
  leaveRoom: () => void;
  skipCategory: () => void;
  skipDiscussion: () => void;
}
