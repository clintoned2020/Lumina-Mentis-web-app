import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefreshIndicator({ pullProgress, isRefreshing, pullY }) {
  const visible = pullProgress > 0 || isRefreshing;
  if (!visible) return null;

  const rotate = isRefreshing ? undefined : `${pullProgress * 360}deg`;
  const translateY = isRefreshing ? 40 : Math.min(pullY * 0.6, 40);

  return (
    <div
      className="fixed top-16 left-1/2 z-50 pointer-events-none lg:hidden"
      style={{ transform: `translateX(-50%) translateY(${translateY}px)`, transition: isRefreshing ? 'transform 0.2s' : 'none' }}
    >
      <div className={`w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}>
        <RefreshCw
          className="w-4 h-4 text-primary"
          style={{ transform: rotate ? `rotate(${rotate})` : undefined, opacity: 0.3 + pullProgress * 0.7 }}
        />
      </div>
    </div>
  );
}