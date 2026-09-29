import React, { useState, useMemo } from 'react';
import { StudentProfile, BorrowRecord } from '../../types';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Calendar,
  DollarSign,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  Plus,
  RotateCcw,
  User,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentCirculationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  borrowRecords: BorrowRecord[];
  onMarkSubmitted?: (recordId: string) => void;
  onIssueBookForStudent?: (rollNumber: string) => void;
}

export const StudentCirculationModal: React.FC<StudentCirculationModalProps> = ({
  isOpen,
  onClose,
  student,
  borrowRecords,
  onMarkSubmitted,
  onIssueBookForStudent
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'issued' | 'returned' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRoll, setCopiedRoll] = useState(false);

  // Match all borrow records for this student
  const studentRecords = useMemo(() => {
    if (!student) return [];
    const roll = (student.rollNumber || '').toLowerCase().trim();
    const email = (student.email || '').toLowerCase().trim();
    const name = (student.name || '').toLowerCase().trim();

    return (borrowRecords || []).filter(r => {
      if (!r) return false;
      const rRoll = (r.studentRollNo || (r as any).studentRollNumber || '').toLowerCase().trim();
      const rEmail = (r.studentEmail || '').toLowerCase().trim();
      const rName = (r.studentName || '').toLowerCase().trim();
      return (roll && rRoll === roll) || (email && rEmail === email) || (name && rName === name);
    });
  }, [student, borrowRecords]);

  // Derived loan subsets
  const activeLoans = useMemo(() => {
    return studentRecords.filter(r => r.status === 'Issued' || r.status === 'Not Submitted' || r.status === 'Overdue');
  }, [studentRecords]);

  const overdueLoans = useMemo(() => {
    return studentRecords.filter(r => r.status === 'Overdue');
  }, [studentRecords]);

  const returnedLoans = useMemo(() => {
    return studentRecords.filter(r => r.status === 'Submitted');
  }, [studentRecords]);

  const totalFines = useMemo(() => {
    return studentRecords.reduce((acc, r) => acc + (r.fineAmount || 0), 0);
  }, [studentRecords]);

  // Filtered by tab and search
  const filteredRecords = useMemo(() => {
    let list = studentRecords;
    if (activeTab === 'issued') {
      list = activeLoans;
    } else if (activeTab === 'returned') {
      list = returnedLoans;
    } else if (activeTab === 'overdue') {
      list = overdueLoans;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r =>
        (r.bookTitle && r.bookTitle.toLowerCase().includes(q)) ||
        (r.bookId && r.bookId.toLowerCase().includes(q)) ||
        (r.bookAuthor && r.bookAuthor.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [studentRecords, activeLoans, returnedLoans, overdueLoans, activeTab, searchQuery]);

  if (!isOpen || !student) return null;

  const handleCopyRoll = () => {
    if (student.rollNumber) {
      navigator.clipboard.writeText(student.rollNumber);
      setCopiedRoll(true);
      setTimeout(() => setCopiedRoll(false), 2000);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const maxLimit = student.maxBorrowLimit || 5;
  const currentActiveCount = activeLoans.length;
  const remainingSlots = Math.max(0, maxLimit - currentActiveCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all my-auto">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  student.avatar ||
                  student.photoURL ||
                  student.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt={student.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                  overdueLoans.length > 0
                    ? 'bg-rose-500'
                    : currentActiveCount > 0
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
                title={
                  overdueLoans.length > 0
                    ? 'Has Overdue Books'
                    : currentActiveCount > 0
                    ? 'Active Borrower'
                    : 'No Active Loans'
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {student.name}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyRoll}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  title="Click to copy Roll Number"
                >
                  Roll: {student.rollNo || student.rollNumber}
                  {copiedRoll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
                {student.barcode && (
                  <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-mono text-xs font-semibold border border-blue-500/20 flex items-center gap-1">
                    ID Barcode: {student.barcode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.department || 'General Department'}
                </span>
                <span>•</span>
                <span className="text-slate-500 dark:text-slate-400">{student.year || '3rd Year'}</span>
                <span>•</span>
                <span className="text-slate-500 dark:text-slate-400">{student.batch || '2022-2026 Batch'}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onIssueBookForStudent && (
              <button
                onClick={() => {
                  onClose();
                  onIssueBookForStudent(student.rollNumber);
                }}
                className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Issue Book
              </button>
            )}

            <button
              onClick={handlePrintSlip}
              title="Print Clearance Slip & History"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Total Borrowed
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {studentRecords.length}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">All-time books</div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Active Issued
              </div>
              <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
                {activeLoans.length} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">/ {maxLimit}</span>
              </div>
              <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 font-medium">
                {remainingSlots} slots remaining
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Returned
              </div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {returnedLoans.length}
              </div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                Submitted to library
              </div>
            </div>

            <div className={`p-3 rounded-2xl border ${
              overdueLoans.length > 0
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
            }`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                overdueLoans.length > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Overdue Loans
              </div>
              <div className={`text-xl font-black mt-1 ${
                overdueLoans.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}>
                {overdueLoans.length}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Pending return</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Fine Amount
              </div>
              <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1 font-mono">
                ₹{totalFines}
              </div>
              <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">
                {totalFines === 0 ? 'No Dues Pending' : 'Outstanding dues'}
              </div>
            </div>
          </div>

          {/* CIRCULATION TABS & SEARCH BAR */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Records ({studentRecords.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('issued')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'issued'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Currently Issued ({activeLoans.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('returned')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'returned'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Returned ({returnedLoans.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'overdue'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Overdue ({overdueLoans.length})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by book title or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* RECORDS TABLE / LIST */}
            {filteredRecords.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No records found in this category
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No books matching "${searchQuery}" for this student.`
                    : activeTab === 'issued'
                    ? 'No books are currently issued to this student. Student is eligible to borrow.'
                    : activeTab === 'overdue'
                    ? 'Great news! Student has zero overdue books.'
                    : 'No past borrow history recorded for this student.'}
                </p>
                {activeTab === 'issued' && onIssueBookForStudent && (
                  <button
                    onClick={() => {
                      onClose();
                      onIssueBookForStudent(student.rollNumber);
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow inline-flex items-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Issue Book Now
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5 pl-4">Book Details & ID</th>
                      <th className="p-3.5">Issue & Due Date</th>
                      <th className="p-3.5">Status & Fine</th>
                      <th className="p-3.5 pr-4 text-right">Circulation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40">
                    {filteredRecords.map((r, idx) => {
                      const isReturned = r.status === 'Submitted';
                      const isOverdue = r.status === 'Overdue';

                      return (
                        <tr
                          key={`modal-rec-${r.id}-${idx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3.5 pl-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-12 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                                {r.bookCover ? (
                                  <img src={r.bookCover} alt={r.bookTitle} className="w-full h-full object-cover" />
                                ) : (
                                  <BookOpen className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                                  {r.bookTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {r.bookAuthor}
                                </div>
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                                  Book ID: {r.bookId} • Borrow ID: {r.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] space-y-0.5">
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Issued: </span>
                              <span className="font-bold">{r.borrowDate}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${
                              isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Due: </span>
                              <span className="font-bold">{r.dueDate}</span>
                            </div>
                            {r.returnDate && (
                              <div className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Returned: {r.returnDate}</span>
                              </div>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="space-y-1">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                  isReturned
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : isOverdue
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {isReturned ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : isOverdue ? (
                                  <AlertCircle className="w-3 h-3" />
                                ) : (
                                  <Clock className="w-3 h-3" />
                                )}
                                {r.status}
                              </span>

                              {(r.fineAmount || 0) > 0 && (
                                <div className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                                  Fine: ₹{r.fineAmount}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 pr-4 text-right">
                            {isReturned ? (
                              <div className="inline-flex flex-col items-end">
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Returned
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                                  by {r.handledByStaffId || 'STAFF'}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-end gap-1">
                                {onMarkSubmitted && (
                                  <button
                                    onClick={() => onMarkSubmitted(r.id)}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition-all inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95"
                                    title="Click to mark book as Submitted / Returned"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Return Book
                                  </button>
                                )}
                                <span className="text-[9px] text-slate-400 font-mono">
                                  Issued by {r.handledByStaffId || 'STAFF'}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Student Clearance Status:{' '}
            {activeLoans.length === 0 ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ✓ All books cleared (No pending dues)
              </span>
            ) : (
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {activeLoans.length} active book(s) in possession
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
