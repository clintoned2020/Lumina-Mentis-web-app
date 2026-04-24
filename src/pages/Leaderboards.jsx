import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flame, Trophy, Users, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StreakLeaderboard from '@/components/gamification/StreakLeaderboard';
import CircleActivityLeaderboard from '@/components/gamification/CircleActivityLeaderboard';
import PointsDisplay from '@/components/gamification/PointsDisplay';

export default function Leaderboards() {
  const [user, setUser] = useState(null);
  const [userPointsData, setUserPointsData] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: leaderboardData = {} } = useQuery({
    queryKey: ['leaderboard-data', user?.email],
    queryFn: async () => {
      if (!user) return { allUserPoints: [], myAchievements: [] };
      const response = await base44.functions.invoke('getLeaderboardData', {});
      return response.data;
    },
    enabled: !!user,
  });

  const allUserPoints = leaderboardData.allUserPoints || [];
  const myAchievements = leaderboardData.myAchievements || [];

  useEffect(() => {
    if (user && allUserPoints.length > 0) {
      const myData = allUserPoints.find(p => p.user_email === user.email);
      setUserPointsData(myData);
    }
  }, [user, allUserPoints]);

  const levelLeaderboard = [...allUserPoints]
    .sort((a, b) => (b.current_level || 0) - (a.current_level || 0))
    .slice(0, 10);

  const pointsLeaderboard = [...allUserPoints]
    .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gamification</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl tracking-tight mb-2">
              Leaderboards & Achievements
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Compete with the community, earn badges, and climb the ranks through consistent wellness habits.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 space-y-10">

          {/* User's Status */}
          {userPointsData && (
            <div>
              <h2 className="font-semibold text-lg mb-4">Your Progress</h2>
              <PointsDisplay userPoints={userPointsData} showDetails={true} />
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="streaks" className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-xl h-12">
              <TabsTrigger value="streaks" className="rounded-lg">
                <Flame className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Streaks</span>
              </TabsTrigger>
              <TabsTrigger value="levels" className="rounded-lg">
                <Trophy className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Levels</span>
              </TabsTrigger>
              <TabsTrigger value="points" className="rounded-lg">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Points</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="rounded-lg">
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Community</span>
              </TabsTrigger>
            </TabsList>

            {/* Streak Leaderboard */}
            <TabsContent value="streaks" className="mt-8">
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <StreakLeaderboard userPoints={allUserPoints} limit={20} />
              </div>
            </TabsContent>

            {/* Level Leaderboard */}
            <TabsContent value="levels" className="mt-8">
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Level Leaderboard</h3>
                </div>
                <div className="space-y-2">
                  {levelLeaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40 hover:border-primary/20 transition-colors"
                    >
                      <span className="text-lg font-bold text-primary w-8 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {entry.user_email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Level {entry.current_level} • {entry.total_points.toLocaleString()} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{entry.current_level}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Points Leaderboard */}
            <TabsContent value="points" className="mt-8">
              <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Top Earners</h3>
                </div>
                <div className="space-y-2">
                  {pointsLeaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40 hover:border-primary/20 transition-colors"
                    >
                      <span className="text-lg font-bold text-primary w-8 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {entry.user_email?.split('@')[0]}
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-primary">
                        {entry.total_points.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Community Leaderboard */}
            <TabsContent value="community" className="mt-8">
              <div className="bg-card border border-border/60 rounded-2xl p-6">
                <CircleActivityLeaderboard userPoints={allUserPoints} limit={20} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}