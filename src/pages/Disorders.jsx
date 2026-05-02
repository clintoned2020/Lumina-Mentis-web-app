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

const categories = [
  { value: 'all', label: 'All Conditions' },
  { value: 'psychotic', label: 'Psychotic Spectrum' },
  { value: 'mood', label: 'Mood Disorders' },
  { value: 'anxiety', label: 'Anxiety Spectrum' },
  { value: 'neurodevelopmental', label: 'Neurodevelopmental' },
  { value: 'other', label: 'Other' },
];

/** Map DB/category text to canonical filter key (handles casing, underscores, stray labels). */
function normalizeCategoryKey(value) {
  if (value == null) return 'other';
  const raw = String(value).trim().toLowerCase();
  if (!raw) return 'other';
  const v = raw.replace(/[\s-]+/g, '_');

  const direct = new Set(['psychotic', 'mood', 'anxiety', 'neurodevelopmental', 'other']);
  if (direct.has(v)) return v;

  if (v.includes('psychotic') || v.includes('schizo')) return 'psychotic';
  if (v.includes('mood')) return 'mood';
  if (v.includes('anxiety') || v.includes('panic') || v.includes('ocd') || v.includes('trauma')) return 'anxiety';
  if (v.includes('neurodevelopmental') || v.includes('adhd') || v.includes('autism') || v.includes('developmental')) return 'neurodevelopmental';

  return 'other';
}

function disorderMatchesCategory(disorder, activeCategory) {
  if (activeCategory === 'all') return true;
  return normalizeCategoryKey(disorder?.category) === activeCategory;
}

export default function Disorders() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: disorders = [], isLoading, refetch } = useQuery({
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((disorder, i) => (
                <DisorderCard key={disorder.id} disorder={disorder} index={i} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No conditions found in this category.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}