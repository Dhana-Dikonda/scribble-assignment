# Reflection Report: Scribble Multiplayer Drawing Game

This report outlines the state of the initial starter code and summarizes the components and logic added to build the complete Scribble multiplayer drawing game.

---

## 1. What the Starter App Already Had

The starter codebase provided the core layout routing, layout styling, and basic structures, but lacked active coordination and gameplay mechanics:

- **App Shell & Basic Routing**: Ready-made client routes for `/` (landing), `/create-room`, `/join-room`, `/lobby`, and `/game`.
- **Placeholder Pages**: React components with static visual placeholders (such as canvas `div` placeholders, static scoreboard lists, and a non-functional guess submission form).
- **Manual Lobby Controls**: A lobby page that required users to click a "Refresh Room" button to sync participants.
- **In-Memory Store Scaffold**: A basic `Map<string, Room>` configuration in the backend and base CRUD routes (`POST /rooms` and `GET /rooms/:code`).
- **Seed Data**: An array of 5 starter words (`rocket`, `pizza`, `castle`, `guitar`, `sunflower`) and 2 roles (`drawer`, `guesser`).
- **Test Infrastructure**: Standard vitest configuration files for backend and frontend.

---

## 2. What We Added

We implemented the complete game loop, validation layer, drawing canvas, scoring mechanism, and restart workflow across Scenarios 1 through 4:

### Room Setup & Lobby (Scenario 1)
- **Host Tracking**: Mapped `hostId` to the participant ID of the room creator.
- **Player Name Validation**: Enforced non-empty, whitespace-trimmed names for room creation and joining via Zod schemas, with error feedback on the client.
- **Lobby Polling**: Implemented a ~2-second interval polling mechanism on the Lobby page, enabling automatic list refreshes and status transition redirects.
- **Host-Only Start**: Created `POST /rooms/:code/start` and restricted start action availability in the UI to the host, enforcing a 2-player minimum.

### Game Start & Drawer Flow (Scenario 2)
- **Role Assignment**: Assigned the `"drawer"` role to the host and `"guesser"` to other participants at game start.
- **Deterministic Word Selection**: Enabled selection of the secret word from the starter data using the participants count modulo formula.
- **Secret Word Isolation**: Filtered the room snapshot so that the secret word is only exposed to the host/drawer client, keeping it hidden from guessers.

### Gameplay Interaction (Scenario 3)
- **Drawing Canvas**: Developed an interactive `<DrawingCanvas>` supporting touch and mouse inputs, scaling coordinates to a reference 800x500 aspect ratio, with real-time local drawing, guesser polling redraws, and canvas clearing.
- **Scoring & Case-Insensitive Guessing**: Created `POST /rooms/:code/guesses`. Correct guesses award exactly 100 points, log the guess, and transition the status to `"results"`.
- **Dynamic Scoreboard & Guesses Activity Feed**: Scoreboard renders sorted by score descending. Activity logs guesses scrollable with green/grey correctness highlights and auto-scrolls on new guess entries.

### Results & Restart (Scenario 4)
- **Shared Results View**: Exposed the secret word to all players when in results status, rendering a completed round banner showing the word and the correct guesser name.
- **Lobby Reset**: Implemented `POST /rooms/:code/restart`, which transitions the status to `"lobby"`, preserves all participants, clears drawings and guess histories, and resets player scores to `0`. Active game pages automatically redirect players back to `/lobby`.
