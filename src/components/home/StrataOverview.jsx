import React from 'react';
import { GitBranch, Activity, Pill, BookOpen } from 'lucide-react';
import StrataCard from '../shared/StrataCard';

const strata = [
  {
    title: 'Root Causes',
    description: 'Explore the biological, environmental, and psychological factors that contribute to mental illness. Understand the "why" behind your experience.',
    icon: GitBranch,
    href: '/root-causes',
  },
  {
    title: 'Symptom Spectrum',
    description: 'See how symptoms manifest across different disorders. Understand why you experience specific symptoms and how they connect to your neurochemistry.',
    icon: Activity,
    href: '/symptom-spectrum',
  },
  {
    title: 'Remedies & Medication',
    description: 'Learn about treatment options, how medications work at the molecular level, and evidence-based lifestyle changes — always with your provider.',
    icon: Pill,
    href: '/remedies',
  },
  {
    title: 'Disorder Library',
    description: 'Comprehensive deep-dives into each condition. From schizophrenia to ADHD, nothing is left unspoken — the full picture of every disorder.',
    icon: BookOpen,
    href: '/disorders',
  },
];

export default function StrataOverview() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">
            Strata of Understanding
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl tracking-tight">
            Knowledge, Layered with Care
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strata.map((item, i) => (
            <StrataCard key={item.href} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}