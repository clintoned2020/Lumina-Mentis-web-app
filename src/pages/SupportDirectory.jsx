import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Video, UserCheck, Filter, Star, Phone, Globe, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ConsultBanner from '@/components/shared/ConsultBanner';
import ConsultationRequestModal from '@/components/directory/ConsultationRequestModal';

const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'psychiatrist', label: 'Psychiatrist' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'counselor', label: 'Counselor' },
  { value: 'social_worker', label: 'Social Worker' },
  { value: 'clinic', label: 'Clinic' },
];

const SPECIALTIES = [
  'Anxiety', 'Depression', 'Trauma / PTSD', 'ADHD', 'OCD', 'Bipolar',
  'Schizophrenia', 'Grief', 'Addiction', 'Relationships', 'Child & Adolescent',
  'LGBTQ+', 'Eating Disorders', 'Sleep Issues',
];

const TYPE_COLORS = {
  therapist: 'bg-blue-500/10 text-blue-600',
  psychiatrist: 'bg-purple-500/10 text-purple-600',
  psychologist: 'bg-indigo-500/10 text-indigo-600',
  counselor: 'bg-emerald-500/10 text-emerald-600',
  social_worker: 'bg-teal-500/10 text-teal-600',
  clinic: 'bg-amber-500/10 text-amber-600',
};

export default function SupportDirectory() {
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [requestTarget, setRequestTarget] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals'],
    queryFn: () => base44.entities.Professional.list('-created_date', 100),
  });

  const filtered = useMemo(() => {
    return professionals.filter(p => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase()) || p.bio?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchSpecialty = !specialtyFilter || p.specialties?.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
      const matchTelehealth = !telehealthOnly || p.telehealth;
      const matchAccepting = !acceptingOnly || p.accepting_new;
      return matchSearch && matchType && matchSpecialty && matchTelehealth && matchAccepting;
    });
  }, [professionals, search, typeFilter, specialtyFilter, telehealthOnly, acceptingOnly]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Find Help</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-6xl tracking-tight mb-4">Support Directory</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Discover mental health professionals and clinics. Filter by specialty, request a consultation, and take the first step toward support.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 lg:py-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-16 space-y-8">

          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Search by name, location, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(v => !v)}
              className="rounded-xl gap-2"
            >
              <Filter className="w-4 h-4" />Filters
              {(typeFilter !== 'all' || specialtyFilter || telehealthOnly || acceptingOnly) && (
                <span className="ml-1 w-2 h-2 rounded-full bg-primary-foreground/70 inline-block" />
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 rounded-2xl border border-border bg-card space-y-5">
                  {/* Type */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Professional Type</p>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map(t => (
                        <button
                          key={t.value}
                          onClick={() => setTypeFilter(t.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Specialty */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specialty</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTIES.map(s => (
                        <button
                          key={s}
                          onClick={() => setSpecialtyFilter(specialtyFilter === s ? '' : s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${specialtyFilter === s ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Toggles */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={telehealthOnly} onChange={e => setTelehealthOnly(e.target.checked)} className="rounded" />
                      <span className="text-sm">Telehealth only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={acceptingOnly} onChange={e => setAcceptingOnly(e.target.checked)} className="rounded" />
                      <span className="text-sm">Accepting new patients</span>
                    </label>
                  </div>
                  {/* Clear */}
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setTypeFilter('all'); setSpecialtyFilter(''); setTelehealthOnly(false); setAcceptingOnly(false); }}>
                    Clear all filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${filtered.length} professional${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => <div key={i} className="h-56 rounded-2xl bg-muted/30 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <UserCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No professionals match your filters.</p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setSearch(''); setTypeFilter('all'); setSpecialtyFilter(''); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((pro, i) => (
                <ProfessionalCard key={pro.id} pro={pro} index={i} onRequest={() => setRequestTarget(pro)} />
              ))}
            </div>
          )}

          <ConsultBanner />
        </div>
      </section>

      {/* Consultation Request Modal */}
      <AnimatePresence>
        {requestTarget && (
          <ConsultationRequestModal
            professional={requestTarget}
            currentUser={currentUser}
            onClose={() => setRequestTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfessionalCard({ pro, index, onRequest }) {
  const initials = pro.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-6 rounded-2xl border border-border/60 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-start gap-4 mb-4">
         <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
           style={{ backgroundColor: pro.avatar_color || '#a78bfa' }}>
           {initials}
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-start justify-between gap-2 flex-wrap">
             <a href={`/professional/${encodeURIComponent(pro.email)}`} className="font-semibold text-foreground hover:text-primary transition-colors">
               {pro.name}
             </a>
            <div className="flex gap-1.5 flex-wrap">
              {pro.telehealth && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                  <Video className="w-3 h-3" />Telehealth
                </span>
              )}
              {pro.accepting_new && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                  <UserCheck className="w-3 h-3" />Accepting
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[pro.type] || 'bg-muted text-muted-foreground'}`}>
              {pro.type?.replace('_', ' ')}
            </span>
            {pro.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />{pro.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {pro.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{pro.bio}</p>
      )}

      {pro.specialties?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pro.specialties.slice(0, 5).map(s => (
            <Badge key={s} variant="secondary" className="text-[10px] font-normal">{s}</Badge>
          ))}
          {pro.specialties.length > 5 && (
            <Badge variant="outline" className="text-[10px] font-normal">+{pro.specialties.length - 5} more</Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          {pro.phone && (
            <a href={`tel:${pro.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5" />{pro.phone}
            </a>
          )}
          {pro.website && (
            <a href={pro.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Globe className="w-3.5 h-3.5" />Website
            </a>
          )}
        </div>
        {pro.session_fee && (
          <span className="text-xs text-muted-foreground">{pro.session_fee}</span>
        )}
        <Button size="sm" className="rounded-xl ml-auto" onClick={onRequest}>
          Request Consultation
        </Button>
      </div>
    </motion.div>
  );
}