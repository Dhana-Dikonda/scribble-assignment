export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "game" | "results";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  score: number;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
}

export interface GuessEntry {
  playerName: string;
  guess: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  secretWord?: string;
  drawing: DrawingStroke[];
  guesses: GuessEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
  drawing: DrawingStroke[];
  guesses: GuessEntry[];
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
