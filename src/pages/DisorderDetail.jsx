import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dna, Cloud, Brain, Heart, Pill, Activity, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ExpandableSection from '../components/shared/ExpandableSection';
import ConsultBanner from '../components/shared/ConsultBanner';
import BookmarkButton from '../components/shared/BookmarkButton';
import SubPageHeader from '../components/layout/SubPageHeader';

export default function DisorderDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = window.location.pathname.split('/disorders/')[1];

  const { data: disorders = [], isLoading } = useQuery({
    queryKey: ['disorder', slug],
    queryFn: () => base44.entities.Disorder.filter({ slug }),
  });

  const disorder = disorders[0];

  useEffect(() => {
    if (disorder?.name) {
      import('@/lib/analytics-tracker').then(({ trackDisorderView }) => {
        trackDisorderView(disorder.name);
      });
    }
  }, [disorder?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (!disorder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-3xl mb-4">Condition Not Found</h2>
          <Link to="/disorders" className="text-primary hover:underline">
            ← Back to Disorder Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SubPageHeader title={disorder?.name} backPath="/disorders" />
      {/* Header */}
      <section className="py-10 lg:py-28 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-16">
          <Link
            to="/disorders"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Disorder Library
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-4 text-xs">
              {disorder.category?.replace(/_/g, ' ')}
            </Badge>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="font-heading text-4xl lg:text-6xl tracking-tight">
                {disorder.name}
              </h1>
              <BookmarkButton
                resourceType="disorder"
                resourceId={disorder.id}
                resourceName={disorder.name}
                resourceSlug={disorder.slug}
                className="mt-2 flex-shrink-0"
              />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {disorder.short_description}
            </p>
            {disorder.prevalence && (
              <p className="mt-4 text-sm text-muted-foreground/70">
                Prevalence: {disorder.prevalence}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 space-y-6">
          {/* Overview */}
          {disorder.overview && (
            <ExpandableSection title="Overview" icon={BookIcon} defaultOpen={true}>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {disorder.overview}
              </p>
            </ExpandableSection>
          )}

          {/* Who Is Affected */}
          {disorder.who_is_affected && (
            <ExpandableSection title="Who Is Affected & Why" icon={Users}>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {disorder.who_is_affected}
              </p>
            </ExpandableSection>
          )}

          {/* Neurochemistry */}
          {disorder.neurochemistry && (
            <ExpandableSection title="Neurochemistry & Brain Science" icon={Brain}>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {disorder.neurochemistry}
              </p>
            </ExpandableSection>
          )}

          {/* Biological Causes */}
          {disorder.biological_causes?.length > 0 && (
            <ExpandableSection title="Biological & Genetic Causes" icon={Dna}>
              <ul className="space-y-3">
                {disorder.biological_causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <p className="text-base text-muted-foreground leading-relaxed">{cause}</p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Environmental Causes */}
          {disorder.environmental_causes?.length > 0 && (
            <ExpandableSection title="Environmental Triggers" icon={Cloud}>
              <ul className="space-y-3">
                {disorder.environmental_causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0" />
                    <p className="text-base text-muted-foreground leading-relaxed">{cause}</p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Psychological Causes */}
          {disorder.psychological_causes?.length > 0 && (
            <ExpandableSection title="Psychological Contributing Factors" icon={Heart}>
              <ul className="space-y-3">
                {disorder.psychological_causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2.5 flex-shrink-0" />
                    <p className="text-base text-muted-foreground leading-relaxed">{cause}</p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Lifestyle Causes */}
          {disorder.lifestyle_causes?.length > 0 && (
            <ExpandableSection title="Lifestyle & Circumstantial Factors" icon={Activity}>
              <ul className="space-y-3">
                {disorder.lifestyle_causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/60 mt-2.5 flex-shrink-0" />
                    <p className="text-base text-muted-foreground leading-relaxed">{cause}</p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Symptoms */}
          {disorder.symptoms?.length > 0 && (
            <ExpandableSection title="Symptoms & Why They Occur" icon={Activity}>
              <div className="space-y-6">
                {disorder.symptoms.map((symptom, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{symptom.name}</h4>
                      {symptom.severity && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {symptom.severity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {symptom.description}
                    </p>
                    {symptom.why_it_occurs && (
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <p className="text-xs font-medium text-primary mb-1">Why This Occurs:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {symptom.why_it_occurs}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Medications */}
          {disorder.medications?.length > 0 && (
            <ExpandableSection title="Medications & How They Work" icon={Pill}>
              <div className="space-y-4">
                {disorder.medications.map((med, i) => (
                  <div key={i} className="p-5 rounded-xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{med.name}</h4>
                      {med.type && (
                        <Badge variant="outline" className="text-xs">{med.type}</Badge>
                      )}
                    </div>
                    {med.mechanism && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        <span className="font-medium text-foreground">Mechanism:</span> {med.mechanism}
                      </p>
                    )}
                    {med.best_for && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        <span className="font-medium text-foreground">Best For:</span> {med.best_for}
                      </p>
                    )}
                    {med.common_side_effects?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {med.common_side_effects.map((effect, j) => (
                          <Badge key={j} variant="secondary" className="text-xs font-normal">
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ExpandableSection>
          )}

          {/* Lifestyle Remedies */}
          {disorder.lifestyle_remedies?.length > 0 && (
            <ExpandableSection title="Lifestyle & Non-Medication Approaches" icon={TrendingUp}>
              <ul className="space-y-3">
                {disorder.lifestyle_remedies.map((remedy, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 flex-shrink-0" />
                    <p className="text-base text-muted-foreground leading-relaxed">{remedy}</p>
                  </li>
                ))}
              </ul>
            </ExpandableSection>
          )}

          {/* Prognosis */}
          {disorder.prognosis && (
            <ExpandableSection title="Prognosis & Recovery" icon={TrendingUp}>
              <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {disorder.prognosis}
              </p>
            </ExpandableSection>
          )}

          {/* Consult Banner */}
          <div className="pt-8">
            <ConsultBanner />
          </div>

          {/* Related */}
          {disorder.related_disorders?.length > 0 && (
            <div className="pt-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Related Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {disorder.related_disorders.map((name, i) => (
                  <Link
                    key={i}
                    to="/disorders"
                    className="px-4 py-2 rounded-full border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                  >
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BookIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}