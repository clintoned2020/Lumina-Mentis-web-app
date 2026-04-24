import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavTooltip({ label, description, color = 'bg-primary', children }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="hidden lg:block absolute z-[9999] pointer-events-none"
            style={{ top: '100%', left: '50%', marginTop: '8px', x: '-50%' }}
          >
            {/* Arrow */}
            <div
              className="absolute bg-popover border-l border-t border-border/60"
              style={{
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '10px',
                height: '10px',
              }}
            />
            <div className="bg-popover border border-border/60 shadow-lg rounded-xl px-3 py-2 text-center w-44">
              <div className={`inline-block w-1.5 h-1.5 rounded-full mb-1 ${color}`} />
              <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}