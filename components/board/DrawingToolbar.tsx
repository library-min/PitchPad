// components/board/DrawingToolbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDrawingStore, ToolType, ColorType } from '@/store/drawingStore';

export const FORMATIONS = [
  { name: '4-4-2', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.85, y: 0.75 }, { n: 3, x: 0.62, y: 0.75 }, { n: 4, x: 0.38, y: 0.75 }, { n: 5, x: 0.15, y: 0.75 }, { n: 6, x: 0.85, y: 0.55 }, { n: 7, x: 0.62, y: 0.55 }, { n: 8, x: 0.38, y: 0.55 }, { n: 9, x: 0.15, y: 0.55 }, { n: 10, x: 0.6, y: 0.35 }, { n: 11, x: 0.4, y: 0.35 }] },
  { name: '4-3-3', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.85, y: 0.75 }, { n: 3, x: 0.62, y: 0.75 }, { n: 4, x: 0.38, y: 0.75 }, { n: 5, x: 0.15, y: 0.75 }, { n: 6, x: 0.7, y: 0.55 }, { n: 7, x: 0.5, y: 0.55 }, { n: 8, x: 0.3, y: 0.55 }, { n: 9, x: 0.85, y: 0.25 }, { n: 10, x: 0.5, y: 0.25 }, { n: 11, x: 0.15, y: 0.25 }] },
  { name: '4-2-3-1', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.85, y: 0.75 }, { n: 3, x: 0.62, y: 0.75 }, { n: 4, x: 0.38, y: 0.75 }, { n: 5, x: 0.15, y: 0.75 }, { n: 6, x: 0.6, y: 0.62 }, { n: 7, x: 0.4, y: 0.62 }, { n: 8, x: 0.8, y: 0.45 }, { n: 9, x: 0.5, y: 0.45 }, { n: 10, x: 0.2, y: 0.45 }, { n: 11, x: 0.5, y: 0.25 }] },
  { name: '4-1-4-1', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.85, y: 0.75 }, { n: 3, x: 0.62, y: 0.75 }, { n: 4, x: 0.38, y: 0.75 }, { n: 5, x: 0.15, y: 0.75 }, { n: 6, x: 0.5, y: 0.65 }, { n: 7, x: 0.8, y: 0.45 }, { n: 8, x: 0.6, y: 0.45 }, { n: 9, x: 0.4, y: 0.45 }, { n: 10, x: 0.2, y: 0.45 }, { n: 11, x: 0.5, y: 0.25 }] },
  { name: '3-5-2', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.75, y: 0.75 }, { n: 3, x: 0.5, y: 0.75 }, { n: 4, x: 0.25, y: 0.75 }, { n: 5, x: 0.9, y: 0.5 }, { n: 6, x: 0.65, y: 0.55 }, { n: 7, x: 0.5, y: 0.55 }, { n: 8, x: 0.35, y: 0.55 }, { n: 9, x: 0.1, y: 0.5 }, { n: 10, x: 0.6, y: 0.3 }, { n: 11, x: 0.4, y: 0.3 }] },
  { name: '3-4-3', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.75, y: 0.75 }, { n: 3, x: 0.5, y: 0.75 }, { n: 4, x: 0.25, y: 0.75 }, { n: 5, x: 0.85, y: 0.55 }, { n: 6, x: 0.6, y: 0.55 }, { n: 7, x: 0.4, y: 0.55 }, { n: 8, x: 0.15, y: 0.55 }, { n: 9, x: 0.8, y: 0.3 }, { n: 10, x: 0.5, y: 0.25 }, { n: 11, x: 0.2, y: 0.3 }] },
  { name: '5-3-2', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.9, y: 0.72 }, { n: 3, x: 0.7, y: 0.75 }, { n: 4, x: 0.5, y: 0.75 }, { n: 5, x: 0.3, y: 0.75 }, { n: 6, x: 0.1, y: 0.72 }, { n: 7, x: 0.7, y: 0.55 }, { n: 8, x: 0.5, y: 0.55 }, { n: 9, x: 0.3, y: 0.55 }, { n: 10, x: 0.6, y: 0.3 }, { n: 11, x: 0.4, y: 0.3 }] },
  { name: '5-4-1', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.9, y: 0.72 }, { n: 3, x: 0.7, y: 0.75 }, { n: 4, x: 0.5, y: 0.75 }, { n: 5, x: 0.3, y: 0.75 }, { n: 6, x: 0.1, y: 0.72 }, { n: 7, x: 0.8, y: 0.55 }, { n: 8, x: 0.6, y: 0.55 }, { n: 9, x: 0.4, y: 0.55 }, { n: 10, x: 0.2, y: 0.55 }, { n: 11, x: 0.5, y: 0.25 }] },
  { name: '4-5-1', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.85, y: 0.75 }, { n: 3, x: 0.62, y: 0.75 }, { n: 4, x: 0.38, y: 0.75 }, { n: 5, x: 0.15, y: 0.75 }, { n: 6, x: 0.85, y: 0.55 }, { n: 7, x: 0.65, y: 0.55 }, { n: 8, x: 0.5, y: 0.55 }, { n: 9, x: 0.35, y: 0.55 }, { n: 10, x: 0.15, y: 0.55 }, { n: 11, x: 0.5, y: 0.25 }] },
  { name: '3-6-1', positions: [{ n: 1, x: 0.5, y: 0.92 }, { n: 2, x: 0.75, y: 0.75 }, { n: 3, x: 0.5, y: 0.75 }, { n: 4, x: 0.25, y: 0.75 }, { n: 5, x: 0.9, y: 0.55 }, { n: 6, x: 0.7, y: 0.55 }, { n: 7, x: 0.55, y: 0.55 }, { n: 8, x: 0.45, y: 0.55 }, { n: 9, x: 0.3, y: 0.55 }, { n: 10, x: 0.1, y: 0.55 }, { n: 11, x: 0.5, y: 0.3 }] },
];

interface DrawingToolbarProps {
  readOnly?: boolean;
  onYoutubeToggle?: () => void;
  isYoutubeActive?: boolean;
  onApplyFormation?: (name: string, team: 'red' | 'blue') => void;
  onClear?: () => void;
}

const Icons = {
  Pencil: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
  ),
  Arrow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  ),
  Circle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
  ),
  Highlighter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="m21 12-9-9-9.5 9.5a3 3 0 0 0 0 4.24l1.26 1.26a3 3 0 0 0 4.24 0Z"/><path d="M5 18h14"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Undo: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  )
};

const ToolButton = ({ 
  selected, 
  onClick, 
  title, 
  children,
  danger = false
}: { 
  selected?: boolean; 
  onClick: () => void; 
  title: string; 
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <div className="relative group flex items-center">
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-[10px] transition-all duration-200 cursor-pointer ${
        selected 
          ? 'bg-[#0a0a0a] text-white shadow-md' 
          : danger 
            ? 'bg-transparent text-[#ef4444] hover:bg-red-50' 
            : 'bg-transparent text-[#6b7280] hover:bg-[#f3f4f6]'
      }`}
    >
      {children}
    </button>
    <div className="absolute left-full ml-3 px-2 py-1 bg-[#0a0a0a] text-white text-[12px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[100] font-medium shadow-xl">
      {title}
    </div>
  </div>
);

const Divider = () => <div className="h-[1px] bg-[#f3f4f6] mx-1 my-1" />;

export default function DrawingToolbar({ 
  readOnly, 
  onYoutubeToggle, 
  isYoutubeActive,
  onApplyFormation,
  onClear
}: DrawingToolbarProps) {
  const { 
    currentTool, 
    setTool, 
    currentColor, 
    setColor, 
    undo, 
    clear, 
    selectedPlayer, 
    setSelectedPlayer,
    strokeWidth,
    setStrokeWidth
  } = useDrawingStore();

  const [isFormationOpen, setIsFormationOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue'>('red');
  
  const [playerNum, setPlayerNum] = useState<string>('1');
  const [playerTeam, setPlayerTeam] = useState<'red' | 'blue'>('red');

  // 컬러 피커 입력을 위한 ref
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentTool === 'player') {
          setTool('freehand');
          setSelectedPlayer(null);
          setIsFormationOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTool, setTool, setSelectedPlayer]);

  if (readOnly) return null;

  const handleConfirmPlayer = () => {
    const num = parseInt(playerNum);
    if (isNaN(num) || num < 1 || num > 99) {
      alert('등번호는 1에서 99 사이의 숫자여야 합니다.');
      return;
    }
    setSelectedPlayer({ team: playerTeam, number: num });
  };

  const colors: ColorType[] = ['#EF4444', '#3B82F6', '#FACC15', '#FFFFFF'];
  const thicknesses: { label: string; value: number }[] = [
    { label: 'S', value: 2 },
    { label: 'M', value: 4 },
    { label: 'L', value: 8 }
  ];

  return (
    <div className="flex flex-col gap-4 relative">
      <div 
        className="flex flex-col p-2 bg-white border-[0.5px] border-[#e5e7eb] rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] z-50 overflow-visible sticky top-4 bottom-4 w-[56px] shrink-0 gap-[4px]"
      >
        {/* 도구 버튼들 */}
        <ToolButton 
          selected={currentTool === 'freehand'} 
          onClick={() => { setTool('freehand'); setIsFormationOpen(false); setSelectedPlayer(null); }} 
          title="연필"
        >
          <Icons.Pencil />
        </ToolButton>
        <ToolButton 
          selected={currentTool === 'arrow'} 
          onClick={() => { setTool('arrow'); setIsFormationOpen(false); setSelectedPlayer(null); }} 
          title="화살표"
        >
          <Icons.Arrow />
        </ToolButton>
        <ToolButton 
          selected={currentTool === 'circle'} 
          onClick={() => { setTool('circle'); setIsFormationOpen(false); setSelectedPlayer(null); }} 
          title="원형"
        >
          <Icons.Circle />
        </ToolButton>

        <Divider />

        <ToolButton 
          selected={currentTool === 'player' && !isFormationOpen} 
          onClick={() => { 
            setTool('player'); 
            setIsFormationOpen(false);
            if (selectedPlayer) setSelectedPlayer(null);
          }} 
          title="선수 배치"
        >
          <Icons.User />
        </ToolButton>
        <ToolButton 
          selected={isFormationOpen} 
          onClick={() => { setIsFormationOpen(!isFormationOpen); setTool('player'); setSelectedPlayer(null); }} 
          title="포메이션"
        >
          <Icons.Grid />
        </ToolButton>
        <ToolButton 
          selected={isYoutubeActive} 
          onClick={() => {
            console.log('[YouTube] DrawingToolbar button clicked');
            onYoutubeToggle?.();
          }} 
          title="유튜브 분석"
        >
          <Icons.Play />
        </ToolButton>

        <Divider />

        {/* 색상 선택 */}
        <div className="flex flex-col items-center gap-2 py-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c as ColorType)}
              className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                currentColor === c ? 'scale-125 ring-2 ring-offset-2 ring-[#0a0a0a] z-10 shadow-sm' : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid #e5e7eb' : 'none' }}
            />
          ))}
          
          {/* 커스텀 컬러 피커 */}
          <div className="relative">
            <button
              onClick={() => colorInputRef.current?.click()}
              className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer relative ${
                !colors.includes(currentColor.toUpperCase() as ColorType)
                  ? 'scale-125 ring-2 ring-offset-2 ring-[#0a0a0a] z-10 shadow-sm'
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{
                background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                border: !colors.includes(currentColor.toUpperCase() as ColorType)
                  ? '2px solid white' : '2px solid transparent'
              }}
              title="커스텀 색상"
            />
            <input
              ref={colorInputRef}
              type="color"
              className="absolute opacity-0 w-0 h-0 p-0 pointer-events-none"
              onChange={(e) => setColor(e.target.value as ColorType)}
            />
          </div>
        </div>

        <Divider />

        {/* 굵기 선택 */}
        <div className="flex flex-col items-center gap-1 py-1">
          {thicknesses.map((t) => (
            <button
              key={t.label}
              onClick={() => setStrokeWidth(t.value)}
              className={`w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                strokeWidth === t.value 
                  ? 'bg-[#0a0a0a] text-white' 
                  : 'text-[#6b7280] hover:bg-[#f3f4f6]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Divider />

        {/* 액션 */}
        <ToolButton onClick={undo} title="되돌리기">
          <Icons.Undo />
        </ToolButton>
        <ToolButton 
          onClick={() => {
            if (onClear) onClear();
            else clear();
          }} 
          title="전체 삭제" 
          danger
        >
          <Icons.Trash />
        </ToolButton>
      </div>

      {/* 선수 배치 설정 모달 */}
      {currentTool === 'player' && !isFormationOpen && (
        <div className="absolute left-[68px] top-0 p-4 bg-white border border-[#e5e7eb] rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-left-2 duration-200 w-48">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">등번호 입력 (1-99)</label>
            <input 
              type="number"
              min={1}
              max={99}
              value={playerNum}
              onChange={(e) => setPlayerNum(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmPlayer()}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-lg text-sm font-bold text-[#0a0a0a] focus:ring-2 focus:ring-[#0a0a0a] outline-none transition-all"
              placeholder="1~99"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">팀 선택</label>
            <div className="flex p-1 bg-[#f3f4f6] rounded-lg">
              <button 
                onClick={() => setPlayerTeam('red')}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${playerTeam === 'red' ? 'bg-white text-[#ef4444] shadow-sm' : 'text-[#6b7280]'}`}
              >RED</button>
              <button 
                onClick={() => setPlayerTeam('blue')}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${playerTeam === 'blue' ? 'bg-white text-[#3b82f6] shadow-sm' : 'text-[#6b7280]'}`}
              >BLUE</button>
            </div>
          </div>

          <button 
            onClick={handleConfirmPlayer}
            className={`w-full py-2.5 rounded-lg text-[12px] font-bold transition-all shadow-sm ${
              selectedPlayer?.number === parseInt(playerNum) && selectedPlayer?.team === playerTeam
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-[#f3f4f6] text-[#0a0a0a] hover:bg-[#e5e7eb]'
            }`}
          >
            {selectedPlayer?.number === parseInt(playerNum) && selectedPlayer?.team === playerTeam ? '설정됨 (경기장 클릭)' : '확인'}
          </button>
          
          <div className="flex flex-col gap-1">
            <p className="text-[9px] text-gray-400 text-center leading-tight">경기장을 클릭하여 배치하세요.</p>
            <p className="text-[9px] text-gray-400 text-center leading-tight">ESC 키를 누르면 종료됩니다.</p>
          </div>
        </div>
      )}

      {/* 포메이션 선택 모달 */}
      {isFormationOpen && (
        <div className="absolute left-[68px] top-0 p-4 bg-white border border-[#e5e7eb] rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-200 w-56">
          <div className="flex p-1 bg-[#f3f4f6] rounded-lg">
            <button 
              onClick={() => setSelectedTeam('red')}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${selectedTeam === 'red' ? 'bg-white text-[#ef4444] shadow-sm' : 'text-[#6b7280]'}`}
            >RED</button>
            <button 
              onClick={() => setSelectedTeam('blue')}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${selectedTeam === 'blue' ? 'bg-white text-[#3b82f6] shadow-sm' : 'text-[#6b7280]'}`}
            >BLUE</button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {FORMATIONS.map((f) => (
              <button
                key={f.name}
                onClick={() => {
                  onApplyFormation?.(f.name, selectedTeam);
                  setIsFormationOpen(false);
                }}
                className="py-2.5 px-2 bg-white hover:bg-[#f3f4f6] text-[#0a0a0a] text-[12px] font-medium rounded-lg border border-[#e5e7eb] transition-all cursor-pointer"
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
