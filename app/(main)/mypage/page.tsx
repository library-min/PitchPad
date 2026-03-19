// app/(main)/mypage/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function MyPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardCount, setBoardCount] = useState(0);
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setNickname(user.user_metadata?.full_name || '');

      const { count } = await supabase
        .from('boards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setBoardCount(count || 0);
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUpdating(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '프로필 업데이트 실패');
      }
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('Upload error:', error);
      alert('업로드 실패: ' + message);
    } finally {
      setUpdating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateNickname = async () => {
    if (!user || nickname === user.user_metadata?.full_name || nickname.trim() === '') {
      setIsEditingNickname(false);
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: nickname }),
      });

      if (!response.ok) throw new Error('업데이트 실패');

      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
      setIsEditingNickname(false);
    } catch {
      alert('닉네임 수정 실패');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    const response = await fetch('/api/user/profile', { method: 'DELETE' });
    if (response.ok) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return null;

  return (
    <div className="relative min-h-screen bg-white flex flex-col font-sans text-[#0a0a0a] overflow-hidden">
      {/* Background Decor: Dot Grid */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-50"
        style={{ 
          backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Background Decor: Desktop Only (md+) */}
      <div className="hidden md:block">
        {/* Left Top: Overlapping Green Circles */}
        <div className="absolute -top-[60px] -left-[60px] z-0 pointer-events-none">
          <div 
            className="rounded-full"
            style={{ 
              width: '200px', 
              height: '200px', 
              background: '#16a34a', 
              opacity: 0.06 
            }} 
          />
          <div 
            className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ 
              width: '120px', 
              height: '120px', 
              background: '#16a34a', 
              opacity: 0.04 
            }} 
          />
        </div>

        {/* Right Bottom: Black Circle */}
        <div 
          className="absolute -bottom-[80px] -right-[80px] rounded-full z-0 pointer-events-none"
          style={{ 
            width: '280px', 
            height: '280px', 
            background: '#0a0a0a', 
            opacity: 0.03 
          }} 
        />
      </div>

      <Header />
      
      <main className="relative z-10 flex-1 w-full max-w-[560px] mx-auto px-6 py-12 md:py-16 animate-in fade-in duration-700">
        
        {/* 1. Profile Section */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-gray-50 relative">
              {user?.user_metadata?.avatar_url ? (
                <Image 
                  src={user.user_metadata.avatar_url} 
                  alt="프로필" 
                  fill 
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#0a0a0a] text-xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
              {updating && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-[#0a0a0a] text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#16a34a] transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
          </div>

          <div className="text-center">
            {isEditingNickname ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-2xl font-black text-center border-b-2 border-[#16a34a] outline-none py-0.5 w-40 bg-transparent"
                autoFocus
                onBlur={handleUpdateNickname}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateNickname()}
              />
            ) : (
              <div 
                className="flex items-center justify-center gap-1.5 cursor-pointer group"
                onClick={() => setIsEditingNickname(true)}
              >
                <h2 className="text-2xl font-black group-hover:text-[#16a34a] transition-colors tracking-tight">
                  {user?.user_metadata?.full_name || '사용자'}
                </h2>
                <svg className="text-gray-400 group-hover:text-[#16a34a] transition-colors" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
            )}
            <p className="text-gray-400 font-medium text-sm mt-0.5">{user?.email}</p>
          </div>
        </section>

        {/* 2. Stats Grid */}
        <section className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">만든 보드</p>
            <p className="text-2xl font-black text-[#0a0a0a]">{boardCount}</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">가입일</p>
            <p className="text-lg font-black text-[#0a0a0a] leading-tight mt-1">{formatDate(user?.created_at)}</p>
          </div>
        </section>

        {/* 3. Settings List */}
        <section className="space-y-2 mb-10">
          <h3 className="px-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">설정</h3>
          <button 
            onClick={handleAvatarClick}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <span className="font-bold text-sm">프로필 사진 변경</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#0a0a0a] transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <button 
            onClick={() => setIsEditingNickname(true)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="font-bold text-sm">닉네임 변경</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#0a0a0a] transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </section>

        {/* 4. Account Management List */}
        <section className="space-y-2">
          <h3 className="px-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">계정 관리</h3>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <span className="font-bold text-sm">로그아웃</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#0a0a0a] transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          
          <button 
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-red-50 rounded-xl border border-gray-100 hover:border-red-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </div>
              <span className="font-bold text-sm text-red-500">회원 탈퇴</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-300 group-hover:text-red-500 transition-colors"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </section>

      </main>
    </div>
  );
}
