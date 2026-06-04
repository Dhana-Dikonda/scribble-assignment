# Implementation Plan: Scenario 1 — Room Setup & Lobby

Add host tracking to the room model, tighten input validation, implement automatic lobby polling on the frontend, and add a host-only `POST /rooms/:code/start` endpoint that transitions the room from `"lobby"` to `"game"` and triggers navigation for all participants.

## Technical Context
- **Language/Version**: TypeScript (Node 18+, React 18)
- **Primary Dependencies**: Express (backend), React + React Router v6 (frontend), Zod (validation), Vite (dev server)
- **Storage**: In-memory `Map<string, Room>` — no persistence
- **Testing**: Vitest (both `backend/vitest.config.ts` and `frontend/vitest.config.ts`)

## Proposed Changes

### Backend
- **Room Models**: Extend `Room` and `RoomSnapshot` interfaces to support `hostId: string` and extend `RoomStatus` to `"lobby" | "game" | "results"`.
- **Validation**: Tighten `createRoomSchema` and `joinRoomSchema` in `schemas.ts` to trim and reject blank name strings.
- **Service Logic**: 
  - Update `createRoom()` to set `room.hostId = participant.id`.
  - Expose `hostId` in `toRoomSnapshot()` so the frontend can check host status.
- **Start Game Route**: Create `POST /rooms/:code/start` handler that:
  - Validates room code and checks if calling player is host.
  - Verifies at least 2 participants are in the room.
  - Transitions `status` to `"game"`.

### Frontend
- **API Client**: Fix base URL by removing `/bug` suffix. Add `api.startGame()` method.
- **Room Store**: Add `startGame()` store action.
- **Lobby UI**:
  - Replace the manual Refresh button with a 2-second interval polling loop.
  - Clear interval on component unmount to prevent leaks.
  - Restrict the Start Game button to the host and disable it if fewer than 2 players are present.
  - Check room status and automatically navigate to `/game` when the status changes.
