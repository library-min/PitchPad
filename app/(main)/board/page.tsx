// app/(main)/board/page.tsx
'use client';

import React from 'react';
import PitchCanvas from '@/components/board/PitchCanvas';
import Header from '@/components/layout/Header';
import { useDrawingStore } from '@/store/drawingStore';
import { useRouter } from 'next/navigation';

export default function BoardPage() {
  const router = useRouter();
  const { drawings, clear } = useDrawingStore();

  const handleSave = async () => {
    if (drawings.length === 0) {
      alert('Draw something first!');
      return;
    }

    const title = prompt('Enter a title for your strategy:', 'New Tactic');
    if (!title) return;

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, drawings }),
      });

      // 1. [수정] 서버에서 보낸 상세 에러 메시지를 파싱합니다.
      if (!response.ok) {
        const errorData = await response.json();
        // 서버의 NextResponse.json({ error: '...' }) 메시지를 가져옴
        throw new Error(errorData.error || 'Failed to save');
      }
      
      const board = await response.json();
      alert('Strategy saved successfully!');
      clear(); 
      router.push(`/dashboard`); // 저장이 완료되면 대시보드로 이동
    } catch (error: any) {
      // 2. [수정] 이제 상세한 에러 내용이 alert에 표시됩니다.
      console.error('Save error details:', error);
      alert(`Save Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col items-center p-6 md:p-8">
        <div className="w-full max-w-7xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-emerald-900 tracking-tight uppercase">Strategy Board</h1>
              <p className="text-emerald-700 font-bold opacity-80">New Formation</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => { clear(); }}
                className="px-6 py-3 bg-white border-2 border-emerald-200 text-emerald-800 font-black rounded-2xl hover:bg-emerald-50 transition-all shadow-sm"
              >
                Reset
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg ring-offset-2 ring-emerald-500 hover:ring-2"
              >
                Save Tactic
              </button>
            </div>
          </div>

          <PitchCanvas />
        </div>
      </main>
    </div>
  );
}
