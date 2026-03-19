// hooks/useDrawing.ts
import { useRef, useEffect, useState, useCallback } from 'react';
import { useDrawingStore, Drawing, Player } from '@/store/drawingStore';

interface UseDrawingProps {
  onDrawingFinished?: (drawing: Drawing) => void;
  onPlayerAdd?: (player: Player) => void;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onPlayerRemove?: (playerId: string) => void;
}

export function useDrawing({ 
  onDrawingFinished, 
  onPlayerAdd, 
  onPlayerMove, 
  onPlayerRemove 
}: UseDrawingProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);

  const { 
    drawings, addDrawing, 
    players, addPlayer, removePlayer, updatePlayerPosition,
    currentTool, currentColor, strokeWidth, selectedPlayer 
  } = useDrawingStore();

  const toRatio = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x, y };
    return { x: x / canvas.width, y: y / canvas.height };
  };

  const toPixel = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x, y };
    const finalX = x <= 1 ? x * canvas.width : x;
    const finalY = y <= 1 ? y * canvas.height : y;
    return { x: finalX, y: finalY };
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    const { x, y } = toPixel(player.x, player.y);
    const radius = 18 * (ctx.canvas.width / 1000);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = player.team === 'red' ? '#ef4444' : '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${radius * 1.1}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.number.toString(), x, y);
  };

  const renderDrawing = (ctx: CanvasRenderingContext2D, drawing: any) => {
    const { tool, color, width, points } = drawing;
    if (!points || points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width * (ctx.canvas.width / 1000);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = tool === 'highlight' ? 0.4 : 1.0;

    const start = toPixel(points[0].x, points[0].y);
    const end = toPixel(points[points.length - 1].x, points[points.length - 1].y);

    switch (tool) {
      case 'freehand':
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        points.forEach((p: any) => {
          const { x, y } = toPixel(p.x, p.y);
          ctx.lineTo(x, y);
        });
        ctx.stroke();
        break;
      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headSize = ctx.lineWidth * 4;
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headSize * Math.cos(angle - Math.PI / 6), end.y - headSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - headSize * Math.cos(angle + Math.PI / 6), end.y - headSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        break;
      case 'circle':
        const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    ctx.globalAlpha = 1.0;
  };

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(d => renderDrawing(ctx, d));
    players.forEach(p => drawPlayer(ctx, p));

    if (isDrawing && currentPoints.length > 1 && currentTool !== 'player') {
      renderDrawing(ctx, {
        tool: currentTool, color: currentColor, width: strokeWidth, points: currentPoints
      });
    }
  }, [drawings, players, isDrawing, currentPoints, currentTool, currentColor, strokeWidth]);

  useEffect(() => { redrawAll(); }, [redrawAll]);

  const onMouseDown = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    const clickedPlayer = players.find(p => {
      const { x, y } = toPixel(p.x, p.y);
      const radius = 20 * (canvasRef.current!.width / 1000);
      const dist = Math.sqrt(Math.pow(x - coords.x, 2) + Math.pow(y - coords.y, 2));
      return dist < radius;
    });

    if (clickedPlayer) {
      setDraggedPlayerId(clickedPlayer.id);
      return;
    }

    if (currentTool === 'player' && selectedPlayer) {
      const ratioCoords = toRatio(coords.x, coords.y);
      const newPlayer: Player = {
        id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        number: selectedPlayer.number,
        team: selectedPlayer.team,
        x: ratioCoords.x,
        y: ratioCoords.y
      };
      addPlayer(newPlayer);
      if (onPlayerAdd) onPlayerAdd(newPlayer);
    } else {
      setIsDrawing(true);
      setCurrentPoints([toRatio(coords.x, coords.y)]);
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    if (draggedPlayerId) {
      const ratioCoords = toRatio(coords.x, coords.y);
      updatePlayerPosition(draggedPlayerId, ratioCoords.x, ratioCoords.y);
      if (onPlayerMove) onPlayerMove(draggedPlayerId, ratioCoords.x, ratioCoords.y);
      return;
    }
    if (!isDrawing) return;
    const ratioCoords = toRatio(coords.x, coords.y);
    if (currentTool === 'arrow' || currentTool === 'circle') {
      setCurrentPoints([currentPoints[0], ratioCoords]);
    } else {
      setCurrentPoints([...currentPoints, ratioCoords]);
    }
  };

  const onMouseUp = () => {
    setDraggedPlayerId(null);
    if (!isDrawing) return;
    if (currentPoints.length > 1) {
      const newDrawing: Drawing = {
        id: Date.now().toString(), 
        tool: currentTool, 
        color: currentColor, 
        width: strokeWidth, 
        points: currentPoints
      };
      addDrawing(newDrawing);
      if (onDrawingFinished) onDrawingFinished(newDrawing);
    }
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  return { 
    canvasRef, redrawAll, onMouseDown, onMouseMove, onMouseUp, 
    onContextMenu: (e: any) => { e.preventDefault(); } 
  };
}
