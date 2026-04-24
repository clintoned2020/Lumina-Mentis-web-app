import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ChevronLeft, Clock, RefreshCw, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreathingSession from '@/components/mindfulness/BreathingSession';

const PATTERNS = [
  {
    id: 'box',
    name: 'Box Breathing',
    tagline: 'Balance & calm',
    description: 'Used by Navy SEALs and therapists alike. Equal counts for each phase create a balanced, grounding rhythm.',
    color: 'bg-primary/10 border-primary/30 text-primary',
    icon: '🟦',
    duration: '~4 min',
    difficulty: 'Beginner',
    cycles: 5,
    steps: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'rest', duration: 4 },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    tagline: 'Sleep & anxiety relief',
    description: 'Developed by Dr. Andrew Weil. A natural tranquilizer for the nervous system — ideal before sleep or during anxiety.',
    color: 'bg-accent/10 border-accent/30 text-accent',
    icon: '🌙',
    duration: '~3 min',
    difficulty: 'Intermediate',
    cycles: 4,
    steps: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 },
    ],
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    tagline: 'Heart rate harmony',
    description: 'Five breaths per minute to sync your heart rate variability. Promotes deep calm and mental clarity.',
    color: 'bg-green-500/10 border-green-500/30 text-green-600',
    icon: '💚',
    duration: '~5 min',
    difficulty: 'Beginner',
    cycles: 5,
    steps: [
      { phase: 'inhale', duration: 6 },
      { phase: 'exhale', duration: 6 },
    ],
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    tagline: 'Instant stress relief',
    description: 'A double inhale through the nose then a long exhale. Researched by Stanford — the fastest way to reduce stress.',
    color: 'bg-chart-4/20 border-chart-4/30 text-chart-4',
    icon: '🫁',
    duration: '~2 min',
    difficulty: 'Beginner',
    cycles: 6,
    steps: [
      { phase: 'inhale', duration: 2 },
      { phase: 'inhale', duration: 1 },
      { phase: 'exhale', duration: 6 },
    ],
  },
  {
    id: 'wim-hof',
    name: 'Deep Rhythmic',
    tagline: 'Energize & focus',
    description: 'A deep, rhythmic pattern to build energy and focus. Great for morning sessions or before a demanding task.',
    color: 'bg-chart-2/20 border-chart-2/30 text-chart-2',
    icon: '⚡',
    duration: '~4 min',
    difficulty: 'Intermediate',
    cycles: 6,
    steps: [
      { phase: 'inhale', duration: 3 },
      { phase: 'exhale', duration: 3 },
      { phase: 'rest', duration: 2 },
    ],
  },
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic',
    tagline: 'Deep relaxation',
    description: 'Slow, belly-focused breathing that activates the parasympathetic nervous system for full-body relaxation.',
    color: 'bg-chart-3/20 border-chart-3/30 text-chart-3',
    icon: '🌿',
    duration: '~5 min',
    difficulty: 'Beginner',
    cycles: 5,
    steps: [
      { phase: 'inhale', duration: 5 },
      { phase: 'hold', duration: 2 },
      { phase: 'exhale', duration: 7 },
    ],
  },
];

export default function Mindfulness() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mindfulness</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-4">
              Guided Breathing
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Science-backed breathing patterns with a visual rhythm guide. Choose a technique and let the animation pace your breath to reduce stress and restore calm.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key="session"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                {/* Back */}
                <button
                  onClick={() => setSelected(null)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to techniques
                </button>

                {/* Pattern info */}
                <div className="text-center mb-10">
                  <span className="text-4xl mb-3 block">{selected.icon}</span>
                  <h2 className="font-heading text-2xl lg:text-3xl mb-1">{selected.name}</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">{selected.description}</p>
                  <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selected.duration}</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{selected.cycles} cycles</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{selected.difficulty}</span>
                  </div>
                </div>

                <BreathingSession
                  pattern={selected}
                  onComplete={() => setSelected(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <p className="text-sm text-muted-foreground mb-6">
                  Choose a breathing technique to begin your session.
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PATTERNS.map((pattern, i) => (
                    <motion.button
                      key={pattern.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelected(pattern)}
                      className="text-left p-5 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="text-3xl mb-3">{pattern.icon}</div>
                      <h3 className="font-semibold text-sm mb-0.5">{pattern.name}</h3>
                      <p className="text-xs text-primary font-medium mb-2">{pattern.tagline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                        {pattern.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pattern.duration}</span>
                        <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{pattern.cycles} cycles</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${pattern.color}`}>
                          {pattern.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          Start →
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}