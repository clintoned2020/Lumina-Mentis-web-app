import { useState, useEffect, useRef } from 'react';

/**
 * Pull-to-refresh hook for mobile.
 * Returns { isPulling, pullProgress (0-1), isRefreshing }
 * Call onRefresh when threshold is reached.
 */
export default function usePullToRefresh(onRefresh, threshold = 72) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(null);
  const scrollEl = useRef(null);

  useEffect(() => {
    const onTouchStart = (e) => {
      const el = document.documentElement;
      if (el.scrollTop > 4) return;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (startY.current === null || isRefreshing) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) {
        setPullY(Math.min(delta, threshold * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (pullY >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        setPullY(0);
        await onRefresh();
        setIsRefreshing(false);
      } else {
        setPullY(0);
      }
      startY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullY, isRefreshing, onRefresh, threshold]);

  return {
    isPulling: pullY > 0,
    pullProgress: Math.min(pullY / threshold, 1),
    isRefreshing,
    pullY,
  };
}