# Tasks: Scenario 3

- [x] T201 [US6] Add `score` to `Participant`, define `DrawingStroke`/`GuessEntry`, and add `drawing`/`guesses` to `Room`/`RoomSnapshot` in `backend/src/models/game.ts`
- [x] T202 [US6] In `backend/src/services/roomStore.ts`, initialize participant score to `0`, and initialize `drawing` / `guesses` list. Map them in `toRoomSnapshot()`
- [x] T203 [US6] Add Zod schemas `submitDrawingSchema` and `submitGuessSchema` to `backend/src/api/schemas.ts`
- [x] T204 [US6] Add `POST /:code/drawing` (overwrites drawing) and `POST /:code/guesses` (checks guess, updates score, sets status to results if correct) to `backend/src/api/rooms.ts`
- [x] T205 [US6] Add backend unit tests in `backend/src/services/roomStore.test.ts` to verify drawing updates, guess scoring, and status transitions
- [x] T206 [US6] Mirror models and add `submitDrawing`/`submitGuess` API client methods to `frontend/src/services/api.ts`
- [x] T207 [US6] Add `submitDrawing` and `submitGuess` store actions to `frontend/src/state/roomStore.ts`
- [x] T208 [US6] Create `frontend/src/components/DrawingCanvas.tsx` supporting interactive 800x500 canvas drawing for the drawer and polled redraws for guessers
- [x] T209 [US6] Update `frontend/src/pages/GamePage.tsx` to render `<DrawingCanvas />` and pass scores/guesses to Scoreboard/ResultPanel
- [x] T210 [US6] Wire `GuessForm.tsx` to submit guesses to `roomStore.submitGuess` and handle input clear/error state
- [x] T211 [US6] Update `Scoreboard.tsx` to sort participants by score descending and display them dynamically
- [x] T212 [US6] Update `ResultPanel.tsx` to display scrolled guess entries from guess history with correct highlight
- [x] T213 Run compilation checks via builds in backend and frontend
- [x] T214 Run vitest tests in backend and frontend to verify logic correctness
- [x] T215 Commit and push Scenario 3 changes with a descriptive message
