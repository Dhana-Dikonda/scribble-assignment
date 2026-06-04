import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, startRoom, toRoomSnapshot, getRoom, submitDrawing, submitGuess, restartRoom } from "./roomStore.js";
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

  it("submitDrawing updates drawing strokes for drawer and rejects non-drawer", () => {
    const createRes = createRoom("Alice");
    const code = createRes.room.code;
    const hostId = createRes.participantId;

    const joinRes = joinRoom(code, "Bob");
    const bobId = joinRes!.participantId;

    startRoom(code, hostId);

    const testStrokes = [{ points: [{ x: 10, y: 20 }, { x: 30, y: 40 }] }];

    // Non-drawer tries to draw
    const bobDraw = submitDrawing(code, bobId, testStrokes);
    expect("error" in bobDraw).toBe(true);
    if ("error" in bobDraw) {
      expect(bobDraw.error).toBe("forbidden");
    }

    // Drawer draws
    const hostDraw = submitDrawing(code, hostId, testStrokes);
    expect("error" in hostDraw).toBe(false);
    if (!("error" in hostDraw)) {
      expect(hostDraw.room.drawing).toEqual(testStrokes);
    }
  });

  it("submitGuess records incorrect guess, keeps score unchanged, and status as game", () => {
    const createRes = createRoom("Alice");
    const code = createRes.room.code;
    const hostId = createRes.participantId;

    const joinRes = joinRoom(code, "Bob");
    const bobId = joinRes!.participantId;

    startRoom(code, hostId);

    const guessRes = submitGuess(code, bobId, "wrongguess");
    expect("error" in guessRes).toBe(false);
    if (!("error" in guessRes)) {
      expect(guessRes.room.guesses).toHaveLength(1);
      expect(guessRes.room.guesses[0].guess).toBe("wrongguess");
      expect(guessRes.room.guesses[0].isCorrect).toBe(false);
      expect(guessRes.room.status).toBe("game");
      expect(guessRes.room.participants.find(p => p.id === bobId)?.score).toBe(0);
    }
  });

  it("submitGuess records correct guess, awards 100 points, sets status to results, and rejects drawer", () => {
    const createRes = createRoom("Alice");
    const code = createRes.room.code;
    const hostId = createRes.participantId;

    const joinRes = joinRoom(code, "Bob");
    const bobId = joinRes!.participantId;

    startRoom(code, hostId);

    // Host/drawer tries to guess
    const hostGuess = submitGuess(code, hostId, "castle");
    expect("error" in hostGuess).toBe(true);
    if ("error" in hostGuess) {
      expect(hostGuess.error).toBe("forbidden");
    }

    // Guesser guesses correctly
    const guessRes = submitGuess(code, bobId, "  cAsTlE  "); // with whitespace and mixed case
    expect("error" in guessRes).toBe(false);
    if (!("error" in guessRes)) {
      expect(guessRes.room.guesses).toHaveLength(1);
      expect(guessRes.room.guesses[0].guess).toBe("cAsTlE");
      expect(guessRes.room.guesses[0].isCorrect).toBe(true);
      expect(guessRes.room.status).toBe("results");
      expect(guessRes.room.participants.find(p => p.id === bobId)?.score).toBe(100);
    }
  });

  it("restartRoom transitions results room back to lobby, resets scores, clears drawings and guesses, and rejects non-host", () => {
    const createRes = createRoom("Alice");
    const code = createRes.room.code;
    const hostId = createRes.participantId;

    const joinRes = joinRoom(code, "Bob");
    const bobId = joinRes!.participantId;

    startRoom(code, hostId);
    submitGuess(code, bobId, "castle");

    // Room should now be in results state
    const roomBeforeRestart = getRoom(code)!;
    expect(roomBeforeRestart.status).toBe("results");
    expect(roomBeforeRestart.participants.find(p => p.id === bobId)?.score).toBe(100);

    // Non-host (Bob) tries to restart
    const bobRestart = restartRoom(code, bobId);
    expect("error" in bobRestart).toBe(true);
    if ("error" in bobRestart) {
      expect(bobRestart.error).toBe("forbidden");
    }

    // Host (Alice) restarts
    const aliceRestart = restartRoom(code, hostId);
    expect("error" in aliceRestart).toBe(false);
    if (!("error" in aliceRestart)) {
      expect(aliceRestart.room.status).toBe("lobby");
      expect(aliceRestart.room.drawing).toHaveLength(0);
      expect(aliceRestart.room.guesses).toHaveLength(0);
      expect(aliceRestart.room.availableWords).toHaveLength(0);

      // Verify scores are reset to 0
      expect(aliceRestart.room.participants.find(p => p.id === bobId)?.score).toBe(0);
      expect(aliceRestart.room.participants.find(p => p.id === hostId)?.score).toBe(0);
    }
  });
});
