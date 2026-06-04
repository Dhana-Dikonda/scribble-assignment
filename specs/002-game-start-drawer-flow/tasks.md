# Tasks: Scenario 2

- [x] T101 [US5] Update `backend/src/models/game.ts` to add optional `secretWord?: string` to `Room` interface
- [x] T102 [US5] Update `startRoom` in `backend/src/services/roomStore.ts` to deterministically select the secret word and store it on the room
- [x] T103 [US5] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to assign roles ("drawer" for host, "guesser" for others) and filter `availableWords` so only the drawer sees the secret word
- [x] T104 [US5] Add unit tests in `backend/src/services/roomStore.test.ts` verifying:
  - deterministic word selection at game start
  - correct role mapping in snapshots
  - secret word visibility logic (only visible to host/drawer)
- [x] T105 [US5] Implement active polling in `frontend/src/pages/GamePage.tsx` using `setInterval` to call `roomStore.fetchRoom()`. Redirect to `/lobby` if room status transitions to lobby
- [x] T106 [US5] Identify the drawer name in `GamePage.tsx` for all players
- [x] T107 [US5] Display the secret word in `GamePage.tsx` only to the drawer
- [x] T108 [US5] Pass `disabled={isDrawer}` to `GuessForm` in `GamePage.tsx` and ensure `GuessForm.tsx` supports it
- [x] T109 Run `cd backend && npm run build` and `cd frontend && npm run build` to verify compilation
- [x] T110 Run `cd backend && npm test` to verify all tests pass
- [x] T111 Commit changes for Scenario 2 with a descriptive message
