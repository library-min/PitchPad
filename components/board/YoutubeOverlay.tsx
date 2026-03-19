// components/board/YoutubeOverlay.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface YoutubeOverlayProps {
  videoId: string | null;
  isSplitMode?: boolean;
  onClose: () => void;
  onUrlSubmit: (url: string) => void;
  onChangeUrl?: () => void;
  // Sync props
  youtubeSync?: {
    type: 'url' | 'play' | 'pause' | 'seek' | null;
    videoId?: string | null;
    timestamp?: number;
    senderId?: string;
    eventId?: number;
  };
  emitYoutubePlay?: (timestamp: number) => void;
  emitYoutubePause?: (timestamp: number) => void;
  emitYoutubeSeek?: (timestamp: number) => void;
  isReadOnly?: boolean;
}

export default function YoutubeOverlay({ 
  videoId, 
  isSplitMode = false, 
  onClose, 
  onUrlSubmit,
  onChangeUrl,
  youtubeSync = { type: null, timestamp: 0 },
  emitYoutubePlay,
  emitYoutubePause,
  emitYoutubeSeek,
  isReadOnly = false
}: YoutubeOverlayProps) {
  const [urlInput, setUrlInput] = useState('');
  const playerRef = useRef<any>(null);
  const containerId = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);
  const isInternalChange = useRef(false);
  const lastEmittedTime = useRef(0);

  // Initialize YouTube API and Player
  useEffect(() => {
    if (!videoId || !isSplitMode) return;

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) return;
      
      console.log('[YoutubeOverlay] Initializing Player for:', videoId);
      
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerId.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            console.log('[YoutubeOverlay] Player Ready');
          },
          onStateChange: handlePlayerStateChange,
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      // Load API if not already present
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Handle Ready Callback
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initializePlayer();
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, isSplitMode]);

  // Handle local state changes (Send to Socket)
  const handlePlayerStateChange = (event: any) => {
    if (isReadOnly || isInternalChange.current) return;

    const currentTime = playerRef.current?.getCurrentTime() || 0;
    
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1) {
      // If time difference is significant, it's likely a seek during play
      if (Math.abs(currentTime - lastEmittedTime.current) > 2) {
        emitYoutubeSeek?.(currentTime);
      }
      emitYoutubePlay?.(currentTime);
    } 
    // YT.PlayerState.PAUSED = 2
    else if (event.data === 2) {
      emitYoutubePause?.(currentTime);
    }
    
    lastEmittedTime.current = currentTime;
  };

  // Sync from Socket (Receive)
  useEffect(() => {
    if (!playerRef.current || !youtubeSync?.type || isInternalChange.current) return;

    const player = playerRef.current;
    if (typeof player.getPlayerState !== 'function') return;

    console.log('[YoutubeOverlay] Applying Sync:', youtubeSync.type, youtubeSync.timestamp);
    
    isInternalChange.current = true;
    const remoteTime = youtubeSync.timestamp || 0;
    const localTime = player.getCurrentTime();

    try {
      switch (youtubeSync.type) {
        case 'play':
          if (Math.abs(localTime - remoteTime) > 2) {
            player.seekTo(remoteTime, true);
          }
          player.playVideo();
          break;
        case 'pause':
          player.pauseVideo();
          if (Math.abs(localTime - remoteTime) > 2) {
            player.seekTo(remoteTime, true);
          }
          break;
        case 'seek':
          player.seekTo(remoteTime, true);
          break;
      }
    } catch (err) {
      console.error('[YoutubeOverlay] Sync Error:', err);
    }

    // Reset internal change flag after a short delay
    setTimeout(() => {
      isInternalChange.current = false;
    }, 800);
  }, [youtubeSync?.type, youtubeSync?.timestamp, youtubeSync?.eventId]);

  // URL Input Form (Modal style)
  if (!videoId && !isSplitMode) {
    return (
      <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
          <h3 className="text-2xl font-black text-emerald-900 mb-2 tracking-tight">YouTube 분석</h3>
          <p className="text-emerald-700/60 mb-6 font-medium leading-tight">분석할 영상의 URL을 입력하세요.</p>
          <input
            autoFocus
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onUrlSubmit(urlInput)}
            className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all mb-6 font-medium"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={() => onUrlSubmit(urlInput)}
              className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Split Mode View
  if (isSplitMode) {
    return (
      <div className="w-full h-full bg-emerald-900/10 rounded-3xl overflow-hidden relative border-4 border-emerald-900/10 flex items-center justify-center">
        {!videoId ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">📺</span>
            <p className="text-emerald-900/60 font-bold">영상 URL을 입력하세요</p>
            <button 
              onClick={onChangeUrl}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all cursor-pointer"
            >
              URL 입력하기
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative group">
            {/* Control Buttons */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={onChangeUrl}
                className="px-4 py-2 bg-black/50 hover:bg-black/70 text-white text-xs font-bold rounded-lg backdrop-blur-md transition-all cursor-pointer"
              >
                URL 변경
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Container */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div id={containerId.current} className="w-full h-full max-w-full aspect-video shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
