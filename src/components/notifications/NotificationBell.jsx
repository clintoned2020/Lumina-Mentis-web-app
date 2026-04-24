import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell({ currentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!currentUser) return null;

  return (
    <div className="relative" ref={ref}>
      <NotificationPanel
        currentUser={currentUser}
        open={open}
        onToggle={() => setOpen(o => !o)}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}