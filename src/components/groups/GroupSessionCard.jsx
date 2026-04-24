import React from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, User, CheckCircle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function GroupSessionCard({ session, currentUser, isFacilitator, onUpdate }) {
  const isRsvped = (session.rsvp_emails || []).includes(currentUser?.email);
  const isLive = session.status === 'live';
  const isEnded = session.status === 'ended';

  async function toggleRsvp() {
    if (!currentUser) return;
    const list = session.rsvp_emails || [];
    const updated = isRsvped ? list.filter(e => e !== currentUser.email) : [...list, currentUser.email];
    await base44.entities.GroupSession.update(session.id, { rsvp_emails: updated });
    onUpdate();
  }

  async function setStatus(status) {
    await base44.entities.GroupSession.update(session.id, { status });
    onUpdate();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl border bg-card transition-all ${
        isLive ? 'border-green-500/40 bg-green-500/5' : isEnded ? 'border-border/40 opacity-60' : 'border-border/60'
      }`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                <Radio className="w-3 h-3" />LIVE NOW
              </span>
            )}
            {isEnded && <Badge variant="secondary" className="text-[10px]">Ended</Badge>}
            <h4 className="font-semibold text-foreground">{session.title}</h4>
          </div>
          {session.description && <p className="text-sm text-muted-foreground mb-2">{session.description}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {session.scheduled_at && format(new Date(session.scheduled_at), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {session.scheduled_at && format(new Date(session.scheduled_at), 'h:mm a')}
              {session.duration_minutes && ` · ${session.duration_minutes} min`}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {session.facilitator_name || session.facilitator_email}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {(session.rsvp_emails || []).length} RSVPs
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {!isEnded && currentUser && (
            <Button
              size="sm"
              variant={isRsvped ? 'secondary' : 'outline'}
              onClick={toggleRsvp}
              className={isRsvped ? 'text-primary' : ''}
            >
              {isRsvped ? <><CheckCircle className="w-3.5 h-3.5 mr-1" />RSVP'd</> : 'RSVP'}
            </Button>
          )}
          {isFacilitator && !isEnded && (
            <div className="flex gap-1.5">
              {session.status !== 'live' && (
                <Button size="sm" variant="ghost" className="text-xs text-green-600 hover:text-green-700" onClick={() => setStatus('live')}>
                  Go Live
                </Button>
              )}
              {session.status === 'live' && (
                <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setStatus('ended')}>
                  End Session
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}