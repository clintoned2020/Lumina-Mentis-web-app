import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare, ChevronUp, UserPlus, UserMinus,
  Edit2, Check, X, Mail, Trash2, MapPin, Globe, Hash
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import AvatarEditor from '@/components/profile/AvatarEditor';
import FollowListModal from '@/components/profile/FollowListModal';
import { notifyNewFollower } from '@/lib/notifications';

export default function UserProfilePage() {
  const { email: profileEmail } = useParams();
  const decodedEmail = decodeURIComponent(profileEmail);
  const [currentUser, setCurrentUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [followModal, setFollowModal] = useState(null); // 'followers' | 'following' | null
  const [interestInput, setInterestInput] = useState('');
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const isSelf = currentUser?.email === decodedEmail;

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile', decodedEmail],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: decodedEmail }),
  });
  const profile = profiles[0];

  const { data: threads = [] } = useQuery({
    queryKey: ['forum-threads-user', decodedEmail],
    queryFn: () => base44.entities.ForumThread.filter({ author_email: decodedEmail }),
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['forum-replies-user', decodedEmail],
    queryFn: () => base44.entities.ForumReply.filter({ author_email: decodedEmail }),
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', currentUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: currentUser.email }),
    enabled: !!currentUser && !isSelf,
  });

  const { data: followerList = [] } = useQuery({
    queryKey: ['followers', decodedEmail],
    queryFn: () => base44.entities.UserFollow.filter({ following_email: decodedEmail }),
  });

  const { data: followingList = [] } = useQuery({
    queryKey: ['following', decodedEmail],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: decodedEmail }),
  });

  const isFollowing = follows.some(f => f.following_email === decodedEmail);
  const totalUpvotes = threads.reduce((sum, t) => sum + (t.upvotes || []).length, 0);
  const displayName = profile?.display_name || decodedEmail.split('@')[0];
  const avatarColor = profile?.avatar_color || '#a78bfa';
  const avatarUrl = profile?.avatar_url;

  function startEdit() {
    setForm({
      display_name: profile?.display_name || currentUser?.full_name || '',
      bio: profile?.bio || '',
      about: profile?.about || '',
      location: profile?.location || '',
      website: profile?.website || '',
      interests: profile?.interests || [],
      joined_label: profile?.joined_label || '',
      avatar_color: profile?.avatar_color || '#a78bfa',
      avatar_url: profile?.avatar_url || '',
    });
    setEditing(true);
  }

  async function saveProfile() {
    setSaving(true);
    const data = { ...form };
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, data);
    } else {
      await base44.entities.UserProfile.create({ user_email: currentUser.email, ...data });
    }
    qc.invalidateQueries({ queryKey: ['user-profile', decodedEmail] });
    setEditing(false);
    setSaving(false);
  }

  async function toggleFollow() {
    if (isFollowing) {
      const rec = follows.find(f => f.following_email === decodedEmail);
      if (rec) await base44.entities.UserFollow.delete(rec.id);
    } else {
      await base44.entities.UserFollow.create({ follower_email: currentUser.email, following_email: decodedEmail });
      // Notify the followed user
      notifyNewFollower({ followerUser: currentUser, followingEmail: decodedEmail }).catch(() => {});
    }
    qc.invalidateQueries({ queryKey: ['follows', currentUser?.email] });
    qc.invalidateQueries({ queryKey: ['followers', decodedEmail] });
  }

  function addInterest(e) {
    e.preventDefault();
    const val = interestInput.trim();
    if (val && !(form.interests || []).includes(val)) {
      setForm(f => ({ ...f, interests: [...(f.interests || []), val] }));
    }
    setInterestInput('');
  }

  function removeInterest(tag) {
    setForm(f => ({ ...f, interests: f.interests.filter(i => i !== tag) }));
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Profile Card */}
            <div className="p-8 rounded-2xl border border-border/60 bg-card mb-6">
              <div className="flex items-start gap-6 flex-wrap">
                {/* Avatar */}
                {!editing && (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
                  >
                    {avatarUrl
                      ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      : displayName[0]?.toUpperCase()
                    }
                  </div>
                )}

                {/* Info / Edit Form */}
                <div className="flex-1 min-w-0">
                  {editing ? (
                    <div className="space-y-4">
                      {/* Avatar Editor */}
                      <AvatarEditor form={form} setForm={setForm} displayName={form.display_name || decodedEmail} />

                      <div className="border-t border-border/40 pt-4 space-y-3">
                        <input
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Display name"
                          value={form.display_name}
                          onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                        />
                        <input
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Tagline e.g. 'Here to learn'"
                          value={form.joined_label}
                          onChange={e => setForm(f => ({ ...f, joined_label: e.target.value }))}
                        />
                        <textarea
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Short bio (shown on cards)..."
                          rows={2}
                          value={form.bio}
                          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        />
                        <textarea
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="About me — share your story, what brings you here, what you hope for..."
                          rows={4}
                          value={form.about}
                          onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="📍 Location"
                            value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                          />
                          <input
                            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="🔗 Website"
                            value={form.website}
                            onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                          />
                        </div>

                        {/* Interests */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">Interests / topics</p>
                          <form onSubmit={addInterest} className="flex gap-2 mb-2">
                            <input
                              className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder="Add interest & press Enter"
                              value={interestInput}
                              onChange={e => setInterestInput(e.target.value)}
                            />
                            <Button type="submit" size="sm" variant="outline">Add</Button>
                          </form>
                          <div className="flex flex-wrap gap-1.5">
                            {(form.interests || []).map(tag => (
                              <span key={tag} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                                #{tag}
                                <button type="button" onClick={() => removeInterest(tag)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={saveProfile} disabled={saving}>
                          <Check className="w-3.5 h-3.5 mr-1" />{saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                          <X className="w-3.5 h-3.5 mr-1" />Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-heading text-2xl tracking-tight">{displayName}</h1>
                      {profile?.joined_label && <p className="text-xs text-primary font-medium mt-0.5 mb-1">{profile.joined_label}</p>}
                      {profile?.bio && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{profile.bio}</p>}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mt-2 mb-3 text-xs text-muted-foreground">
                        {profile?.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
                        )}
                        {profile?.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Globe className="w-3 h-3" />{profile.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>

                      {/* Interests */}
                      {profile?.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {profile.interests.map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span><b className="text-foreground">{threads.length}</b> threads</span>
                        <span><b className="text-foreground">{replies.length}</b> replies</span>
                        <span><b className="text-foreground">{totalUpvotes}</b> upvotes</span>
                        <button
                          onClick={() => setFollowModal('followers')}
                          className="hover:text-primary transition-colors"
                        >
                          <b className="text-foreground">{followerList.length}</b> followers
                        </button>
                        <button
                          onClick={() => setFollowModal('following')}
                          className="hover:text-primary transition-colors"
                        >
                          <b className="text-foreground">{followingList.length}</b> following
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {!editing && (
                  <div className="flex flex-col gap-2">
                    {isSelf ? (
                      <>
                        <Button size="sm" variant="outline" onClick={startEdit}>
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" />Edit Profile
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your profile, posts, and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                onClick={async () => {
                                  if (profile) await base44.entities.UserProfile.delete(profile.id);
                                  await base44.auth.logout('/');
                                }}
                              >
                                Yes, delete my account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : currentUser && (
                      <>
                        <Button size="sm" variant={isFollowing ? 'outline' : 'default'} onClick={toggleFollow}>
                          {isFollowing ? <><UserMinus className="w-3.5 h-3.5 mr-1" />Unfollow</> : <><UserPlus className="w-3.5 h-3.5 mr-1" />Follow</>}
                        </Button>
                        <Link to={`/messages?with=${encodeURIComponent(decodedEmail)}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <Mail className="w-3.5 h-3.5 mr-1.5" />Message
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* About Me */}
            {profile?.about && !editing && (
              <div className="p-6 rounded-2xl border border-border/60 bg-card mb-6">
                <h2 className="font-heading text-lg mb-3">About Me</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.about}</p>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h2 className="font-heading text-xl mb-4">Recent Forum Activity</h2>
              {threads.length === 0 && replies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No forum activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Threads */}
                  {threads.slice(0, 5).map(t => (
                    <Link key={t.id} to={`/forum/${t.id}`}>
                      <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Thread</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_date), { addSuffix: true })}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{t.title}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-1"><ChevronUp className="w-3.5 h-3.5" />{(t.upvotes || []).length}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{t.reply_count || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {/* Recent replies */}
                  {replies.slice(0, 5).map(r => (
                    <Link key={r.id} to={`/forum/${r.thread_id}`}>
                      <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">Reply</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_date), { addSuffix: true })}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{r.body}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <ChevronUp className="w-3.5 h-3.5" />{(r.upvotes || []).length}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Follow list modal */}
      {followModal && (
        <FollowListModal
          mode={followModal}
          email={decodedEmail}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}