# Feature Specification: Scenario 3 — Gameplay Interaction

**Status**: Completed

**Input**: "A round is active. Alice (drawer) draws on her canvas or clears it, and Bob (guesser) sees Alice's drawing update on his canvas within ~2 seconds. Bob submits a guess; incorrect guesses appear in the guess history with score 0, and correct guesses add 100 to Bob's score and transition the room to 'results' status."

---

## User Scenarios & Testing

### User Story 6 — Gameplay Interaction (Priority: P1)
A round is active. Alice (drawer) draws on her canvas or clears it, and Bob (guesser) sees Alice's drawing update on his canvas within ~2 seconds. Bob submits a guess; incorrect guesses appear in the guess history with score 0, and correct guesses add 100 to Bob's score and transition the room to `"results"` status.

**Why this priority**: The drawing and guessing loop is the core gameplay mechanic of Scribble.

**Independent Test**: Open two tabs. Start the game. Tab 1 (Host/Drawer) draws a line. Within 2 seconds, Tab 2 (Guesser) sees the line. Tab 2 submits an incorrect guess "dog" -> both tabs show "Bob: dog" in the activity panel. Tab 2 submits "castle" (correct) -> both tabs transition to Results, Bob's score becomes 100.

### Acceptance Scenarios:
1. **Given** a drawer performs mouse or touch gestures on their canvas card, **When** they draw, **Then** the canvas draws lines instantly in real-time on their screen and coordinates are scaled relative to an 800x500 reference coordinate grid.
2. **Given** a drawer finishes drawing a stroke, **When** mouse-up or touch-end triggers, **Then** the strokes are sent to `POST /rooms/:code/drawing` to overwrite the stored strokes.
3. **Given** a guesser is in the active game page, **When** the page polls every 2 seconds, **Then** the canvas is cleared and redrawn using the polled drawing strokes array.
4. **Given** a drawer clicks the Clear Canvas button, **When** it triggers, **Then** it clears the local strokes and submits an empty array `[]` to the server, clearing guessers' canvases on the next poll.
5. **Given** a guesser submits a guess via the form, **When** `POST /rooms/:code/guesses` is called, **Then** the backend trims the guess and compares it case-insensitively with the secret word.
6. **Given** the guess is incorrect, **When** checked, **Then** it awards 0 points, records the guess in the guesses list, and keeps the room status as `"game"`.
7. **Given** the guess is correct, **When** checked, **Then** it awards exactly 100 points to the guesser, records the guess, and transitions `room.status` to `"results"`.
8. **Given** new guesses are polled, **When** guess logs update, **Then** they render in the Activity Feed and the container auto-scrolls to the bottom.
9. **Given** participants have scores, **When** the Scoreboard renders, **Then** players are sorted descending by score.
