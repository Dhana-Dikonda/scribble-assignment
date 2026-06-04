# Implementation Plan: Scenario 3 — Gameplay Interaction

Support drawing stroke syncing, case-insensitive guessing, score accumulation, descending scoreboard sorting, and auto-scrolled correctness-highlighted activity logs.

## Proposed Changes

### Backend
- **Data Models**: Add `score: number` to `Participant`, define `DrawingStroke`/`GuessEntry`, and add `drawing`/`guesses` to `Room` and `RoomSnapshot`.
- **Validation**: Define Zod schemas `submitDrawingSchema` and `submitGuessSchema` (with trim and non-empty checks).
- **Service Logic**: Implemented `submitDrawing()` and `submitGuess()` (checks correctness case-insensitively, awards 100 points, logs guess, and transitions status to `"results"`).
- **Routes**: Expose `POST /rooms/:code/drawing` and `POST /rooms/:code/guesses` endpoints in `rooms.ts`.

### Frontend
- **Canvas Rendering**: Create `<DrawingCanvas>` with mouse and touch listeners. Drawer draws locally and submits on mouse up, whereas guessers poll and redraw strokes. Host has a clear canvas button.
- **Scoreboard**: Map and sort participants by score descending.
- **Activity Logs**: Render guess history in a scrollable list, highlighting correct guesses in green and auto-scrolling to the bottom.
- **Form Submission**: Wire `GuessForm` to submit guesses to the store, clear input, and display errors.
