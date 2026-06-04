import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId, error, isLoading } = useRoomState();
  const [startError, setStartError] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no room session
  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  // FR-104: immediate fetch on mount + FR-112: silent background polling
  const runPoll = useCallback(async () => {
    if (!room) return;
    try {
      const snapshot = await api.fetchRoom(
        room.code,
        participantId ?? undefined
      );
      roomStore.setRoomSnapshot(snapshot.room);
      if (snapshot.room.status === "game") {
        navigate("/game", { replace: true });
      }
      setPollError(null);
    } catch {
      setPollError("Unable to refresh — retrying…");
    }
  }, [room, participantId, roomStore, navigate]);

  useEffect(() => {
    if (!room) return;

    // Immediate fetch on mount (may show isLoading via store's fetchRoom for initial)
    void runPoll();

    // Background interval — silent, no isLoading toggled
    intervalRef.current = setInterval(() => {
      void runPoll();
    }, 2000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [room?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const isHost = room?.hostId === participantId;
  const canStart = isHost && (room?.participants.length ?? 0) >= 2;

  async function handleStartGame() {
    try {
      setStartError(null);
      setIsStarting(true);
      await roomStore.startGame();
      navigate("/game");
    } catch (caughtError) {
      setStartError(
        caughtError instanceof Error ? caughtError.message : "Unable to start game"
      );
    } finally {
      setIsStarting(false);
    }
  }

  if (!room) {
    return null;
  }

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.id === room.hostId && (
                      <span className="player-list__meta"> · Host</span>
                    )}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p
            className="status-line"
            style={{
              backgroundColor: isLoading ? "#fef3c7" : "#e0e7ff",
              color: isLoading ? "#b45309" : "#3730a3"
            }}
          >
            {isLoading ? "Loading…" : "Ready to play"}
          </p>
          {pollError ? (
            <p style={{ marginTop: "8px", color: "#b45309", fontSize: "0.875rem" }}>
              {pollError}
            </p>
          ) : (
            <p style={{ marginTop: "8px" }}>
              {error ?? "Waiting for the host to start the game."}
            </p>
          )}
          {startError && <p className="form__error">{startError}</p>}
        </Card>
      </div>

      <div className="button-row button-row--spread">
        {isHost ? (
          <button
            className="button button--primary"
            disabled={!canStart || isStarting}
            onClick={handleStartGame}
            title={!canStart ? "Need at least 2 players to start" : undefined}
          >
            {isStarting ? "Starting…" : canStart ? "Start Game" : "Need at least 2 players"}
          </button>
        ) : (
          <button className="button button--primary" disabled>
            Waiting for host to start…
          </button>
        )}
      </div>
    </section>
  );
}
