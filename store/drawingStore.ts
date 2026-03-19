import { create } from 'zustand';

export type ToolType = 'arrow' | 'circle' | 'freehand' | 'player';
export type ColorType = string; 
export type WidthType = number;

export interface Drawing {
  id: string;
  tool: ToolType;
  color: ColorType;
  width: WidthType;
  points: { x: number; y: number }[];
}

export interface Player {
  id: string;
  number: number;
  team: 'red' | 'blue';
  x: number;
  y: number;
}

interface DrawingState {
  currentTool: ToolType;
  currentColor: ColorType;
  strokeWidth: WidthType;
  drawings: Drawing[];
  players: Player[];
  selectedPlayer: { team: 'red' | 'blue'; number: number } | null;
  
  setTool: (tool: ToolType) => void;
  setColor: (color: ColorType) => void;
  setStrokeWidth: (width: WidthType) => void;
  addDrawing: (drawing: Drawing) => void;
  setDrawings: (drawings: Drawing[]) => void;
  undo: () => void;
  clear: () => void;

  // Player actions
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  clearPlayers: (team?: 'red' | 'blue') => void;
  updatePlayerPosition: (playerId: string, x: number, y: number) => void;
  setSelectedPlayer: (player: { team: 'red' | 'blue'; number: number } | null) => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  currentTool: 'freehand',
  currentColor: '#FFFFFF',
  strokeWidth: 4,
  drawings: [],
  players: [],
  selectedPlayer: null,

  setTool: (currentTool) => set({ currentTool }),
  setColor: (currentColor) => set({ currentColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  
  addDrawing: (drawing) => set((state) => ({ 
    drawings: [...state.drawings, drawing] 
  })),

  setDrawings: (drawings) => set({ drawings }),
  
  undo: () => set((state) => ({ 
    drawings: state.drawings.slice(0, -1) 
  })),
  
  // Clear both drawings and players
  clear: () => set({ drawings: [], players: [], selectedPlayer: null }),

  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  })),
  clearPlayers: (team) => set((state) => ({
    players: team ? state.players.filter(p => p.team !== team) : []
  })),
  updatePlayerPosition: (playerId, x, y) => set((state) => ({
    players: state.players.map(p => p.id === playerId ? { ...p, x, y } : p)
  })),
  setSelectedPlayer: (selectedPlayer) => set({ selectedPlayer }),
}));
