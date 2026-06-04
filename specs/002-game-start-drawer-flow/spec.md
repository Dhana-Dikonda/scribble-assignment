# Feature Specification: Scenario 2 — Game Start & Drawer Flow

**Status**: Completed

**Input**: "Once the game is started by the host, the game transitions into the first round. The host (drawer) is assigned the 'drawer' role and shown the secret word deterministically selected from the starter list. All other players are guessers; they do not see the secret word and can type guesses."

---

## User Scenarios & Testing

### User Story 5 — Game Start & Drawer Flow (Priority: P1)
Once the game is started by the host, the game transitions into the first round. The host (drawer) is assigned the `"drawer"` role and shown the secret word deterministically selected from the starter list. All other players are guessers; they do not see the secret word and can type guesses.

**Why this priority**: Correctly assigning the drawer role and isolating the secret word is the base of the drawing/guessing game loop.

**Independent Test**: Open two tabs. Start the game. Tab 1 (Host/Drawer) sees "Your word to draw: Castle" and has the guess input disabled. Tab 2 (Guesser) sees "Alice is drawing..." and has the guess input active (with no secret word displayed).

### Acceptance Scenarios:
1. **Given** the host starts the game, **When** roles are assigned, **Then** the host's participant entry is mapped as `"drawer"` and all other participants are mapped as `"guesser"`.
2. **Given** a game starts with $N$ participants, **When** selecting the secret word, **Then** the word is deterministically selected using the formula `STARTER_WORDS[room.participants.length % STARTER_WORDS.length]` and stored on the room object.
3. **Given** a room snapshot is constructed, **When** returning it to a guesser, **Then** the `availableWords` array is completely empty to prevent exposing the word.
4. **Given** a room snapshot is constructed, **When** returning it to the host/drawer, **Then** the `availableWords` array contains exactly one element: the selected secret word.
5. **Given** the game page renders, **When** the drawer views the page, **Then** the secret word banner is displayed, and the guess input form is disabled.
6. **Given** the game page renders, **When** a guesser views the page, **Then** a banner indicating who is drawing is rendered, and the guess input form is active.
