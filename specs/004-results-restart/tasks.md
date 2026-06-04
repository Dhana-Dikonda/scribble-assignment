# Tasks: Scenario 4

- [x] T301 [US7] Add `restartRoom(code, participantId)` with host, status, and state reset checks to `backend/src/services/roomStore.ts`
- [x] T302 [US7] Add `POST /rooms/:code/restart` route handler in `backend/src/api/rooms.ts`
- [x] T303 [US7] Add unit test to `backend/src/services/roomStore.test.ts` verifying restart transitions results room to lobby and resets state
- [x] T304 [US7] Add `api.restartGame()` in `frontend/src/services/api.ts`
- [x] T305 [US7] Add `restartGame()` action in `frontend/src/state/roomStore.ts`
- [x] T306 [US7] Render 'Restart Game' button for host on GamePage results view and call restart
- [x] T307 Run compilation checks (builds)
- [x] T308 Run vitest tests in backend and frontend
- [x] T309 Commit all changes and verify end-to-end flow
