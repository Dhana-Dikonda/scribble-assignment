import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function Scoreboard() {
  const { room, participantId } = useRoomState();

  if (!room) {
    return null;
  }

  // Sort participants by score descending
  const sortedParticipants = [...room.participants].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );

  return (
    <Card title="Scoreboard">
      <ul className="player-list">
        {sortedParticipants.map((p) => {
          const isCurrent = p.id === participantId;
          const isDrawer = p.id === room.hostId;
          return (
            <li
              key={p.id}
              style={
                isCurrent
                  ? { borderLeft: "4px solid var(--brand)", paddingLeft: "16px" }
                  : undefined
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: isCurrent ? "700" : "500" }}>
                  {p.name} {isCurrent && "(You)"}
                </span>
                {isDrawer && (
                  <span
                    className="player-list__meta"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    Drawer
                  </span>
                )}
              </div>
              <strong style={{ fontSize: "1.25rem" }}>{p.score ?? 0}</strong>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
