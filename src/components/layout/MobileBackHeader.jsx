import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * MobileBackHeader — Sticky header for mobile screens with consistent back navigation.
 * Ensures minimum touch target sizes and proper spacing with bottom tabs.
 */
export default function MobileBackHeader({ title, backPath = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/60">
      <div className="flex items-center h-14 px-4 gap-3">
        {!isHome && (
          <button
            onClick={handleBack}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors active:bg-muted/70 -ml-1"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {title && (
          <h1 className="text-sm font-semibold text-foreground truncate flex-1">
            {title}
          </h1>
        )}
      </div>
    </div>
  );
}