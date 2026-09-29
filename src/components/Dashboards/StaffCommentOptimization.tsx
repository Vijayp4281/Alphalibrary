import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookFeedback, FeedbackCategory, FeedbackPriority, FeedbackStatus } from '../../types';
import {
  calculateGlobalFeedbackMetrics,
  enrichFeedbacksWithSimilarDetection
} from '../../services/commentOptimizationService';
import {
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  CornerDownRight,
  BookOpen,
  User,
  ShieldAlert,
  Layers,
  Send,
  X,
  Eye,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  FileCheck,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StaffCommentOptimization: React.FC = () => {
  const {
    feedbackList,
    updateFeedbackStatus,
    updateFeedbackPriority,
    deleteFeedback,
    setSelectedBook,
    books,
    currentStaff,
    currentAdmin
  } = useLibrary();

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest_rating' | 'lowest_rating' | 'priority' | 'similar'>('recent');

  // Modal states
  const [selectedFeedbackForDetails, setSelectedFeedbackForDetails] = useState<BookFeedback | null>(null);
  const [replyingFeedback, setReplyingFeedback] = useState<BookFeedback | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Similar group view modal
  const [viewingSimilarGroup, setViewingSimilarGroup] = useState<{ label: string; items: BookFeedback[] } | null>(null);

  // Global metrics computed from actual Firebase feedback list
  const metrics = useMemo(() => {
    return calculateGlobalFeedbackMetrics(feedbackList);
  }, [feedbackList]);

  // Enriched feedbacks with similarity clustering
  const { enriched: enrichedList, similarGroups } = useMemo(() => {
    return enrichFeedbacksWithSimilarDetection(feedbackList);
  }, [feedbackList]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return enrichedList
      .filter((fb) => {
        const matchesSearch =
          !searchQuery.trim() ||
          fb.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fb.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (fb.studentRollNo && fb.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          fb.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (fb.librarianReply && fb.librarianReply.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || fb.category === selectedCategory || fb.optimizedCategory === selectedCategory;
        const matchesPrio = selectedPriority === 'all' || fb.priority === selectedPriority;
        const matchesStat = selectedStatus === 'all' || fb.status === selectedStatus;
        const matchesRat = selectedRating === 'all' || fb.rating === Number(selectedRating);

        return matchesSearch && matchesCat && matchesPrio && matchesStat && matchesRat;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const pOrder = { High: 3, Medium: 2, Normal: 1 };
          return (pOrder[b.priority] || 1) - (pOrder[a.priority] || 1);
        }
        if (sortBy === 'highest_rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'lowest_rating') return (a.rating || 0) - (b.rating || 0);
        if (sortBy === 'similar') return (b.similarCount || 1) - (a.similarCount || 1);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [enrichedList, searchQuery, selectedCategory, selectedPriority, selectedStatus, selectedRating, sortBy]);

  const handleOpenReply = (fb: BookFeedback) => {
    setReplyingFeedback(fb);
    setReplyText(fb.librarianReply || '');
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingFeedback) return;

    setIsSubmittingReply(true);
    try {
      await updateFeedbackStatus(replyingFeedback.id, 'Reviewed', replyText.trim());
      setReplyingFeedback(null);
      setReplyText('');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    await updateFeedbackStatus(id, newStatus);
  };

  const handleQuickPriorityChange = async (id: string, newPriority: FeedbackPriority) => {
    await updateFeedbackPriority(id, newPriority);
  };

  const handleOpenBookInCatalog = (bookId: string) => {
    const book = books.find((b) => b.id.toLowerCase().trim() === bookId.toLowerCase().trim());
    if (book) {
      setSelectedBook(book);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent NLP & Feedback Analyzer
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Library Management Comment Optimization
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Automatically categorizes student book feedback, clusters recurring suggestions, detects priority issues, and enables librarian responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-medium block">Total Analyzed</span>
            <span className="text-lg font-black text-white font-mono">{metrics.total} Reviews</span>
          </div>
        </div>
      </div>

      {/* 6 Real-time Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.total}</div>
          <span className="text-[10px] text-slate-500">Across entire catalog</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-md space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-xs font-semibold">
            <span>New Feedback</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{metrics.newCount}</div>
          <span className="text-[10px] text-amber-500/80">Awaiting librarian review</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 shadow-md space-y-1">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-semibold">
            <span>Reviewed</span>
            <Eye className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">{metrics.reviewedCount}</div>
          <span className="text-[10px] text-indigo-400/80">Staff acknowledged</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow-md space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">{metrics.resolvedCount}</div>
          <span className="text-[10px] text-emerald-400/80">Completed actions</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Rating</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.averageRating} <span className="text-xs text-slate-400 font-normal">/ 5</span></div>
          <span className="text-[10px] text-slate-500">Student satisfaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow-md space-y-1">
          <div className="flex items-center justify-between text-rose-400 text-xs font-semibold">
            <span>High Priority</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{metrics.highPriorityCount}</div>
          <span className="text-[10px] text-rose-400/80">Wear & severe issues</span>
        </div>
      </div>

      {/* Clustered Similar Requests Section */}
      {similarGroups.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> AI-Clustered Frequent Requests ({similarGroups.length} Topics Detected)
            </h3>
            <span className="text-[11px] text-slate-400">
              Aggregated across all books
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {similarGroups.slice(0, 6).map((group, idx) => (
              <div
                key={`sim-grp-${group.key}-${idx}`}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-start justify-between gap-3 shadow-sm group"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {group.label}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    <strong className="text-indigo-400">{group.count}</strong> student {group.count === 1 ? 'request' : 'requests'}
                  </p>
                </div>

                <button
                  onClick={() => setViewingSimilarGroup({ label: group.label, items: group.items })}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition-colors shrink-0 cursor-pointer"
                >
                  View All ({group.count})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by book title, student name, roll number, or comment keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Book Quality">Book Quality</option>
              <option value="Book Availability">Book Availability</option>
              <option value="Content Accuracy">Content Accuracy</option>
              <option value="Edition Request">Edition Request</option>
              <option value="Library Service">Library Service</option>
              <option value="Positive Feedback">Positive Feedback</option>
              <option value="Complaint">Complaint</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Normal">Normal Priority</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-semibold outline-none focus:border-indigo-500"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="similar">Sort: Most Similar Requests</option>
              <option value="highest_rating">Sort: Highest Rated</option>
              <option value="lowest_rating">Sort: Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Management Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Student Reviews & Optimized Requests ({filteredFeedbacks.length})
            </h3>
          </div>
        </div>

        {filteredFeedbacks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-3">Rating</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Comment & Optimized Topic</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Priority</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Book */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleOpenBookInCatalog(fb.bookId)}
                        className="text-left font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{fb.bookTitle}</span>
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        ID: {fb.bookId}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white truncate max-w-[130px]">
                        {fb.studentName}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {fb.studentRollNo || fb.studentDepartment || 'Student'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-amber-400 font-mono text-xs">{fb.rating}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </div>
                    </td>

                    {/* Comment & Optimized Topic */}
                    <td className="py-3.5 px-4">
                      <p className="line-clamp-2 text-slate-300 font-normal leading-relaxed">
                        "{fb.comment}"
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {fb.optimizedCategory && fb.optimizedCategory !== fb.category && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                            Auto: {fb.optimizedCategory}
                          </span>
                        )}
                        {fb.similarCount && fb.similarCount > 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" /> {fb.similarCount} Similar
                          </span>
                        )}
                        {fb.librarianReply && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1">
                            <CornerDownRight className="w-2.5 h-2.5" /> Replied
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap">
                        {fb.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <select
                        value={fb.priority}
                        onChange={(e) => handleQuickPriorityChange(fb.id, e.target.value as FeedbackPriority)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                          fb.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : fb.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Normal" className="bg-slate-900 text-white">Normal</option>
                        <option value="Medium" className="bg-slate-900 text-white">Medium</option>
                        <option value="High" className="bg-slate-900 text-white">High</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <select
                        value={fb.status}
                        onChange={(e) => handleQuickStatusChange(fb.id, e.target.value as FeedbackStatus)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                          fb.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : fb.status === 'Reviewed'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-white">New</option>
                        <option value="Reviewed" className="bg-slate-900 text-white">Reviewed</option>
                        <option value="Resolved" className="bg-slate-900 text-white">Resolved</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Reply to Student"
                          onClick={() => handleOpenReply(fb)}
                          className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="View Full Details"
                          onClick={() => setSelectedFeedbackForDetails(fb)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center space-y-2">
            <Inbox className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-xs font-bold text-slate-400">No feedbacks match your filters</h4>
            <p className="text-[11px] text-slate-500">Try adjusting your search keywords, categories, or status filter.</p>
          </div>
        )}
      </div>

      {/* Modal 1: Librarian Reply Modal */}
      <AnimatePresence>
        {replyingFeedback && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setReplyingFeedback(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white flex flex-col"
            >
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Librarian Feedback Response</h3>
                </div>
                <button
                  onClick={() => setReplyingFeedback(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReply} className="p-5 space-y-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400">Replying to:</div>
                  <div className="font-bold text-white">{replyingFeedback.studentName} ({replyingFeedback.bookTitle})</div>
                  <p className="text-slate-300 italic">"{replyingFeedback.comment}"</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Librarian / Staff Reply *
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="e.g. 'Thank you for notifying us. We have requested 3 copies of the latest edition from the procurement desk.'"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    This reply will be publicly visible to students reading reviews for this book.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplyingFeedback(null)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReply}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Save Response
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Full Feedback Detail Modal */}
      <AnimatePresence>
        {selectedFeedbackForDetails && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setSelectedFeedbackForDetails(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-white flex flex-col"
            >
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Full Review & Optimization Report</h3>
                </div>
                <button
                  onClick={() => setSelectedFeedbackForDetails(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Book & Student Info */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Target Book</span>
                    <strong className="text-white text-sm line-clamp-1">{selectedFeedbackForDetails.bookTitle}</strong>
                    <span className="text-[10px] text-indigo-400 font-mono">ID: {selectedFeedbackForDetails.bookId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Reviewer</span>
                    <strong className="text-white text-sm">{selectedFeedbackForDetails.studentName}</strong>
                    <span className="text-[10px] text-slate-400 block">{selectedFeedbackForDetails.studentRollNo || 'Student'}</span>
                  </div>
                </div>

                {/* Rating & Category Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {selectedFeedbackForDetails.rating} / 5 Stars
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                    Category: {selectedFeedbackForDetails.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                    Optimized: {selectedFeedbackForDetails.optimizedCategory}
                  </span>
                </div>

                {/* Original Comment */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Student Comment</div>
                  <p className="text-slate-100 text-sm leading-relaxed">
                    "{selectedFeedbackForDetails.comment}"
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Submitted: {new Date(selectedFeedbackForDetails.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Librarian Response */}
                {selectedFeedbackForDetails.librarianReply ? (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" /> Official Librarian Response
                    </div>
                    <p className="text-slate-200 text-xs italic">
                      "{selectedFeedbackForDetails.librarianReply}"
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Replied by: {selectedFeedbackForDetails.repliedByStaffName || 'Librarian'} on {selectedFeedbackForDetails.repliedAt ? new Date(selectedFeedbackForDetails.repliedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const fb = selectedFeedbackForDetails;
                      setSelectedFeedbackForDetails(null);
                      handleOpenReply(fb);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" /> Add Official Response
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: View Clustered Similar Group Feedback */}
      <AnimatePresence>
        {viewingSimilarGroup && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
            onClick={() => setViewingSimilarGroup(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden text-white flex flex-col max-h-[85vh]"
            >
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Clustered Request Group
                  </h3>
                  <p className="text-xs text-slate-400">{viewingSimilarGroup.label}</p>
                </div>
                <button
                  onClick={() => setViewingSimilarGroup(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3">
                {viewingSimilarGroup.items.map((item) => (
                  <div key={`modal-sim-item-${item.id}`} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">{item.studentName} ({item.bookTitle})</span>
                      <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5">
                        {item.rating} <Star className="w-3 h-3 fill-amber-400" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">"{item.comment}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Category: {item.category}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
