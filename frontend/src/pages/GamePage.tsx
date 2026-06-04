import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const [pollError, setPollError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect if no room session
  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [navigate, room]);

  const runPoll = useCallback(async () => {
    if (!room) return;
    try {
      const snapshot = await api.fetchRoom(
        room.code,
        participantId ?? undefined
      );
      roomStore.setRoomSnapshot(snapshot.room);
      if (snapshot.room.status === "lobby") {
        navigate("/lobby", { replace: true });
      }
      setPollError(null);
    } catch {
      setPollError("Unable to refresh — retrying…");
    }
  }, [room, participantId, roomStore, navigate]);

  useEffect(() => {
    if (!room) return;

    // Immediate mount fetch
    void runPoll();

    // Silent background interval polling
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

  const handleRestart = async () => {
    try {
      await roomStore.restartGame();
    } catch (err) {
      console.error("Failed to restart game:", err);
    }
  };

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = participantId === room.hostId;
  const drawer = room.participants.find((participant) => participant.id === room.hostId) ?? null;
  const drawerName = drawer?.name ?? "Host";
  const correctGuess = room.guesses?.find((g) => g.isCorrect) ?? null;

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">
            {room.status === "results"
              ? "Round Completed!"
              : isDrawer
              ? "You are drawing!"
              : `${drawerName} is drawing!`}
          </h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          {room.status === "results" ? (
            <div className="word-banner" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '1px solid #6ee7b7' }}>
              <span className="word-banner__label" style={{ color: '#065f46' }}>Round Completed!</span>
              <h2 className="word-banner__word" style={{ color: '#064e3b' }}>
                Word was: {room.availableWords?.[0] ?? "..."}
              </h2>
              {correctGuess && (
                <p style={{ color: '#047857', fontWeight: '600', marginTop: '4px', margin: 0 }}>
                  Guessed by <strong>{correctGuess.playerName}</strong>!
                </p>
              )}
            </div>
          ) : (
            <>
              {isDrawer && (
                <div className="word-banner">
                  <span className="word-banner__label">Your secret word to draw:</span>
                  <h2 className="word-banner__word">{room.availableWords?.[0] ?? "..."}</h2>
                </div>
              )}

              {!isDrawer && (
                <div className="guesser-banner">
                  <span className="guesser-banner__indicator" />
                  <span><strong>{drawerName}</strong> is drawing...</span>
                </div>
              )}
            </>
          )}

          <Card title="Canvas">
            <DrawingCanvas isDrawer={isDrawer && room.status === "game"} drawing={room.drawing || []} />
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{isDrawer ? "Drawing" : "Guessing"}</dd>
              </div>
              {pollError && (
                <div>
                  <dt style={{ color: "#b45309" }}>Connection</dt>
                  <dd style={{ color: "#b45309", fontSize: "0.875rem" }}>{pollError}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Your Guess">
            <GuessForm disabled={isDrawer || room.status === "results"} />
          </Card>
        </aside>
      </div>

      <div className="button-row">
        {isDrawer && room.status === "results" && (
          <button className="button button--primary" onClick={handleRestart}>
            Restart Game
          </button>
        )}
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
