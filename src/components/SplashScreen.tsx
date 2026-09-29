import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, Sparkles, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    // 5 seconds total loading animation (5000ms)
    const intervalTime = 100; // update every 100ms
    const totalSteps = 5000 / intervalTime; // 50 steps
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min(100, (currentStep / totalSteps) * 100);
      setProgress(newProgress);

      const remaining = Math.max(0, Math.ceil(5 - (currentStep * intervalTime) / 1000));
      setSecondsLeft(remaining);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        onComplete();
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* Background ambient glow matching dashboard */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative z-10 max-w-md w-full mx-auto text-center space-y-8">
        {/* Logo and Icon animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/40 border border-blue-400/30">
            <BookOpen className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Enterprise Library Suite
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              Alpha <span className="text-sky-400">Library</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              MANAGEMENT SYSTEM • CLOUD EDITION
            </p>
          </div>
        </motion.div>

        {/* Loading status & Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-2xl shadow-slate-950/60"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400 animate-pulse" /> Initializing secure system...
            </span>
            <span className="font-mono text-sky-400 font-bold">{Math.round(progress)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-100 shadow-lg shadow-blue-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Firestore Cloud Sync Ready
            </span>
            <span className="font-mono">Loading in {secondsLeft}s...</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
