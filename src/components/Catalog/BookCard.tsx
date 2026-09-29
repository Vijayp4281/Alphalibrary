import React from 'react';
import { Book } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { BookOpen, MapPin, CheckCircle2, XCircle, ArrowRight, BookmarkPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { setSelectedBook, borrowBook, currentRole } = useLibrary();

  const isAvailable = book.availableCopies > 0;
  const availabilityPercent = Math.round((book.availableCopies / book.totalCopies) * 100);

  return (
    <motion.div
      id={`book-card-${book.id}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all shadow-sm flex flex-col justify-between group"
    >
      <div>
        {/* Cover & Badges */}
        <div className="relative h-52 bg-slate-900 overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md border ${
                isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {isAvailable ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> {book.availableCopies} Available
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" /> Out of Stock
                </>
              )}
            </span>
          </div>

          {/* Department & Shelf Location Tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
            <span className="truncate bg-slate-950/80 px-2.5 py-0.5 rounded-md backdrop-blur-md border border-white/10 text-[10px]">
              {book.department}
            </span>
            <span className="shrink-0 flex items-center gap-1 bg-blue-600/90 px-2.5 py-0.5 rounded-md backdrop-blur-md font-semibold text-[10px] border border-blue-400/30 text-white">
              <MapPin className="w-3 h-3 text-sky-200" /> {book.shelfLocation}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px] text-blue-600 dark:text-sky-400 font-bold">
            <span>{book.category}</span>
            <span className="text-slate-400 font-normal">{book.edition}</span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
            {book.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            By <span className="text-slate-900 dark:text-slate-100 font-semibold">{book.author}</span>
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-[11px]">
            {book.description}
          </p>

          {/* Stock Progress Bar */}
          <div className="pt-1">
            <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">
              <span>Copies</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                {book.availableCopies} / {book.totalCopies} available
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  availabilityPercent > 50
                    ? 'bg-blue-600'
                    : availabilityPercent > 20
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          id={`btn-view-details-${book.id}`}
          onClick={() => setSelectedBook(book)}
          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> View Details
        </button>
      </div>
    </motion.div>
  );
};
