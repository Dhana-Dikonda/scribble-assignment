import { useEffect, useRef, useState } from "react";
import { useRoomStore } from "../state/roomStore";
import type { DrawingStroke } from "../services/api";

interface DrawingCanvasProps {
  isDrawer: boolean;
  drawing: DrawingStroke[];
}

export function DrawingCanvas({ isDrawer, drawing }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const roomStore = useRoomStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [localStrokes, setLocalStrokes] = useState<DrawingStroke[]>([]);

  // Redraw when drawing or localStrokes changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const strokesToDraw = isDrawer ? localStrokes : drawing;
    
    ctx.clearRect(0, 0, 800, 500);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 4;

    for (const stroke of strokesToDraw) {
      if (!stroke.points || stroke.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  }, [drawing, localStrokes, isDrawer]);

  // If drawing changes on the server and we are the drawer, and not actively drawing,
  // we sync localStrokes with server drawing to keep them aligned
  useEffect(() => {
    if (isDrawer && !isDrawing) {
      setLocalStrokes(drawing);
    }
  }, [drawing, isDrawer, isDrawing]);

  // Sync for guesser: when isDrawer changes, reset state
  useEffect(() => {
    if (!isDrawer) {
      setIsDrawing(false);
    } else {
      setLocalStrokes(drawing);
    }
  }, [isDrawer]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 800,
      y: ((e.clientY - rect.top) / rect.height) * 500,
    };
  };

  const getTouchCoordinates = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: ((touch.clientX - rect.left) / rect.width) * 800,
      y: ((touch.clientY - rect.top) / rect.height) * 500,
    };
  };

  const handleStartDraw = (x: number, y: number) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    const newStroke: DrawingStroke = { points: [{ x, y }] };
    setLocalStrokes((prev) => [...prev, newStroke]);
  };

  const handleDraw = (x: number, y: number) => {
    if (!isDrawer || !isDrawing) return;
    setLocalStrokes((prev) => {
      if (prev.length === 0) return prev;
      const lastStroke = prev[prev.length - 1];
      const updatedStroke = {
        ...lastStroke,
        points: [...lastStroke.points, { x, y }],
      };
      return [...prev.slice(0, -1), updatedStroke];
    });
  };

  const handleEndDraw = async () => {
    if (!isDrawer || !isDrawing) return;
    setIsDrawing(false);
    try {
      await roomStore.submitDrawing(localStrokes);
    } catch (err) {
      console.error("Failed to submit drawing:", err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    handleStartDraw(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCoordinates(e);
    handleDraw(x, y);
  };

  const handleMouseUpOrLeave = () => {
    handleEndDraw();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getTouchCoordinates(e);
    handleStartDraw(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getTouchCoordinates(e);
    handleDraw(x, y);
  };

  const handleTouchEnd = () => {
    handleEndDraw();
  };

  const handleClear = async () => {
    if (!isDrawer) return;
    setLocalStrokes([]);
    try {
      await roomStore.submitDrawing([]);
    } catch (err) {
      console.error("Failed to clear drawing:", err);
    }
  };

  return (
    <div className="drawing-canvas-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          width: '100%',
          height: 'auto',
          aspectRatio: '8/5',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: isDrawer ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {isDrawer && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="button button--secondary"
            onClick={handleClear}
          >
            Clear Canvas
          </button>
        </div>
      )}
    </div>
  );
}
