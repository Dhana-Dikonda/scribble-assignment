import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startRoomSchema,
  submitDrawingSchema,
  submitGuessSchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, startRoom, toRoomSnapshot, saveRoom, submitDrawing, submitGuess, restartRoom } from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(code.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startRoomSchema.parse(request.body);
      const result = startRoom(code.toUpperCase(), participantId);

      if ("error" in result) {
        if (result.error === "not_found") {
          throw new HttpError(404, "Room not found");
        }
        if (result.error === "already_started") {
          throw new HttpError(400, "Game already started");
        }
        if (result.error === "forbidden") {
          throw new HttpError(403, "Only the host can start the game");
        }
        if (result.error === "not_enough_players") {
          throw new HttpError(400, "Need at least 2 players to start");
        }
      } else {
        response.json({ room: result.room });
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/drawing", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, drawing } = submitDrawingSchema.parse(request.body);
      const result = submitDrawing(code.toUpperCase(), participantId, drawing);

      if ("error" in result) {
        if (result.error === "not_found") {
          throw new HttpError(404, "Room not found");
        }
        if (result.error === "not_in_game") {
          throw new HttpError(400, "Drawing is only allowed during the game round");
        }
        if (result.error === "forbidden") {
          throw new HttpError(403, "Only the drawer can update the drawing");
        }
      } else {
        response.json({ room: result.room });
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guesses", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, guess } = submitGuessSchema.parse(request.body);
      const result = submitGuess(code.toUpperCase(), participantId, guess);

      if ("error" in result) {
        if (result.error === "not_found") {
          throw new HttpError(404, "Room not found");
        }
        if (result.error === "not_in_game") {
          throw new HttpError(400, "Game is not in progress");
        }
        if (result.error === "participant_not_found") {
          throw new HttpError(404, "Participant not found");
        }
        if (result.error === "forbidden") {
          throw new HttpError(403, "Drawer cannot submit a guess");
        }
      } else {
        response.json({ room: result.room });
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/restart", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startRoomSchema.parse(request.body);
      const result = restartRoom(code.toUpperCase(), participantId);

      if ("error" in result) {
        if (result.error === "not_found") {
          throw new HttpError(404, "Room not found");
        }
        if (result.error === "not_in_results") {
          throw new HttpError(400, "Game cannot be restarted unless in results state");
        }
        if (result.error === "forbidden") {
          throw new HttpError(403, "Only the host can restart the game");
        }
      } else {
        response.json({ room: result.room });
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
}
