// types/board.ts
export interface Board {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface BoardList {
  boards: Board[];
}
