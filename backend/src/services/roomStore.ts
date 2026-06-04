import { randomUUID } from "node:crypto";
import type { Participant, ParticipantRole, Room, RoomSnapshot } from "../models/game.js";
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
    joinedAt: now()
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
    roles
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
