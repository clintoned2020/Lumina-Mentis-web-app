import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, TrendingUp, Activity, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminConsole() {
  const [user, setUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [tableFilter, setTableFilter] = useState('all'); // 'all' | 'active'

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(u);
    }).catch(() => window.location.href = '/');
  }, []);

  // Fetch all users and activity data from secure backend endpoint
  const { data: consoleData = { allUsers: [], activityMap: {} }, isLoading: dataLoading } = useQuery({
    queryKey: ['admin-console-data'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAdminConsoleData', {});
      return response.data;
    },
    enabled: !!user,
  });

  const allUsers = consoleData.allUsers || [];
  const activityMap = consoleData.activityMap || {};
  const usersLoading = dataLoading;
  const activityLoading = dataLoading;

  // Filter users by search + active filter
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesActive = tableFilter === 'all' || (activityMap[u.email]?.totalActivity || 0) > 0;
    return matchesSearch && matchesActive;
  });

  // Sort by last activity
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aDate = activityMap[a.email]?.lastActivityDate || new Date(0);
    const bDate = activityMap[b.email]?.lastActivityDate || new Date(0);
    return bDate - aDate;
  });

  // Growth metrics
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => (activityMap[u.email]?.totalActivity || 0) > 0).length;
  const totalActivity = Object.values(activityMap).reduce((sum, act) => sum + (act.totalActivity || 0), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-32 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl mb-2">Admin Console</h1>
          <p className="text-muted-foreground">Monitor user growth and engagement</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border/60 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Total Users</span>
            </div>
            {usersLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">{totalUsers}</p>
            )}
          </div>

          <button
            onClick={() => setTableFilter(f => f === 'active' ? 'all' : 'active')}
            className={`bg-card border rounded-xl p-6 text-left transition-all hover:shadow-md ${tableFilter === 'active' ? 'border-accent ring-2 ring-accent/30' : 'border-border/60'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground font-medium">Active Users</span>
              <span className="ml-auto text-xs text-accent font-medium">{tableFilter === 'active' ? 'Filtered ✓' : 'Click to filter'}</span>
            </div>
            {activityLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">{activeUsers}</p>
            )}
          </button>

          <button
            onClick={() => setTableFilter(f => f === 'active' ? 'all' : 'active')}
            className={`bg-card border rounded-xl p-6 text-left transition-all hover:shadow-md ${tableFilter === 'active' ? 'border-primary ring-2 ring-primary/30' : 'border-border/60'}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">Total Activity</span>
              <span className="ml-auto text-xs text-primary font-medium">{tableFilter === 'active' ? 'Filtered ✓' : 'Click to filter'}</span>
            </div>
            {activityLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold">{totalActivity}</p>
            )}
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border/60">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg">
                {tableFilter === 'active' ? 'Active Users' : 'Registered Users'}
              </h2>
              {tableFilter === 'active' && (
                <button
                  onClick={() => setTableFilter('all')}
                  className="ml-2 px-2 py-1 rounded-lg text-xs bg-accent/10 text-accent hover:bg-accent/20 transition-colors font-medium"
                >
                  Clear filter ✕
                </button>
              )}
            </div>
            <Input
              placeholder="Search by email or name..."
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Threads</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Replies</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Posts</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Activity</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Last Active</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading || activityLoading ? (
                  Array(5).fill(null).map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td colSpan={9} className="px-6 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    </tr>
                  ))
                ) : sortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-6 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map(u => {
                    const activity = activityMap[u.email] || {};
                    return (
                      <tr key={u.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3 text-xs text-foreground">{u.email}</td>
                        <td className="px-6 py-3 font-medium text-foreground">{u.full_name || '—'}</td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">
                          {new Date(u.created_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-center font-medium">{activity.threads || 0}</td>
                        <td className="px-6 py-3 text-center font-medium">{activity.replies || 0}</td>
                        <td className="px-6 py-3 text-center font-medium">{activity.posts || 0}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.totalActivity > 10 ? 'bg-primary/10 text-primary' :
                            activity.totalActivity > 0 ? 'bg-secondary/10 text-secondary-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {activity.totalActivity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-muted-foreground">{activity.lastActivity || '—'}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border/60 bg-muted/30 text-xs text-muted-foreground">
            Showing {sortedUsers.length} of {tableFilter === 'active' ? activeUsers : totalUsers} {tableFilter === 'active' ? 'active' : 'total'} users
          </div>
        </div>
      </div>
    </div>
  );
}