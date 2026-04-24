import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Volume2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function MeditationPlayer({ meditation, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioRef.current) { audioRef.current.pause(); }
    };
  }, []);

  function togglePlay() {
    if (playing) {
      audioRef.current?.pause();
      clearInterval(intervalRef.current);
    } else {
      audioRef.current?.play().catch(() => {});
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 100;
          }
          return p + 0.5;
        });
      }, 300);
    }
    setPlaying(p => !p);
  }

  function nextStep() {
    setCurrentStep(s => Math.min(s + 1, meditation.steps.length - 1));
  }

  return (
    <div className="p-6 rounded-2xl border border-primary/20 bg-card shadow-xl">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-heading text-xl mb-1">{meditation.title}</h3>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: meditation.color + '20', color: meditation.color }}>
            {meditation.tag}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Audio (hidden player) */}
      <audio ref={audioRef} src={meditation.audioSrc} loop />

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: meditation.color }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-14 h-14 rounded-2xl shadow-lg"
          style={{ backgroundColor: meditation.color }}
        >
          {playing ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
        </Button>
      </div>

      {/* Steps Guide */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Guided Steps</p>
        {meditation.steps.map((step, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === currentStep ? 1 : 0.4, scale: i === currentStep ? 1 : 0.98 }}
            className={`flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${i === currentStep ? 'bg-primary/5 border border-primary/10' : ''}`}
            onClick={() => setCurrentStep(i)}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-white"
              style={{ backgroundColor: i <= currentStep ? meditation.color : '#e2e8f0' }}>
              {i + 1}
            </span>
            <p className="text-sm text-foreground leading-relaxed">{step}</p>
          </motion.div>
        ))}
      </div>

      {currentStep < meditation.steps.length - 1 && (
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={nextStep}>
          <SkipForward className="w-3.5 h-3.5 mr-2" />Next Step
        </Button>
      )}
    </div>
  );
}