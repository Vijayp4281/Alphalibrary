import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CATEGORIES } from '../data/mockData';
import { Search, BookMarked, CheckCircle2, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { books, filters, setFilters, resetFilters } = useLibrary();

  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const totalAvailable = books.reduce((acc, b) => acc + b.availableCopies, 0);

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 shadow-sm my-6 transition-colors">
      {/* Background subtle accent lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/50 text-blue-700 dark:text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> Library Circulation & Discovery Catalog
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Explore Books & <span className="text-blue-600 dark:text-sky-400">Manage Borrowings</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Search the collection, check availability, view active due dates, and request borrow permits seamlessly.
        </p>

        {/* Search & Filter Bar */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              id="hero-search-input"
              type="text"
              placeholder="Search by title, author, category, or ISBN..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              id="hero-category-select"
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-medium cursor-pointer"
            >
              {CATEGORIES.map((cat, idx) => (
                <option key={`hero-cat-opt-${cat}-${idx}`} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {cat}
                </option>
              ))}
            </select>

            {(filters.searchQuery || filters.category !== 'All Categories' || filters.department !== 'All Departments') && (
              <button
                id="hero-btn-reset-filters"
                onClick={resetFilters}
                className="px-3 py-2 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Category:
          </span>
          {CATEGORIES.slice(1, 6).map((cat, idx) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={`hero-cat-pill-${cat}-${idx}`}
                id={`pill-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() =>
                  setFilters(prev => ({ ...prev, category: isSelected ? 'All Categories' : cat }))
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Statistics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <BookMarked className="w-4 h-4 text-blue-600 dark:text-sky-400" /> Catalog Volumes
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">{totalBooks} Titles</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{totalCopies} Total Physical Copies</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Available Now
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalAvailable} Copies</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Ready for immediate borrowing</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-sky-400" /> Active Circulation
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-sky-400">Managed System</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time status tracking</div>
          </div>
        </div>
      </div>
    </div>
  );
};

