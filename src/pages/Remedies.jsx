import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Pill, Leaf, ChevronRight } from 'lucide-react';
import BookmarkButton from '../components/shared/BookmarkButton';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ConsultBanner from '../components/shared/ConsultBanner';

export default function Remedies() {
  const [selectedDisorder, setSelectedDisorder] = useState(null);
  const [activeTab, setActiveTab] = useState('medications');

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
            className="mb-8"
          >
            <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
              Treatment Pathways
            </p>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-6">
              Remedies & Medication
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Learn how medications work at the molecular level, why they're prescribed for specific situations, 
              and evidence-based lifestyle approaches — always in partnership with your healthcare provider.
            </p>
          </motion.div>

          {/* Permanent Consult Banner */}
          <div className="mb-12">
            <ConsultBanner />
          </div>

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
                      onClick={() => { setSelectedDisorder(disorder.id); setActiveTab('medications'); }}
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

            {/* Content */}
            <div className="lg:col-span-8">
              {!activeDisorder ? (
                <div className="h-full flex items-center justify-center border border-dashed border-border/60 rounded-2xl p-16">
                  <p className="text-muted-foreground text-center">
                    Select a condition to explore treatment options
                  </p>
                </div>
              ) : (
                <motion.div
                  key={activeDisorder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="font-heading text-2xl lg:text-3xl">
                      {activeDisorder.name} — Treatment Options
                    </h2>
                    <BookmarkButton
                      resourceType="remedy"
                      resourceId={activeDisorder.id}
                      resourceName={`${activeDisorder.name} — Remedies`}
                      resourceSlug={activeDisorder.slug}
                    />
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-8">
                    <button
                      onClick={() => setActiveTab('medications')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'medications'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Pill className="w-4 h-4" />
                      Medications
                    </button>
                    <button
                      onClick={() => setActiveTab('lifestyle')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === 'lifestyle'
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Leaf className="w-4 h-4" />
                      Lifestyle
                    </button>
                  </div>

                  {/* Medications Tab */}
                  {activeTab === 'medications' && (
                    <div className="space-y-4">
                      {(activeDisorder.medications || []).length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8">
                          No medication data available for this condition yet.
                        </p>
                      ) : (
                        activeDisorder.medications.map((med, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-2xl border border-border/60 bg-card/50"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-semibold text-lg">{med.name}</h4>
                              {med.type && (
                                <Badge variant="outline" className="text-xs">{med.type}</Badge>
                              )}
                            </div>
                            {med.mechanism && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                                  How It Works
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {med.mechanism}
                                </p>
                              </div>
                            )}
                            {med.best_for && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-accent mb-1 uppercase tracking-wider">
                                  Best For
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {med.best_for}
                                </p>
                              </div>
                            )}
                            {med.common_side_effects?.length > 0 && (
                              <div className="pt-3 border-t border-border/40">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                                  Common Side Effects
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {med.common_side_effects.map((effect, j) => (
                                    <Badge key={j} variant="secondary" className="text-xs font-normal">
                                      {effect}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Lifestyle Tab */}
                  {activeTab === 'lifestyle' && (
                    <div className="space-y-4">
                      {(activeDisorder.lifestyle_remedies || []).length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8">
                          No lifestyle remedy data available for this condition yet.
                        </p>
                      ) : (
                        <div className="p-6 rounded-2xl border border-border/60 bg-card/50">
                          <ul className="space-y-4">
                            {activeDisorder.lifestyle_remedies.map((remedy, i) => (
                              <li key={i} className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-semibold text-accent">{i + 1}</span>
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed">{remedy}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prognosis */}
                  {activeDisorder.prognosis && (
                    <div className="mt-8 p-6 rounded-2xl border border-primary/20 bg-primary/5">
                      <h3 className="font-semibold text-lg mb-3">Prognosis & Recovery</h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {activeDisorder.prognosis}
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