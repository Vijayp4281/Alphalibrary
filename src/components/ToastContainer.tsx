import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();
  const activeToast = toasts.length > 0 ? toasts[toasts.length - 1] : null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-[9999] pointer-events-none flex flex-col items-end max-w-[340px] sm:max-w-[380px] w-full"
    >
      <AnimatePresence mode="wait">
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            id={`popup-notification-${activeToast.id}`}
            className={`pointer-events-auto w-full px-3.5 py-2.5 rounded-xl shadow-xl border backdrop-blur-md flex items-start gap-2.5 transition-colors ${
              activeToast.type === 'success'
                ? 'bg-white dark:bg-emerald-950/95 border-emerald-500/40 text-slate-900 dark:text-emerald-50 shadow-emerald-950/10 dark:shadow-emerald-950/40'
                : activeToast.type === 'error'
                ? 'bg-white dark:bg-rose-950/95 border-rose-500/40 text-slate-900 dark:text-rose-50 shadow-rose-950/10 dark:shadow-rose-950/40'
                : activeToast.type === 'warning'
                ? 'bg-white dark:bg-amber-950/95 border-amber-500/40 text-slate-900 dark:text-amber-50 shadow-amber-950/10 dark:shadow-amber-950/40'
                : 'bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-slate-900/10 dark:shadow-slate-950/40'
            }`}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {activeToast.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {activeToast.type === 'error' && (
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
              {activeToast.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              {activeToast.type === 'info' && (
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              )}
            </div>

            {/* Content: Title & Short Message */}
            <div className="flex-1 min-w-0 pr-1">
              <h4
                className={`text-xs font-bold leading-tight truncate ${
                  activeToast.type === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : activeToast.type === 'error'
                    ? 'text-rose-700 dark:text-rose-300'
                    : activeToast.type === 'warning'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {activeToast.title}
              </h4>
              {activeToast.description && (
                <p className="mt-0.5 text-[11px] leading-snug text-slate-600 dark:text-slate-300 line-clamp-2">
                  {activeToast.description}
                </p>
              )}
            </div>

            {/* Close Button (×) */}
            <button
              id={`btn-close-toast-${activeToast.id}`}
              onClick={() => removeToast(activeToast.id)}
              className="shrink-0 -mr-1 -mt-0.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

