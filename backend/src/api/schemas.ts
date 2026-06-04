import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, "Player name is required")
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: "Player name cannot be blank" })
});

export const joinRoomSchema = z.object({
  playerName: z
    .string()
    .min(1, "Player name is required")
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: "Player name cannot be blank" })
});

export const startRoomSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required")
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
