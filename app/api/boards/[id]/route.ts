// app/api/boards/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

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

  let thumbnailUrl = null;

  // 썸네일 데이터 처리
  if (thumbnail && typeof thumbnail === 'string') {
    try {
      const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `board-${id}.png`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrl;
      }
    } catch (e) {
      console.error('Thumbnail Processing Error:', e);
    }
  }

  // 1. 기존 드로잉 삭제
  await supabase.from('drawings').delete().eq('board_id', id);

  // 2. 새 드로잉 추가 (있는 경우에만)
  if (drawings && Array.isArray(drawings) && drawings.length > 0) {
    const drawingsToInsert = drawings.map((d: any) => ({
      board_id: id,
      tool: d.tool,
      type: d.tool,
      color: d.color,
      width: d.width,
      points: d.points
    }));

    const { error: insertError } = await supabase.from('drawings').insert(drawingsToInsert);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // 3. 보드 테이블 업데이트 (thumbnail_url, players)
  const updateData: any = {};
  if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl;
  
  // players가 undefined가 아니라면 빈 배열([])인 경우에도 업데이트 수행
  if (players !== undefined) {
    updateData.players = players;
  }

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from('boards')
      .update(updateData)
      .eq('id', id);
    
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Updated', thumbnailUrl });
}

// 4. 보드 삭제 (DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
