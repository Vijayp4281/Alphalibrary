import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, FeedbackCategory } from '../../types';
import { X, Star, MessageSquarePlus, Sparkles, Send, AlertCircle, BookOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

const CATEGORIES: FeedbackCategory[] = [
  'Book Quality',
  'Book Availability',
  'Content Accuracy',
  'Edition Request',
  'Library Service',
  'Other'
];

export const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({
  isOpen,
  onClose,
  book
}) => {
  const { addFeedback, currentStudent, currentRole, openAuthModal, addToast } = useLibrary();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('Book Quality');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentRole !== 'student' && !currentStudent) {
      addToast('Student Sign-In Required', 'Please sign in with your student account to write a review.', 'warning');
      openAuthModal('signin', 'student');
      onClose();
      return;
    }

    if (!comment.trim()) {
      setErrorMsg('Please enter your review or feedback comments.');
      return;
    }

    if (comment.trim().length < 5) {
      setErrorMsg('Review comments must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addFeedback({
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCategory: book.category,
        rating,
        comment: comment.trim(),
        category
      });

      if (success) {
        setComment('');
        setRating(5);
        setCategory('Book Quality');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5: return '5 Stars • Excellent & Highly Recommended';
      case 4: return '4 Stars • Very Good & Helpful';
      case 3: return '3 Stars • Average / Needs Minor Improvements';
      case 2: return '2 Stars • Below Expectations / Has Issues';
      case 1: return '1 Star • Poor / Major Issues Identified';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      <div
        id="add-feedback-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="add-feedback-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-lg w-full overflow-hidden text-white my-auto flex flex-col"
        >
          {/* Header */}
          <div className="bg-slate-950/80 p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Write Book Review & Feedback
                </h3>
                <p className="text-xs text-slate-400">
                  Share your insights to help improve library resources
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Book Title (Read Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Book Title (Selected)
              </label>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span className="truncate pr-2">{book.title}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  ID: {book.id}
                </span>
              </div>
            </div>

            {/* Student Info preview */}
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Reviewer:
              </span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {currentStudent?.name || 'Authenticated Student'} ({currentStudent?.rollNumber || 'STU'})
              </span>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Your Rating *
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        type="button"
                        key={`star-pick-${star}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-slate-600 hover:text-amber-400 transition-transform transform hover:scale-125 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-bold text-amber-400 block font-mono">
                    {rating} / 5
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Feedback Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 ml-1"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Detailed Review & Comment *</span>
                <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-normal">
                  <Sparkles className="w-3 h-3" /> Auto-Categorized & Clustered
                </span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience reading this book, content feedback, page condition, or request a newer edition/copies..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-400 transition-all resize-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Helpful keywords (e.g. "latest edition", "more copies", "useful", "torn pages") are automatically optimized for librarians.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
