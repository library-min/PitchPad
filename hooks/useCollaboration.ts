// hooks/useCollaboration.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDrawingStore, Drawing, Player } from '@/store/drawingStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface YouTubeData {
  boardId: string;
  videoId?: string | null;
  timestamp?: number;
  socketId?: string;
  eventId?: number;
}

interface PlayerSyncData {
  type: 'add' | 'move' | 'remove' | null;
  player?: Player;
  playerId?: string;
  x?: number;
  y?: number;
  eventId?: number;
}

export function useCollaboration(boardId: string, user: any, isOwner: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const addDrawing = useDrawingStore((state) => state.addDrawing);
  
  const [isConnected, setIsConnected] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState<'idle' | 'requesting' | 'approved' | 'denied'>(isOwner ? 'approved' : 'idle');
  const [requests, setRequests] = useState<Array<{ socketId: string, requester: any }>>([]);

  // Player synchronization state
  const [playerSync, setPlayerSync] = useState<PlayerSyncData>({ type: null });

  // YouTube Synchronization State (for receiving)
  const [youtubeSync, setYoutubeSync] = useState<{
    type: 'url' | 'play' | 'pause' | 'seek' | null;
    videoId?: string | null;
    timestamp?: number;
    senderId?: string;
    eventId?: number;
  }>({ type: null });

  useEffect(() => {
    if (typeof window === 'undefined' || !boardId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Collaboration] Connected:', socket.id);
      setIsConnected(true);
      if (user) {
        socket.emit('join-board', { boardId, user });
      }
    });

    socket.on('disconnect', () => {
      console.log('[Collaboration] Disconnected');
      setIsConnected(false);
    });

    socket.on('collaboration-request-received', (data: { socketId: string, requester: any }) => {
      setRequests(prev => {
        if (prev.find(r => r.socketId === data.socketId)) return prev;
        return [...prev, data];
      });
    });

    socket.on('collaboration-approved', () => setCollaborationStatus('approved'));
    socket.on('collaboration-denied', () => setCollaborationStatus('denied'));

    socket.on('drawing-update-received', (data: any) => {
      if (socketRef.current?.id === data.socketId) return;
      
      const newDrawing: Drawing = {
        id: `remote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        tool: data.type, 
        points: data.points,
        color: data.color,
        width: data.width,
      };
      
      addDrawing(newDrawing);
    });

    // Player Event Listeners (Receive)
    socket.on('player-added', (data: any) => {
      if (socket.id === data.socketId) return;
      setPlayerSync({ type: 'add', player: data.player, eventId: Date.now() });
    });

    socket.on('player-moved', (data: any) => {
      if (socket.id === data.socketId) return;
      setPlayerSync({ type: 'move', playerId: data.playerId, x: data.x, y: data.y, eventId: Date.now() });
    });

    socket.on('player-removed', (data: any) => {
      if (socket.id === data.socketId) return;
      setPlayerSync({ type: 'remove', playerId: data.playerId, eventId: Date.now() });
    });

    // YouTube Event Listeners (Receive)
    socket.on('youtube-url-updated', (data: YouTubeData) => {
      if (socket.id === data.socketId) return;
      setYoutubeSync({ 
        type: 'url', 
        videoId: data.videoId, 
        senderId: data.socketId,
        eventId: Date.now() 
      });
    });

    socket.on('youtube-played', (data: YouTubeData) => {
      if (socket.id === data.socketId) return;
      setYoutubeSync({ 
        type: 'play', 
        timestamp: data.timestamp, 
        senderId: data.socketId,
        eventId: Date.now() 
      });
    });

    socket.on('youtube-paused', (data: YouTubeData) => {
      if (socket.id === data.socketId) return;
      setYoutubeSync({ 
        type: 'pause', 
        timestamp: data.timestamp, 
        senderId: data.socketId,
        eventId: Date.now() 
      });
    });

    socket.on('youtube-seeked', (data: YouTubeData) => {
      if (socket.id === data.socketId) return;
      setYoutubeSync({ 
        type: 'seek', 
        timestamp: data.timestamp, 
        senderId: data.socketId,
        eventId: Date.now() 
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [boardId, addDrawing]);

  useEffect(() => {
    if (socketRef.current?.connected && user && boardId) {
      socketRef.current.emit('join-board', { boardId, user });
    }
  }, [user, boardId, isConnected]);

  useEffect(() => {
    if (isOwner) setCollaborationStatus('approved');
  }, [isOwner]);

  const requestCollaboration = useCallback(() => {
    if (socketRef.current?.connected) {
      setCollaborationStatus('requesting');
      socketRef.current.emit('collaboration-request', { boardId, requester: user });
    }
  }, [boardId, user]);

  const acceptCollaboration = useCallback((targetSocketId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('collaboration-accept', { targetSocketId });
      setRequests(prev => prev.filter(r => r.socketId !== targetSocketId));
    }
  }, []);

  const rejectCollaboration = useCallback((targetSocketId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('collaboration-reject', { targetSocketId });
      setRequests(prev => prev.filter(r => r.socketId !== targetSocketId));
    }
  }, []);

  const emitDrawing = useCallback((drawing: Drawing) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit('drawing-update', {
      boardId,
      socketId: socket.id,
      type: drawing.tool,
      points: drawing.points,
      color: drawing.color,
      width: drawing.width
    });
  }, [boardId]);

  // Player Emit Methods (Send)
  const emitPlayerAdd = useCallback((player: Player) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('player-add', { boardId, player });
    }
  }, [boardId]);

  const emitPlayerMove = useCallback((playerId: string, x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('player-move', { boardId, playerId, x, y });
    }
  }, [boardId]);

  const emitPlayerRemove = useCallback((playerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('player-remove', { boardId, playerId });
    }
  }, [boardId]);

  // YouTube Emit Methods (Send)
  const emitYoutubeUrl = useCallback((videoId: string | null) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('youtube-url-update', { boardId, videoId });
    }
  }, [boardId]);

  const emitYoutubePlay = useCallback((timestamp: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('youtube-play', { boardId, timestamp });
    }
  }, [boardId]);

  const emitYoutubePause = useCallback((timestamp: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('youtube-pause', { boardId, timestamp });
    }
  }, [boardId]);

  const emitYoutubeSeek = useCallback((timestamp: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('youtube-seek', { boardId, timestamp });
    }
  }, [boardId]);

  return {
    isConnected,
    collaborationStatus,
    requests: isOwner ? requests : [],
    requestCollaboration,
    acceptCollaboration,
    rejectCollaboration,
    emitDrawing,
    // Player Synchronization Emitters
    emitPlayerAdd,
    emitPlayerMove,
    emitPlayerRemove,
    playerSync,
    // YouTube Collaboration tools
    youtubeSync,
    emitYoutubeUrl,
    emitYoutubePlay,
    emitYoutubePause,
    emitYoutubeSeek
  };
}
