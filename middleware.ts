// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 (중요: 로그인이 풀리지 않도록 유도)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 경로 설정
  // 공유된 보드 상세 페이지(/board/[id])는 비로그인 유저도 접근 가능하도록 수정
  // 보드 생성 페이지(/board)는 로그인이 필요함
  const isProtected = ['/dashboard'].some(route => request.nextUrl.pathname.startsWith(route));
  const isBoardCreation = request.nextUrl.pathname === '/board';

  if (!user && (isProtected || isBoardCreation)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
