import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Dna, Cloud, Brain, Activity, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BookmarkButton from '@/components/shared/BookmarkButton';

const causeTypes = [
  { key: 'biological_causes', label: 'Biological & Genetic', icon: Dna, color: 'bg-blue-500/10 text-blue-600' },
  { key: 'environmental_causes', label: 'Environmental', icon: Cloud, color: 'bg-emerald-500/10 text-emerald-600' },
  { key: 'psychological_causes', label: 'Psychological', icon: Brain, color: 'bg-purple-500/10 text-purple-600' },
  { key: 'lifestyle_causes', label: 'Lifestyle & Circumstantial', icon: Activity, color: 'bg-amber-500/10 text-amber-600' },
];

export default function RootCauses() {
  const [selectedDisorder, setSelectedDisorder] = useState(null);
  const [selectedCauseType, setSelectedCauseType] = useState(null);

  const { data: disorders = [], isLoading } = useQuery({
    queryKey: ['disorders'],
    queryFn: () => base44.entities.Disorder.list(),
  });

  const activeDisorder = disorders.find(d => d.id === selectedDisorder);

  return (
    <div className="min-h-screen">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
              The "Why" Engine
            </p>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-6">
              Root Cause Mapping
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore the interconnected factors behind mental health conditions. 
              Select a condition, then drill into biological, environmental, psychological, and lifestyle causes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Disorder Selector */}
            <div className="lg:col-span-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Select a Condition
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {disorders.map((disorder) => (
                    <button
                      key={disorder.id}
                      onClick={() => { setSelectedDisorder(disorder.id); setSelectedCauseType(null); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between ${
                        selectedDisorder === disorder.id
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-card border border-border/60 text-foreground hover:border-primary/30'
                      }`}
                    >
                      {disorder.name}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cause Types */}
            <div className="lg:col-span-8">
              {!activeDisorder ? (
                <div className="h-full flex items-center justify-center border border-dashed border-border/60 rounded-2xl p-16">
                  <p className="text-muted-foreground text-center">
                    Select a condition from the left to explore its root causes
                  </p>
                </div>
              ) : (
                <motion.div
                  key={activeDisorder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="font-heading text-2xl lg:text-3xl">
                      {activeDisorder.name} — Causality Map
                    </h2>
                    <BookmarkButton
                      resourceType="root_cause"
                      resourceId={activeDisorder.id}
                      resourceName={`${activeDisorder.name} — Root Causes`}
                      resourceSlug={activeDisorder.slug}
                    />
                  </div>

                  {/* Cause Type Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {causeTypes.map((type) => {
                      const causes = activeDisorder[type.key] || [];
                      const TypeIcon = type.icon;
                      return (
                        <button
                          key={type.key}
                          onClick={() => setSelectedCauseType(selectedCauseType === type.key ? null : type.key)}
                          className={`p-5 rounded-2xl border text-left transition-all duration-300 ${
                            selectedCauseType === type.key
                              ? 'border-primary/40 bg-primary/5 shadow-lg shadow-primary/10'
                              : 'border-border/60 bg-card/50 hover:border-primary/20'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl ${type.color} flex items-center justify-center mb-3`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{type.label}</h4>
                          <p className="text-xs text-muted-foreground">
                            {causes.length} factor{causes.length !== 1 ? 's' : ''} identified
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded Causes */}
                  {selectedCauseType && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 lg:p-8 rounded-2xl border border-border/60 bg-card/50"
                    >
                      <h3 className="font-semibold text-lg mb-4">
                        {causeTypes.find(t => t.key === selectedCauseType)?.label}
                      </h3>
                      <ul className="space-y-4">
                        {(activeDisorder[selectedCauseType] || []).map((cause, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-semibold text-primary">{i + 1}</span>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed">{cause}</p>
                          </li>
                        ))}
                        {(activeDisorder[selectedCauseType] || []).length === 0 && (
                          <p className="text-muted-foreground text-sm">No data available for this category yet.</p>
                        )}
                      </ul>
                    </motion.div>
                  )}

                  {/* Who Is Affected */}
                  {activeDisorder.who_is_affected && (
                    <div className="p-6 lg:p-8 rounded-2xl border border-accent/20 bg-accent/5 mt-6">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <span>Why Certain People & Not Others</span>
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {activeDisorder.who_is_affected}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}