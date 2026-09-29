import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  BookMarked,
  RotateCcw,
  FileQuestion,
  UserCheck,
  Bug,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ArrowLeft,
  Mail,
  Building,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLibrary } from '../context/LibraryContext';
import { submitSupportReportInFirestore } from '../lib/firebase';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const { currentStudent, systemSettings, staffList, addToast } = useLibrary();

  // Active sub-tab for Help modal
  const [activeTab, setActiveTab] = useState<'rules' | 'borrow' | 'return' | 'faq' | 'contact' | 'report'>('rules');

  // Accordion FAQ expanded state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Report a Problem form state
  const [reportIssueType, setReportIssueType] = useState('Book Borrow Issue');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How do I borrow a book?',
      a: 'Navigate to the Library Catalog, click on any book you wish to borrow, verify that copy availability is greater than zero, click the "Borrow Book" button, and confirm. The book will immediately appear in your Student Dashboard under "My Library Activity".'
    },
    {
      q: 'How do I check my due date?',
      a: 'Log in to your Student Dashboard and scroll to the "My Library Activity" section. Every active loan displays its exact borrow date and calculated due date. If a book is due within 48 hours, an amber warning banner will also alert you at the top of your dashboard.'
    },
    {
      q: 'Where can I see my borrowed books?',
      a: 'All current active loans and completed returns are listed under "My Library Activity" on your Student Dashboard. Each record features status badges such as Active Loan, Due Soon, Overdue, or Submitted.'
    },
    {
      q: 'What happens if a book becomes overdue?',
      a: 'If a book is not returned on or before its due date, its status transitions to "Overdue" and an alert notification is flagged. Overdue items may accumulate fine fees ($1.00/day after grace period) according to system settings.'
    },
    {
      q: 'How do I update my profile?',
      a: 'On your Student Dashboard, click the "Edit Profile & Photo" button on your profile card. You can update your full name, roll number, department, academic year, batch, and phone number, then click "Save Changes".'
    },
    {
      q: 'How do I change my profile photo?',
      a: 'Click "Edit Profile & Photo" on your Student Dashboard, then click "Upload Photo" to select a JPG, PNG, or WEBP image file (up to 2 MB). The photo will be compressed and saved directly to your student record in Firestore.'
    },
    {
      q: 'How do I verify my email?',
      a: 'If your account shows "Unverified Email", click the "Verify Now" button on your student card. Click "Send Verification Link" or request a 6-digit PIN code, then follow the instructions to complete verification.'
    },
    {
      q: 'What should I do if I cannot log in?',
      a: 'Ensure you are entering the correct registered email and password. If you forgot your password, click "Forgot Password?" on the sign-in screen to receive a password reset email, or contact library staff for help.'
    }
  ];

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) {
      addToast('Missing Description', 'Please provide details about the problem before submitting.', 'warning');
      return;
    }

    try {
      setIsSubmittingReport(true);
      await submitSupportReportInFirestore({
        studentId: currentStudent?.rollNumber || currentStudent?.id || 'STUDENT',
        studentName: currentStudent?.name || 'Student User',
        studentEmail: currentStudent?.email || 'N/A',
        issueCategory: reportIssueType,
        description: reportDescription
      });

      addToast('Report Submitted 📩', 'Thank you! Your report has been saved to Firestore. Staff will review it.', 'success');
      setReportDescription('');
      setReportIssueType('Book Borrow Issue');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      addToast('Submission Error', err?.message || 'Failed to record report. Please try again.', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-900 dark:text-white relative overflow-hidden my-auto"
      >
        {/* Top Accent Gradient */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Help & Support</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Library rules, borrowing guides, FAQs, librarian contact, and issue reporting.
              </p>
            </div>
          </div>

          <button
            id="btn-close-help-support"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="p-2 sm:p-3 bg-slate-100/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            id="tab-help-rules"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" /> 📚 Rules
          </button>

          <button
            id="tab-help-borrow"
            onClick={() => setActiveTab('borrow')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'borrow'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 📖 Borrow Guide
          </button>

          <button
            id="tab-help-return"
            onClick={() => setActiveTab('return')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'return'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> 🔄 Return Guide
          </button>

          <button
            id="tab-help-faq"
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" /> ❓ FAQs
          </button>

          <button
            id="tab-help-contact"
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> 👨‍💼 Contact
          </button>

          <button
            id="tab-help-report"
            onClick={() => setActiveTab('report')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Bug className="w-3.5 h-3.5" /> 🐛 Report Issue
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm leading-relaxed">
          {/* TAB 1: LIBRARY RULES */}
          {activeTab === 'rules' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <BookMarked className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">📚 Library Rules & Policy</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Maximum Borrowing Limit
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Students can hold a maximum of <span className="font-bold text-slate-900 dark:text-white">{systemSettings.maxBooksPerStudent || 5} books</span> concurrently.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Loan Period & Due Dates
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    The standard borrowing period is <span className="font-bold text-slate-900 dark:text-white">{systemSettings.maxLoanDays || 10} calendar days</span> from the issue date.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-extrabold text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Overdue Policy & Fines
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Overdue returns incur a fine rate of <span className="font-bold text-slate-900 dark:text-white">${systemSettings.finePerDay || 1.00}/day</span>. Always return books on time.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="font-extrabold text-teal-600 dark:text-teal-400 text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> Book Care & Responsibility
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Do not tear pages, mark text, or damage covers. Lost or heavily damaged books must be replaced or paid for in full.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: HOW TO BORROW A BOOK */}
          {activeTab === 'borrow' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">📖 How to Borrow a Book</h3>
              </div>

              <div className="space-y-3">
                {[
                  { step: 1, title: 'Search for a book', desc: 'Browse the Library Catalog or use the search bar to locate titles by keyword, author, category, or engineering department.' },
                  { step: 2, title: 'Open book details', desc: 'Click on any book card to view description, ISBN, shelf location code, and total copy breakdown.' },
                  { step: 3, title: 'Check availability', desc: 'Verify that available copies are greater than zero before submitting your borrow request.' },
                  { step: 4, title: 'Select the borrow option', desc: 'Click the "Borrow Book" button on the book details window.' },
                  { step: 5, title: 'Confirm the borrowing request', desc: 'Review the return due date schedule and click "Confirm Borrow".' },
                  { step: 6, title: 'View in My Library Activity', desc: 'Your new loan will instantly appear in your Student Dashboard under "My Library Activity" with digital receipt download.' }
                ].map((item, idx) => (
                  <div key={`help-borrow-step-${item.step}-${idx}`} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: HOW TO RETURN A BOOK */}
          {activeTab === 'return' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">🔄 How to Return a Book</h3>
              </div>

              <div className="space-y-3">
                {[
                  { step: 1, title: 'Open My Library Activity', desc: 'Navigate to your Student Dashboard to view active loans and circulation status.' },
                  { step: 2, title: 'Find the borrowed book', desc: 'Locate the specific book in your active loan list.' },
                  { step: 3, title: 'Check the due date', desc: 'Review whether your book is in active status, due soon, or overdue.' },
                  { step: 4, title: 'Return book according to workflow', desc: 'Present the physical book at the library circulation desk or initiate return with library staff.' },
                  { step: 5, title: 'Confirm the return status', desc: 'Library staff will verify physical condition and mark the book as "Submitted" with return timestamp.' }
                ].map((item, idx) => (
                  <div key={`help-return-step-${item.step}-${idx}`} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: FREQUENTLY ASKED QUESTIONS */}
          {activeTab === 'faq' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <FileQuestion className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">❓ Frequently Asked Questions</h3>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpenFaq = openFaqIndex === idx;
                  return (
                    <div
                      key={`help-faq-card-${idx}`}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpenFaq ? null : idx)}
                        className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Q{idx + 1}.</span>
                          {faq.q}
                        </span>
                        {isOpenFaq ? <ChevronUp className="w-4 h-4 text-emerald-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </button>

                      {isOpenFaq && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/60">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: CONTACT LIBRARIAN */}
          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">👨‍💼 Contact Library Staff</h3>
              </div>

              {staffList && staffList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {staffList.map((staff, idx) => (
                    <div
                      key={`help-staff-${staff.id || staff.staffId}-${idx}`}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5"
                    >
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                          {staff.name.charAt(0)}
                        </div>
                      )}

                      <div className="space-y-1 text-xs">
                        <h4 className="font-extrabold text-slate-900 dark:text-white">{staff.name}</h4>
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{staff.position || 'Library Staff'}</div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                          <Building className="w-3 h-3 text-slate-400" /> {staff.department || 'Central Library'}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-slate-400" /> {staff.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-300">
                  Please contact the library staff for assistance.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: REPORT A PROBLEM */}
          {activeTab === 'report' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Bug className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">🐛 Report a Problem</h3>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Problem / Issue Category
                  </label>
                  <select
                    id="select-report-issue-category"
                    value={reportIssueType}
                    onChange={e => setReportIssueType(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Book Borrow Issue">Book Borrow Issue</option>
                    <option value="Book Return Issue">Book Return Issue</option>
                    <option value="Profile / Photo Upload Issue">Profile / Photo Upload Issue</option>
                    <option value="Catalog Search Error">Catalog Search Error</option>
                    <option value="Account Login / Verification">Account Login / Verification</option>
                    <option value="Other System Bug">Other System Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="input-report-description"
                    rows={4}
                    value={reportDescription}
                    onChange={e => setReportDescription(e.target.value)}
                    placeholder="Describe the problem in detail (e.g. error message, book ID, page location)..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-submit-support-report"
                  disabled={isSubmittingReport}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting Report to Firestore...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
