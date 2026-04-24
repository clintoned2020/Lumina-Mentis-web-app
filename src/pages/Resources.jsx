import React, { useState } from 'react';
import { ExternalLink, BookOpen, Wind, LifeBuoy, Search, ArrowUpRight, Clock, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Static data ────────────────────────────────────────────────
const ARTICLES = [
  {
    id: 1,
    title: "Understanding Anxiety: What's Actually Happening in Your Brain",
    summary: "A deep dive into the neuroscience of anxiety, what triggers it, and evidence-based ways to calm the nervous system.",
    tags: ["anxiety", "neuroscience"],
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
  },
  {
    id: 2,
    title: "The Science of Sleep and Mental Health",
    summary: "How sleep deprivation impacts mood, cognition, and emotional regulation — and practical tips to sleep better.",
    tags: ["sleep", "wellness"],
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
    url: "https://www.sleepfoundation.org/mental-health",
  },
  {
    id: 3,
    title: "Mindfulness for Beginners: A Practical Guide",
    summary: "You don't need to meditate for hours. This guide explains how even 5 minutes a day can rewire stress responses.",
    tags: ["mindfulness", "stress"],
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80",
    url: "https://www.mindful.org/meditation/mindfulness-getting-started/",
  },
  {
    id: 4,
    title: "Depression vs. Sadness: Knowing the Difference",
    summary: "Sadness is a normal emotion. Depression is a clinical condition. Learn the key distinctions and when to seek help.",
    tags: ["depression", "education"],
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80",
    url: "https://www.nami.org/About-Mental-Illness/Mental-Health-Conditions/Depression",
  },
  {
    id: 5,
    title: "How Exercise Changes Your Brain Chemistry",
    summary: "Exercise is one of the most powerful tools for improving mental health. Here's the neuroscience behind why it works.",
    tags: ["exercise", "wellness"],
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
    url: "https://www.health.harvard.edu/mind-and-mood/exercise-is-an-all-natural-treatment-to-fight-depression",
  },
  {
    id: 6,
    title: "Trauma-Informed Self-Care: A Gentle Guide",
    summary: "For those navigating trauma, traditional self-care advice can feel hollow. This guide offers compassionate, practical alternatives.",
    tags: ["trauma", "self-care"],
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80",
    url: "https://www.psychologytoday.com/us/basics/trauma",
  },
];

const EXERCISES = [
  {
    id: "box",
    name: "Box Breathing",
    tagline: "Used by Navy SEALs to stay calm under pressure",
    steps: ["Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold for 4 counts"],
    duration: "4 min",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: "🟦",
    best_for: "Stress & focus",
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    tagline: "Dr. Weil's relaxation technique for anxiety",
    steps: ["Inhale for 4 counts", "Hold for 7 counts", "Exhale for 8 counts", "Repeat 3–4 cycles"],
    duration: "3 min",
    color: "bg-violet-500/10 text-violet-600 border-violet-200",
    icon: "🟣",
    best_for: "Anxiety & sleep",
  },
  {
    id: "diaphragmatic",
    name: "Diaphragmatic Breathing",
    tagline: "Belly breathing to activate the parasympathetic system",
    steps: ["Place one hand on chest, one on belly", "Breathe in through nose, belly rises", "Breathe out through pursed lips", "Repeat 5–10 times slowly"],
    duration: "5 min",
    color: "bg-green-500/10 text-green-600 border-green-200",
    icon: "🟢",
    best_for: "Relaxation",
  },
  {
    id: "alternate",
    name: "Alternate Nostril Breathing",
    tagline: "Ancient yogic technique for balance and calm",
    steps: ["Close right nostril, inhale left", "Close both, hold briefly", "Close left nostril, exhale right", "Inhale right, then switch sides"],
    duration: "5 min",
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    icon: "🟠",
    best_for: "Balance & clarity",
  },
];

const SUPPORT_LINKS = [
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "Free, confidential support for people in distress. Call or text 988 anytime.",
    url: "https://988lifeline.org",
    badge: "Crisis",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    name: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a trained crisis counselor 24/7.",
    url: "https://www.crisistextline.org",
    badge: "Crisis",
    badgeColor: "bg-red-100 text-red-700",
  },
  {
    name: "NAMI — National Alliance on Mental Illness",
    description: "The largest mental health grassroots organization in the US. Resources, helpline, and community.",
    url: "https://www.nami.org",
    badge: "Education",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Psychology Today Therapist Finder",
    description: "Find a licensed therapist or counselor near you by location, specialty, and insurance.",
    url: "https://www.psychologytoday.com/us/therapists",
    badge: "Find Help",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    name: "MentalHealth.gov",
    description: "Official U.S. government source for information on mental health conditions and treatment.",
    url: "https://www.mentalhealth.gov",
    badge: "Education",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Open Path Collective",
    description: "Affordable therapy sessions ($30–$80) for those who can't afford standard rates.",
    url: "https://openpathcollective.org",
    badge: "Affordable Care",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    name: "Headspace",
    description: "Guided meditations and mindfulness tools for stress, sleep, and focus.",
    url: "https://www.headspace.com",
    badge: "Mindfulness",
    badgeColor: "bg-orange-100 text-orange-700",
  },
  {
    name: "SAMHSA National Helpline",
    description: "Free, confidential, 24/7 treatment referral and information: 1-800-662-4357.",
    url: "https://www.samhsa.gov/find-help/national-helpline",
    badge: "Crisis",
    badgeColor: "bg-red-100 text-red-700",
  },
];

const ALL_TAGS = ["all", "anxiety", "depression", "mindfulness", "sleep", "wellness", "stress", "trauma", "self-care", "neuroscience", "exercise", "education"];

const TABS = [
  { id: "articles", label: "Articles", icon: BookOpen },
  { id: "breathing", label: "Breathing", icon: Wind },
  { id: "support", label: "Support Links", icon: LifeBuoy },
];

// ─── Sub-components ─────────────────────────────────────────────
function ArticleCard({ article }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {article.tags.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">{t}</span>
          ))}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-lg leading-snug mb-2 group-hover:text-primary transition-colors">{article.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1">{article.summary}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime} read</span>
          <span className="text-xs text-primary font-medium flex items-center gap-1">Read article <ArrowUpRight className="w-3 h-3" /></span>
        </div>
      </div>
    </a>
  );
}

function ExerciseCard({ ex }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border p-6 transition-all ${ex.color}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl mb-2 block">{ex.icon}</span>
          <h3 className="font-heading text-xl">{ex.name}</h3>
          <p className="text-sm opacity-80 mt-0.5">{ex.tagline}</p>
        </div>
        <div className="text-right text-xs opacity-70 flex flex-col items-end gap-1">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ex.duration}</span>
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {ex.best_for}</span>
        </div>
      </div>

      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-3 text-sm font-medium underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
      >
        {expanded ? "Hide steps" : "Show steps"}
      </button>

      {expanded && (
        <ol className="mt-3 space-y-2">
          {ex.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center flex-shrink-0 text-xs font-bold opacity-70">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function SupportCard({ link }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 p-5 bg-card border border-border/50 rounded-2xl hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <ExternalLink className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{link.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${link.badgeColor}`}>{link.badge}</span>
        </div>
        <p className="text-sm text-muted-foreground">{link.description}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
    </a>
  );
}

// ─── Main page ──────────────────────────────────────────────────
export default function Resources() {
  const [activeTab, setActiveTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");

  const filteredArticles = ARTICLES.filter(a => {
    const matchesTag = activeTag === "all" || a.tags.includes(activeTag);
    const matchesSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const filteredSupport = SUPPORT_LINKS.filter(l =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredExercises = EXERCISES.filter(e =>
    !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1600&auto=format&fit=crop&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/65 to-background" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-16 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="w-4 h-4" /> Mental Health Resources
          </div>
          <h1 className="font-heading text-5xl lg:text-6xl tracking-tight mb-4">Your Wellness Library</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Curated articles, breathing exercises, and trusted support links — all in one place.
          </p>
        </div>
      </section>

      {/* Sticky tabs + search */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 lg:px-16 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-16 pt-8">

        {/* Articles */}
        {activeTab === "articles" && (
          <div>
            {/* Tag filters */}
            <div className="flex gap-2 flex-wrap mb-6">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all border ${
                    activeTag === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {filteredArticles.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No articles match your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArticles.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </div>
        )}

        {/* Breathing */}
        {activeTab === "breathing" && (
          <div>
            <p className="text-muted-foreground mb-6 text-sm">
              Breathing exercises are one of the fastest ways to regulate your nervous system. Try one when you feel stressed, anxious, or overwhelmed.
            </p>
            {filteredExercises.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No exercises match your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredExercises.map(e => <ExerciseCard key={e.id} ex={e} />)}
              </div>
            )}
          </div>
        )}

        {/* Support links */}
        {activeTab === "support" && (
          <div>
            <div className="mb-6 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 text-sm text-destructive/80">
              <strong>If you are in immediate danger</strong>, please call <strong>911</strong> or go to your nearest emergency room. For crisis support, text or call <strong>988</strong>.
            </div>
            {filteredSupport.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No links match your search.</p>
            ) : (
              <div className="space-y-3">
                {filteredSupport.map(l => <SupportCard key={l.name} link={l} />)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}