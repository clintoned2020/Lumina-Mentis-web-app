import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreathingCircle from './BreathingCircle';

function buildSequence(pattern) {
  // Returns array of {phase, duration} steps
  return pattern.steps;
}

export default function BreathingSession({ pattern, onComplete }) {
  const sequence = buildSequence(pattern);
  const totalCycles = pattern.cycles || 5;

  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [countdown, setCountdown] = useState(sequence[0].duration);
  const [cycleCount, setCycleCount] = useState(0);

  const tickRef = useRef(null);
  const countdownRef = useRef(sequence[0].duration);
  const stepRef = useRef(0);
  const cycleRef = useRef(0);

  const currentStep = sequence[stepIndex];

  const tick = useCallback(() => {
    countdownRef.current -= 1;
    setCountdown(countdownRef.current);

    if (countdownRef.current <= 0) {
      const nextStep = stepRef.current + 1;
      if (nextStep >= sequence.length) {
        // End of one cycle
        const nextCycle = cycleRef.current + 1;
        cycleRef.current = nextCycle;
        setCycleCount(nextCycle);
        if (nextCycle >= totalCycles) {
          clearInterval(tickRef.current);
          setIsRunning(false);
          setDone(true);
          return;
        }
        stepRef.current = 0;
        setStepIndex(0);
        countdownRef.current = sequence[0].duration;
        setCountdown(sequence[0].duration);
      } else {
        stepRef.current = nextStep;
        setStepIndex(nextStep);
        countdownRef.current = sequence[nextStep].duration;
        setCountdown(sequence[nextStep].duration);
      }
    }
  }, [sequence, totalCycles]);

  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [isRunning, tick]);

  const handleReset = () => {
    clearInterval(tickRef.current);
    setIsRunning(false);
    setDone(false);
    setStepIndex(0);
    setCountdown(sequence[0].duration);
    setCycleCount(0);
    countdownRef.current = sequence[0].duration;
    stepRef.current = 0;
    cycleRef.current = 0;
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="font-heading text-2xl mb-2">Session Complete</h3>
        <p className="text-muted-foreground text-sm mb-6">
          You completed {totalCycles} cycles of {pattern.name}. Well done.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Repeat
          </Button>
          <Button onClick={onComplete}>Choose Another</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Circle */}
      <BreathingCircle
        phase={currentStep.phase}
        countdown={countdown}
        totalDuration={currentStep.duration}
        isRunning={isRunning}
      />

      {/* Cycle progress */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalCycles }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < cycleCount
                ? 'bg-primary'
                : i === cycleCount
                ? 'bg-primary/40 ring-1 ring-primary'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground -mt-4">
        Cycle {Math.min(cycleCount + 1, totalCycles)} of {totalCycles}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="lg"
          className="rounded-full px-10"
          onClick={() => setIsRunning(r => !r)}
        >
          {isRunning ? (
            <><Pause className="w-4 h-4 mr-2" /> Pause</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> {cycleCount === 0 && countdown === sequence[0].duration ? 'Begin' : 'Resume'}</>
          )}
        </Button>
      </div>
    </div>
  );
}