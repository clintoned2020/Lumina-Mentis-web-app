import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookmarkButton({ resourceType, resourceId, resourceName, resourceSlug, size = 'icon', className = '' }) {
  const [saved, setSaved] = useState(undefined); // undefined = loading, null = not saved
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    base44.entities.SavedResource.filter({ user_email: user.email, resource_id: resourceId })
      .then(results => setSaved(results[0] || null))
      .catch(() => setSaved(null));
  }, [user, resourceId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || saved === undefined) return;

    if (saved) {
      // Optimistic: remove
      const prev = saved;
      setSaved(null);
      try {
        await base44.entities.SavedResource.delete(prev.id);
      } catch {
        setSaved(prev);
      }
    } else {
      // Optimistic: add (use temp object)
      setSaved({ id: '__optimistic__' });
      try {
        const created = await base44.entities.SavedResource.create({
          user_email: user.email,
          resource_type: resourceType,
          resource_id: resourceId,
          resource_name: resourceName,
          resource_slug: resourceSlug || '',
        });
        setSaved(created);
      } catch {
        setSaved(null);
      }
    }
  };

  if (!user) return null;

  const isSaved = !!saved;
  const isLoading = saved === undefined;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`rounded-xl transition-all ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'} ${className}`}
      title={isSaved ? 'Remove bookmark' : 'Save for later'}
    >
      {isSaved
        ? <BookmarkCheck className="w-4 h-4" />
        : <Bookmark className="w-4 h-4" />
      }
    </Button>
  );
}