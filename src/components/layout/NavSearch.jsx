import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';

const staticLinks = [
  { label: 'Disorders', path: '/disorders', type: 'page' },
  { label: 'Root Causes', path: '/root-causes', type: 'page' },
  { label: 'Symptom Spectrum', path: '/symptom-spectrum', type: 'page' },
  { label: 'Remedies', path: '/remedies', type: 'page' },
  { label: 'Community Forum', path: '/forum', type: 'page' },
  { label: 'Support Groups', path: '/groups', type: 'page' },
  { label: 'Wellness Goals', path: '/wellness', type: 'page' },
  { label: 'Coping Toolbox', path: '/toolbox', type: 'page' },
  { label: 'Mindfulness', path: '/mindfulness', type: 'page' },
  { label: 'Journal', path: '/journal', type: 'page' },
  { label: 'Find a Therapist', path: '/directory', type: 'page' },
  { label: 'Saved Resources', path: '/saved', type: 'page' },
];

export default function NavSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [disorders, setDisorders] = useState([]);
  const [threads, setThreads] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load disorders + threads once
  useEffect(() => {
    base44.entities.Disorder.list().then(setDisorders).catch(() => {});
    base44.entities.ForumThread.list('-created_date', 100).then(setThreads).catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = query.trim().toLowerCase();

  const results = q.length < 1 ? [] : [
    ...staticLinks
      .filter(l => l.label.toLowerCase().includes(q))
      .map(l => ({ ...l })),
    ...disorders
      .filter(d => d.name?.toLowerCase().includes(q) || d.short_description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(d => ({ label: d.name, path: `/disorders/${d.slug}`, type: 'disorder' })),
    ...threads
      .filter(t => t.title?.toLowerCase().includes(q) || t.body?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(t => ({ label: t.title, path: `/forum/${t.id}`, type: 'thread' })),
  ];

  function go(path) {
    navigate(path);
    setQuery('');
    setOpen(false);
  }

  const typeLabel = { page: 'Page', disorder: 'Disorder', thread: 'Forum' };
  const typeColor = {
    page: 'bg-primary/10 text-primary',
    disorder: 'bg-accent/10 text-accent',
    thread: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${open ? 'border-primary/40 bg-card w-56' : 'border-border/50 bg-muted/50 w-36 hover:w-44'}`}>
        <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="bg-transparent text-xs outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => go(r.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${typeColor[r.type]}`}>
                    {typeLabel[r.type]}
                  </span>
                  <span className="text-sm text-foreground truncate">{r.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {open && q.length > 0 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-2 left-0 w-72 bg-card border border-border rounded-2xl shadow-xl z-50"
          >
            <p className="text-xs text-muted-foreground text-center py-4">No results for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}