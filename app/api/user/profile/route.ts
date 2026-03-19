// app/api/user/profile/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface UpdateProfileBody {
  full_name?: string;
  avatar_url?: string;
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const body: UpdateProfileBody = await request.json();
  const { full_name, avatar_url } = body;

  const updateData: UpdateProfileBody = {};
  if (full_name !== undefined) updateData.full_name = full_name;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

  const { data, error } = await supabase.auth.updateUser({
    data: updateData
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user });
}

export async function DELETE() {
  const supabase = await createClient();
  
  // 현재 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  try {
    // 1. 유저의 보드 데이터 삭제
    const { error: boardsError } = await supabase
      .from('boards')
      .delete()
      .eq('user_id', user.id);
      
    if (boardsError) throw boardsError;

    // 실제 유저 삭제는 Admin API 권한(Service Role Key)이 필요하므로, 
    // 여기서는 클라이언트 측에서 signOut 처리하도록 데이터 정리 성공만 반환합니다.
    return NextResponse.json({ message: '계정 데이터 정리 완료' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
