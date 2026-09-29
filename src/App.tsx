import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BookCard } from './components/Catalog/BookCard';
import { BookDetailsModal } from './components/Catalog/BookDetailsModal';
import { AddEditBookModal } from './components/Catalog/AddEditBookModal';
import { StudentDashboard } from './components/Dashboards/StudentDashboard';
import { StaffDashboard } from './components/Dashboards/StaffDashboard';
import { AdminDashboard } from './components/Dashboards/AdminDashboard';
import { DevOpsPanel } from './components/DevOpsPanel';
import { SettingsCenter } from './components/SettingsCenter';
import { AccessDeniedView } from './components/AccessDeniedView';
import { LoginModal } from './components/Auth/LoginModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { CATEGORIES, DEPARTMENTS } from './data/mockData';
import { Book } from './types';
import {
  Grid,
  List as ListIcon,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CatalogView: React.FC = () => {
  const { books, filters, setFilters, resetFilters, setSelectedBook, currentRole } = useLibrary();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  // Apply filters
  const filteredBooks = books.filter(book => {
    const query = filters.searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.id.toLowerCase().includes(query) ||
      book.isbn.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query);

    const matchesCategory =
      filters.category === 'All Categories' || book.category === filters.category;

    const matchesDepartment =
      filters.department === 'All Departments' || book.department === filters.department;

    const matchesAvailability =
      filters.availability === 'all' ||
      (filters.availability === 'available' && book.availableCopies > 0) ||
      (filters.availability === 'out_of_stock' && book.availableCopies === 0);

    return matchesQuery && matchesCategory && matchesDepartment && matchesAvailability;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
    if (filters.sortBy === 'newest') return b.publishedYear - a.publishedYear;
    if (filters.sortBy === 'available') return b.availableCopies - a.availableCopies;
    return b.totalCopies - a.totalCopies; // 'popular'
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Catalog Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-slate-900 dark:text-white transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Library Catalog ({sortedBooks.length} books)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browse physical books, check live shelf availability, or filter by engineering departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Staff Add Book Button */}
            {currentRole === 'staff' && (
              <button
                id="btn-catalog-add-book"
                onClick={() => {
                  setBookToEdit(null);
                  setIsAddBookModalOpen(true);
                }}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Book
              </button>
            )}
          </div>
        </div>

        {/* Filters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              id="catalog-filter-category"
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium cursor-pointer text-slate-800 dark:text-slate-100"
            >
              {CATEGORIES.map((c, idx) => (
                <option key={`catalog-filter-cat-${c}-${idx}`} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Department
            </label>
            <select
              id="catalog-filter-department"
              value={filters.department}
              onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium cursor-pointer text-slate-800 dark:text-slate-100"
            >
              {DEPARTMENTS.map((d, idx) => (
                <option key={`catalog-filter-dept-${d}-${idx}`} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Availability
            </label>
            <select
              id="catalog-filter-availability"
              value={filters.availability}
              onChange={e => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium cursor-pointer text-slate-800 dark:text-slate-100"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Items</option>
              <option value="available" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">In Stock (Available)</option>
              <option value="out_of_stock" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Out of Stock</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Sort Order
            </label>
            <select
              id="catalog-filter-sort"
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium cursor-pointer text-slate-800 dark:text-slate-100"
            >
              <option value="popular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Most Popular (Total Copies)</option>
              <option value="available" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Highest Available Copies</option>
              <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Publication Year (Newest)</option>
              <option value="title" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Book Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Grid / List */}
      {sortedBooks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Books Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No library catalog items matched your filter search criteria. Try clearing search keywords or selecting all categories.
          </p>
          <button
            id="btn-clear-empty-filters"
            onClick={resetFilters}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all border border-emerald-500/30 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedBooks.map((book, idx) => (
            <BookCard key={`catalog-grid-${book.id}-${idx}`} book={book} />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-200 dark:divide-slate-800">
          {sortedBooks.map((book, idx) => (
            <div
              key={`catalog-list-${book.id}-${idx}`}
              className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded-lg shadow shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{book.category}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400">{book.department}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{book.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    By <span className="font-semibold text-slate-700 dark:text-slate-200">{book.author}</span> • Shelf:{' '}
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{book.shelfLocation}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                    book.availableCopies > 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  }`}
                >
                  {book.availableCopies > 0 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {book.availableCopies} available
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Out of stock
                    </>
                  )}
                </span>

                <button
                  onClick={() => setSelectedBook(book)}
                  className="py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      <BookDetailsModal
        onEditRequested={() => {
          setSelectedBook(null);
          setBookToEdit(books.find(b => b.id === bookToEdit?.id) || null);
          setIsAddBookModalOpen(true);
        }}
      />

      {/* Add/Edit Modal */}
      <AddEditBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => {
          setIsAddBookModalOpen(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
      />
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { activeTab, currentRole } = useLibrary();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {activeTab === 'catalog' && <CatalogView />}
        {activeTab === 'student-dashboard' && (
          currentRole === 'student' ? (
            <StudentDashboard />
          ) : (
            <AccessDeniedView requiredRole="student" targetTitle="Student Dashboard" />
          )
        )}
        {activeTab === 'staff-dashboard' && (
          currentRole === 'staff' ? (
            <StaffDashboard />
          ) : (
            <AccessDeniedView requiredRole="staff" targetTitle="Staff Dashboard (Archivist Portal)" />
          )
        )}
        {activeTab === 'admin-dashboard' && (
          currentRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AccessDeniedView requiredRole="admin" targetTitle="Admin Management Dashboard" />
          )
        )}
        {activeTab === 'devops-panel' && (
          currentRole === 'admin' ? (
            <DevOpsPanel />
          ) : (
            <AccessDeniedView requiredRole="admin" targetTitle="DevOps Infrastructure Panel" />
          )
        )}
        {activeTab === 'settings' && <SettingsCenter />}
      </main>

      <Footer />
      <LoginModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LibraryProvider>
      {isLoading && <SplashScreen onComplete={() => setIsLoading(false)} />}
      <MainAppContent />
    </LibraryProvider>
  );
}
