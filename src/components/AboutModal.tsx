import React from 'react';
import {
  Info,
  Code2,
  Terminal,
  Cpu,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Sparkles,
  Database,
  Flame,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const technologies = [
    { name: 'React', desc: 'Component UI Framework', icon: Code2, color: 'text-sky-500' },
    { name: 'Firebase Authentication', desc: 'Secure Auth & PIN Verification', icon: Flame, color: 'text-amber-500' },
    { name: 'Firebase Firestore', desc: 'NoSQL Database Storage', icon: Database, color: 'text-emerald-500' },
    { name: 'Tailwind CSS', desc: 'Utility Styling & Dark Mode', icon: Layers, color: 'text-teal-500' },
    { name: 'Vite', desc: 'Fast Module Bundler & Dev Tooling', icon: Cpu, color: 'text-indigo-500' }
  ];

  const features = [
    'Student Registration',
    'Email Verification',
    'Student Dashboard',
    'Book Search',
    'Book Details',
    'Book Borrowing',
    'Book Return',
    'Student Profile',
    'Profile Photo',
    'Staff Dashboard',
    'Library Management'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-900 dark:text-white relative overflow-hidden my-auto"
      >
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 shrink-0" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">About System</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">
                  Version 1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Project overview, DevOps engineering details, technologies, and features.
              </p>
            </div>
          </div>

          <button
            id="btn-close-about-modal"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs leading-relaxed">
          {/* Library Management System Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Library Management System</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              This Library Management System provides students with a convenient platform to search, borrow, track, and manage library books while helping library staff manage library operations efficiently.
            </p>
          </div>

          {/* Project Information */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              Project Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Project</div>
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  LIBRARY MANAGEMENT SYSTEM
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Focus</div>
                <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  DEVOPS / CLEAN CODING
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Used */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              Technologies Used
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {technologies.map((tech, idx) => {
                const IconComp = tech.icon;
                return (
                  <div
                    key={`about-tech-${tech.name}-${idx}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${tech.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{tech.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{tech.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Major System Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              System Features
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {features.map((f, idx) => (
                <div
                  key={`about-feature-${f}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Purpose */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              Project Purpose
            </h4>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
              This is a college/learning project focused on applying:
            </p>
            <ul className="space-y-1 text-xs text-indigo-900 dark:text-indigo-200 font-medium pl-2">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">•</span> DevOps practices
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">•</span> Clean Coding principles
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">•</span> Firebase-based authentication and database management
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">•</span> Modern web application development
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
