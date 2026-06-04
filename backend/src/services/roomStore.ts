import { randomUUID } from "node:crypto";
import type { Participant, ParticipantRole, Room, RoomSnapshot, DrawingStroke } from "../models/game.js";
import { STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

// Last-resort safeguard only — Zod validation rejects empty/whitespace names
// before reaching this function. This fallback should never fire in practice.
function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now(),
    score: 0
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    drawing: [],
    guesses: [],
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  let roles: ParticipantRole[] = room.participants.map(() => "guesser");
  let availableWords: string[] = [];

  if (room.status === "game" || room.status === "results") {
    roles = room.participants.map((p) => (p.id === room.hostId ? "drawer" : "guesser"));

    if (room.status === "game") {
      if (viewerParticipantId === room.hostId && room.secretWord) {
        availableWords = [room.secretWord];
      } else {
        availableWords = [];
      }
    } else {
      if (room.secretWord) {
        availableWords = [room.secretWord];
      }
    }
  }

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords,
    roles,
    drawing: room.drawing || [],
    guesses: room.guesses || []
  };
}

type StartRoomResult =
  | { error: "not_found" | "already_started" | "forbidden" | "not_enough_players" }
  | { room: RoomSnapshot };

export function startRoom(code: string, participantId: string): StartRoomResult {
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return { error: "not_found" };
  }

  if (room.status !== "lobby") {
    return { error: "already_started" };
  }

  if (room.hostId !== participantId) {
    return { error: "forbidden" };
  }

  if (room.participants.length < 2) {
    return { error: "not_enough_players" };
  }

  room.status = "game";
  room.secretWord = STARTER_WORDS[room.participants.length % STARTER_WORDS.length];
  saveRoom(room);

  return { room: toRoomSnapshot(room, participantId) };
}

type SubmitDrawingResult =
  | { error: "not_found" | "not_in_game" | "forbidden" }
  | { room: RoomSnapshot };

export function submitDrawing(
  code: string,
  participantId: string,
  drawing: DrawingStroke[]
): SubmitDrawingResult {
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return { error: "not_found" };
  }

  if (room.status !== "game") {
    return { error: "not_in_game" };
  }

  if (room.hostId !== participantId) {
    return { error: "forbidden" };
  }

  room.drawing = drawing;
  saveRoom(room);

  return { room: toRoomSnapshot(room, participantId) };
}

type SubmitGuessResult =
  | { error: "not_found" | "not_in_game" | "participant_not_found" | "forbidden" }
  | { room: RoomSnapshot };

export function submitGuess(
  code: string,
  participantId: string,
  guess: string
): SubmitGuessResult {
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return { error: "not_found" };
  }

  if (room.status !== "game") {
    return { error: "not_in_game" };
  }

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) {
    return { error: "participant_not_found" };
  }

  if (room.hostId === participantId) {
    return { error: "forbidden" };
  }

  const trimmed = guess.trim();
  const isCorrect = trimmed.toLowerCase() === room.secretWord?.toLowerCase();

  if (isCorrect) {
    participant.score += 100;
    room.status = "results";
  }

  room.guesses = room.guesses || [];
  room.guesses.push({
    playerName: participant.name,
    guess: trimmed,
    isCorrect,
    timestamp: now()
  });

  saveRoom(room);

  return { room: toRoomSnapshot(room, participantId) };
}

type RestartRoomResult =
  | { error: "not_found" | "not_in_results" | "forbidden" }
  | { room: RoomSnapshot };

export function restartRoom(code: string, participantId: string): RestartRoomResult {
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return { error: "not_found" };
  }

  if (room.status !== "results") {
    return { error: "not_in_results" };
  }

  if (room.hostId !== participantId) {
    return { error: "forbidden" };
  }

  room.status = "lobby";
  room.drawing = [];
  room.guesses = [];
  delete room.secretWord;

  for (const participant of room.participants) {
    participant.score = 0;
  }

  saveRoom(room);

  return { room: toRoomSnapshot(room, participantId) };
}
