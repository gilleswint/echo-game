import {
  GamePhase,
  Player,
  Role,
  PublicGameState,
  PrivatePlayerInfo,
  ClueEntry,
  WinReason
} from 'echo-shared';
import { wordBank } from './WordBank';
import {
  TURN_TIME_SECONDS,
  DISCUSSION_TIME_SECONDS,
  VOTING_TIME_SECONDS,
  GUESS_TIME_SECONDS,
  ROLE_REVEAL_TIME_SECONDS
} from '../config';

export class Room {
  public code: string;
  public phase: GamePhase = 'Lobby';
  public players: Map<string, Player> = new Map(); // socketId -> Player
  public hostId: string = '';
  public roundNumber: number = 0;
  
  // Game session dynamic state
  public selectedCategoryId?: string;
  public currentCategoryName?: string;
  public categoryWords: string[] = [];
  public secretWord?: string;
  public imposterId?: string;
  
  public clues: ClueEntry[] = [];
  public turnOrder: string[] = []; // Player Socket IDs
  public currentTurnIndex: number = 0;
  
  public votes: Map<string, string> = new Map(); // voterSocketId -> targetSocketId
  public eliminatedPlayerId?: string;
  public winningTeam?: Role;
  public winReason?: WinReason;
  public imposterGuess?: string;
  public imposterGuessCorrect?: boolean;

  // Timer fields
  public timerDuration: number = 0;
  public timerRemaining: number = 0;
  private timerInterval?: NodeJS.Timeout;

  private onStateChangeCallback: (room: Room) => void;
  private onTimerTickCallback: (roomCode: string, remainingSeconds: number) => void;
  private sendPrivateRoleCallback: (socketId: string, info: PrivatePlayerInfo) => void;

  constructor(
    code: string,
    onStateChange: (room: Room) => void,
    onTimerTick: (roomCode: string, remainingSeconds: number) => void,
    sendPrivateRole: (socketId: string, info: PrivatePlayerInfo) => void
  ) {
    this.code = code;
    this.onStateChangeCallback = onStateChange;
    this.onTimerTickCallback = onTimerTick;
    this.sendPrivateRoleCallback = sendPrivateRole;
  }

  public addPlayer(socketId: string, sessionId: string, name: string, color: string, icon: string): Player {
    const isFirst = this.players.size === 0;
    const player: Player = {
      id: socketId,
      sessionId,
      name,
      avatarColor: color,
      avatarIcon: icon,
      isHost: isFirst,
      isReady: false,
      score: 0,
      isConnected: true
    };

    if (isFirst) {
      this.hostId = socketId;
    }

    this.players.set(socketId, player);
    this.notifyStateChange();
    return player;
  }

  public reconnectPlayer(newSocketId: string, oldSessionId: string): Player | undefined {
    let existingPlayer: Player | undefined;
    let oldSocketId: string | undefined;

    for (const [sId, p] of this.players.entries()) {
      if (p.sessionId === oldSessionId) {
        existingPlayer = p;
        oldSocketId = sId;
        break;
      }
    }

    if (!existingPlayer || !oldSocketId) return undefined;

    // Delete old socket entry and insert with new socketId
    this.players.delete(oldSocketId);
    existingPlayer.id = newSocketId;
    existingPlayer.isConnected = true;
    this.players.set(newSocketId, existingPlayer);

    // Update host reference if was host
    if (this.hostId === oldSocketId) {
      this.hostId = newSocketId;
    }

    // Update turn order array if in active game
    this.turnOrder = this.turnOrder.map(id => id === oldSocketId ? newSocketId : id);

    // Update votes map
    if (this.votes.has(oldSocketId)) {
      const target = this.votes.get(oldSocketId)!;
      this.votes.delete(oldSocketId);
      this.votes.set(newSocketId, target);
    }

    // Send private role info if game is active
    if (this.phase !== 'Lobby' && existingPlayer.role) {
      this.sendPrivateRoleCallback(newSocketId, {
        role: existingPlayer.role,
        secretWord: existingPlayer.role === 'Player' ? this.secretWord : undefined,
        category: this.currentCategoryName || '',
        categoryWords: this.categoryWords
      });
    }

    this.notifyStateChange();
    return existingPlayer;
  }

  public handleDisconnect(socketId: string) {
    const player = this.players.get(socketId);
    if (!player) return;

    if (this.phase === 'Lobby') {
      // Remove permanently if in Lobby
      this.players.delete(socketId);
    } else {
      // Mark disconnected if mid-game so they can reconnect
      player.isConnected = false;
    }

    // Handle host transfer if host leaves/disconnects
    if (this.hostId === socketId) {
      this.transferHostToNext();
    }

    this.notifyStateChange();
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
    if (this.hostId === socketId) {
      this.transferHostToNext();
    }
    this.notifyStateChange();
  }

  private transferHostToNext() {
    const connected = Array.from(this.players.values()).filter(p => p.isConnected);
    if (connected.length > 0) {
      const newHost = connected[0];
      newHost.isHost = true;
      this.hostId = newHost.id;
    }
  }

  public setSelectedCategory(categoryId: string) {
    if (this.phase !== 'Lobby') return;
    this.selectedCategoryId = categoryId;
    this.notifyStateChange();
  }

  public startGame() {
    if (this.players.size < 3) {
      throw new Error('Minimum 3 players required to start Echo.');
    }

    this.roundNumber++;
    this.phase = 'RoleReveal';
    this.clues = [];
    this.votes.clear();
    this.eliminatedPlayerId = undefined;
    this.winningTeam = undefined;
    this.winReason = undefined;
    this.imposterGuess = undefined;
    this.imposterGuessCorrect = undefined;

    // Reset player round states
    this.players.forEach(p => {
      p.isReady = false;
      p.hasVoted = false;
      p.role = undefined;
    });

    // Select category and secret word
    const selection = wordBank.getRandomSelection(this.selectedCategoryId);
    this.currentCategoryName = selection.category.category;
    this.categoryWords = selection.category.words;
    this.secretWord = selection.secretWord;

    const allPlayers = Array.from(this.players.values()).filter(p => p.isConnected);
    
    // Anti-Streak Imposter Selection: Exclude previous round's imposter if > 2 players
    let imposterCandidates = allPlayers;
    if (this.imposterId && allPlayers.length > 2) {
      const candidatesMinusPrev = allPlayers.filter(p => p.id !== this.imposterId);
      if (candidatesMinusPrev.length > 0) {
        imposterCandidates = candidatesMinusPrev;
      }
    }

    // Pick new imposter from candidates
    const chosenImposter = imposterCandidates[Math.floor(Math.random() * imposterCandidates.length)];
    this.imposterId = chosenImposter.id;

    allPlayers.forEach((p) => {
      if (p.id === this.imposterId) {
        p.role = 'Imposter';
      } else {
        p.role = 'Player';
      }

      // Send private role info to each client
      this.sendPrivateRoleCallback(p.id, {
        role: p.role,
        secretWord: p.role === 'Player' ? this.secretWord : undefined,
        category: this.currentCategoryName!,
        categoryWords: this.categoryWords
      });
    });

    // Fisher-Yates (Knuth) Uniform Shuffle for Turn Order
    const playerIds = allPlayers.map(p => p.id);
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }
    this.turnOrder = playerIds;

    this.startRoleRevealTimer();
  }

  private startRoleRevealTimer() {
    this.stopTimer();
    this.timerDuration = ROLE_REVEAL_TIME_SECONDS;
    this.timerRemaining = ROLE_REVEAL_TIME_SECONDS;

    this.notifyStateChange();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.onTimerTickCallback(this.code, this.timerRemaining);

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        this.startCluePhase();
      }
    }, 1000);
  }

  public skipCategory(hostSocketId: string) {
    if (this.hostId !== hostSocketId) {
      throw new Error('Only the Host can skip the current category.');
    }

    // Pick a new random category and secret word
    const selection = wordBank.getRandomSelection();
    this.currentCategoryName = selection.category.category;
    this.categoryWords = selection.category.words;
    this.secretWord = selection.secretWord;

    // Reset ready states & clues
    this.clues = [];
    this.players.forEach(p => {
      p.isReady = false;
      if (p.role) {
        this.sendPrivateRoleCallback(p.id, {
          role: p.role,
          secretWord: p.role === 'Player' ? this.secretWord : undefined,
          category: this.currentCategoryName!,
          categoryWords: this.categoryWords
        });
      }
    });

    // Reset turn index if in Clues phase
    if (this.phase === 'Clues') {
      this.currentTurnIndex = 0;
      this.startTurnTimer();
    }

    this.notifyStateChange();
  }

  public playerReady(socketId: string) {
    const player = this.players.get(socketId);
    if (!player || this.phase !== 'RoleReveal') return;

    player.isReady = true;

    // If everyone is ready, automatically progress to Clue phase
    const allReady = Array.from(this.players.values()).every(p => p.isReady || !p.isConnected);
    if (allReady) {
      this.stopTimer();
      this.startCluePhase();
    } else {
      this.notifyStateChange();
    }
  }

  private startCluePhase() {
    this.phase = 'Clues';
    this.currentTurnIndex = 0;
    this.startTurnTimer();
    this.notifyStateChange();
  }

  private startTurnTimer() {
    this.stopTimer();
    this.timerDuration = TURN_TIME_SECONDS;
    this.timerRemaining = TURN_TIME_SECONDS;

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.onTimerTickCallback(this.code, this.timerRemaining);

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        // Time expired: auto-submit default clue or skip turn
        this.submitClue(this.turnOrder[this.currentTurnIndex], '(Passed / Timeout)');
      }
    }, 1000);
  }

  public submitClue(socketId: string, clueText: string) {
    if (this.phase !== 'Clues') return;
    
    const activePlayerId = this.turnOrder[this.currentTurnIndex];
    if (socketId !== activePlayerId) return; // Not player's turn

    const player = this.players.get(socketId);
    if (!player) return;

    this.stopTimer();

    this.clues.push({
      playerId: player.id,
      playerName: player.name,
      avatarColor: player.avatarColor,
      clueText: clueText.trim() || '(No clue given)',
      order: this.clues.length + 1
    });

    this.currentTurnIndex++;

    if (this.currentTurnIndex < this.turnOrder.length) {
      // Next player's turn
      this.startTurnTimer();
      this.notifyStateChange();
    } else {
      // All players have given a clue -> Start Discussion phase
      this.startDiscussionPhase();
    }
  }

  private startDiscussionPhase() {
    this.phase = 'Discussion';
    this.stopTimer();
    this.timerDuration = DISCUSSION_TIME_SECONDS;
    this.timerRemaining = DISCUSSION_TIME_SECONDS;

    this.notifyStateChange();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.onTimerTickCallback(this.code, this.timerRemaining);

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        this.startVotingPhase();
      }
    }, 1000);
  }

  public skipDiscussion(socketId: string) {
    if (this.phase !== 'Discussion') return;
    this.stopTimer();
    this.startVotingPhase();
  }

  public startVotingPhase() {
    this.phase = 'Voting';
    this.stopTimer();
    this.votes.clear();
    this.players.forEach(p => p.hasVoted = false);
    
    this.timerDuration = VOTING_TIME_SECONDS;
    this.timerRemaining = VOTING_TIME_SECONDS;

    this.notifyStateChange();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.onTimerTickCallback(this.code, this.timerRemaining);

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        this.tallyVotesAndReveal();
      }
    }, 1000);
  }

  public submitVote(voterSocketId: string, targetSocketId: string) {
    if (this.phase !== 'Voting') return;
    if (voterSocketId === targetSocketId) return; // Cannot vote self

    const voter = this.players.get(voterSocketId);
    const target = this.players.get(targetSocketId);
    if (!voter || !target) return;

    this.votes.set(voterSocketId, targetSocketId);
    voter.hasVoted = true;

    this.notifyStateChange();

    // If everyone has voted, proceed immediately
    const connectedPlayers = Array.from(this.players.values()).filter(p => p.isConnected);
    if (this.votes.size >= connectedPlayers.length) {
      this.stopTimer();
      this.tallyVotesAndReveal();
    }
  }

  private tallyVotesAndReveal() {
    this.phase = 'Reveal';
    this.stopTimer();

    // Tally vote counts per player
    const voteCounts: Record<string, number> = {};
    for (const targetId of this.votes.values()) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }

    // Find player with highest votes
    let maxVotes = 0;
    let mostVotedPlayerId: string | undefined;
    let tie = false;

    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedPlayerId = targetId;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }

    this.eliminatedPlayerId = tie ? undefined : mostVotedPlayerId;

    // Check if Imposter was eliminated
    if (this.eliminatedPlayerId && this.eliminatedPlayerId === this.imposterId) {
      // Imposter was caught! Imposter gets 1 chance to guess the secret word.
      this.startImposterGuessTimer();
    } else {
      // Imposter survived! Imposter Wins.
      this.winningTeam = 'Imposter';
      this.winReason = 'ImposterSurvived';
      this.updateScores('Imposter');
      this.phase = 'GameOver';
      this.notifyStateChange();
    }
  }

  private startImposterGuessTimer() {
    this.timerDuration = GUESS_TIME_SECONDS;
    this.timerRemaining = GUESS_TIME_SECONDS;
    this.notifyStateChange();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.onTimerTickCallback(this.code, this.timerRemaining);

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        // Time expired for guess -> Players Win
        this.guessWord(this.imposterId || '', '');
      }
    }, 1000);
  }

  public guessWord(socketId: string, guessedWord: string) {
    if (this.phase !== 'Reveal' || socketId !== this.imposterId) return;

    this.stopTimer();
    this.imposterGuess = guessedWord.trim();
    
    const normalizedGuess = this.imposterGuess.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedSecret = (this.secretWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedGuess.length > 0 && normalizedGuess === normalizedSecret) {
      // Imposter guessed correctly! Imposter Wins.
      this.imposterGuessCorrect = true;
      this.winningTeam = 'Imposter';
      this.winReason = 'ImposterGuessedWord';
      this.updateScores('Imposter');
    } else {
      // Imposter guessed wrong! Players Win.
      this.imposterGuessCorrect = false;
      this.winningTeam = 'Player';
      this.winReason = 'PlayersCaughtImposter';
      this.updateScores('Player');
    }

    this.phase = 'GameOver';
    this.notifyStateChange();
  }

  private updateScores(winningRole: Role) {
    this.players.forEach(p => {
      if (p.role === winningRole) {
        p.score += 1;
      }
    });
  }

  public returnToLobby() {
    this.stopTimer();
    this.phase = 'Lobby';
    this.clues = [];
    this.votes.clear();
    this.turnOrder = [];
    this.imposterId = undefined;
    this.secretWord = undefined;
    this.winningTeam = undefined;
    this.winReason = undefined;
    this.notifyStateChange();
  }

  public stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  public getPublicState(): PublicGameState {
    // Map votes map to Record
    const votesRecord: Record<string, string> = {};
    if (this.phase === 'Reveal' || this.phase === 'GameOver') {
      for (const [voter, target] of this.votes.entries()) {
        votesRecord[voter] = target;
      }
    }

    return {
      roomCode: this.code,
      phase: this.phase,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        sessionId: p.sessionId,
        name: p.name,
        avatarColor: p.avatarColor,
        avatarIcon: p.avatarIcon,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
        isConnected: p.isConnected,
        hasVoted: p.hasVoted,
        // Only include role if GameOver or Reveal phase
        role: (this.phase === 'GameOver' || this.phase === 'Reveal') ? p.role : undefined
      })),
      hostId: this.hostId,
      category: this.currentCategoryName,
      clues: this.clues,
      currentTurnPlayerId: this.phase === 'Clues' ? this.turnOrder[this.currentTurnIndex] : undefined,
      turnOrder: this.turnOrder,
      timerDuration: this.timerDuration,
      timerRemaining: this.timerRemaining,
      votes: votesRecord,
      eliminatedPlayerId: this.eliminatedPlayerId,
      imposterId: (this.phase === 'GameOver' || this.phase === 'Reveal') ? this.imposterId : undefined,
      secretWord: (this.phase === 'GameOver') ? this.secretWord : undefined,
      winningTeam: this.winningTeam,
      winReason: this.winReason,
      imposterGuess: this.imposterGuess,
      imposterGuessCorrect: this.imposterGuessCorrect,
      roundNumber: this.roundNumber,
      selectedCategoryId: this.selectedCategoryId
    };
  }

  private notifyStateChange() {
    this.onStateChangeCallback(this);
  }
}
