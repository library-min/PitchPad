'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';

// --- Minimal Icons ---
const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

// 장식용 플로팅 보드 (배경)
const FloatingBoard = ({ side }: { side: 'left' | 'right' }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 hidden xl:block w-[280px] h-[380px] z-0 opacity-[0.03] transition-all duration-1000 ${
    side === 'left' ? '-left-20 -rotate-12' : '-right-20 rotate-12'
  }`}>
    <div className="w-full h-full bg-[#16a34a] rounded-2xl border-4 border-black relative overflow-hidden animate-float">
      <div className="absolute inset-0 border-2 border-white/30 m-4 rounded-sm" />
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
    </div>
  </div>
);

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <div className="h-screen bg-white text-black font-sans selection:bg-green-100 selection:text-green-900 overflow-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-draw-line { animation: draw-line 3s ease-out forwards infinite; }
      `}} />

      {/* Unified Header */}
      <Header />

      <main className="relative flex-1 flex items-center justify-center overflow-hidden">
        <FloatingBoard side="left" />
        <FloatingBoard side="right" />

        <section className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-20 items-center max-w-7xl mx-auto">
            
            <div className="text-left space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-[#16a34a] text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                무료 전술 분석 도구
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] md:leading-[1.05]">
                전술을 그리는 <br />
                <span className="text-[#16a34a]">가장 빠른 방법</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-lg font-medium">
                축구장 위에 직접 전술을 그리고 팀과 공유하세요. <br className="hidden md:block" />
                복잡한 도구 없이, 아이디어에만 집중하는 가장 심플한 도구.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-2">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="w-full sm:w-auto px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 text-center"
                        >
                          대시보드 바로가기
                        </Link>
                        <Link
                          href="/dashboard"
                          className="group flex items-center gap-2 px-4 py-3 text-gray-900 font-bold hover:translate-x-1 transition-transform"
                        >
                          새 보드 만들기 <ArrowRight />
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="w-full sm:w-auto px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200 text-center"
                        >
                          무료로 시작하기
                        </Link>
                        <Link
                          href="/board"
                          className="group flex items-center gap-2 px-4 py-3 text-gray-900 font-bold hover:translate-x-1 transition-transform"
                        >
                          데모 보기 <ArrowRight />
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000 order-2">
              <div className="absolute -inset-4 bg-green-100/30 blur-3xl rounded-full group-hover:bg-green-100/40 transition-colors duration-700" />
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                
                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex-1 max-w-[200px] mx-auto h-6 bg-white rounded border border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                    pitchpad.ai/board/demo
                  </div>
                </div>

                <div className="flex aspect-[1.5/1] bg-white overflow-hidden">
                  <div className="w-10 md:w-14 border-r border-gray-50 flex flex-col items-center py-4 gap-4 shrink-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-black flex items-center justify-center text-white text-[10px] font-bold">P</div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gray-50 border border-gray-100" />
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gray-100 border border-gray-200" />
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-gray-50 border border-gray-100" />
                  </div>

                  <div className="flex-1 bg-gray-50 p-3 md:p-6 flex items-center justify-center min-w-0">
                    <div className="w-full h-full bg-[#1a5c2a] rounded-lg shadow-inner relative border-2 border-white/20 overflow-hidden">
                      <svg 
                        viewBox="0 0 560 370" 
                        width="100%" 
                        height="100%" 
                        preserveAspectRatio="xMidYMid meet"
                        className="absolute inset-0 w-full h-full"
                      >
                        <defs>
                          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                            <path d="M0,0 L10,5 L0,10 Z" fill="#facc15" />
                          </marker>
                          <marker id="arrow-white" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                            <path d="M0,0 L10,5 L0,10 Z" fill="white" />
                          </marker>
                        </defs>

                        <g fill="#227a35">
                          <rect x="0" y="20" width="560" height="55" />
                          <rect x="0" y="130" width="560" height="55" />
                          <rect x="0" y="240" width="560" height="55" />
                        </g>

                        <g stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" fill="none">
                          <rect x="20" y="20" width="520" height="330" />
                          <line x1="280" y1="20" x2="280" y2="350" />
                          <circle cx="280" cy="185" r="50" />
                          <circle cx="280" cy="185" r="2" fill="white" stroke="none" />
                          <rect x="20" y="85" width="80" height="200" />
                          <rect x="20" y="145" width="30" height="80" />
                          <rect x="460" y="85" width="80" height="200" />
                          <rect x="510" y="145" width="30" height="80" />
                          <path d="M 35,20 A 15,15 0 0 1 20,35" />
                          <path d="M 525,20 A 15,15 0 0 0 540,35" />
                          <path d="M 35,350 A 15,15 0 0 0 20,335" />
                          <path d="M 525,350 A 15,15 0 0 1 540,335" />
                        </g>

                        <g>
                          <circle cx="90" cy="185" r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
                          <circle cx="170" cy="100" r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
                          <circle cx="170" cy="270" r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
                          <circle cx="250" cy="185" r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
                          <circle cx="470" cy="185" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          <circle cx="390" cy="110" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          <circle cx="390" cy="260" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          <circle cx="330" cy="185" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                          <path d="M 178,105 Q 210,140 242,177" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="6" fill="none" />
                          <path d="M 382,255 Q 350,220 338,193" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeDasharray="6" fill="none" />
                          <path 
                            d="M 258,190 Q 320,240 380,250" 
                            stroke="#facc15" 
                            strokeWidth="3" 
                            fill="none" 
                            markerEnd="url(#arrow)"
                            strokeDasharray="200"
                            strokeDashoffset="200"
                            className="animate-draw-line"
                          />
                          <path 
                            d="M 170,92 C 170,40 280,40 280,130" 
                            stroke="white" 
                            strokeWidth="2.5" 
                            fill="none" 
                            markerEnd="url(#arrow-white)"
                            strokeDasharray="300"
                            strokeDashoffset="300"
                            className="animate-draw-line"
                            style={{ animationDelay: '1s' }}
                          />
                        </g>
                      </svg>
                      
                      <div className="absolute bottom-2 right-4 text-white/10 font-black text-xl pointer-events-none select-none italic uppercase">
                        PitchPad
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="shrink-0 py-4 border-t border-gray-100 text-center bg-white relative z-10">
        <p className="text-gray-400 text-xs font-medium">
          Pitchpad © 2026. Built for victory.
        </p>
      </footer>
    </div>
  );
}
