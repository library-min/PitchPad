// app/api/boards/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, drawings } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // A. 보드 생성
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert([{ title, user_id: user.id }])
      .select()
      .single();

    if (boardError) {
      return NextResponse.json({ error: `Board Error: ${boardError.message}` }, { status: 500 });
    }

    // B. 드로잉 저장
    if (drawings && Array.isArray(drawings) && drawings.length > 0) {
      // [수정] tool 값을 type 컬럼에도 동일하게 매핑하여 NOT NULL 제약 조건 에러 방지
      const drawingsToInsert = drawings.map((d: any) => ({
        board_id: board.id,
        tool: d.tool,
        type: d.tool, // type 컬럼의 NOT NULL 에러 해결을 위해 추가
        color: d.color,
        width: d.width,
        points: d.points
      }));

      const { error: drawingError } = await supabase
        .from('drawings')
        .insert(drawingsToInsert);

      if (drawingError) {
        console.error('Drawing Save Error:', drawingError);
        return NextResponse.json({ error: `Drawings Error: ${drawingError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json(board);

  } catch (err: any) {
    console.error('POST Catch Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
