import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BookOpen, ShieldCheck, Globe, Palette, Eye, Lock, 
  HelpCircle, Info, LogOut, X, Settings
} from 'lucide-react';

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  handlers: {
    onOpenNotifications: () => void;
    onOpenLibrary: () => void;
    onOpenAccount: () => void;
    onOpenLanguage: () => void;
    onOpenAppearance: () => void;
    onOpenAccessibility: () => void;
    onOpenPrivacy: () => void;
    onOpenHelp: () => void;
    onOpenAbout: () => void;
    onSignOut: () => void;
  };
  state: {
    emailAlertsEnabled: boolean;
    selectedLanguage: string;
  };
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({ isOpen, onClose, handlers, state }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold">Quick Settings & Support</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
              <button onClick={() => { onClose(); handlers.onOpenNotifications(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Bell className="w-4 h-4 text-amber-500" /> Notifications
              </button>
              <button onClick={() => { onClose(); handlers.onOpenLibrary(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Library
              </button>
              <button onClick={() => { onClose(); handlers.onOpenAccount(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Account
              </button>
              <button onClick={() => { onClose(); handlers.onOpenLanguage(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Globe className="w-4 h-4 text-sky-500" /> Language
              </button>
              <button onClick={() => { onClose(); handlers.onOpenAppearance(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Palette className="w-4 h-4 text-violet-500" /> Appearance
              </button>
              <button onClick={() => { onClose(); handlers.onOpenAccessibility(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Eye className="w-4 h-4 text-teal-500" /> Accessibility
              </button>
              <button onClick={() => { onClose(); handlers.onOpenPrivacy(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Lock className="w-4 h-4 text-blue-500" /> Privacy
              </button>
              <button onClick={() => { onClose(); handlers.onOpenHelp(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <HelpCircle className="w-4 h-4 text-emerald-500" /> Help
              </button>
              <button onClick={() => { onClose(); handlers.onOpenAbout(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-700/80 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <Info className="w-4 h-4 text-indigo-500" /> About
              </button>
              <button onClick={() => { onClose(); handlers.onSignOut(); }} className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-left flex flex-col gap-2 cursor-pointer">
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
