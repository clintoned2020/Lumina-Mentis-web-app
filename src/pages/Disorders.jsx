import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import DisorderCard from '../components/shared/DisorderCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator';
import { disorderMatchesCategory } from '@/lib/disorderCategory';

const categories = [
  { value: 'all', label: 'All Conditions' },
  { value: 'psychotic', label: 'Psychotic Spectrum' },
  { value: 'mood', label: 'Mood Disorders' },
  { value: 'anxiety', label: 'Anxiety Spectrum' },
  { value: 'neurodevelopmental', label: 'Neurodevelopmental' },
  { value: 'other', label: 'Other' },
];

export default function Disorders() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: disorders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['disorders'],
    queryFn: () => base44.entities.Disorder.list(),
  });

  const ptr = usePullToRefresh(refetch);

  const filtered = activeCategory === 'all'
    ? disorders
    : disorders.filter(d => disorderMatchesCategory(d, activeCategory));

  return (
    <div className="min-h-screen">
      <PullToRefreshIndicator {...ptr} />
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
              Disorder Library
            </p>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-6">
              Understanding Every Condition
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Comprehensive, compassionate information about mental health conditions. 
              Nothing left unsaid — from root causes to recovery.
            </p>
          </motion.div>

          {/* Category Filter — desktop pills */}
          <div className="hidden md:flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Category Filter — mobile bottom-sheet */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  {categories.find(c => c.value === activeCategory)?.label || 'All Conditions'}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter by Category</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-8 space-y-2">
                  {categories.map(cat => (
                    <DrawerTrigger asChild key={cat.value}>
                      <button
                        onClick={() => setActiveCategory(cat.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          activeCategory === cat.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    </DrawerTrigger>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
            {activeCategory !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {filtered.length} condition{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-8 rounded-2xl border border-border/60">
                  <Skeleton className="h-5 w-24 mb-6 rounded-full" />
                  <Skeleton className="h-8 w-48 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="col-span-full py-16 text-center space-y-4 max-w-lg mx-auto rounded-2xl border border-destructive/30 bg-destructive/5 px-6">
              <p className="text-sm font-medium text-foreground">Could not load disorders</p>
              <p className="text-xs text-muted-foreground">
                {(error && (error.message || String(error))) ||
                  'Check browser network tab, Supabase env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), and that the disorder table exists.'}
              </p>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((disorder, i) => (
                <DisorderCard key={disorder.id} disorder={disorder} index={i} />
              ))}
              {filtered.length === 0 && disorders.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground space-y-3 max-w-lg mx-auto">
                  <p>No conditions are in the library yet.</p>
                  <p className="text-sm">
                    Seed the <code className="text-xs bg-muted px-1 py-0.5 rounded">disorder</code> table in Supabase, or confirm you are connected to the right project.
                  </p>
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => refetch()}>
                    Reload
                  </Button>
                </div>
              )}
              {filtered.length === 0 && disorders.length > 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground space-y-4 max-w-xl mx-auto">
                  <p>No conditions match this category filter.</p>
                  <Button type="button" variant="secondary" className="rounded-xl" onClick={() => setActiveCategory('all')}>
                    Show all conditions
                  </Button>
                  <p className="text-xs text-muted-foreground/90">
                    Categories in your database:{' '}
                    <span className="text-foreground font-mono text-[11px]">
                      {[...new Set(disorders.map(d => d.category).filter(Boolean))].join(', ') || '(empty or null)'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}