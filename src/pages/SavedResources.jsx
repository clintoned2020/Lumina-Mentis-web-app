import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, BookOpen, Pill, Dna } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';

export default function SavedResources() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: saved = [], isLoading, refetch } = useQuery({
    queryKey: ['saved-resources', user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const ptr = usePullToRefresh(refetch);

  const handleRemove = async (item) => {
    // Optimistic update
    queryClient.setQueryData(['saved-resources', user?.email], (old = []) =>
      old.filter(s => s.id !== item.id)
    );
    try {
      await base44.entities.SavedResource.delete(item.id);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['saved-resources'] });
    }
  };

  const disorders = saved.filter(s => s.resource_type === 'disorder');
  const remedies = saved.filter(s => s.resource_type === 'remedy');
  const rootCauses = saved.filter(s => s.resource_type === 'root_cause');

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">My Library</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-4">Saved Resources</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Bookmarked disorders and remedies you've saved for quick reference. Build your personal mental health library.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 space-y-10">

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-muted/30 rounded-2xl animate-pulse" />)}
            </div>
          ) : saved.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-2xl mb-2">Nothing saved yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Browse Disorders, Root Causes, or Remedies and tap the bookmark icon to save resources here.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/disorders">
                  <Button variant="outline"><BookOpen className="w-4 h-4 mr-2" />Disorder Library</Button>
                </Link>
                <Link to="/root-causes">
                  <Button variant="outline"><Dna className="w-4 h-4 mr-2" />Root Causes</Button>
                </Link>
                <Link to="/remedies">
                  <Button variant="outline"><Pill className="w-4 h-4 mr-2" />Remedies</Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Disorders */}
              {disorders.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold text-foreground">Disorders</h2>
                    <Badge variant="secondary" className="text-xs">{disorders.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {disorders.map(item => (
                        <ResourceRow key={item.id} item={item} onRemove={handleRemove}
                          href={item.resource_slug ? `/disorders/${item.resource_slug}` : '/disorders'} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Root Causes */}
              {rootCauses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Dna className="w-4 h-4 text-blue-500" />
                    <h2 className="font-semibold text-foreground">Root Causes</h2>
                    <Badge variant="secondary" className="text-xs">{rootCauses.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {rootCauses.map(item => (
                        <ResourceRow key={item.id} item={item} onRemove={handleRemove}
                          href={item.resource_slug ? `/root-causes` : '/root-causes'} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Remedies */}
              {remedies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Pill className="w-4 h-4 text-accent" />
                    <h2 className="font-semibold text-foreground">Remedies & Treatments</h2>
                    <Badge variant="secondary" className="text-xs">{remedies.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {remedies.map(item => (
                        <ResourceRow key={item.id} item={item} onRemove={handleRemove} href="/remedies" />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ResourceRow({ item, onRemove, href }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-4 p-4 bg-card border border-border/60 rounded-2xl hover:border-primary/20 transition-all group"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
        {item.resource_type === 'disorder'
          ? <BookOpen className="w-4 h-4 text-primary" />
          : item.resource_type === 'root_cause'
          ? <Dna className="w-4 h-4 text-blue-500" />
          : <Pill className="w-4 h-4 text-accent" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.resource_name}</p>
        <p className="text-xs text-muted-foreground capitalize">{item.resource_type}</p>
      </div>
      <Link to={href}>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </Link>
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item)}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </motion.div>
  );
}