# Feature Specification: Scenario 4 — Result, Restart & Final Validation

**Status**: Completed

**Input**: "Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared."

---

## User Scenarios & Testing

### User Story 7 — Result & Restart (Priority: P1)
Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared.

**Why this priority**: Correctly resetting the game state back to the lobby allows players to play multiple matches consecutively without having to manually recreate rooms.

**Independent Test**:
1. Open two tabs. Lobby has Alice (host) and Bob.
2. Start the game. Bob guesses correctly.
3. Both players see the results banner, final scores, and complete guess logs.
4. Alice clicks 'Restart Game'.
5. Both players immediately navigate back to the Lobby screen with scores reset to 0.

### Acceptance Scenarios:
1. **Given** a round completes, **When** `room.status` is set to `"results"`, **Then** the secret word is exposed to all participants in `availableWords` in the room snapshot.
2. **Given** the room status is `"results"`, **When** the game page renders, **Then** all participants (drawer and guessers) view a completed round banner displaying the correct secret word and the name of the player who guessed it correctly.
3. **Given** the room status is `"results"`, **When** the page renders, **Then** drawing on the canvas is disabled, and the guess input form is disabled for all players.
4. **Given** the room status is `"results"`, **When** the host views the page, **Then** a "Restart Game" primary action button is rendered at the bottom of the page.
5. **Given** a non-host player views the results page, **When** it renders, **Then** no "Restart Game" action is visible, only "Exit Game".
6. **Given** the host clicks "Restart Game", **When** `POST /rooms/:code/restart` is called, **Then** the backend transitions the status back to `"lobby"`, deletes the secret word, resets all participant scores to `0`, and empties the drawing and guesses arrays.
7. **Given** the backend transitions the room back to `"lobby"`, **When** the active game pages poll the room state, **Then** they automatically redirect all players back to the `/lobby` route.
8. **Given** players are redirected back to the lobby, **When** they land, **Then** the participant list remains intact, ready to start a new round.
