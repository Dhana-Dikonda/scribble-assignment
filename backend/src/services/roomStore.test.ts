import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, startRoom, toRoomSnapshot, getRoom } from "./roomStore.js";
import { STARTER_WORDS } from "../seed/starterData.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("startRoom assigns host as drawer, Bob as guesser, and sets secret word", () => {
    const createRes = createRoom("Alice");
    const code = createRes.room.code;
    const hostId = createRes.participantId;

    const joinRes = joinRoom(code, "Bob");
    const bobId = joinRes!.participantId;

    const startRes = startRoom(code, hostId);
    expect("error" in startRes).toBe(false);

    const activeRoom = getRoom(code)!;
    expect(activeRoom.status).toBe("game");
    expect(activeRoom.secretWord).toBe(STARTER_WORDS[2]); // 2 participants % 5 words = index 2 ("castle")

    // toRoomSnapshot check: host (drawer) sees the secret word
    const hostSnap = toRoomSnapshot(activeRoom, hostId);
    expect(hostSnap.roles[0]).toBe("drawer");
    expect(hostSnap.roles[1]).toBe("guesser");
    expect(hostSnap.availableWords).toEqual([activeRoom.secretWord]);

    // toRoomSnapshot check: guesser (Bob) does NOT see the secret word
    const bobSnap = toRoomSnapshot(activeRoom, bobId);
    expect(bobSnap.roles[0]).toBe("drawer");
    expect(bobSnap.roles[1]).toBe("guesser");
    expect(bobSnap.availableWords).toEqual([]);
  });
});
