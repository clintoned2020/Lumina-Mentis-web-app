import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import BookmarkButton from './BookmarkButton';

const categoryLabels = {
  psychotic: 'Psychotic Spectrum',
  mood: 'Mood Disorder',
  anxiety: 'Anxiety Spectrum',
  neurodevelopmental: 'Neurodevelopmental',
  other: 'Other',
};

const categoryStyles = {
  psychotic: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  mood: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  anxiety: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  neurodevelopmental: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  other: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

function canonicalCategory(cat) {
  if (cat == null) return 'other';
  const raw = String(cat).trim().toLowerCase();
  if (!raw) return 'other';
  const v = raw.replace(/[\s-]+/g, '_');
  const direct = new Set(['psychotic', 'mood', 'anxiety', 'neurodevelopmental', 'other']);
  if (direct.has(v)) return v;
  if (v.includes('psychotic') || v.includes('schizo')) return 'psychotic';
  if (v.includes('mood')) return 'mood';
  if (v.includes('anxiety') || v.includes('panic') || v.includes('ocd')) return 'anxiety';
  if (v.includes('neurodevelopmental') || v.includes('adhd') || v.includes('autism') || v.includes('developmental')) return 'neurodevelopmental';
  return 'other';
}

export default function DisorderCard({ disorder, index = 0 }) {
  const slug = disorder.slug || '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative rounded-2xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 h-full"
    >
      <Link
        to={slug ? `/disorders/${encodeURIComponent(slug)}` : '/disorders'}
        className="relative block p-6 lg:p-8 h-full pr-14 lg:pr-14"
        aria-label={`Open disorder: ${disorder.name}`}
      >
        <ArrowUpRight className="absolute top-8 right-[3rem] lg:top-10 lg:right-[3rem] w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 flex-shrink-0 pointer-events-none" />
        <div className="flex items-start mb-4 max-w-[85%]">
          <Badge variant="outline" className={`text-xs font-medium ${categoryStyles[canonicalCategory(disorder.category)] || categoryStyles.other}`}>
            {categoryLabels[canonicalCategory(disorder.category)] || 'Other'}
          </Badge>
        </div>
        <h3 className="font-heading text-2xl mb-3">{disorder.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {disorder.short_description}
        </p>
        {disorder.prevalence && (
          <p className="mt-4 text-xs text-muted-foreground/70">
            Prevalence: {disorder.prevalence}
          </p>
        )}
      </Link>
      {/* Keep bookmark outside <a> — nested buttons break navigation / accessibility in some browsers */}
      <div className="absolute top-6 right-5 lg:top-8 lg:right-6 z-10">
        <BookmarkButton
          resourceType="disorder"
          resourceId={disorder.id}
          resourceName={disorder.name}
          resourceSlug={disorder.slug}
        />
      </div>
    </motion.div>
  );
}