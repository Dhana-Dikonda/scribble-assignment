# Implementation Plan: Scenario 4 — Result, Restart & Final Validation

Design the results state visualization and the transition back to the lobby state while clearing round-specific data.

## Proposed Changes

### Backend
- **Room Store Restarts**: Add `restartRoom(code, participantId)` in `backend/src/services/roomStore.ts`.
  - Validate that the caller is the host and the room is in the results state.
  - Reset `status` to `"lobby"`.
  - Reset all player scores to `0`.
  - Empty `drawing` and `guesses` arrays.
  - Delete `secretWord`.
- **API Endpoint**: Define `POST /rooms/:code/restart` route in `backend/src/api/rooms.ts` mapping service errors to corresponding HTTP status codes.

### Frontend
- **API Client**: Add `restartGame(code, participantId)` client method.
- **Store**: Add `restartGame()` store action.
- **Results Presentation**:
  - Render a green banner showing the round is completed, the secret word, and who guessed it.
  - Disable drawing and guess inputs when in results status.
  - Display the "Restart Game" button next to "Exit Game" only to the host/drawer.
  - Rely on the existing GamePage polling interval to automatically navigate non-hosts back to `/lobby` once the status shifts to lobby.
