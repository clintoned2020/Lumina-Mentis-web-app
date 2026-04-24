import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackTimeSpent } from '@/lib/analytics-tracker';

const PAGE_NAMES = {
  '/': 'Home',
  '/disorders': 'Disorders',
  '/root-causes': 'Root Causes',
  '/symptom-spectrum': 'Symptom Spectrum',
  '/remedies': 'Remedies',
  '/analytics': 'Analytics',
};

export function usePageTracking() {
  const location = useLocation();
  const entryTime = useRef(Date.now());
  const prevPath = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    const pageName = PAGE_NAMES[path] || path.replace('/', '').replace(/-/g, ' ');

    // Log time spent on previous page
    if (prevPath.current) {
      const seconds = Math.round((Date.now() - entryTime.current) / 1000);
      const prevName = PAGE_NAMES[prevPath.current] || prevPath.current;
      if (seconds > 2) trackTimeSpent(prevName, seconds);
    }

    trackPageView(pageName);
    entryTime.current = Date.now();
    prevPath.current = path;
  }, [location.pathname]);
}