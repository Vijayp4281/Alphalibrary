import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { Layers, MapPin, Clock, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useLibrary();

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Alpha <span className="text-emerald-600 dark:text-emerald-400">Library</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Professional Library Catalog & Real-Time Circulation Engine. Built with Clean Code practices and enterprise architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Searchable Book Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('student-dashboard')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Student Profile & Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('staff-dashboard')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Archivist Management Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('devops-panel')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  DevOps Infrastructure Suite
                </button>
              </li>
            </ul>
          </div>

          {/* Library Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Library Hours</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mon – Sat: 08:00 AM – 05:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Sunday: Closed (Digital Portal 24/7)</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Contact Circulation</h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Central Campus Library, Block A</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>+1 (800) 555-LIB-SYS</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>library-support@university.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} LibStack Engine • All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            Built with Clean Code & DevOps Principles
          </div>
        </div>
      </div>
    </footer>
  );
};
