// components/board/PitchCanvas.tsx
'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useDrawing } from '@/hooks/useDrawing';
import { Drawing, Player } from '@/store/drawingStore';

export interface PitchCanvasHandle {
  getMergedDataURL: () => string | null;
  getDimensions: () => { width: number; height: number } | null;
}

interface PitchCanvasProps {
  readOnly?: boolean;
  onDrawingFinished?: (drawing: Drawing) => void;
  onPlayerAdd?: (player: Player) => void;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onPlayerRemove?: (playerId: string) => void;
  children?: React.ReactNode;
}

const PitchCanvas = forwardRef<PitchCanvasHandle, PitchCanvasProps>(({ 
  readOnly, 
  onDrawingFinished, 
  onPlayerAdd,
  onPlayerMove,
  onPlayerRemove,
  children 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null); 
  
  const { 
    canvasRef: drawingCanvasRef, 
    redrawAll, 
    onMouseDown, 
    onMouseMove, 
    onMouseUp,
    onDoubleClick,
    onContextMenu
  } = useDrawing({
    onDrawingFinished: readOnly ? undefined : onDrawingFinished,
    onPlayerAdd: readOnly ? undefined : onPlayerAdd,
    onPlayerMove: readOnly ? undefined : onPlayerMove,
    onPlayerRemove: readOnly ? undefined : onPlayerRemove,
  });

  const drawPitch = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    if (width <= 0 || height <= 0) return;
    
    ctx.clearRect(0, 0, width, height);
    const grassMain = '#2d6a35';
    const grassStripe = '#40916c';
    const lineColor = 'rgba(255, 255, 255, 1.0)';
    
    const stripeCount = 10;
    const stripeWidth = width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? grassMain : grassStripe;
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
    }

    ctx.strokeStyle = lineColor;
    const margin = 20 * dpr; // 여백 약간 축소
    const pitchW = width - margin * 2;
    const pitchH = height - margin * 2;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.lineWidth = 4 * dpr;
    ctx.strokeRect(margin, margin, pitchW, pitchH);
    ctx.beginPath();
    ctx.moveTo(centerX, margin);
    ctx.lineTo(centerX, height - margin);
    ctx.stroke();
    
    // 원형은 세로 높이 기준으로 비율 유지
    const circleRadius = Math.min(pitchW, pitchH) * 0.2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    ctx.lineWidth = 3 * dpr;
    const penaltyW = pitchW * 0.15;
    const penaltyH = pitchH * 0.6;
    ctx.strokeRect(margin, centerY - penaltyH / 2, penaltyW, penaltyH);
    ctx.strokeRect(width - margin - penaltyW, centerY - penaltyH / 2, penaltyW, penaltyH);
    
    const goalBoxW = penaltyW * 0.35;
    const goalBoxH = penaltyH * 0.4;
    ctx.strokeRect(margin, centerY - goalBoxH / 2, goalBoxW, goalBoxH);
    ctx.strokeRect(width - margin - goalBoxW, centerY - goalBoxH / 2, goalBoxW, goalBoxH);

    const arcRadius = circleRadius * 0.8;
    ctx.beginPath();
    ctx.arc(margin + penaltyW * 0.7, centerY, arcRadius, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width - margin - penaltyW * 0.7, centerY, arcRadius, Math.PI * 0.66, -Math.PI * 0.66);
    ctx.stroke();

    const cornerR = 10 * dpr;
    ctx.beginPath(); ctx.arc(margin, margin, cornerR, 0, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(margin, height - margin, cornerR, -Math.PI / 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(width - margin, margin, cornerR, Math.PI / 2, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(width - margin, height - margin, cornerR, Math.PI, -Math.PI / 2); ctx.stroke();

    const goalWidth = 10 * dpr;
    const goalHeight = goalBoxH * 0.3;
    ctx.beginPath();
    ctx.moveTo(margin, centerY - goalHeight);
    ctx.lineTo(margin - goalWidth, centerY - goalHeight);
    ctx.lineTo(margin - goalWidth, centerY + goalHeight);
    ctx.lineTo(margin, centerY + goalHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - margin, centerY - goalHeight);
    ctx.lineTo(width - margin + goalWidth, centerY - goalHeight);
    ctx.lineTo(width - margin + goalWidth, centerY + goalHeight);
    ctx.lineTo(width - margin, centerY + goalHeight);
    ctx.stroke();
  }, []);

  useImperativeHandle(ref, () => ({
    getDimensions: () => {
      const canvas = staticCanvasRef.current;
      if (!canvas) return null;
      return { width: canvas.width, height: canvas.height };
    },
    getMergedDataURL: () => {
      const pitchCanvas = staticCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      if (!pitchCanvas || !drawingCanvas) return null;
      const merged = document.createElement('canvas');
      merged.width = pitchCanvas.width;
      merged.height = pitchCanvas.height;
      const ctx = merged.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(pitchCanvas, 0, 0);
      ctx.drawImage(drawingCanvas, 0, 0);
      return merged.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    const staticCanvas = staticCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const container = containerRef.current;
    if (!staticCanvas || !drawingCanvas || !container) return;
    const staticCtx = staticCanvas.getContext('2d');
    if (!staticCtx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerW, height: containerH } = entry.contentRect;
        if (containerW <= 0 || containerH <= 0) continue;

        const dpr = window.devicePixelRatio || 1;
        // 부모 컨테이너 크기 그대로 캔버스 크기 설정 (1.5:1 무시)
        [staticCanvas, drawingCanvas].forEach(canvas => {
          canvas.width = containerW * dpr;
          canvas.height = containerH * dpr;
          canvas.style.width = `${containerW}px`;
          canvas.style.height = `${containerH}px`;
        });

        drawPitch(staticCtx, staticCanvas.width, staticCanvas.height, dpr);
        redrawAll();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [redrawAll, drawPitch]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-emerald-800">
      {/* Layer 1: Pitch */}
      <canvas ref={staticCanvasRef} className="absolute inset-0 block" />
      
      {/* Layer 2: Overlays */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
        {children}
      </div>

      {/* Layer 3: Drawings & Players */}
      <canvas
        ref={drawingCanvasRef}
        onMouseDown={readOnly ? undefined : onMouseDown}
        onMouseMove={readOnly ? undefined : onMouseMove}
        onMouseUp={readOnly ? undefined : onMouseUp}
        onMouseLeave={readOnly ? undefined : onMouseUp}
        onDoubleClick={readOnly ? undefined : onDoubleClick}
        onContextMenu={readOnly ? undefined : onContextMenu}
        className={`absolute inset-0 block touch-none z-[20] ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
      />
      
      <div className="absolute bottom-2 right-4 text-emerald-100/10 font-black text-[10px] md:text-sm pointer-events-none select-none italic uppercase z-[30]">
        PitchPad Analysis
      </div>
    </div>
  );
});

PitchCanvas.displayName = 'PitchCanvas';

export default PitchCanvas;
