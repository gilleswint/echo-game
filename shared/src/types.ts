export type GamePhase = 
  | 'Lobby'
  | 'RoleReveal'
  | 'Clues'
  | 'Discussion'
  | 'Voting'
  | 'Reveal'
  | 'GameOver';

export type Role = 'Player' | 'Imposter';

export type WinReason = 
  | 'ImposterSurvived'
  | 'ImposterGuessedWord'
  | 'PlayersCaughtImposter'
  | 'ImposterFailedGuess';

export interface Player {
  id: string; // Socket ID or internal UUID
  sessionId: string; // Client persistent session key
  name: string;
  avatarColor: string;
  avatarIcon: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  isConnected: boolean;
  role?: Role; // Only sent privately or at Reveal/GameOver!
  hasVoted?: boolean;
}

export interface ClueEntry {
  playerId: string;
  playerName: string;
  avatarColor: string;
  clueText: string;
  order: number;
}

export interface CategoryData {
  id: string;
  category: string;
  icon: string;
  words: string[];
}

export interface VoteRecord {
  voterId: string;
  targetId: string;
}

export interface PublicGameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  hostId: string;
  category?: string;
  clues: ClueEntry[];
  currentTurnPlayerId?: string;
  turnOrder: string[]; // Player IDs in clue order
  timerDuration: number;
  timerRemaining: number;
  votes: Record<string, string>; // VoterId -> TargetId (populated in Reveal phase)
  eliminatedPlayerId?: string;
  imposterId?: string; // Revealed at end
  secretWord?: string; // Revealed at end
  winningTeam?: Role;
  winReason?: WinReason;
  imposterGuess?: string;
  imposterGuessCorrect?: boolean;
  roundNumber: number;
  selectedCategoryId?: string;
}

export interface PrivatePlayerInfo {
  role: Role;
  secretWord?: string; // Undefined for Imposter!
  category: string;
  categoryWords: string[]; // All word options in the active category
}

export interface CreateRoomPayload {
  playerName: string;
  avatarColor: string;
  avatarIcon: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  avatarColor: string;
  avatarIcon: string;
}

export interface ReconnectPayload {
  roomCode: string;
  sessionId: string;
}

export interface SubmitCluePayload {
  clueText: string;
}

export interface SubmitVotePayload {
  targetId: string;
}

export interface GuessWordPayload {
  word: string;
}

export interface SelectCategoryPayload {
  categoryId: string;
}
