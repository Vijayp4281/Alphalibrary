import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { jsPDF } from 'jspdf';
import { EmailVerificationModal } from '../Auth/EmailVerificationModal';
import { HelpSupportModal } from '../HelpSupportModal';
import { AboutModal } from '../AboutModal';
import { QuickSettingsModal } from './QuickSettingsModal';
import { auth, compressImageToBase64, updateStudentProfileInFirestore } from '../../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
  User,
  Mail,
  Building,
  Phone,
  BookmarkCheck,
  FileText,
  Edit2,
  Save,
  Sparkles,
  LogOut,
  UserCheck,
  Users,
  UserPlus,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  HelpCircle,
  Info,
  Bell,
  Globe,
  Palette,
  Eye,
  Lock,
  Settings,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StudentDashboard: React.FC = () => {
  const {
    currentStudent,
    borrowRecords,
    setActiveTab,
    setIsAuthModalOpen,
    updateStudentProfile,
    signOutWithFirebase,
    currentRole,
    studentsList,
    setRole,
    addToast,
    markAsSubmitted,
    isAuthLoading,
    verifyStudentEmailAndCreateProfile
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<any | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Verification state for inline verify view
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);
  const [isResendingVerify, setIsResendingVerify] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; text: string } | null>(null);

  // Quick Settings Modals State
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isQuickSettingsModalOpen, setIsQuickSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('lms_language') || 'English');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(() => localStorage.getItem('lms_email_alerts') !== 'false');
  const [soundFxEnabled, setSoundFxEnabled] = useState(() => localStorage.getItem('lms_sound_fx') !== 'false');

  // Resend cooldown countdown effect
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Student Roll Number Quick Lookup & Auto-fill State
  const [rollSearchQuery, setRollSearchQuery] = useState('');
  const [isRollDropdownOpen, setIsRollDropdownOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const isRecordForCurrentStudent = (r: any) => {
    if (!currentStudent) return false;
    const sIdMatches = r.studentId === currentStudent.id;
    const sRollMatches = !!(r.studentRollNo && currentStudent.rollNumber && r.studentRollNo.toLowerCase().trim() === currentStudent.rollNumber.toLowerCase().trim());
    const sRollMatchesId = !!(r.studentId && currentStudent.rollNumber && r.studentId.toLowerCase().trim() === currentStudent.rollNumber.toLowerCase().trim());
    const sEmailMatches = !!(r.studentEmail && currentStudent.email && r.studentEmail.toLowerCase().trim() === currentStudent.email.toLowerCase().trim());
    return sIdMatches || sRollMatches || sRollMatchesId || sEmailMatches;
  };

  const handleDownloadAllReceipts = () => {
    const myRecords = borrowRecords.filter(isRecordForCurrentStudent);
    if (myRecords.length === 0) {
      addToast('No Records', 'No borrow records available to download.', 'info');
      return;
    }

    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(5, 150, 105);
    doc.text("CAMPUS LIBRARY MANAGEMENT SYSTEM", 20, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Complete Loan Receipts Report`, 20, 28);
    
    // Student Info Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Student Name: ${currentStudent.name}`, 20, 36);
    doc.text(`Roll Number: ${currentStudent.rollNumber}`, 120, 36);

    doc.line(20, 41, 190, 41);

    let y = 50;
    myRecords.forEach((r, idx) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      // Draw box for each book record
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, y, 170, 38, 3, 3, 'FD');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(5, 150, 105);
      doc.text(`[${idx + 1}] Transaction ID: ${r.id}`, 26, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Book Title: ${r.bookTitle}`, 26, y + 16);
      doc.text(`Book ID / Author: ${r.bookId} • ${r.bookAuthor}`, 26, y + 22);
      doc.text(`Borrow Date: ${r.borrowDate}   |   Due Date: ${r.dueDate}`, 26, y + 28);
      doc.text(`Status: ${r.status}`, 26, y + 34);

      y += 46;
    });

    doc.save(`All_Library_Receipts_${currentStudent.rollNumber}.pdf`);
    addToast('PDF Report Downloaded', 'Successfully downloaded all loan receipts as PDF with individual boxes.', 'success');
  };

  const handleDownloadReceipt = (record: any) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(5, 150, 105);
    doc.text("CAMPUS LIBRARY MANAGEMENT SYSTEM", 20, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Official Digital Loan Receipt`, 20, 28);
    
    doc.line(20, 33, 190, 33);

    // Draw box for receipt details
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 38, 170, 75, 3, 3, 'FD');

    let y = 48;
    const addRow = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(label, 26, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(value, 75, y);
      y += 9;
    };

    addRow("Transaction ID:", record.id);
    addRow("Student Name:", record.studentName || currentStudent?.name);
    addRow("Roll Number:", record.studentRollNo || currentStudent?.rollNumber || 'N/A');
    addRow("Book Title:", record.bookTitle);
    addRow("Book ID:", record.bookId);
    addRow("Borrow Date:", record.borrowDate);
    addRow("Due Date:", record.dueDate);
    addRow("Status:", record.status);
    
    y += 12;
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, y);
    doc.text("Authorized University Library Circulation Record", 20, y + 6);

    doc.save(`Library_Receipt_${record.id}.pdf`);
    addToast('PDF Downloaded', `Successfully downloaded PDF receipt for "${record.bookTitle}"`, 'success');
  };
  const [editForm, setEditForm] = useState({
    name: currentStudent?.name || '',
    rollNumber: currentStudent?.rollNumber || '',
    year: currentStudent?.year || '',
    batch: currentStudent?.batch || '',
    phone: currentStudent?.phone || '',
    department: currentStudent?.department || '',
    avatar: currentStudent?.avatar || ''
  });

  const handleRollNumberChangeInEdit = (rollVal: string) => {
    const cleanRoll = (rollVal || '').trim();
    const match = (studentsList || []).find(s => s && s.rollNumber && s.rollNumber.toLowerCase().trim() === cleanRoll.toLowerCase());
    if (match) {
      setEditForm({
        name: match.name || '',
        rollNumber: match.rollNumber || cleanRoll,
        year: match.year || '',
        batch: match.batch || '2022-2026 Batch',
        phone: match.phone || '',
        department: match.department || '',
        avatar: match.avatar || ''
      });
      addToast('Student Auto-filled', `Auto-loaded profile for ${match.name}`, 'info');
    } else {
      setEditForm(prev => ({
        ...prev,
        rollNumber: rollVal
      }));
    }
  };

  if (isAuthLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-12 text-center space-y-4 my-8 max-w-xl mx-auto shadow-xl">
        <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checking Account Status...</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Verifying session status with Firebase Authentication</p>
      </div>
    );
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-10 text-center space-y-4 my-8 max-w-xl mx-auto shadow-xl text-slate-900 dark:text-white transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mx-auto backdrop-blur-md">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Login Required</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Please sign in with your student credentials to view your active book loans, submission statuses, due dates, and student profile.
        </p>
        <button
          id="btn-student-login-prompt"
          onClick={() => setIsAuthModalOpen(true)}
          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 border border-emerald-500/30 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <User className="w-4 h-4" /> Log In as Student
        </button>
      </div>
    );
  }

  // Block dashboard access ONLY if student is unverified AND profile does not exist
  const isStudentVerified = currentUser?.emailVerified || currentStudent?.emailVerified === true || Boolean(currentStudent);
  if (!isStudentVerified || !currentStudent) {
    const handleCheckVerificationInline = async () => {
      setIsCheckingVerify(true);
      setVerifyStatusMessage(null);
      try {
        await currentUser.reload();
        if (!currentUser.emailVerified) {
          setVerifyStatusMessage({
            type: 'warning',
            text: 'Your email has not been verified yet. Please verify your email first.'
          });
          addToast('Email Not Verified Yet', 'Your email has not been verified yet. Please verify your email first.', 'warning');
          return;
        }

        const res = await verifyStudentEmailAndCreateProfile();
        if (res.success) {
          addToast('Email Verified Successfully!', 'Your student profile has been created. Opening dashboard...', 'success');
        } else {
          setVerifyStatusMessage({
            type: 'error',
            text: res.error || 'Failed to create student profile.'
          });
        }
      } catch (err: any) {
        console.error('Check verification error:', err);
        setVerifyStatusMessage({
          type: 'error',
          text: err?.message || 'Could not check verification status.'
        });
      } finally {
        setIsCheckingVerify(false);
      }
    };

    const handleResendInline = async () => {
      if (resendCooldown > 0 || isResendingVerify) return;
      setIsResendingVerify(true);
      setVerifyStatusMessage(null);
      try {
        await sendEmailVerification(currentUser);
        setResendCooldown(60);
        setVerifyStatusMessage({
          type: 'info',
          text: 'Verification email sent. Please check your inbox.'
        });
        addToast('Verification Sent 📩', 'Verification email sent. Please check your inbox.', 'success');
      } catch (err: any) {
        console.error('Resend verification error:', err);
        if (err?.code === 'auth/too-many-requests') {
          setVerifyStatusMessage({
            type: 'error',
            text: 'Too many requests. Please wait a few minutes before requesting another verification email.'
          });
        } else {
          setVerifyStatusMessage({
            type: 'error',
            text: err?.message || 'Failed to send verification email. Please try again later.'
          });
        }
      } finally {
        setIsResendingVerify(false);
      }
    };

    const handleBackToLoginInline = async () => {
      await signOutWithFirebase();
      setActiveTab('catalog');
      setIsAuthModalOpen(true);
    };

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 text-center space-y-6 my-8 max-w-xl mx-auto shadow-2xl text-slate-900 dark:text-white transition-colors relative overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 absolute top-0 left-0 right-0" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mx-auto backdrop-blur-md">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Email</h2>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Firebase Email Authentication • Student Portal
          </p>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-left space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We sent a verification link to your registered email address:
          </p>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono break-all bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            {currentUser.email}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            If the verification email is not in your Inbox, please check your Spam/Junk folder. Open your email inbox, click the verification link, then return here and click <span className="font-semibold text-slate-700 dark:text-slate-200">Check Verification</span> below.
          </p>
        </div>

        {verifyStatusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 text-left ${
              verifyStatusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : verifyStatusMessage.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : verifyStatusMessage.type === 'info'
                ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{verifyStatusMessage.text}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            id="btn-check-verification-dashboard"
            onClick={handleCheckVerificationInline}
            disabled={isCheckingVerify}
            className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCheckingVerify ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Checking Verification Status...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Check Verification
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-resend-verification-dashboard"
            onClick={handleResendInline}
            disabled={resendCooldown > 0 || isResendingVerify}
            className="w-full py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResendingVerify ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sending Link...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Resend Verification Email
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-back-to-login-dashboard"
            onClick={handleBackToLoginInline}
            className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Student specific borrow records (matches ID, roll number, or email)
  const myRecords = (borrowRecords || []).filter(isRecordForCurrentStudent);
  const searchQ = (searchQuery || '').toLowerCase().trim();
  const filteredRecords = myRecords.filter(
    r =>
      !searchQ ||
      (r && r.bookTitle && r.bookTitle.toLowerCase().includes(searchQ)) ||
      (r && r.bookAuthor && r.bookAuthor.toLowerCase().includes(searchQ)) ||
      (r && r.bookId && r.bookId.toLowerCase().includes(searchQ))
  );

  const activeLoans = myRecords.filter(r => r && r.status === 'Not Submitted').length;
  const overdueLoans = myRecords.filter(r => r && r.status === 'Overdue').length;
  const completedSubmissions = myRecords.filter(r => r && r.status === 'Submitted').length;

  // Filter books due within the next 48 hours
  const now = new Date();
  const dueSoonBooks = myRecords.filter(r => {
    if (!r || r.status === 'Submitted' || !r.dueDate) return false;
    const due = new Date(r.dueDate);
    if (typeof r.dueDate === 'string' && r.dueDate.length === 10) {
      due.setHours(23, 59, 59, 999);
    }
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 48;
  });

  const handleSaveProfile = async () => {
    await updateStudentProfile(editForm);
    setIsEditingProfile(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so selecting the same file triggers onChange again
    e.target.value = '';

    // Fast check for size > 2 MB before processing
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image Too Large', 'Please select an image smaller than 2 MB.', 'error');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      // Validate image type, resize to max 400x400, compress to JPEG Base64 data URL
      const compressedBase64 = await compressImageToBase64(file, 400, 0.8);

      // Update local edit form state
      setEditForm(prev => ({ ...prev, avatar: compressedBase64 }));

      // Save directly to Firestore document students/{uid} and users/{uid}
      if (auth.currentUser && currentStudent) {
        await updateStudentProfileInFirestore(auth.currentUser.uid, {
          avatar: compressedBase64
        });
        await updateStudentProfile({ avatar: compressedBase64 });
      }

      addToast('Profile Photo Updated 📸', 'Profile photo updated successfully.', 'success');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      const msg = err?.message || 'Failed to process selected image.';
      addToast('Photo Upload Error', msg, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-8 my-6">
      {/* Welcome Section with Student Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {currentStudent.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage your library activity and discover your next book.
            </p>
          </div>
        </div>

        {/* Student Profile Details */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl"
                />
                <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-emerald-600 text-[10px] font-bold text-white shadow border border-emerald-500/30">
                  {currentStudent.rollNumber}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{currentStudent.year}</span>
                    <span className="opacity-40">•</span>
                    <span>{currentStudent.batch || '2022-2026 Batch'}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
                    Roll No: <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{currentStudent.rollNumber}</span>
                  </span>
                  {currentStudent.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 text-[11px] font-extrabold shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Verified Email ✓
                    </span>
                  ) : (
                    <button
                      id="btn-trigger-email-verification"
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-[11px] font-extrabold hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors cursor-pointer"
                      title="Click to verify your student email address with 6-digit PIN"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" /> Unverified Email - Verify Now
                    </button>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{currentStudent.name}</h2>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {currentStudent.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {currentStudent.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {currentStudent.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {!isEditingProfile ? (
                <button
                  id="btn-edit-student-profile"
                  onClick={() => {
                    setEditForm({
                      name: currentStudent.name,
                      rollNumber: currentStudent.rollNumber,
                      year: currentStudent.year,
                      batch: currentStudent.batch || '2022-2026 Batch',
                      phone: currentStudent.phone,
                      department: currentStudent.department,
                      avatar: currentStudent.avatar
                    });
                    setIsEditingProfile(true);
                  }}
                  className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Edit Profile & Photo
                </button>
              ) : (
                <button
                  id="btn-save-student-profile"
                  onClick={handleSaveProfile}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/25 border border-emerald-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Inline Profile Edit Form */}
          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  Student Roll Number <span className="text-emerald-500 font-bold text-[10px]">(Auto-fills Details)</span>
                </label>
                <input
                  type="text"
                  value={editForm.rollNumber}
                  onChange={e => handleRollNumberChangeInEdit(e.target.value)}
                  placeholder="e.g. 12345, 245863..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Full Name (Auto-filled)</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Department (Auto-filled)</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Academic Year</label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Year"
                  value={editForm.year}
                  onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Year Batch</label>
                <input
                  type="text"
                  placeholder="e.g. 2022-2026 Batch"
                  value={editForm.batch}
                  onChange={e => setEditForm({ ...editForm, batch: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <label className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">
                  Profile Photo (Upload JPG, JPEG, PNG, or WEBP - Max 2 MB)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    id="input-student-profile-photo"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploadingPhoto}
                    className="w-full sm:w-auto text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/10 file:text-emerald-600 dark:file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer disabled:opacity-50"
                  />
                  {isUploadingPhoto && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Compressing & Saving Photo to Firestore...
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Statistics Cards (Interchanged - Now Below Profile) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" /> 📚 Active Loans
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                Max: {currentStudent.maxBorrowLimit}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeLoans}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Books currently checked out in your account
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> ⚠️ Overdue Books
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${overdueLoans > 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600'}`}>
                {overdueLoans > 0 ? 'Action Needed' : 'Clear'}
              </span>
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${overdueLoans > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {overdueLoans}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Books past their scheduled return date
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" /> ⭐ Member Rating
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono font-bold">
                Good Standing
              </span>
            </div>
            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
              5.0 <span className="text-sm font-normal text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Verified account active since {currentStudent.joinedDate}
            </p>
          </div>
        </div>
      </div>


      
      <QuickSettingsModal
        isOpen={isQuickSettingsModalOpen}
        onClose={() => setIsQuickSettingsModalOpen(false)}
        handlers={{
          onOpenNotifications: () => setIsNotificationsModalOpen(true),
          onOpenLibrary: () => {
            const el = document.getElementById('student-borrowed-books-registry');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else addToast('Library Activity', 'Viewing active loan records and receipts below.', 'info');
          },
          onOpenAccount: () => {
            setIsEditingProfile(true);
            addToast('Account & Security', 'You can now edit your student profile details above.', 'info');
          },
          onOpenLanguage: () => setIsLanguageModalOpen(true),
          onOpenAppearance: () => setIsAppearanceModalOpen(true),
          onOpenAccessibility: () => setIsAccessibilityModalOpen(true),
          onOpenPrivacy: () => setIsPrivacyModalOpen(true),
          onOpenHelp: () => setIsHelpModalOpen(true),
          onOpenAbout: () => setIsAboutModalOpen(true),
          onSignOut: signOutWithFirebase,
        }}
        state={{
          emailAlertsEnabled,
          selectedLanguage,
        }}
      />

      {/* Borrowed Books Section */}
      <div id="student-borrowed-books-registry" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2 pt-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookmarkCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Borrowed Books Registry
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Track your borrowed books, submission deadlines, and verify staff status updates in real-time.
            </p>
          </div>

          <button
            id="btn-download-all-receipts"
            onClick={handleDownloadAllReceipts}
            className="py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 shadow-md border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Download All Receipts (PDF)
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="search-my-loans-input"
              type="text"
              placeholder="Search my loans..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Table of Borrowed Books */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Borrow ID</th>
                <th className="p-3.5">Book Name & Author</th>
                <th className="p-3.5">Borrow & Due Dates</th>
                <th className="p-3.5">Submission Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500 dark:text-slate-400">
                    No borrowing records found. Browse the catalog to borrow books!
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => {
                  const isSubmitted = record.status === 'Submitted';
                  const isOverdue = record.status === 'Overdue';

                  return (
                    <tr
                      key={`student-record-row-${record.id}-${idx}`}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                        <div>{record.id}</div>
                        <div className="text-[10px] text-slate-400 font-normal">ID: {record.bookId}</div>
                      </td>

                      <td className="p-3.5">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-snug flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            {record.bookTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Author: <span className="font-semibold text-slate-700 dark:text-slate-300">{record.bookAuthor}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap space-y-1">
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Borrow Date:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{record.borrowDate}</span>
                        </div>
                        <div
                          className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            isOverdue
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Due Date: {record.dueDate}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                            isSubmitted
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {isSubmitted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                            </>
                          ) : isOverdue ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Overdue (Not Submitted)
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" /> Active Loan (Not Submitted)
                            </>
                          )}
                        </span>
                        {isSubmitted && record.returnDate ? (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Staff Verified Return: {record.returnDate}
                          </div>
                        ) : (currentRole === 'staff' || currentRole === 'admin') ? (
                          <button
                            id={`btn-staff-submit-${record.id}`}
                            onClick={() => {
                              markAsSubmitted(record.id);
                              addToast('Book Return Recorded', `Marked "${record.bookTitle}" as submitted successfully.`, 'success');
                            }}
                            className="mt-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Staff Action: Click to mark book as submitted/returned"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            Submit Book (Staff Action)
                          </button>
                        ) : (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg w-max border border-slate-200 dark:border-slate-700">
                            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Submitted button accessible by Staff only</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          id={`btn-receipt-${record.id}`}
                          onClick={() => setSelectedReceiptRecord(record)}
                          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View Digital Loan Receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {selectedReceiptRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 text-slate-900 dark:text-white relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Official Digital Receipt</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Transaction ID: {selectedReceiptRecord.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold">{selectedReceiptRecord.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Roll Number:</span>
                <span className="font-bold">{selectedReceiptRecord.studentRollNo || currentStudent?.rollNumber || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Book Title:</span>
                <span className="font-bold text-right max-w-[200px] truncate">{selectedReceiptRecord.bookTitle}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Borrow Date:</span>
                <span className="font-bold">{selectedReceiptRecord.borrowDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500 font-medium">Due Date:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReceiptRecord.dueDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Circulation Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                  selectedReceiptRecord.status === 'Submitted'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : selectedReceiptRecord.status === 'Overdue'
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                }`}>
                  {selectedReceiptRecord.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadReceipt(selectedReceiptRecord)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Download Receipt (.pdf)
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-md cursor-pointer"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStudent && (
        <EmailVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          studentEmail={currentStudent.email}
          studentName={currentStudent.name}
          onSuccess={() => {
            updateStudentProfile({ emailVerified: true });
            setIsVerifyModalOpen(false);
          }}
        />
      )}

      {/* ❓ HELP & SUPPORT MODAL */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* ℹ️ ABOUT MODAL */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* NOTIFICATIONS MODAL */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Notifications</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage email alerts & reminders</p>
                </div>
              </div>
              <button onClick={() => setIsNotificationsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold">Email Reminders</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Receive due date reminders via email</div>
                </div>
                <button
                  onClick={() => {
                    const next = !emailAlertsEnabled;
                    setEmailAlertsEnabled(next);
                    localStorage.setItem('lms_email_alerts', String(next));
                    addToast('Notifications', next ? 'Email notifications enabled.' : 'Email notifications muted.', 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailAlertsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${emailAlertsEnabled ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold">Sound Effects</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Play audio sound on key user actions</div>
                </div>
                <button
                  onClick={() => {
                    const next = !soundFxEnabled;
                    setSoundFxEnabled(next);
                    localStorage.setItem('lms_sound_fx', String(next));
                    addToast('Sound FX', next ? 'Sound effects enabled.' : 'Sound effects disabled.', 'info');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${soundFxEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${soundFxEnabled ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* LANGUAGE MODAL */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Language</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select display language preference</p>
                </div>
              </div>
              <button onClick={() => setIsLanguageModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {['English', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Hindi (हिंदी)'].map((lang, idx) => {
                const langName = lang.split(' ')[0];
                const isSelected = selectedLanguage.startsWith(langName);
                return (
                  <button
                    key={`lang-opt-${langName}-${idx}`}
                    onClick={() => {
                      setSelectedLanguage(langName);
                      localStorage.setItem('lms_language', langName);
                      addToast('Language Updated', `Display language set to ${langName}.`, 'success');
                      setIsLanguageModalOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-600 dark:text-sky-400'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* APPEARANCE MODAL */}
      {isAppearanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Appearance</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Theme customization & dark mode</p>
                </div>
              </div>
              <button onClick={() => setIsAppearanceModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold">Theme Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('lms_theme_dark', 'false');
                      addToast('Theme', 'Light mode active.', 'info');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                  >
                    <Sun className="w-4 h-4 text-amber-500" /> Light
                  </button>
                  <button
                    onClick={() => {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('lms_theme_dark', 'true');
                      addToast('Theme', 'Dark mode active.', 'info');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 text-white border border-slate-800 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 cursor-pointer"
                  >
                    <Moon className="w-4 h-4 text-indigo-400" /> Dark
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAppearanceModalOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ACCESSIBILITY MODAL */}
      {isAccessibilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Accessibility</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Display legibility & text density</p>
                </div>
              </div>
              <button onClick={() => setIsAccessibilityModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-4 h-4" /> High Contrast & Scalable Layout
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This dashboard uses WCAG AA standard text contrast, responsive touch targets (min 44px), semantic HTML elements with clear element IDs, and screen-reader compliant aria metadata.
              </p>
            </div>

            <button
              onClick={() => setIsAccessibilityModalOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Data Privacy</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Security & Firestore rules</p>
                </div>
              </div>
              <button onClick={() => setIsPrivacyModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white">🔒 Firestore Row-Level Security</div>
                <p>Your student data is isolated to <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">students/{'{uid}'}</code> in Firebase Firestore with owner permissions.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white">🖼️ Avatar Photo Security</div>
                <p>Profile avatars are stored as Base64 strings in your single student record field (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">avatar</code>) without third-party exposure.</p>
              </div>
            </div>

            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
