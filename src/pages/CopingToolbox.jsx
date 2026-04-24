import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Wind, Music, ShieldAlert, Star, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import MeditationPlayer from '../components/toolbox/MeditationPlayer';
import BreathingExercise from '../components/toolbox/BreathingExercise';
import CrisisPlanEditor from '../components/toolbox/CrisisPlanEditor';

const TABS = [
  { id: 'all', label: 'All Tools', icon: Layers },
  { id: 'meditation', label: 'Meditations', icon: Music },
  { id: 'breathing', label: 'Breathing', icon: Wind },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'crisis', label: 'Crisis Plan', icon: ShieldAlert },
];

export const MEDITATIONS = [
  {
    id: 'meditation-body-scan',
    type: 'meditation',
    title: 'Body Scan Relaxation',
    description: 'A gentle scan from head to toe, releasing tension with each breath.',
    duration: '10 min',
    tag: 'Anxiety Relief',
    color: '#a78bfa',
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    steps: [
      'Find a comfortable position, lying down or seated.',
      'Close your eyes and take three slow, deep breaths.',
      'Bring attention to the top of your head. Notice any sensations.',
      'Slowly move awareness down through your face, jaw, neck...',
      'Continue scanning through shoulders, arms, chest, belly...',
      'Move through your hips, thighs, knees, calves, and feet.',
      'Rest for a moment in total body awareness.',
    ],
  },
  {
    id: 'meditation-loving-kindness',
    type: 'meditation',
    title: 'Loving Kindness',
    description: 'Cultivate compassion for yourself and others through gentle affirmations.',
    duration: '8 min',
    tag: 'Self-Compassion',
    color: '#f472b6',
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    steps: [
      'Sit comfortably and close your eyes.',
      'Place one hand on your heart.',
      'Repeat silently: "May I be happy. May I be healthy. May I be at peace."',
      'Visualize someone you love — extend the same wishes to them.',
      'Expand outward to acquaintances, strangers, all beings.',
      'Return awareness to yourself. Rest in warmth.',
    ],
  },
  {
    id: 'meditation-5senses',
    type: 'meditation',
    title: '5 Senses Grounding',
    description: 'Anchor yourself in the present moment by noticing what is around you.',
    duration: '5 min',
    tag: 'Grounding',
    color: '#34d399',
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    steps: [
      'Pause and look around you.',
      'Name 5 things you can SEE.',
      'Notice 4 things you can TOUCH — feel their textures.',
      'Listen for 3 things you can HEAR.',
      'Identify 2 things you can SMELL.',
      'Notice 1 thing you can TASTE.',
      'Take a deep breath. You are here, you are safe.',
    ],
  },
  {
    id: 'meditation-sleep',
    type: 'meditation',
    title: 'Sleep Wind-Down',
    description: 'A calming practice to ease your nervous system before sleep.',
    duration: '12 min',
    tag: 'Sleep',
    color: '#60a5fa',
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    steps: [
      'Lie down in a comfortable position.',
      'Dim your environment and set aside screens.',
      'Take 4 slow breaths — inhale 4 counts, exhale 6 counts.',
      'Imagine a warm, golden light starting at your feet.',
      'Let the light slowly move up your body, softening everything it touches.',
      'Allow thoughts to drift by like clouds — no need to hold them.',
      'Let yourself sink gently into rest.',
    ],
  },
];

export const BREATHING_EXERCISES = [
  {
    id: 'breathing-box',
    type: 'breathing',
    title: 'Box Breathing',
    description: 'Used by Navy SEALs to stay calm under pressure. Inhale, hold, exhale, hold — 4 counts each.',
    tag: 'Stress Relief',
    color: '#60a5fa',
    phases: [
      { label: 'Inhale', duration: 4, color: '#60a5fa' },
      { label: 'Hold', duration: 4, color: '#818cf8' },
      { label: 'Exhale', duration: 4, color: '#34d399' },
      { label: 'Hold', duration: 4, color: '#818cf8' },
    ],
  },
  {
    id: 'breathing-478',
    type: 'breathing',
    title: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system. Inhale 4, hold 7, exhale 8.',
    tag: 'Anxiety Relief',
    color: '#a78bfa',
    phases: [
      { label: 'Inhale', duration: 4, color: '#a78bfa' },
      { label: 'Hold', duration: 7, color: '#818cf8' },
      { label: 'Exhale', duration: 8, color: '#34d399' },
    ],
  },
  {
    id: 'breathing-diaphragmatic',
    type: 'breathing',
    title: 'Diaphragmatic Breathing',
    description: 'Belly breathing to activate the parasympathetic nervous system.',
    tag: 'Deep Calm',
    color: '#2dd4bf',
    phases: [
      { label: 'Inhale', duration: 5, color: '#2dd4bf' },
      { label: 'Exhale', duration: 7, color: '#34d399' },
    ],
  },
];

export default function CopingToolbox() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [activeMed, setActiveMed] = useState(null);
  const [activeBreath, setActiveBreath] = useState(null);
  const qc = useQueryClient();

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorite-tools', currentUser?.email],
    queryFn: () => base44.entities.FavoriteTool.filter({ user_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const favIds = new Set(favorites.map(f => f.tool_id));

  async function toggleFavorite(tool) {
    if (!currentUser) return;
    const existing = favorites.find(f => f.tool_id === tool.id);
    if (existing) {
      await base44.entities.FavoriteTool.delete(existing.id);
    } else {
      await base44.entities.FavoriteTool.create({ user_email: currentUser.email, tool_id: tool.id, tool_type: tool.type });
    }
    qc.invalidateQueries({ queryKey: ['favorite-tools', currentUser.email] });
  }

  const allTools = [...MEDITATIONS, ...BREATHING_EXERCISES];
  const visibleMeds = activeTab === 'favorites'
    ? MEDITATIONS.filter(m => favIds.has(m.id))
    : activeTab === 'breathing' ? [] : MEDITATIONS;
  const visibleBreaths = activeTab === 'favorites'
    ? BREATHING_EXERCISES.filter(b => favIds.has(b.id))
    : activeTab === 'meditation' ? [] : BREATHING_EXERCISES;

  return (
    <div className="min-h-screen">
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Wellness</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-4">Coping Toolbox</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Interactive tools for moments when you need them most — guided meditations, breathing exercises, and your personal crisis plan, always at hand.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {TABS.map(({ id, label, icon: TabIcon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Crisis Plan Tab */}
          {activeTab === 'crisis' ? (
            <CrisisPlanSection currentUser={currentUser} />
          ) : (
            <div className="space-y-12">
              {/* Meditations */}
              {visibleMeds.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Music className="w-4 h-4 text-primary" />
                    <h2 className="font-heading text-2xl">Guided Meditations</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleMeds.map((med, i) => (
                      <ToolCard
                        key={med.id}
                        tool={med}
                        index={i}
                        isFavorite={favIds.has(med.id)}
                        onFavorite={() => toggleFavorite(med)}
                        onOpen={() => { setActiveMed(med); setActiveBreath(null); }}
                        isActive={activeMed?.id === med.id}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                  {activeMed && visibleMeds.find(m => m.id === activeMed.id) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                      <MeditationPlayer meditation={activeMed} onClose={() => setActiveMed(null)} />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Breathing */}
              {visibleBreaths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Wind className="w-4 h-4 text-accent" />
                    <h2 className="font-heading text-2xl">Breathing Exercises</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visibleBreaths.map((b, i) => (
                      <ToolCard
                        key={b.id}
                        tool={b}
                        index={i}
                        isFavorite={favIds.has(b.id)}
                        onFavorite={() => toggleFavorite(b)}
                        onOpen={() => { setActiveBreath(b); setActiveMed(null); }}
                        isActive={activeBreath?.id === b.id}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                  {activeBreath && visibleBreaths.find(b => b.id === activeBreath.id) && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                      <BreathingExercise exercise={activeBreath} onClose={() => setActiveBreath(null)} />
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && visibleMeds.length === 0 && visibleBreaths.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No favorites yet. Tap the star on any tool to save it here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ToolCard({ tool, index, isFavorite, onFavorite, onOpen, isActive, currentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
        isActive ? 'border-primary/40 shadow-lg shadow-primary/10 bg-card' : 'border-border/60 bg-card hover:border-primary/20 hover:shadow-md'
      }`}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
          style={{ backgroundColor: tool.color }}>
          {tool.type === 'meditation' ? '🎵' : '🌬️'}
        </div>
        <div className="flex items-center gap-1.5">
          {tool.duration && <span className="text-xs text-muted-foreground">{tool.duration}</span>}
          {currentUser && (
            <button
              onClick={e => { e.stopPropagation(); onFavorite(); }}
              className={`p-1.5 rounded-lg transition-colors ${isFavorite ? 'text-amber-400' : 'text-muted-foreground hover:text-amber-400'}`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
        style={{ backgroundColor: tool.color + '20', color: tool.color }}>
        {tool.tag}
      </span>
      <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
    </motion.div>
  );
}

function CrisisPlanSection({ currentUser }) {
  const qc = useQueryClient();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['crisis-plan', currentUser?.email],
    queryFn: () => base44.entities.CrisisPlan.filter({ user_email: currentUser.email }),
    enabled: !!currentUser,
  });
  const plan = plans[0];

  if (!currentUser) return (
    <div className="text-center py-20 text-muted-foreground text-sm">Sign in to access your Crisis Plan.</div>
  );

  return <CrisisPlanEditor plan={plan} currentUser={currentUser} onSave={() => qc.invalidateQueries({ queryKey: ['crisis-plan', currentUser.email] })} />;
}