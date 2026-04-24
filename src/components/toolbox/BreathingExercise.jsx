import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingExercise({ exercise, onClose }) {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(exercise.phases[0].duration);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const phase = exercise.phases[phaseIndex];

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return; }

    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          const nextIndex = (phaseIndex + 1) % exercise.phases.length;
          setPhaseIndex(nextIndex);
          if (nextIndex === 0) setCycles(c => c + 1);
          setSecondsLeft(exercise.phases[nextIndex].duration);
          return exercise.phases[nextIndex].duration;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [running, phaseIndex]);

  function toggle() {
    if (running) {
      setRunning(false);
      setPhaseIndex(0);
      setSecondsLeft(exercise.phases[0].duration);
      setCycles(0);
    } else {
      setRunning(true);
    }
  }

  // Circle scale based on phase
  const isInhale = phase.label === 'Inhale';
  const isHold = phase.label === 'Hold';
  const circleScale = isHold ? 1.3 : isInhale ? 1.3 : 0.8;
  const transitionDuration = phase.duration * 0.9;

  return (
    <div className="p-6 rounded-2xl border bg-card" style={{ borderColor: exercise.color + '40' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-heading text-xl mb-1">{exercise.title}</h3>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: exercise.color + '20', color: exercise.color }}>
            {exercise.tag}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Visual Breathing Circle */}
      <div className="flex flex-col items-center mb-8 py-6">
        <div className="relative w-40 h-40 flex items-center justify-center mb-5">
          {/* Outer rings */}
          {[1.6, 1.35, 1.1].map((s, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full opacity-10"
              style={{ backgroundColor: phase.color }}
              animate={{ scale: running ? circleScale * s : s }}
              transition={{ duration: transitionDuration, ease: 'easeInOut' }}
            />
          ))}
          {/* Main circle */}
          <motion.div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl"
            style={{ backgroundColor: phase.color }}
            animate={{ scale: running ? circleScale : 1 }}
            transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-center"
              >
                <p className="text-lg font-bold leading-none">{phase.label}</p>
                <p className="text-3xl font-bold mt-1">{secondsLeft}</p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Phase dots */}
        <div className="flex gap-2">
          {exercise.phases.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <motion.div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
                animate={{ scale: i === phaseIndex && running ? 1.5 : 1, opacity: i === phaseIndex ? 1 : 0.3 }}
              />
              <span className="text-[10px] text-muted-foreground">{p.label}</span>
            </div>
          ))}
        </div>

        {cycles > 0 && (
          <p className="text-xs text-muted-foreground mt-3">{cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed</p>
        )}
      </div>

      {/* Controls */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={toggle}
          className="px-10 rounded-2xl"
          style={{ backgroundColor: running ? '#ef4444' : exercise.color }}
        >
          {running ? <><Square className="w-4 h-4 mr-2" />Stop</> : <><Play className="w-4 h-4 mr-2" />Begin</>}
        </Button>
      </div>

      {/* Phase legend */}
      {!running && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {exercise.phases.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label}: {p.duration}s
            </div>
          ))}
        </div>
      )}
    </div>
  );
}