import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_KEY = 'lumina_tour_seen';

const steps = [
  {
    title: 'Welcome to Lumina Mentis 🧠',
    description: 'Your personal mental health awareness platform. Let\'s take a quick tour of what you can do here.',
    color: 'from-primary/20 to-primary/5',
    accent: 'text-primary',
  },
  {
    title: 'Disorder Library',
    description: 'Explore in-depth guides on mental health conditions — their causes, symptoms, neurochemistry, medications, and prognosis.',
    color: 'from-blue-500/20 to-blue-500/5',
    accent: 'text-blue-500',
    path: '/disorders',
  },
  {
    title: 'Community Forum',
    description: 'Connect with others who understand. Post threads, share experiences, and find support in a compassionate community.',
    color: 'from-violet-500/20 to-violet-500/5',
    accent: 'text-violet-500',
    path: '/forum',
  },
  {
    title: 'Support Groups',
    description: 'Join or create small peer support groups focused on specific topics like anxiety, depression, grief, and more.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    accent: 'text-emerald-500',
    path: '/groups',
  },
  {
    title: 'Wellness Goals',
    description: 'Set daily habits for medication, mindfulness, journaling, and exercise. Track your streaks and build consistency.',
    color: 'from-orange-400/20 to-orange-400/5',
    accent: 'text-orange-400',
    path: '/wellness',
  },
  {
    title: 'Personal Journal',
    description: 'A private space to log your mood, energy, gratitude, and daily reflections. Only you can see your entries.',
    color: 'from-pink-500/20 to-pink-500/5',
    accent: 'text-pink-500',
    path: '/journal',
  },
  {
    title: 'Coping Toolbox',
    description: 'Access guided meditations, breathing exercises, grounding techniques, and your personal crisis safety plan.',
    color: 'from-teal-500/20 to-teal-500/5',
    accent: 'text-teal-500',
    path: '/toolbox',
  },
  {
    title: 'Wellness Circles 🤝',
    description: 'Join communities with others on similar wellness journeys. Share progress, celebrate milestones, and support each other.',
    color: 'from-rose-500/20 to-rose-500/5',
    accent: 'text-rose-500',
    path: '/wellness-circles',
  },
  {
    title: 'Leaderboards & Achievements 🏆',
    description: 'Earn points for completing goals, unlock achievement badges, and compete on leaderboards. Level up your wellness journey.',
    color: 'from-yellow-500/20 to-yellow-500/5',
    accent: 'text-yellow-500',
    path: '/leaderboards',
  },
  {
    title: 'You\'re all set! ✨',
    description: 'Lumina Mentis is here for you whenever you need it. Remember: small steps every day make a big difference.',
    color: 'from-primary/20 to-accent/10',
    accent: 'text-primary',
  },
];

export default function WelcomeTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      // Small delay so the page loads first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setVisible(false);
    setStep(0);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else handleClose();
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleReplay = () => {
    setStep(0);
    setVisible(true);
  };

  const current = steps[step];

  return (
    <>
      {/* Replay button — only shown after tour was seen */}
      {!visible && localStorage.getItem(TOUR_KEY) && (
        <button
          onClick={handleReplay}
          title="Replay Welcome Tour"
          className="fixed bottom-20 lg:bottom-6 right-4 z-40 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </button>
      )}

      <AnimatePresence>
        {visible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-[101] px-4"
              onClick={e => e.stopPropagation()}
            >
              <div className={`w-full max-w-md rounded-3xl bg-gradient-to-br ${current.color} border border-border/60 bg-card shadow-2xl p-8 relative`}>
                {/* Close */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {/* Step indicator */}
                <div className="flex gap-1.5 mb-6">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-border'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <h2 className={`font-heading text-2xl mb-3 ${current.accent}`}>{current.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm mb-8">{current.description}</p>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={step === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <span className="text-xs text-muted-foreground">{step + 1} / {steps.length}</span>
                  <Button size="sm" onClick={handleNext} className="gap-1">
                    {step === steps.length - 1 ? 'Get Started' : 'Next'}
                    {step < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}