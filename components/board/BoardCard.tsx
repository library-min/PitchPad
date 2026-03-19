// components/board/BoardCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface BoardCardProps {
  id: string;
  title: string;
  createdAt: string;
  thumbnailUrl?: string | null;
}

export default function BoardCard({ id, title, createdAt, thumbnailUrl }: BoardCardProps) {
  const queryClient = useQueryClient();

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      // 삭제 성공 시 대시보드 목록 즉시 갱신
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('전술 보드를 삭제하시겠습니까?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="group relative bg-white rounded-[16px] border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      <Link href={`/board/${id}`} className="block overflow-hidden rounded-[16px]">
        {/* 썸네일 영역 */}
        <div className="aspect-[1.6/1] bg-[#2d6a35] relative overflow-hidden flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              // 이미지 캐싱 문제를 방지하기 위해 쿼리 스트링 추가
              src={`${thumbnailUrl}?t=${new Date().getTime()}`}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            // [수정] 썸네일 없을 때 요청하신 축구장 SVG 반드시 표시
            <svg viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
              <rect width="280" height="180" fill="#2d6a35"/>
              <rect x="10" y="10" width="260" height="160" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <line x1="140" y1="10" x2="140" y2="170" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <circle cx="140" cy="90" r="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <rect x="10" y="55" width="45" height="70" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <rect x="225" y="55" width="45" height="70" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
            </svg>
          )}
          
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        <div className="p-5 space-y-1">
          <h3 className="text-lg font-bold text-[#0a0a0a] truncate tracking-tight">{title}</h3>
          <p className="text-xs text-[#6b7280] font-medium">
            {new Date(createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </Link>
      
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white z-10"
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <div className="w-3 h-3 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        )}
      </button>
    </div>
  );
}
