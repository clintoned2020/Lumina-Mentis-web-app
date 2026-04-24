import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const conditions = [
  { label: 'Schizophrenia', slug: 'schizophrenia' },
  { label: 'Schizoaffective', slug: 'schizoaffective-disorder' },
  { label: 'Depression', slug: 'major-depression' },
  { label: 'Anxiety', slug: 'generalized-anxiety' },
  { label: 'Panic Disorder', slug: 'panic-disorder' },
  { label: 'ADHD', slug: 'adhd' },
  { label: 'Social Anxiety', slug: 'social-anxiety' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="https://media.base44.com/images/public/69df919d9f811306e51022a9/ef8cf5665_generated_9c7e129b.png"
          alt="Abstract luminous neural network art"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 lg:px-16 text-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-6">
            A Sanctuary of Understanding
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none tracking-tight mb-8">
            Illuminate<br />
            <span className="italic text-primary/80">Your Mind</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
            Understanding why you feel the way you do is the first step toward clarity. 
            Explore the root causes, neurochemistry, and pathways of mental health — all in one place.
          </p>
          <p className="text-sm lg:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed mb-12 italic">
            A digital sanctuary providing clear, empathetic, and evidence-based insights into mental health conditions, root causes, and paths to stability.
          </p>
        </motion.div>

        {/* Topic Orbit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {conditions.map((condition, i) => (
            <motion.div
              key={condition.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
            >
              <Link
                to={`/disorders/${condition.slug}`}
                className="inline-block px-5 py-2.5 rounded-full border border-border/80 bg-card/60 backdrop-blur-sm text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                {condition.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs tracking-wider uppercase">Discover the Strata of Understanding</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}