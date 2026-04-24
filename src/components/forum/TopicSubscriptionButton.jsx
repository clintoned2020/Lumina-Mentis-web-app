import React, { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'forum_subscribed_topics';

function getSubscribed() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function TopicSubscriptionButton({ topic }) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setSubscribed(getSubscribed().includes(topic));
  }, [topic]);

  function toggle(e) {
    e.stopPropagation();
    const current = getSubscribed();
    const next = subscribed
      ? current.filter(t => t !== topic)
      : [...current, topic];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSubscribed(!subscribed);
  }

  if (topic === 'all') return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={`h-7 px-2 text-xs gap-1 ${subscribed ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
      title={subscribed ? 'Unsubscribe from topic' : 'Subscribe to topic'}
    >
      {subscribed ? <Bell className="w-3.5 h-3.5 fill-current" /> : <BellOff className="w-3.5 h-3.5" />}
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}