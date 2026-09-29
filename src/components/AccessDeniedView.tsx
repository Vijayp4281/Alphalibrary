import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessDeniedViewProps {
  requiredRole?: 'staff' | 'student' | 'admin';
  targetTitle?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Automatically disappear after approximately 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[9999] pointer-events-none max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#0B1220] border border-purple-500/30 text-white shadow-2xl shadow-purple-950/50 backdrop-blur-xl"
          >
            {/* Small lock icon with purple accent */}
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>

            {/* Content: Display only title and message */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">Access Denied</h4>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium leading-snug mt-0.5">
                You don't have permission to access this page.
              </p>
            </div>

            {/* Small 'x' close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

