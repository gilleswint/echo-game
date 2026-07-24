import { Room } from './Room';
import { PublicGameState, PrivatePlayerInfo } from 'echo-shared';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private onStateChange: (room: Room) => void;
  private onTimerTick: (roomCode: string, remainingSeconds: number) => void;
  private sendPrivateRole: (socketId: string, info: PrivatePlayerInfo) => void;

  constructor(
    onStateChange: (room: Room) => void,
    onTimerTick: (roomCode: string, remainingSeconds: number) => void,
    sendPrivateRole: (socketId: string, info: PrivatePlayerInfo) => void
  ) {
    this.onStateChange = onStateChange;
    this.onTimerTick = onTimerTick;
    this.sendPrivateRole = sendPrivateRole;
  }

  public createRoom(): Room {
    let roomCode = this.generateRoomCode();
    let attempts = 0;
    while (this.rooms.has(roomCode) && attempts < 100) {
      roomCode = this.generateRoomCode();
      attempts++;
    }

    const room = new Room(
      roomCode,
      this.onStateChange,
      this.onTimerTick,
      this.sendPrivateRole
    );

    this.rooms.set(roomCode, room);
    return room;
  }

  public getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase().trim());
  }

  public deleteRoom(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.stopTimer();
      this.rooms.delete(roomCode);
    }
  }

  public findRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.has(socketId)) {
        return room;
      }
    }
    return undefined;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous I, O, 1, 0
    let result = 'ECHO';
    for (let i = 0; i < 2; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
