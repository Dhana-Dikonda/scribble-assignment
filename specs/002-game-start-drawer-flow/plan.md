# Implementation Plan: Scenario 2 — Game Start & Drawer Flow

Implement drawer assignment, deterministic secret word selection, drawer-only secret word visibility, guess input disabling, and active GamePage polling.

## Proposed Changes

### Backend
- **Deterministic Word Selection**: In `startRoom()` in `backend/src/services/roomStore.ts`, select the secret word at index `room.participants.length % STARTER_WORDS.length`.
- **Role Assignment**: In `toRoomSnapshot()` in `backend/src/services/roomStore.ts`, map the host's role to `"drawer"` and all other participants to `"guesser"`.
- **Snapshot Visibility Filtration**: In `toRoomSnapshot()`, verify if `viewerParticipantId` matches `room.hostId`. If yes, populate `availableWords` with `[room.secretWord]`. Otherwise, populate it with `[]`.

### Frontend
- **Active Game Page Polling**: Implement a `setInterval` in `GamePage.tsx` that polls the room state every 2 seconds, and cleanly clears it on unmount.
- **Drawer Indication**: Display a header on `GamePage.tsx` showing "You are drawing!" to the host/drawer and "<Host> is drawing!" to the guessers.
- **Banners and Word Displays**:
  - Show the secret word to the drawer only using a premium gradient banner.
  - Show a green blinder banner to guessers stating "<Host> is drawing...".
- **Form Disabling**: Disable the guess form inputs and submit button for the drawer.
