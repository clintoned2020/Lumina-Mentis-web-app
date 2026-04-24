import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASE_LABELS = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  rest: 'Rest',
};

const PHASE_COLORS = {
  inhale: 'from-primary/40 to-primary/10',
  hold: 'from-accent/40 to-accent/10',
  exhale: 'from-secondary/60 to-secondary/20',
  rest: 'from-muted/60 to-muted/20',
};

const RING_COLORS = {
  inhale: 'border-primary/50',
  hold: 'border-accent/50',
  exhale: 'border-secondary-foreground/30',
  rest: 'border-muted-foreground/20',
};

export default function BreathingCircle({ phase, countdown, totalDuration, isRunning }) {
  const scale = phase === 'inhale' ? 1.35 : phase === 'hold' ? 1.35 : 1;
  const progress = totalDuration > 0 ? (countdown / totalDuration) : 1;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto">
      {/* Outer pulse ring */}
      <AnimatePresence>
        {isRunning && (phase === 'inhale' || phase === 'hold') && (
          <motion.div
            key={phase + '-pulse'}
            className="absolute rounded-full border border-primary/20"
            initial={{ width: 220, height: 220, opacity: 0.5 }}
            animate={{ width: 270, height: 270, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Static outer ring */}
      <div className={`absolute w-56 h-56 rounded-full border-2 ${RING_COLORS[phase]} transition-colors duration-700`} />

      {/* Animated circle */}
      <motion.div
        className={`w-40 h-40 rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]} backdrop-blur-sm transition-all duration-700`}
        animate={{ scale: isRunning ? scale : 1 }}
        transition={{ duration: phase === 'inhale' ? 0.8 : 0.5, ease: 'easeInOut' }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-foreground/80 tracking-widest uppercase"
          >
            {PHASE_LABELS[phase]}
          </motion.p>
          <p className="text-4xl font-light text-foreground mt-1 tabular-nums">
            {countdown}
          </p>
        </div>
      </motion.div>

      {/* Progress arc (SVG) */}
      <svg className="absolute w-64 h-64 -rotate-90" viewBox="0 0 256 256">
        <circle
          cx="128" cy="128" r="120"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="3"
        />
        <motion.circle
          cx="128" cy="128" r="120"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 120}`}
          strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress)}`}
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          opacity={0.5}
        />
      </svg>
    </div>
  );
}