import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const severityColors = {
  mild: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  moderate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  severe: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function SymptomSpectrum() {
  const [selectedSymptom, setSelectedSymptom] = useState(null);

  const { data: disorders = [], isLoading } = useQuery({
    queryKey: ['disorders'],
    queryFn: () => base44.entities.Disorder.list(),
  });

  // Build unique symptom list across all disorders
  const allSymptoms = useMemo(() => {
    const symptomMap = {};
    disorders.forEach(d => {
      (d.symptoms || []).forEach(s => {
        const key = s.name?.toLowerCase();
        if (!key) return;
        if (!symptomMap[key]) {
          symptomMap[key] = { name: s.name, disorders: [] };
        }
        symptomMap[key].disorders.push({
          disorderName: d.name,
          disorderSlug: d.slug,
          severity: s.severity,
          description: s.description,
          why_it_occurs: s.why_it_occurs,
        });
      });
    });
    return Object.values(symptomMap).sort((a, b) => b.disorders.length - a.disorders.length);
  }, [disorders]);

  const activeSymptom = allSymptoms.find(s => s.name === selectedSymptom);

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
              Cross-Disorder Analysis
            </p>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-6">
              Symptom Spectrum
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              See how the same symptom manifests across different conditions. 
              Understand why you experience specific symptoms and how they connect to each disorder.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : allSymptoms.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No symptom data available yet. Add disorders with symptoms to see the spectrum.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Symptom List */}
              <div className="lg:col-span-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Symptoms ({allSymptoms.length})
                </h3>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                  {allSymptoms.map((symptom) => (
                    <button
                      key={symptom.name}
                      onClick={() => setSelectedSymptom(symptom.name)}
                      className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 flex items-center justify-between ${
                        selectedSymptom === symptom.name
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-card border border-border/60 hover:border-primary/30'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-medium">{symptom.name}</span>
                        <p className={`text-xs mt-0.5 ${
                          selectedSymptom === symptom.name ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          Appears in {symptom.disorders.length} condition{symptom.disorders.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedSymptom === symptom.name
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {symptom.disorders.length}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom Detail */}
              <div className="lg:col-span-7">
                {!activeSymptom ? (
                  <div className="h-full flex items-center justify-center border border-dashed border-border/60 rounded-2xl p-16">
                    <p className="text-muted-foreground text-center">
                      Select a symptom to see how it appears across conditions
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={activeSymptom.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <h2 className="font-heading text-2xl lg:text-3xl mb-2">
                      {activeSymptom.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-8">
                      This symptom appears across {activeSymptom.disorders.length} condition{activeSymptom.disorders.length !== 1 ? 's' : ''}
                    </p>

                    <div className="space-y-4">
                      {activeSymptom.disorders.map((d, i) => (
                        <motion.div
                          key={d.disorderName}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-5 rounded-2xl border border-border/60 bg-card/50"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-semibold">{d.disorderName}</h4>
                            {d.severity && (
                              <Badge variant="outline" className={`text-xs ${severityColors[d.severity]}`}>
                                {d.severity}
                              </Badge>
                            )}
                          </div>
                          {d.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {d.description}
                            </p>
                          )}
                          {d.why_it_occurs && (
                            <div className="pt-3 border-t border-border/40">
                              <p className="text-xs font-medium text-primary mb-1">Why it occurs in this condition:</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {d.why_it_occurs}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}