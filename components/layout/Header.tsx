'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [userDropdown, setUserDropdown] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-[100] shrink-0">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="font-bold text-xl tracking-tighter">Pitchpad</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-500 hover:text-black transition-colors">대시보드</Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {!loading && (
          <>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Avatar" 
                      width={32} 
                      height={32} 
                      className="w-8 h-8 rounded-full object-cover border border-gray-100" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
                    {user.user_metadata?.full_name || 'Coach'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${userDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  >
                    <Link 
                      href="/mypage" 
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      마이페이지
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserDropdown(false)}
                    >
                      대시보드
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  로그인
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all active:scale-95"
                >
                  시작하기
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
