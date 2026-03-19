// components/board/CollaborationPanel.tsx
'use client';

import React from 'react';

interface Request {
  socketId: string;
  requester: any;
}

interface Props {
  isOwner: boolean;
  status: 'idle' | 'requesting' | 'approved' | 'denied';
  requests: Request[];
  onRequest: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function CollaborationPanel({ isOwner, status, requests, onRequest, onAccept, onReject }: Props) {
  // 방장인 경우
  if (isOwner) {
    if (requests.length === 0) {
      return (
        <div className="absolute top-24 right-8 z-[9999] bg-white px-6 py-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-sm font-bold text-emerald-900 tracking-tight">협업 대기 중</p>
        </div>
      );
    }

    return (
      <div className="absolute top-24 right-8 z-[9999] bg-white p-6 rounded-2xl shadow-2xl border border-emerald-100 max-w-sm w-80 pointer-events-auto">
        <h3 className="font-black text-lg text-emerald-900 mb-4 tracking-tight">협업 요청 ({requests.length})</h3>
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.socketId} className="flex flex-col gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <p className="text-sm font-medium text-emerald-900 leading-tight">
                <span className="font-bold text-emerald-600">{req.requester?.email || 'Anonymous'}</span> 님이 참여를 요청합니다.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onAccept(req.socketId)} 
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  수락
                </button>
                <button 
                  onClick={() => onReject(req.socketId)} 
                  className="flex-1 py-2 bg-white border border-gray-200 text-gray-800 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 방장이 아닌 경우
  return (
    <div className="absolute top-24 right-8 z-[9999] bg-white p-6 rounded-2xl shadow-2xl border border-emerald-100 max-w-sm pointer-events-auto">
      <h3 className="font-black text-lg text-emerald-900 mb-2 tracking-tight flex items-center gap-2">
        <span className="text-xl">🤝</span> 실시간 협업
      </h3>
      {status === 'idle' && (
        <>
          <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">전술 그리기 권한을 요청하여 방장과 함께 작전을 짜보세요.</p>
          <button 
            onClick={onRequest} 
            className="w-full py-3 bg-emerald-900 text-white rounded-xl font-bold hover:bg-emerald-950 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            협업 요청하기
          </button>
        </>
      )}
      {status === 'requesting' && (
        <p className="text-sm text-emerald-700 font-bold bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 animate-pulse text-center">
          방장의 수락을 기다리고 있습니다...
        </p>
      )}
      {status === 'approved' && (
        <p className="text-sm text-emerald-600 font-black bg-emerald-100/50 px-4 py-3 rounded-xl border border-emerald-200 text-center">
          🎉 협업 권한이 활성화되었습니다!
        </p>
      )}
      {status === 'denied' && (
        <p className="text-sm text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-100 text-center">
          요청이 거절되었습니다.
        </p>
      )}
    </div>
  );
}
