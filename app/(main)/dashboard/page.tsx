'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import BoardCard from '@/components/board/BoardCard';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, [supabase.auth]);

  const { data: boards, isLoading, isError } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await fetch('/api/boards');
      if (!res.ok) throw new Error('Fetch failed');
      return res.json();
    }
  });

  const handleCreateBoard = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '새 전술 보드' }),
      });
      if (!res.ok) throw new Error('Failed to create board');
      const newBoard = await res.json();
      router.push(`/board/${newBoard.id}`);
    } catch (err) {
      console.error(err);
      alert('보드 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
      <Header />

      <main className="container mx-auto px-6 lg:px-12 py-12 max-w-7xl">
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a] bg-green-50 px-2 py-0.5 rounded-sm">
              YOUR BOARDS
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-none">
              나의 전술 보드
            </h1>
          </div>
          
          <button
            onClick={handleCreateBoard}
            disabled={isCreating}
            className="w-full md:w-auto px-8 py-4 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-zinc-100 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300 font-normal">+</span>
            {isCreating ? '생성 중...' : '새 보드 만들기'}
          </button>
        </div>

        {/* 2. Board Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[1.2/1] bg-gray-50 rounded-[16px] animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-red-50 rounded-[32px] border-2 border-dashed border-red-100 max-w-2xl mx-auto">
            <p className="text-red-500 font-bold text-lg">보드 목록을 불러오지 못했습니다. 다시 시도해 주세요.</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {boards?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {boards.map((board: { id: string; title: string; created_at: string; thumbnail_url?: string }) => (
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    title={board.title}
                    createdAt={board.created_at}
                    thumbnailUrl={board.thumbnail_url}
                  />
                ))}
              </div>
            ) : (
              /* 3. Empty State */
              <div className="py-32 flex flex-col items-center justify-center bg-[#fafafa] rounded-[40px] border border-gray-100 text-center max-w-4xl mx-auto">
                <div className="w-24 h-24 mb-8 bg-white rounded-[24px] shadow-sm flex items-center justify-center opacity-80 rotate-[-5deg]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2 tracking-tight">아직 보드가 없어요</h3>
                <p className="text-[#6b7280] font-medium mb-10">첫 번째 전술 보드를 만들어 팀의 승리를 설계하세요.</p>
                <button 
                  onClick={handleCreateBoard}
                  disabled={isCreating}
                  className="px-10 py-4 bg-[#0a0a0a] text-white font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-100 flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="font-normal text-xl">+</span>
                  {isCreating ? '생성 중...' : '첫 번째 보드 만들기'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Decorative Pitch Decor for Background */}
      <div className="fixed bottom-[-5%] right-[-5%] w-[400px] h-[400px] pointer-events-none opacity-[0.02] z-0 hidden lg:block rotate-12">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" stroke="black" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="20" stroke="black" strokeWidth="1" fill="none" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="black" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
