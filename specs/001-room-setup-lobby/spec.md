# Feature Specification: Scenario 1 — Room Setup & Lobby

**Status**: Completed

**Input**: "Given a player wants to host or join a drawing game, When they create or join a room via a unique code, Then the creator is automatically the host; invalid/empty codes are rejected with clear feedback; rooms are fully isolated; the lobby refreshes via polling (~2s); and only the host can start the game once at least 2 players are present."

---

## User Scenarios & Testing

### User Story 1 — Create Room and Become Host (Priority: P1)
A player visits the app, enters their name, and creates a new room. They are automatically designated as the host and land in the Lobby screen. The room code is displayed prominently so they can share it.

**Acceptance Scenarios**:
1. **Given** a player provides a non-empty, non-whitespace name and submits the Create Room form, **When** `POST /rooms` is called, **Then** the API returns `201` with a `participantId` and a room snapshot where the first participant is the host; the frontend stores the `participantId` and navigates to `/lobby`.
2. **Given** a player submits the Create Room form with an empty or whitespace-only name, **When** the form is submitted, **Then** the API returns `400` and the frontend displays a clear inline error message; no room is created.
3. **Given** a room is created, **When** any subsequent player joins or fetches the room, **Then** the first participant (by `joinedAt`) is treated as the host for all permission checks.

### User Story 2 — Join Room by Code (Priority: P1)
A second player visits the app, enters their name and a room code shared by the host, and joins the room. They land in the same Lobby screen and see the existing participants.

**Acceptance Scenarios**:
1. **Given** a player provides a valid name and an existing room code, **When** `POST /rooms/:code/join` is called, **Then** the API returns `200` with a new `participantId` and an updated room snapshot; the frontend navigates to `/lobby`.
2. **Given** a player submits the Join Room form with an empty or whitespace-only name, **When** the form is submitted, **Then** the API returns `400` and the frontend displays a clear inline error message; the player is not added to the room.
3. **Given** a player submits the Join Room form with an empty or whitespace-only room code, **When** the form is submitted, **Then** the frontend displays a clear inline validation error before the API is called; no request is sent.
4. **Given** a player enters a room code that does not match any active room, **When** `POST /rooms/:code/join` is called, **Then** the API returns `404` and the frontend displays "Room not found" or equivalent feedback.
5. **Given** two rooms exist with different codes, **When** players join different rooms, **Then** each room's participant list is fully isolated.

### User Story 3 — Automatic Lobby Polling (Priority: P2)
Once in the Lobby, a player's participant list refreshes automatically every ~2 seconds without any manual interaction. When a new player joins, all existing players see the updated list within approximately 2 seconds.

**Acceptance Scenarios**:
1. **Given** a player is on the Lobby screen, **When** 2 seconds have elapsed since the last fetch, **Then** `GET /rooms/:code` is called automatically with the player's `participantId`.
2. **Given** the poll succeeds, **When** the response is received, **Then** the participant list is updated in the UI without a full page reload; the next poll is scheduled for ~2 seconds later.
3. **Given** the poll request fails, **When** the error is received, **Then** a non-blocking error indicator is shown; polling continues on the next interval.
4. **Given** the player navigates away from the Lobby screen, **When the component unmounts, **Then** the polling interval is cleared.

### User Story 4 — Host-Only Start with Minimum 2 Players (Priority: P2)
The "Start Game" button is only enabled for the host and only when at least 2 players are in the lobby. Non-host players see the button disabled or hidden. Attempting to start with fewer than 2 players is rejected with clear feedback.

**Acceptance Scenarios**:
1. **Given** the host is in the lobby with only 1 participant (themselves), **When** the Lobby screen renders, **Then** the Start Game button is visible but disabled with a tooltip or label such as "Need at least 2 players".
2. **Given** the host is in the lobby and at least 2 participants are present, **When** the lobby state is polled and updated, **Then** the Start Game button becomes enabled for the host only.
3. **Given** a non-host player is in the lobby, **When** the Lobby screen renders, **Then** the Start Game button is either hidden or permanently disabled for that player.
4. **Given** the host clicks Start Game with at least 2 players present, **When** `POST /rooms/:code/start` is called, **Then** the backend transitions the room status from `"lobby"` to `"game"` and returns the updated snapshot; the frontend navigates to `/game`.
5. **Given** the lobby poll detects `status === "game"`, **When** any non-host player's lobby poll returns this status, **Then** that player is automatically navigated to `/game` without needing to click anything.
