// app/(auth)/login/page.tsx
'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a] font-sans selection:bg-green-100 selection:text-green-900 relative overflow-hidden flex flex-col">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* Top Right Mesh Gradient */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] bg-gradient-to-br from-green-50 to-transparent rounded-full blur-[120px] opacity-60" />
        {/* Bottom Left Mesh Gradient */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-[120px] opacity-60" />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      {/* 2. NAVIGATION */}
      <nav className="relative w-full z-20">
        <div className="container mx-auto px-8 h-24 flex items-center">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:scale-105 transition-transform">P</div>
            <span className="text-xl font-bold tracking-tighter group-hover:opacity-70 transition-opacity">Pitchpad</span>
          </Link>
        </div>
      </nav>

      {/* 3. MAIN CONTENT (Sophisticated Card) */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 -mt-20">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          {/* Card Container with Frosted Glass Effect */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[32px] p-10 md:p-12 relative overflow-hidden">
            
            {/* Top Highlight Bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#16a34a] to-transparent opacity-20" />

            {/* Content Header */}
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-[#16a34a] text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
                Tactical Intelligence
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a]">
                승리를 <span className="text-gray-400">설계하세요</span>
              </h1>
              <p className="text-[#6b7280] text-sm font-medium leading-relaxed">
                전 세계 감독들이 사용하는 가장 진보된 <br />
                축구 전술 분석 툴, Pitchpad입니다.
              </p>
            </div>

            {/* Google Login Button (Premium Interaction) */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full group relative flex items-center justify-center gap-4 px-8 py-4 bg-[#0a0a0a] text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.3)] overflow-hidden"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.8" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.8" />
                </svg>
                <span className="relative z-10">Google로 계속하기</span>
              </button>

              {/* Link to Terms */}
              <p className="text-[10px] text-[#9ca3af] text-center pt-2 px-4 leading-relaxed">
                계속함으로써 Pitchpad의 <span className="underline decoration-gray-200 cursor-pointer hover:text-gray-600">이용약관</span> 및 <span className="underline decoration-gray-200 cursor-pointer hover:text-gray-600">개인정보 보호정책</span>에 동의하게 됩니다.
              </p>
            </div>
          </div>

          {/* Bottom Navigation Link (Subtle) */}
          <div className="mt-8 flex justify-center">
            <Link 
              href="/" 
              className="text-sm font-bold text-gray-400 hover:text-black transition-all flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </div>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

      {/* 4. DIGITAL PITCH DECOR */}
      <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] opacity-[0.03] pointer-events-none transition-opacity duration-1000 hidden lg:block">
        <svg viewBox="0 0 400 400" className="w-full h-full rotate-[-15deg]">
          <rect x="20" y="20" width="360" height="360" stroke="black" strokeWidth="1" fill="none" />
          <circle cx="200" cy="200" r="80" stroke="black" strokeWidth="1" fill="none" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="black" strokeWidth="1" />
          <path d="M 100 300 Q 200 100 300 300" stroke="black" strokeWidth="1" fill="none" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}
