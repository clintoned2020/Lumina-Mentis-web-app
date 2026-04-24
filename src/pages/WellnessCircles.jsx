import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Heart, Flame, MessageCircle, Share2, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CircleCard from '@/components/circles/CircleCard';
import CircleFeed from '@/components/circles/CircleFeed';
import CreateCircleModal from '@/components/circles/CreateCircleModal';

const FOCUS_COLORS = {
  meditation: 'bg-blue-500/10 text-blue-600',
  fitness: 'bg-red-500/10 text-red-600',
  sleep: 'bg-indigo-500/10 text-indigo-600',
  medication: 'bg-purple-500/10 text-purple-600',
  journaling: 'bg-emerald-500/10 text-emerald-600',
  mixed: 'bg-amber-500/10 text-amber-600',
};

export default function WellnessCircles() {
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allCircles = [] } = useQuery({
    queryKey: ['wellness-circles'],
    queryFn: () => base44.entities.WellnessCircle.list('-created_date', 100),
  });

  const { data: myCircles = [] } = useQuery({
    queryKey: ['my-wellness-circles', user?.email],
    queryFn: () => {
      if (!user) return [];
      return base44.entities.WellnessCircle.filter({
        member_emails: { $in: [user.email] }
      });
    },
    enabled: !!user,
  });

  const filteredCircles = allCircles.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoinCircle = async (circle) => {
    if (!user) return;
    const members = Array.isArray(circle.member_emails) ? circle.member_emails : [];
    if (!members.includes(user.email)) {
      members.push(user.email);
      await base44.entities.WellnessCircle.update(circle.id, { member_emails: members });
      queryClient.invalidateQueries({ queryKey: ['wellness-circles'] });
      queryClient.invalidateQueries({ queryKey: ['my-wellness-circles'] });
    }
  };

  const handleLeaveCircle = async (circle) => {
    if (!user) return;
    const members = (circle.member_emails || []).filter(e => e !== user.email);
    await base44.entities.WellnessCircle.update(circle.id, { member_emails: members });
    queryClient.invalidateQueries({ queryKey: ['wellness-circles'] });
    queryClient.invalidateQueries({ queryKey: ['my-wellness-circles'] });
    if (selectedCircle?.id === circle.id) setSelectedCircle(null);
  };

  if (selectedCircle) {
    return (
      <CircleFeed
        circle={selectedCircle}
        onBack={() => setSelectedCircle(null)}
        onLeave={() => {
          handleLeaveCircle(selectedCircle);
          setSelectedCircle(null);
        }}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Community</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-2">
              Wellness Circles
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Join communities of people on similar wellness journeys. Share progress, celebrate milestones, and support each other.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 space-y-8">

          {/* Actions and search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search wellness circles..."
                className="pl-10 rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Circle
            </Button>
          </div>

          {/* My Circles */}
          {myCircles.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                My Circles ({myCircles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myCircles.map((circle, i) => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CircleCard
                      circle={circle}
                      isMember={true}
                      onJoin={() => handleJoinCircle(circle)}
                      onLeave={() => handleLeaveCircle(circle)}
                      onOpen={() => setSelectedCircle(circle)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* All Circles */}
          <div>
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Discover Circles ({filteredCircles.length})
            </h2>
            {filteredCircles.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">No circles found</p>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(true)}
                  className="rounded-xl"
                >
                  Create the first one
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCircles.map((circle, i) => {
                  const isMember = user && circle.member_emails?.includes(user.email);
                  return (
                    <motion.div
                      key={circle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CircleCard
                        circle={circle}
                        isMember={isMember}
                        onJoin={() => handleJoinCircle(circle)}
                        onLeave={() => handleLeaveCircle(circle)}
                        onOpen={() => setSelectedCircle(circle)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateCircleModal
            user={user}
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              queryClient.invalidateQueries({ queryKey: ['wellness-circles'] });
              queryClient.invalidateQueries({ queryKey: ['my-wellness-circles'] });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}