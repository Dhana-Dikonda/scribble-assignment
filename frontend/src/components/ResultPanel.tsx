import { useEffect, useRef } from "react";
import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const guesses = room?.guesses ?? [];

  // Scroll to bottom when guesses length changes
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [guesses.length]);

  if (!room) {
    return null;
  }

  return (
    <Card title="Activity">
      {guesses.length === 0 ? (
        <div className="placeholder-block" style={{ backgroundColor: "#f9fafb" }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Game activity and guesses will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingRight: "4px",
          }}
        >
          {guesses.map((entry, idx) => (
            <div
              key={idx}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.925rem",
                lineHeight: "1.4",
                backgroundColor: entry.isCorrect ? "#e8f5e9" : "#f3f4f6",
                border: entry.isCorrect ? "1px solid #a5d6a7" : "1px solid #e5e7eb",
                color: entry.isCorrect ? "#2e7d32" : "#374151",
                alignSelf: "stretch",
              }}
            >
              <strong>{entry.playerName}</strong>: {entry.guess}
              {entry.isCorrect && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    marginLeft: "6px",
                    textTransform: "uppercase",
                    color: "#2e7d32",
                  }}
                >
                  (Correct!)
                </span>
              )}
            </div>
          ))}
          <div ref={listEndRef} />
        </div>
      )}
    </Card>
  );
}
