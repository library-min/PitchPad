'use client';

import React, { useEffect, use, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PitchCanvas, { PitchCanvasHandle } from '@/components/board/PitchCanvas';
import Header from '@/components/layout/Header';
import { useDrawingStore, Drawing, Player } from '@/store/drawingStore';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import DrawingToolbar from '@/components/board/DrawingToolbar';
import YoutubeOverlay from '@/components/board/YoutubeOverlay';
import type { User } from '@supabase/supabase-js';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardDetailPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: boardId } = use(params);
  
  const drawings = useDrawingStore((state) => state.drawings);
  const setDrawings = useDrawingStore((state) => state.setDrawings);
  const players = useDrawingStore((state) => state.players);
  const setPlayers = useDrawingStore((state) => state.setPlayers);
  const clear = useDrawingStore((state) => state.clear);

  const supabase = createClient();
  const canvasRef = useRef<PitchCanvasHandle>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // YouTube States
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isYoutubeMode, setIsYoutubeMode] = useState(false);
  const [isYoutubeModalOpen, setIsYoutubeModalOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const { data: board, isLoading: isBoardLoading } = useQuery({
    queryKey: ['boards', boardId],
    queryFn: async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    }
  });

  const isOwner = currentUser && board && currentUser.id === board.user_id;

  // [수정 1] board 데이터가 로드되면 항상 store 동기화 (빈 배열 포함)
  useEffect(() => {
    if (board) {
      console.log('[Data Sync] Loading board data into store', { drawings: board.drawings?.length, players: board.players?.length });
      setDrawings(board.drawings || []);
      setPlayers(board.players || []);
    }
  }, [board, setDrawings, setPlayers]);

  const updateMutation = useMutation({
    mutationFn: async ({ updatedDrawings, updatedPlayers }: { updatedDrawings: Drawing[], updatedPlayers: Player[] }) => {
      const thumbnailData = canvasRef.current?.getMergedDataURL() || null;
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // [수정 2] 명시적으로 빈 배열 보장
          drawings: updatedDrawings ?? [], 
          players: updatedPlayers ?? [], 
          thumbnail: thumbnailData 
        }),
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
      alert('전술이 저장되었습니다!');
    }
  });

  const handleYoutubeUrlSubmit = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const videoId = match?.[1] || null;
    if (videoId) {
      setYoutubeVideoId(videoId);
      setIsYoutubeModalOpen(false);
      setIsYoutubeMode(true);
    } else {
      alert('유효한 YouTube URL을 입력해주세요.');
    }
  };

  // [수정 3] YouTube 토글 함수 및 로그 추가
  const toggleYoutubeMode = () => {
    console.log('[YouTube] toggle clicked, current mode:', isYoutubeMode);
    const newMode = !isYoutubeMode;
    setIsYoutubeMode(newMode);
    if (!newMode) {
      setYoutubeVideoId(null);
    } else if (!youtubeVideoId) {
      setIsYoutubeModalOpen(true);
    }
  };

  // Clear store when leaving the page
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return (
    <div className="h-screen bg-emerald-50 flex flex-col overflow-hidden relative">
      <Header />
      
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0">
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full min-h-0 gap-4">
          
          <div className="flex flex-row items-center justify-between shrink-0 h-10">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-emerald-100 rounded-xl transition-all">
                ←
              </button>
              {isBoardLoading ? (
                <div className="w-32 h-6 bg-emerald-200 animate-pulse rounded" />
              ) : (
                <h1 className="text-xl md:text-2xl font-black text-emerald-900 uppercase truncate max-w-[200px] md:max-w-none">
                  {board?.title}
                </h1>
              )}
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <button 
                  onClick={() => updateMutation.mutate({ updatedDrawings: drawings, updatedPlayers: players })}
                  disabled={updateMutation.isPending}
                  className={`px-4 py-2 bg-emerald-600 text-white text-sm font-black rounded-xl shadow-lg transition-all ${updateMutation.isPending ? 'opacity-50' : 'hover:bg-emerald-700 active:scale-95'}`}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Tactic'}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-4 w-full flex-1 min-h-0 overflow-hidden">
            <div className="shrink-0 overflow-visible">
              <DrawingToolbar 
                readOnly={!isOwner} 
                onYoutubeToggle={toggleYoutubeMode} // 연결 확인
                isYoutubeActive={isYoutubeMode} // 상태 연결 확인
              />
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
              {isYoutubeMode && (
                <div className="flex-1 min-h-0 bg-black rounded-3xl overflow-hidden shadow-xl">
                  <YoutubeOverlay 
                    videoId={youtubeVideoId}
                    isSplitMode={true}
                    onClose={() => { setIsYoutubeMode(false); setYoutubeVideoId(null); }}
                    onUrlSubmit={handleYoutubeUrlSubmit}
                    onChangeUrl={() => setIsYoutubeModalOpen(true)}
                    isReadOnly={!isOwner}
                  />
                </div>
              )}
              <div className="flex-1 min-h-0 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-900/10 bg-emerald-800">
                <PitchCanvas 
                  ref={canvasRef} 
                  readOnly={!isOwner} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {isYoutubeModalOpen && (
        <YoutubeOverlay videoId={null} onClose={() => setIsYoutubeModalOpen(false)} onUrlSubmit={handleYoutubeUrlSubmit} />
      )}
    </div>
  );
}
