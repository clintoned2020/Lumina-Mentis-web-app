import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Trash2, ArrowLeft, Loader2, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AffirmationGallery() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [affirmations, setAffirmations] = useState([]);
  const [dailyPool, setDailyPool] = useState([]);
  const [newAffirmationText, setNewAffirmationText] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [adding, setAdding] = useState(false);
  const [savingGalleryCopy, setSavingGalleryCopy] = useState(false);
  const [adminAddStatus, setAdminAddStatus] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        setUser(u);
        if (u) {
          const profile = await base44.entities.UserProfile.filter({ user_email: u.email }, null, 1);
          const adminFlag = u.role === 'admin' || !!profile?.[0]?.is_admin;
          setIsAdmin(adminFlag);
          const results = await base44.entities.SavedAffirmation.filter(
            { user_email: u.email },
            '-created_date',
            50
          );
          setAffirmations(results);
          if (adminFlag) {
            try {
              const pool = await base44.entities.DailyAffirmation.filter({ is_active: true }, '-created_date', 100);
              setDailyPool(pool);
            } catch {
              setDailyPool([]);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (window.location.hash !== '#my-saved-affirmations') return;
    const el = document.getElementById('my-saved-affirmations');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading, affirmations.length]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await base44.entities.SavedAffirmation.delete(id);
      setAffirmations(prev => prev.filter(a => a.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleAddDailyAffirmation = async () => {
    const text = newAffirmationText.trim();
    if (!isAdmin || !user || !text || adding) return;
    setAdminAddStatus(null);
    setAdding(true);
    try {
      const created = await base44.entities.DailyAffirmation.create({
        text,
        created_by: user.email,
        is_active: true
      });
      setDailyPool((prev) => [created, ...prev]);
      setNewAffirmationText('');
      setAdminAddStatus({
        type: 'success',
        message: 'Added to daily rotation.'
      });
    } catch (error) {
      console.error('Failed to add daily affirmation:', error);
      setAdminAddStatus({
        type: 'error',
        message: 'Could not add to daily rotation. If this is your first run, apply the latest Supabase schema update first.'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleSaveCopyToMyGallery = async () => {
    const text = newAffirmationText.trim();
    if (!user || !text || savingGalleryCopy) return;
    const today = new Date().toISOString().slice(0, 10);
    setSavingGalleryCopy(true);
    try {
      const created = await base44.entities.SavedAffirmation.create({
        user_email: user.email,
        text,
        date: today,
      });
      setAffirmations((prev) => [created, ...prev]);
    } finally {
      setSavingGalleryCopy(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-20">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 lg:px-16 mb-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading text-3xl lg:text-4xl">My Affirmation Gallery</h1>
        </div>
        <p className="text-muted-foreground">Your saved daily affirmations — words that resonated with you.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-16">
        {isAdmin && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-heading text-xl mb-2">Admin: Add Daily Affirmation</h2>
            <p className="text-sm text-muted-foreground mb-4">
              New entries are added to the shared daily affirmation rotation for all users.
            </p>
            <div className="space-y-3">
              <textarea
                value={newAffirmationText}
                onChange={(e) => setNewAffirmationText(e.target.value)}
                rows={3}
                placeholder="Type a new daily affirmation..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddDailyAffirmation}
                  disabled={adding || !newAffirmationText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Add to Daily Rotation
                </button>
                <button
                  type="button"
                  onClick={handleSaveCopyToMyGallery}
                  disabled={savingGalleryCopy || !newAffirmationText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted/60 disabled:opacity-50"
                >
                  {savingGalleryCopy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Add copy to My Gallery
                </button>
              </div>
              <a
                href="#my-saved-affirmations"
                className="inline-block text-sm text-primary underline-offset-4 hover:underline"
              >
                Jump to My Gallery
              </a>
              {adminAddStatus && (
                <p className={`text-sm ${adminAddStatus.type === 'success' ? 'text-primary' : 'text-destructive'}`}>
                  {adminAddStatus.message}
                </p>
              )}
              {dailyPool.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Active shared affirmations: {dailyPool.length}
                </p>
              )}
            </div>
          </div>
        )}

        <div id="my-saved-affirmations" className="scroll-mt-28">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !user ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Please sign in to view your saved affirmations.</p>
          </div>
        ) : affirmations.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No saved affirmations yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Head to your dashboard and save today's affirmation!</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
              Go to dashboard
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {affirmations.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 p-5"
                >
                  <Quote className="w-5 h-5 text-primary/30 mb-3" />
                  <p className="font-heading text-lg leading-snug text-foreground mb-4">"{a.text}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      title="Remove"
                    >
                      {deleting === a.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
        </div>
      </div>
    </div>
  );
}