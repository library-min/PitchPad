// app/api/boards/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'; // 캐시 방지

// 1. 특정 보드 + 드로잉 상세 조회 (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('boards')
    .select('*, drawings(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 2. 보드 제목만 수정 (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { title } = await request.json();

  const { data, error } = await supabase
    .from('boards')
    .update({ title })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 3. 보드 전체 수정 (PUT) - 드로잉, 썸네일, 선수 업데이트
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { drawings, players, thumbnail } = await request.json();

  // [핵심] 기존 드로잉 무조건 삭제 (선수 배치 지우는 로직과 동일하게 작동하도록 우선 삭제)
  await supabase.from('drawings').delete().eq('board_id', id);

  // 새 드로잉이 있는 경우에만 삽입
  if (drawings && Array.isArray(drawings) && drawings.length > 0) {
    const drawingsToInsert = drawings.map((d: any) => ({
      board_id: id,
      tool: d.tool,
      type: d.tool,
      color: d.color,
      width: d.width,
      points: d.points
    }));
    await supabase.from('drawings').insert(drawingsToInsert);
  }

  // 썸네일 처리
  let thumbnailUrl = null;
  if (thumbnail && typeof thumbnail === 'string') {
    try {
      const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `board-${id}.png`;
      await supabase.storage.from('thumbnails').upload(fileName, buffer, { contentType: 'image/png', upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
      thumbnailUrl = publicUrl;
    } catch (e) {
      console.error('Thumbnail Error:', e);
    }
  }

  // 보드 정보 업데이트 (players는 빈 배열이면 빈 배열로 업데이트됨)
  const updateData: any = { players: players || [] };
  if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl;

  const { error: updateError } = await supabase.from('boards').update(updateData).eq('id', id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 캐시 강제 갱신
  revalidatePath(`/board/${id}`);
  revalidatePath('/dashboard');

  return NextResponse.json({ message: 'Updated successfully', thumbnailUrl });
}

// 4. 보드 삭제 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('boards').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
