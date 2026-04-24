import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Leaf, RefreshCw, ChevronRight, Brain, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  disorder: { icon: Brain, color: 'text-primary', bg: 'bg-primary/10', label: 'Condition' },
  remedy: { icon: Leaf, color: 'text-green-600', bg: 'bg-green-500/10', label: 'Remedy' },
  article: { icon: BookOpen, color: 'text-accent', bg: 'bg-accent/10', label: 'Topic' },
};

function RecommendationCard({ rec, index }) {
  const config = TYPE_CONFIG[rec.type] || TYPE_CONFIG.article;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card border border-border/60 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">{rec.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{rec.reason}</p>
        </div>
      </div>
      {rec.link && (
        <div className="mt-3 pl-12">
          <Link
            to={rec.link}
            className={`inline-flex items-center gap-1 text-xs font-medium ${config.color} hover:underline`}
          >
            Explore <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function AIRecommendations() {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [moodSummary, setMoodSummary] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch data in parallel
      const [journals, goals] = await Promise.all([
        base44.entities.JournalEntry.filter({ user_email: user.email }, '-date', 14),
        base44.entities.WellnessGoal.filter({ user_email: user.email }),
      ]);

      // Build context summary for the LLM
      const recentMoods = journals.map(j => ({
        date: j.date,
        mood: j.mood_label || j.mood,
        tags: j.tags || [],
        reflection: j.reflection ? j.reflection.slice(0, 120) : '',
      }));

      const activeGoals = goals.filter(g => g.is_active).map(g => ({
        title: g.title,
        category: g.category,
        streak: g.streak || 0,
      }));

      const avgMood = journals.length
        ? (journals.reduce((s, j) => s + (j.mood || 3), 0) / journals.length).toFixed(1)
        : null;

      const allTags = journals.flatMap(j => j.tags || []);
      const tagFreq = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
      const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

      const contextPrompt = `
You are a compassionate mental health recommendation engine for a wellness app called Lumina Mentis.

User context:
- Recent journal entries (last 14 days): ${JSON.stringify(recentMoods)}
- Average mood score (1-5): ${avgMood ?? 'No entries yet'}
- Frequent journal tags: ${topTags.join(', ') || 'none'}
- Active wellness habits: ${JSON.stringify(activeGoals)}

Based on this data, suggest 4 highly relevant, personalized resources.
Each suggestion must be one of these types:
- "disorder": a mental health condition worth learning about (link to /disorders/<slug>)
- "remedy": a non-medication remedy or lifestyle approach (link to /remedies)
- "article": a topic or concept (link to /disorders or /root-causes or /symptom-spectrum or /remedies)

Available disorder slugs: major-depression, generalized-anxiety, schizophrenia, adhd, panic-disorder, social-anxiety, bipolar-disorder, ptsd, ocd, schizoaffective-disorder.

Return ONLY valid JSON (no markdown, no explanation) matching this schema:
{
  "mood_summary": "One warm, empathetic sentence summarizing the user's recent emotional state",
  "recommendations": [
    {
      "type": "disorder" | "remedy" | "article",
      "title": "Short resource title",
      "reason": "1-2 sentence personal explanation of why this is relevant to this user",
      "link": "/path"
    }
  ]
}
      `.trim();

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            mood_summary: { type: 'string' },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  reason: { type: 'string' },
                  link: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setMoodSummary(result.mood_summary || '');
      setRecommendations(result.recommendations || []);
      setLoaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRecommendations();
  }, [user]);

  if (!user) return null;

  return (
    <section className="py-16 lg:py-20 border-t border-border/40">
      <div className="max-w-4xl mx-auto px-6 lg:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl lg:text-3xl tracking-tight">For You</h2>
              <p className="text-xs text-muted-foreground">Personalised from your journal & habits</p>
            </div>
          </div>
          {loaded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRecommendations}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading && !loaded && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted/30 rounded-2xl animate-pulse" />
            ))}
            <p className="text-center text-xs text-muted-foreground pt-2 flex items-center justify-center gap-2">
              <HeartPulse className="w-3.5 h-3.5 animate-pulse text-primary" />
              Analysing your journal & habits…
            </p>
          </div>
        )}

        {/* Mood summary */}
        <AnimatePresence>
          {loaded && moodSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl bg-muted/40 border border-border/50 text-sm text-muted-foreground italic leading-relaxed"
            >
              {moodSummary}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations grid */}
        {loaded && recommendations.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        )}

        {/* Empty state — no journal data */}
        {loaded && recommendations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Start journaling to unlock personalised recommendations.</p>
            <Link to="/journal" className="text-primary hover:underline text-xs mt-2 inline-block">
              Write your first entry →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}