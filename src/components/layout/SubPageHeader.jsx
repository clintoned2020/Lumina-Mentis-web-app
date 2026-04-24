import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubPageHeader({ title, backLabel = 'Back', backPath }) {
  const navigate = useNavigate();

  function handleBack() {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  }

  return (
    <div className="sticky top-16 lg:top-20 z-40 bg-background/90 backdrop-blur-md border-b border-border/40 lg:hidden">
      <div className="flex items-center gap-3 px-4 h-12">
        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl -ml-1 flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {title && (
          <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
        )}
      </div>
    </div>
  );
}