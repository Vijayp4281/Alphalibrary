import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, BookFeedback } from '../../types';
import { AddFeedbackModal } from './AddFeedbackModal';
import { calculateBookFeedbackSummary } from '../../services/commentOptimizationService';
import {
  Star,
  MessageSquare,
  Sparkles,
  Plus,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  CheckCircle2,
  CornerDownRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter
} from 'lucide-react';

interface BookFeedbackSectionProps {
  book: Book;
}

type FilterTab = 'all' | 'positive' | 'suggestions' | 'complaints' | 'recent' | 'highest' | 'lowest';

export const BookFeedbackSection: React.FC<BookFeedbackSectionProps> = ({ book }) => {
  const { getFeedbackForBook, currentRole, openAuthModal } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const rawFeedbacks = useMemo(() => {
    return getFeedbackForBook(book.id);
  }, [getFeedbackForBook, book.id]);

  const summary = useMemo(() => {
    return calculateBookFeedbackSummary(rawFeedbacks);
  }, [rawFeedbacks]);

  // Filtered and sorted feedback list
  const filteredFeedbacks = useMemo(() => {
    let list = [...summary.similarGroups.flatMap(g => g.items)];
    if (list.length === 0) {
      list = [...rawFeedbacks];
    }

    // Deduplicate in case multiple clusters overlapped
    const seen = new Set<string>();
    list = list.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });

    switch (activeFilter) {
      case 'positive':
        return list.filter(f => f.optimizedCategory === 'Positive Feedback' || f.rating >= 4);
      case 'suggestions':
        return list.filter(f => f.optimizedCategory === 'Edition Request' || f.optimizedCategory === 'Book Availability' || f.optimizedCategory === 'General Suggestion');
      case 'complaints':
        return list.filter(f => f.optimizedCategory === 'Book Quality' || f.optimizedCategory === 'Content Accuracy' || f.optimizedCategory === 'Complaint' || f.rating <= 2);
      case 'highest':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'lowest':
        return list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'recent':
      case 'all':
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [rawFeedbacks, summary, activeFilter]);

  const toggleReplyExpand = (id: string) => {
    setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenReview = () => {
    if (currentRole !== 'student') {
      openAuthModal('signin', 'student');
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="border-t border-white/10 pt-4 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              Comments & Student Feedback
            </h3>
            <p className="text-[11px] text-slate-400">
              Peer ratings, edition suggestions, and physical condition reports
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenReview}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Write a Review
        </button>
      </div>

      {/* Summary Scorecard & Star Rating Distribution */}
      {summary.totalReviews > 0 ? (
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left: Big Rating Number */}
            <div className="sm:col-span-4 text-center sm:text-left sm:border-r border-slate-800 sm:pr-4">
              <div className="text-3xl font-black text-white font-mono flex items-baseline justify-center sm:justify-start gap-1">
                {summary.averageRating}
                <span className="text-xs font-normal text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={`sum-star-${star}`}
                    className={`w-4 h-4 ${
                      summary.averageRating >= star
                        ? 'text-amber-400 fill-amber-400'
                        : summary.averageRating >= star - 0.5
                        ? 'text-amber-400 fill-amber-400/50'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Based on <strong className="text-slate-200">{summary.totalReviews}</strong> student {summary.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Right: 1-5 Star Breakdown Bar Chart */}
            <div className="sm:col-span-8 space-y-1 text-[10px]">
              {[5, 4, 3, 2, 1].map((ratingVal) => {
                const count = summary.ratingDistribution[ratingVal as 1 | 2 | 3 | 4 | 5] || 0;
                const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                return (
                  <div key={`dist-row-${ratingVal}`} className="flex items-center gap-2">
                    <span className="w-7 font-mono font-bold text-slate-400 flex items-center justify-end gap-0.5">
                      {ratingVal} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Trend Pill summary */}
          {summary.mostCommonSuggestion && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Frequently Mentioned:</span>
                <strong className="text-white font-medium truncate max-w-[280px]">
                  {summary.mostCommonSuggestion}
                </strong>
              </div>
              {summary.highPriorityCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 shrink-0">
                  {summary.highPriorityCount} High Priority
                </span>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Filter / Category Selector Bar */}
      {rawFeedbacks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All ({rawFeedbacks.length})
          </button>

          <button
            onClick={() => setActiveFilter('positive')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'positive'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className="w-3 h-3" /> Positive
          </button>

          <button
            onClick={() => setActiveFilter('suggestions')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'suggestions'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Lightbulb className="w-3 h-3" /> Suggestions
          </button>

          <button
            onClick={() => setActiveFilter('complaints')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              activeFilter === 'complaints'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-rose-300 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3" /> Issues
          </button>

          <div className="ml-auto flex items-center gap-1">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as FilterTab)}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Feedbacks List or Empty State */}
      {filteredFeedbacks.length > 0 ? (
        <div className="space-y-3">
          {filteredFeedbacks.slice(0, visibleCount).map((fb) => (
            <div
              key={fb.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5 shadow-sm"
            >
              {/* Review Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {fb.studentName}
                    </span>
                    {fb.studentDepartment && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {fb.studentDepartment}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={`fb-card-star-${fb.id}-${s}`}
                          className={`w-3 h-3 ${
                            (fb.rating || 5) >= s
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Category & Status Badges */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {fb.category}
                  </span>
                  {fb.similarCount && fb.similarCount > 1 && (
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" /> {fb.similarCount} Similar Requests
                    </span>
                  )}
                </div>
              </div>

              {/* Review Body */}
              <p className="text-xs text-slate-200 leading-relaxed">
                "{fb.comment}"
              </p>

              {/* Librarian Response if present */}
              {fb.librarianReply && (
                <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <CornerDownRight className="w-3.5 h-3.5" /> Librarian Response ({fb.repliedByStaffName || 'Library Staff'})
                    </span>
                    {fb.status === 'Resolved' && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] italic">
                    "{fb.librarianReply}"
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Load More Pagination Button */}
          {filteredFeedbacks.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="w-full py-2 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Load More Reviews ({filteredFeedbacks.length - visibleCount} remaining)
            </button>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-300">
            No feedback yet. Be the first to review this book.
          </h4>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Share ratings, request newer editions, or report page conditions to help librarians and fellow students.
          </p>
          <button
            onClick={handleOpenReview}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Write First Review
          </button>
        </div>
      )}

      {/* Write Feedback Modal */}
      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        book={book}
      />
    </div>
  );
};
