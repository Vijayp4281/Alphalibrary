import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookFeedbackSection } from './BookFeedbackSection';
import { X, MapPin, Edit3, CheckCircle2, XCircle, Hash, Building2, Calendar, BookMarked, Sparkles, BookOpenText, ListTree, Globe, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookDetailsModalProps {
  onEditRequested?: () => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ onEditRequested }) => {
  const { selectedBook, setSelectedBook, currentRole } = useLibrary();
  const [isFullReaderOpen, setIsFullReaderOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [activeReaderTab, setActiveReaderTab] = useState<'chapters' | 'online_search'>('chapters');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  if (!selectedBook) return null;

  const isAvailable = selectedBook.availableCopies > 0;

  // Generate simulated table of contents based on book title & category
  const generatedChapters = [
    { chapter: 1, title: `Introduction to ${selectedBook.title}`, pages: '1 - 24', summary: 'Foundational principles, core definitions, and historical context of the subject matter.', content: `Chapter 1 explores the foundational principles of ${selectedBook.title}. Written by ${selectedBook.author}, this section establishes core terminology, historical milestones in ${selectedBook.department}, and fundamental frameworks required for advanced study.` },
    { chapter: 2, title: 'Theoretical Frameworks & Core Architecture', pages: '25 - 68', summary: 'Deep dive into standard paradigms, structural models, and foundational algorithms.', content: `Chapter 2 dives deep into standard paradigms and structural models. We examine architectural patterns, mathematical formulations, and critical benchmarks utilized across modern enterprise solutions.` },
    { chapter: 3, title: 'Advanced Methodologies & Practical Applications', pages: '69 - 142', summary: 'Real-world case studies, implementation blueprints, and optimization techniques.', content: `Chapter 3 provides real-world case studies, implementation blueprints, and optimization techniques. Students and researchers learn how to translate theory into production-grade systems.` },
    { chapter: 4, title: 'Case Studies & Industry Benchmarks', pages: '143 - 210', summary: 'Empirical analysis of enterprise deployments and performance metrics.', content: `Chapter 4 covers empirical analysis of enterprise deployments, latency metrics, scalability bottlenecks, and cost-efficiency benchmarks.` },
    { chapter: 5, title: 'Future Horizons & Emerging Paradigms', pages: '211 - 280', summary: 'Research directions, scaling challenges, and upcoming technological shifts.', content: `Chapter 5 discusses ongoing academic research, scaling challenges, and upcoming technological shifts in ${selectedBook.category}.` }
  ];

  // Online search results generator tailored dynamically for any book title & category
  const encodedTitle = encodeURIComponent(selectedBook.title);
  const encodedCategory = encodeURIComponent(selectedBook.category);
  const encodedAuthor = encodeURIComponent(selectedBook.author);

  const onlineSearchResults = [
    {
      id: 1,
      title: `${selectedBook.title}: Comprehensive Academic Survey & Whitepaper`,
      source: 'IEEE Xplore & ACM Digital Library',
      url: `https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText=${encodedTitle}`,
      snippet: `Peer-reviewed study examining core paradigms in ${selectedBook.category}, authored by top researchers in ${selectedBook.department}. Evaluates modern implementations and performance benchmarks.`,
      date: 'Updated July 2026',
      type: 'Scholarly Paper'
    },
    {
      id: 2,
      title: `Advanced Topics, Pre-prints and Research Challenges in ${selectedBook.title}`,
      source: 'Semantic Scholar & arXiv Research Archive',
      url: `https://www.semanticscholar.org/search?q=${encodedTitle}+by+${encodedAuthor}`,
      snippet: `Recent pre-print exploring novel breakthroughs, scaling laws, and algorithmic optimizations relevant to ${selectedBook.title} by ${selectedBook.author}.`,
      date: 'June 2026',
      type: 'Academic Citation'
    },
    {
      id: 3,
      title: `Global Industry Standards and Implementation Repositories`,
      source: 'GitHub Open Source Knowledge Base',
      url: `https://github.com/search?q=${encodedTitle}+${encodedCategory}`,
      snippet: `Curated community repositories, reference implementations, test harnesses, and automated benchmarks for ${selectedBook.title}.`,
      date: 'Active Repository',
      type: 'Open Source'
    },
    {
      id: 4,
      title: `WorldCat Library Holdings & Internet Archive Digital Editions`,
      source: 'WorldCat & Internet Archive Digital Library',
      url: `https://www.worldcat.org/search?q=${encodedTitle}`,
      snippet: `Library catalog holdings, open access editions, lecture notes, and global university library records referencing ${selectedBook.title}.`,
      date: 'Academic Year 2025-2026',
      type: 'Global Catalog'
    }
  ];

  const filteredOnlineResults = searchQuery.trim()
    ? onlineSearchResults.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
    : onlineSearchResults;

  const currentChapterObj = selectedChapter !== null ? generatedChapters.find(c => c.chapter === selectedChapter) : generatedChapters[0];

  return (
    <AnimatePresence>
      {/* Full Screen Reader Screen if isFullReaderOpen is true */}
      {isFullReaderOpen ? (
        <motion.div
          key="fresh-screen-book-reader"
          id="fresh-screen-book-reader"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullReaderOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                ← Back to Details
              </button>
              <div>
                <h3 className="text-sm font-bold text-white truncate max-w-md">{selectedBook.title}</h3>
                <p className="text-[11px] text-indigo-400 font-medium">Online Search & Scholarly Content Reader</p>
              </div>
            </div>

            {/* Tab Switcher in Header */}
            <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveReaderTab('chapters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReaderTab === 'chapters'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpenText className="w-3.5 h-3.5" /> Book Chapters
              </button>
              <button
                onClick={() => setActiveReaderTab('online_search')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReaderTab === 'online_search'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Online Search & Research
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono hidden md:inline-block">
                ISBN: {selectedBook.isbn}
              </span>
              <button
                onClick={() => {
                  setIsFullReaderOpen(false);
                  setSelectedBook(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="sm:hidden flex bg-slate-900 border-b border-slate-800 p-2 gap-2">
            <button
              onClick={() => setActiveReaderTab('chapters')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                activeReaderTab === 'chapters' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <BookOpenText className="w-3.5 h-3.5" /> Chapters
            </button>
            <button
              onClick={() => setActiveReaderTab('online_search')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                activeReaderTab === 'online_search' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Online Search
            </button>
          </div>

          {/* Main Reader Layout */}
          <div className="flex-1 flex overflow-hidden">
            {activeReaderTab === 'chapters' ? (
              <>
                {/* Sidebar Table of Contents */}
                <div className="w-80 bg-slate-900/80 border-r border-slate-800 p-5 overflow-y-auto space-y-3 hidden md:block">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 mb-4">
                    <ListTree className="w-4 h-4" /> Chapters & Contents
                  </h4>
                  <div className="space-y-2">
                    {generatedChapters.map((ch, idx) => {
                      const isSelected = (selectedChapter === null && ch.chapter === 1) || selectedChapter === ch.chapter;
                      return (
                        <button
                          key={`reader-ch-btn-${ch.chapter}-${idx}`}
                          onClick={() => setSelectedChapter(ch.chapter)}
                          className={`w-full text-left p-3 rounded-2xl transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                              : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[10px] font-mono font-bold text-indigo-400 mb-0.5">Chapter {ch.chapter} • pp. {ch.pages}</div>
                          <div className="text-xs font-bold line-clamp-1">{ch.title}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reader Content Canvas */}
                <div className="flex-1 bg-slate-950 p-8 sm:p-12 overflow-y-auto max-w-4xl mx-auto space-y-6">
                  <div className="space-y-2 border-b border-slate-800 pb-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                      Chapter {currentChapterObj?.chapter} of {generatedChapters.length}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {currentChapterObj?.title}
                    </h1>
                    <p className="text-xs text-slate-400 font-mono">Pages: {currentChapterObj?.pages} • Author: {selectedBook.author}</p>
                  </div>

                  {/* Mobile Chapter Selector */}
                  <div className="md:hidden">
                    <label className="text-xs font-bold text-slate-400 block mb-1">Select Chapter:</label>
                    <select
                      value={selectedChapter || 1}
                      onChange={(e) => setSelectedChapter(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      {generatedChapters.map((ch, idx) => (
                        <option key={`reader-ch-opt-${ch.chapter}-${idx}`} value={ch.chapter}>Chapter {ch.chapter}: {ch.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Body */}
                  <div className="prose prose-invert max-w-none space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                    <p className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 font-medium italic">
                      "{currentChapterObj?.summary}"
                    </p>
                    <p>
                      {currentChapterObj?.content}
                    </p>
                    <p>
                      In the context of modern academic curricula and enterprise libraries, understanding {selectedBook.title} allows students and scholars to build robust mental models and practical proficiency in {selectedBook.department}.
                    </p>
                    <h3 className="text-lg font-bold text-white mt-6 pt-4 border-t border-slate-800">Key Takeaways & Core Concepts</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300">
                      <li>Comprehensive theoretical grounding in {selectedBook.category}.</li>
                      <li>Standardized protocols and architectural blueprints.</li>
                      <li>Empirical benchmarks and performance metrics evaluated across multiple academic cohorts.</li>
                    </ul>
                  </div>

                  {/* Pagination / Chapter Navigation */}
                  <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                    <button
                      disabled={(selectedChapter || 1) <= 1}
                      onClick={() => setSelectedChapter(Math.max(1, (selectedChapter || 1) - 1))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        (selectedChapter || 1) <= 1
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 cursor-pointer'
                      }`}
                    >
                      ← Previous Chapter
                    </button>
                    <span className="text-xs text-slate-400">Chapter {selectedChapter || 1} of {generatedChapters.length}</span>
                    <button
                      disabled={(selectedChapter || 1) >= generatedChapters.length}
                      onClick={() => setSelectedChapter(Math.min(generatedChapters.length, (selectedChapter || 1) + 1))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        (selectedChapter || 1) >= generatedChapters.length
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 cursor-pointer'
                      }`}
                    >
                      Next Chapter →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Online Search & Scholarly Research Canvas */
              <div className="flex-1 bg-slate-950 p-6 sm:p-10 overflow-y-auto max-w-4xl mx-auto space-y-6">
                <div className="space-y-3 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <Globe className="w-4 h-4" /> Live Online Search & Scholarly Database
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Live Knowledge Base Active
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Researching Topic: "{selectedBook.title}"
                  </h2>

                  <p className="text-xs text-slate-400">
                    Querying international repositories, IEEE papers, arXiv preprints, and open source benchmarks for {selectedBook.category} ({selectedBook.department}).
                  </p>

                  {/* Search Input Bar */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search specific topics, authors, or algorithms online..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setIsSearchingOnline(true);
                        setTimeout(() => setIsSearchingOnline(false), 800);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSearchingOnline ? 'animate-spin' : ''}`} /> Search
                    </button>
                  </div>
                </div>

                {/* Online Search Results List */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Top Scholarly & Web Search Results ({filteredOnlineResults.length})
                  </h3>

                  <div className="space-y-3">
                    {filteredOnlineResults.map((result, idx) => (
                      <div
                        key={`online-res-card-${result.id || 'res'}-${idx}`}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 group shadow-md"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                            <Globe className="w-3 h-3" /> {result.source}
                          </span>
                          <span className="text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-950">{result.date}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                          <span>{result.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                            {result.type}
                          </span>
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {result.snippet}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                          <span className="text-slate-500 font-mono text-[10px] truncate max-w-md">{result.url}</span>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            Explore Source <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div
          key="book-details-backdrop"
          id="book-details-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 overflow-hidden"
          onClick={() => setSelectedBook(null)}
        >
          <motion.div
            key="book-details-content"
            id="book-details-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={e => e.stopPropagation()}
            className="bg-slate-900/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-xl w-full overflow-hidden text-white my-auto max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-slate-950/80 p-5 sm:p-6 flex flex-row gap-4 items-center border-b border-white/10 shrink-0">
              <button
                id="btn-close-book-details"
                onClick={() => setSelectedBook(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-xl shadow-lg border border-white/15 shrink-0"
              />

              <div className="space-y-2 flex-1 pr-6">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" /> {selectedBook.category}
                </div>

                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-snug line-clamp-1">
                  {selectedBook.title}
                </h2>

                <p className="text-xs text-slate-300 font-medium">
                  By <span className="text-white font-semibold">{selectedBook.author}</span>
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
                    <MapPin className="w-3 h-3 text-indigo-400" /> {selectedBook.shelfLocation}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-md">
                    <BookMarked className="w-3 h-3 text-amber-400" /> ID: {selectedBook.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-5 sm:p-6 space-y-4 text-slate-100 overflow-y-auto">
              {/* Availability Alert Bar */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between backdrop-blur-md ${
                  isAvailable
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isAvailable ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider">
                      {isAvailable ? 'Copies Available' : 'Currently Unavailable'}
                    </h4>
                    <p className="text-xs font-semibold">
                      {selectedBook.availableCopies} of {selectedBook.totalCopies} physical copies ready in library
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Metadata Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> ISBN
                  </span>
                  <span className="font-semibold text-white truncate block">{selectedBook.isbn}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Publisher
                  </span>
                  <span className="font-semibold text-white truncate block">{selectedBook.publisher}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Year
                  </span>
                  <span className="font-semibold text-white truncate block">{selectedBook.publishedYear}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Edition</span>
                  <span className="font-semibold text-white truncate block">{selectedBook.edition}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Department</span>
                  <span className="font-semibold text-white truncate block">{selectedBook.department}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Shelf Code</span>
                  <span className="font-semibold text-indigo-300 truncate block">{selectedBook.shelfLocation}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Book Synopsis</h4>
                <p className="text-xs leading-relaxed text-slate-300 line-clamp-2">
                  {selectedBook.description}
                </p>
              </div>

              {/* Book Contents / Table of Contents Section Button to Fresh Screen with Online Search */}
              <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                <button
                  id="btn-open-fresh-screen-contents"
                  onClick={() => {
                    setSelectedChapter(1);
                    setActiveReaderTab('chapters');
                    setIsFullReaderOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md border border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <BookOpenText className="w-4 h-4 text-indigo-400" />
                    Show Book Chapters & Contents
                  </span>
                  <ListTree className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  id="btn-open-online-search-details"
                  onClick={() => {
                    setActiveReaderTab('online_search');
                    setIsFullReaderOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-lg border border-indigo-400/30"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-200" />
                    Online Search & Scholarly Research Details
                  </span>
                  <ExternalLink className="w-4 h-4 text-indigo-200" />
                </button>
              </div>

              {/* Comments & Feedback Section */}
              <BookFeedbackSection book={selectedBook} />

              {/* Footer Action Bar */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3">
                <div className="flex gap-2">
                  {currentRole === 'staff' && onEditRequested && (
                    <button
                      id="btn-staff-edit-book-details"
                      onClick={() => {
                        onEditRequested();
                      }}
                      className="py-2 px-3 text-xs font-semibold rounded-xl bg-amber-500/80 hover:bg-amber-500 border border-amber-400/40 text-white transition-colors flex items-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
