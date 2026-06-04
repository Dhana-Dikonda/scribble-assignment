# Discovery Notes

## What the Starter Has

- App shell and page routing (`/`, `/create-room`, `/join-room`, `/lobby`, `/game`)
- Create room flow — `POST /rooms` creates a room with an in-memory participant
- Join room flow — `POST /rooms/:code/join` adds a participant to an existing room
- Fetch room snapshot — `GET /rooms/:code` returns current room state
- In-memory room store (`Map<string, Room>`) — cleared on backend restart
- Lobby participant list (manual refresh button only)
- Game page UI placeholders — canvas, guess input, scoreboard, result area
- Seed data — 5 words (`rocket`, `pizza`, `castle`, `guitar`, `sunflower`) and 2 roles (`drawer`, `guesser`)

---

## Incomplete Behaviors

### 1. No automatic lobby polling
The `LobbyPage` only refreshes when the user clicks the "Refresh Room" button. There is no interval-based polling. Players cannot detect when new participants join or when the game starts without manual interaction.

**File:** [`LobbyPage.tsx`](frontend/src/pages/LobbyPage.tsx)

---

### 2. No host tracking or host-only permissions
The `Room` model has no `hostId` field. The backend does not record which participant created the room. The "Start Game" button is visible to all players in the lobby with no restriction. The 2-player minimum is also not enforced before starting.

**Files:** [`game.ts`](backend/src/models/game.ts), [`roomStore.ts`](backend/src/services/roomStore.ts), [`LobbyPage.tsx`](frontend/src/pages/LobbyPage.tsx)

---

### 3. No game state or game loop
`RoomStatus` is typed as `"lobby"` only. There is no `"game"` or `"results"` status. The backend has no concept of a round in progress. There are no endpoints for starting a game, submitting guesses, syncing drawings, or restarting.

**Files:** [`game.ts`](backend/src/models/game.ts), [`rooms.ts`](backend/src/api/rooms.ts), [`router.ts`](backend/src/api/router.ts)

---

### 4. No drawer assignment or secret word visibility
There is no mechanism to assign one participant as the drawer. The secret word is exposed to all participants via `availableWords` in the room snapshot. It should only be visible to the drawer.

**Files:** [`roomStore.ts`](backend/src/services/roomStore.ts), [`game.ts`](backend/src/models/game.ts)

---

### 5. No guess submission, history, or scoring
`GuessForm` captures text but its submit handler is a no-op. There is no backend endpoint to receive guesses, no guess history stored on the room, and no scoring logic.

**Files:** [`GuessForm.tsx`](frontend/src/components/GuessForm.tsx), [`ResultPanel.tsx`](frontend/src/components/ResultPanel.tsx), [`Scoreboard.tsx`](frontend/src/components/Scoreboard.tsx)

---

### 6. No interactive drawing canvas
The canvas area on the game page is a static placeholder `<div>`. No drawing interaction exists for the drawer, and no canvas state is persisted or synced to other players.

**File:** [`GamePage.tsx`](frontend/src/pages/GamePage.tsx)

---

### 7. Default API base URL is broken
`api.ts` falls back to `http://localhost:3001/bug` instead of `http://localhost:3001`. All API calls fail out-of-the-box without setting `VITE_API_URL`.

**File:** [`api.ts`](frontend/src/services/api.ts) — line 22

---

### 8. Player name validation is missing
Both create and join room schemas use `z.string().optional()`. Empty or whitespace-only names are accepted and silently defaulted to `"Player"`. The spec requires these to be rejected with a clear error message.

**Files:** [`schemas.ts`](backend/src/api/schemas.ts), [`roomStore.ts`](backend/src/services/roomStore.ts)

---

## Assumptions

1. **Host = room creator.** The first participant added on `POST /rooms` is permanently the host. No host transfer on disconnect.

2. **Deterministic word selection.** The secret word is picked using a fixed algorithm at game start (e.g., `index = participants.length % WORDS.length`) so the selection is reproducible and not random per call.

3. **One drawer per round.** The host is the drawer for the single round. Drawer rotation across multiple rounds is out of scope.

4. **Drawer is excluded from guessing.** The drawer's guess input is disabled. Only guessers may submit guesses.

5. **Round ends on first correct guess.** Since timers are out of scope, the game transitions to `"results"` as soon as a guesser submits a case-insensitive match for the secret word.

6. **Canvas sync via polling.** Drawing strokes are stored on the backend room object and fetched by guessers through the existing room polling cadence (~2 s). No WebSockets.

7. **Restart preserves players.** On restart the room status resets to `"lobby"`, scores/guesses/drawing clear, but all participants remain in the room.

---

## Relevant Files

| File | Purpose |
|------|---------|
| [`backend/src/models/game.ts`](backend/src/models/game.ts) | Room, Participant, and RoomSnapshot types |
| [`backend/src/services/roomStore.ts`](backend/src/services/roomStore.ts) | In-memory room CRUD and snapshot logic |
| [`backend/src/api/rooms.ts`](backend/src/api/rooms.ts) | Room HTTP route handlers |
| [`backend/src/api/schemas.ts`](backend/src/api/schemas.ts) | Zod validation schemas |
| [`backend/src/api/router.ts`](backend/src/api/router.ts) | Express router and error handlers |
| [`backend/src/seed/starterData.ts`](backend/src/seed/starterData.ts) | Starter words and roles |
| [`frontend/src/services/api.ts`](frontend/src/services/api.ts) | HTTP client methods |
| [`frontend/src/state/roomStore.ts`](frontend/src/state/roomStore.ts) | React state store for room session |
| [`frontend/src/pages/LobbyPage.tsx`](frontend/src/pages/LobbyPage.tsx) | Lobby screen — needs polling + host-only start |
| [`frontend/src/pages/GamePage.tsx`](frontend/src/pages/GamePage.tsx) | Game screen — needs canvas, guess log, scores |
| [`frontend/src/components/GuessForm.tsx`](frontend/src/components/GuessForm.tsx) | Guess input — submit is a no-op |
| [`frontend/src/components/Scoreboard.tsx`](frontend/src/components/Scoreboard.tsx) | Score display — static placeholder |
| [`frontend/src/components/ResultPanel.tsx`](frontend/src/components/ResultPanel.tsx) | Activity/result display — static placeholder |
