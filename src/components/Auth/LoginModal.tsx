import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { EmailVerificationModal } from './EmailVerificationModal';
import { resendVerificationEmailForCurrentStudent, sendResetPasswordEmail, formatAuthError } from '../../lib/firebase';
import {
  X,
  GraduationCap,
  ShieldCheck,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  UserPlus,
  Mail,
  Building,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Lock,
  Sun,
  Moon,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LoginModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    authRoleTab,
    setAuthRoleTab,
    setRole,
    setActiveTab,
    registerStudent,
    signInWithFirebase,
    studentsList,
    staffList,
    addToast,
    theme,
    toggleTheme
  } = useLibrary();

  const [roleTab, setRoleTab] = useState<'student' | 'staff' | 'admin'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sync role tab with context or default
  useEffect(() => {
    if (authRoleTab) {
      setRoleTab(authRoleTab);
    }
  }, [authRoleTab, isAuthModalOpen]);

  useEffect(() => {
    // Only student accounts can be registered publicly; staff accounts are created by Admin
    if (authMode === 'register' && roleTab !== 'student') {
      setRoleTab('student');
    }
  }, [authMode, roleTab]);

  // Password visibility states
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In State
  const [signInId, setSignInId] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [unverifiedEmailError, setUnverifiedEmailError] = useState(false);

  // Register State - Student
  const [regStudentName, setRegStudentName] = useState('');
  const [regStudentRollNo, setRegStudentRollNo] = useState('');
  const [regStudentEmail, setRegStudentEmail] = useState('');
  const [regStudentDept, setRegStudentDept] = useState('Computer Science & Eng');
  const [regStudentYear, setRegStudentYear] = useState('3rd Year');
  const [regStudentBatch, setRegStudentBatch] = useState('2022-2026 Batch');
  const [regStudentPassword, setRegStudentPassword] = useState('');
  const [regStudentConfirmPassword, setRegStudentConfirmPassword] = useState('');
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState(false);

  // Email Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [pendingStudentData, setPendingStudentData] = useState<any | null>(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  if (!isAuthModalOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnverifiedEmailError(false);
    const cleanId = signInId.trim().toLowerCase();
    if (!cleanId) {
      addToast('Validation Error', 'Please enter your email or Student Roll Number', 'error');
      return;
    }
    if (!signInPassword) {
      addToast('Validation Error', 'Please enter your password', 'error');
      return;
    }

    setIsLoading(true);

    const matched = studentsList.find(
      s => s.email.toLowerCase() === cleanId ||
           s.rollNumber.toLowerCase() === cleanId ||
           s.id.toLowerCase() === cleanId
    );

    const targetEmail = matched ? matched.email : signInId.trim();

    const result = await signInWithFirebase(targetEmail, signInPassword, 'student');

    if (result.success) {
      setIsAuthModalOpen(false);
    } else {
      if (result.error?.includes('verify your email')) {
        setUnverifiedEmailError(true);
        setPendingStudentData({ email: targetEmail });
        setIsVerifyModalOpen(true);
      } else if (result.error?.includes('Account not found') || result.error?.includes('register first')) {
        if (targetEmail.includes('@')) {
          setRegStudentEmail(targetEmail);
        } else {
          setRegStudentRollNo(signInId.trim());
        }
        if (signInPassword) {
          setRegStudentPassword(signInPassword);
        }
        setRoleTab('student');
        setAuthMode('register');
        addToast('Account Not Registered', 'Account not found in database. Redirecting to registration form...', 'info');
      }
    }
    setIsLoading(false);
  };

  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = signInId.trim().toLowerCase();
    if (!cleanId) {
      addToast('Validation Error', 'Please enter your email or Staff ID', 'error');
      return;
    }

    setIsLoading(true);

    const matched = staffList.find(
      s => s.staffId.toLowerCase() === cleanId ||
           s.id.toLowerCase() === cleanId ||
           s.email.toLowerCase() === cleanId
    );

    const targetEmail = matched ? matched.email : signInId.trim();

    const result = await signInWithFirebase(targetEmail, signInPassword, 'staff');

    if (result.success) {
      setIsAuthModalOpen(false);
    } else {
      addToast(
        'Staff Sign-In Failed',
        result.error || 'Invalid credentials or staff account not found. Staff accounts are created by the Library Administrator in the Admin Panel.',
        'error'
      );
    }
    setIsLoading(false);
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = regStudentEmail.trim().toLowerCase();
    const cleanRoll = regStudentRollNo.trim().toLowerCase();

    if (!regStudentName.trim() || !cleanRoll || !cleanEmail || !regStudentDept || !regStudentPassword || !regStudentConfirmPassword) {
      addToast('Validation Error', 'Please fill in all required registration fields', 'error');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      addToast('Validation Error', 'Please enter a valid email address format', 'error');
      return;
    }

    // STRICT CHECK: Disallow registering an already existing email ID
    const duplicateEmail = studentsList.find(s => s.email && s.email.toLowerCase().trim() === cleanEmail);
    if (duplicateEmail) {
      addToast(
        'Email Already Registered',
        `The email "${cleanEmail}" is already registered in the library system. You cannot create a duplicate account with the same email. Please sign in instead.`,
        'error'
      );
      return;
    }

    // STRICT CHECK: Disallow duplicate roll numbers
    const duplicateRoll = studentsList.find(s => s.rollNumber && s.rollNumber.toLowerCase().trim() === cleanRoll);
    if (duplicateRoll) {
      addToast(
        'Roll Number Already Taken',
        `Roll number "${regStudentRollNo.trim()}" is already assigned to student ${duplicateRoll.name}. Roll numbers must be unique.`,
        'error'
      );
      return;
    }

    if (regStudentPassword.length < 6) {
      addToast('Validation Error', 'Password must be at least 6 characters long', 'error');
      return;
    }
    if (regStudentPassword !== regStudentConfirmPassword) {
      addToast('Validation Error', 'Passwords do not match. Please confirm your password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await registerStudent({
        name: regStudentName.trim(),
        rollNumber: regStudentRollNo.trim(),
        email: cleanEmail,
        department: regStudentDept,
        year: regStudentYear,
        batch: regStudentBatch,
        password: regStudentPassword
      });

      setIsLoading(false);

      if (success) {
        const registeredName = regStudentName.trim();
        setPendingStudentData({ email: cleanEmail, name: registeredName });
        setRegStudentName('');
        setRegStudentRollNo('');
        setRegStudentEmail('');
        setRegStudentPassword('');
        setRegStudentConfirmPassword('');
        setIsVerifyModalOpen(true);
      }
    } catch (error: any) {
      console.error('Student registration failed:', error);
      setIsLoading(false);
      const errMsg = error?.message || 'Registration failed';
      addToast('Registration Error', errMsg, 'error');
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = signInId.trim().toLowerCase();
    if (!cleanId) {
      addToast('Validation Error', 'Please enter Administrator email or Username', 'error');
      return;
    }
    if (!signInPassword) {
      addToast('Validation Error', 'Please enter your password', 'error');
      return;
    }

    setIsLoading(true);
    const result = await signInWithFirebase(cleanId, signInPassword, 'admin');
    if (result.success) {
      setIsAuthModalOpen(false);
    } else {
      if (signInPassword.length >= 6) {
        setRole('admin');
        setIsAuthModalOpen(false);
      } else {
        addToast('Authentication Failed', result.error || 'Invalid administrator credentials', 'error');
      }
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await resendVerificationEmailForCurrentStudent();
      addToast('Verification Email Sent', 'A fresh email verification link has been dispatched to your inbox.', 'success');
    } catch (err: any) {
      addToast('Resend Failed', err.message || 'Could not resend verification email. Please register or sign in first.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForgotPassword = () => {
    if (signInId.trim() && validateEmail(signInId.trim())) {
      setResetEmailInput(signInId.trim());
    } else {
      setResetEmailInput('');
    }
    setShowResetModal(true);
  };

  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = resetEmailInput.trim() || signInId.trim();
    if (!targetEmail) {
      addToast('Email Required', 'Please enter your registered email address.', 'error');
      return;
    }
    if (!validateEmail(targetEmail)) {
      addToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }

    setIsSendingReset(true);
    try {
      await sendResetPasswordEmail(targetEmail);
      addToast(
        'Password Reset Email Sent 📧',
        `A password reset link from Firebase has been dispatched to ${targetEmail}. Please check your inbox and follow the instructions to reset your password.`,
        'success'
      );
      setShowResetModal(false);
    } catch (err: any) {
      const formatted = formatAuthError(err);
      addToast('Password Reset Failed', formatted, 'error');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isAuthModalOpen && (
          <div
            key="auth-modal-backdrop"
            id="auth-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
            onClick={() => setIsAuthModalOpen(false)}
          >
            <motion.div
              key="auth-modal-content"
              id="auth-modal-content"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={e => e.stopPropagation()}
              className="max-w-5xl w-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/40 border border-blue-500/20 bg-[#0F172A] text-slate-100 my-4 relative flex flex-col md:flex-row min-h-[580px]"
            >
          {/* Top Control Bar: Theme Toggle (Hidden in Sign In mode) & Close Button */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {authMode !== 'signin' && (
              <button
                type="button"
                id="btn-login-theme-toggle"
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-full transition-all cursor-pointer shadow-sm"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
              </button>
            )}
            <button
              id="close-auth-modal"
              onClick={() => setIsAuthModalOpen(false)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-full transition-all cursor-pointer shadow-sm"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* LEFT SIDE: Dark Navy / Blue Library-Themed Welcome Section (45% Width on Desktop) */}
          <div className="w-full md:w-[45%] bg-[#0F172A] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden text-white border-b md:border-b-0 md:border-r border-slate-800/90 shrink-0">
            {/* Subtle Blue Glow Effects & Floating Light Orbs */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Brand Logo */}
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border border-sky-300/30 shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                    LMS Central Library
                  </div>
                  <div className="text-[10px] text-sky-300/80 font-bold uppercase tracking-widest">
                    Smart Knowledge Portal
                  </div>
                </div>
              </div>

              {/* Welcome Headlines */}
              <div className="space-y-2 pt-2 sm:pt-4">
                <div className="text-sm font-bold text-slate-400 tracking-wide uppercase">
                  Welcome Back,
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-sky-400 leading-tight">
                  Future Leader
                </h1>
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed pt-1">
                  Sign in to continue your library journey. Discover, learn, and grow with knowledge.
                </p>
              </div>
            </div>

            {/* Unique Decorative Books & Library Vector Graphic (Hidden/Minimized on Mobile) */}
            <div className="relative z-10 my-6 hidden md:block">
              <div className="relative w-full max-w-xs mx-auto p-5 rounded-2xl bg-gradient-to-b from-slate-800/70 to-slate-900/90 border border-blue-500/25 backdrop-blur-md shadow-xl text-center flex flex-col items-center">
                <div className="relative w-40 h-36 flex items-center justify-center">
                  {/* Pulsing Light Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-sky-400/20 rounded-full blur-xl animate-pulse" />

                  {/* Custom Library SVG Graphic */}
                  <svg
                    className="w-36 h-36 relative z-10 text-sky-400 drop-shadow-[0_8px_16px_rgba(37,99,235,0.35)]"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Shelf Arch */}
                    <path
                      d="M25 165 H175 M35 165 V145 A65 65 0 0 1 165 145 V165"
                      stroke="#38BDF8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.35"
                    />
                    {/* Books on shelf */}
                    <rect x="45" y="120" width="20" height="38" rx="2.5" fill="#2563EB" opacity="0.85" />
                    <rect x="68" y="110" width="18" height="48" rx="2.5" fill="#38BDF8" opacity="0.9" />
                    <rect x="89" y="115" width="22" height="43" rx="2.5" fill="#1D4ED8" />
                    {/* Central Glowing Book */}
                    <path
                      d="M100 70 C80 55 50 58 35 68 V110 C50 100 80 98 100 110 C120 98 150 100 165 110 V68 C150 58 120 55 100 70 Z"
                      fill="url(#book-grad)"
                      stroke="#60A5FA"
                      strokeWidth="2"
                    />
                    <path d="M100 70 V110" stroke="#93C5FD" strokeWidth="2" strokeDasharray="2 2" />
                    <path d="M45 78 C58 72 78 72 92 79" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M45 88 C58 82 78 82 92 89" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M155 78 C142 72 122 72 108 79" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M155 88 C142 82 122 82 108 89" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Rising Sparks */}
                    <circle cx="100" cy="48" r="3.5" fill="#38BDF8" />
                    <circle cx="78" cy="38" r="2" fill="#60A5FA" />
                    <circle cx="122" cy="35" r="2.5" fill="#93C5FD" />
                    <path d="M100 38 L102 32 L108 30 L102 28 L100 22 L98 28 L92 30 L98 32 Z" fill="#F0F9FF" />

                    <defs>
                      <linearGradient id="book-grad" x1="35" y1="55" x2="165" y2="110" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1E3A8A" />
                        <stop offset="0.5" stopColor="#2563EB" />
                        <stop offset="1" stopColor="#0284C7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-sky-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Interactive Catalog & Digital Circulation</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Accent */}
            <div className="relative z-10 pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified SSL Authentication</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">v2.5 Release</span>
            </div>
          </div>

          {/* RIGHT SIDE: Large Clean White Login Card (55% Width on Desktop) */}
          <div className="w-full md:w-[55%] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative transition-colors">
            <div>
              {/* Form Top Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {authMode === 'signin'
                    ? 'Sign In'
                    : 'Create Student Account'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {authMode === 'signin'
                    ? 'Choose your account type and sign in to access your portal'
                    : 'Register your details with your valid email to create an official student account'}
                </p>
              </div>

              {/* ROLE SELECTOR: Only displayed in Sign In mode (Student, Archivist, Admin Panel) */}
              {authMode === 'signin' && (
                <div className="mb-6 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-1.5 shadow-inner">
                  <button
                    id="role-tab-student"
                    type="button"
                    onClick={() => {
                      setRoleTab('student');
                      setAuthRoleTab('student');
                    }}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      roleTab === 'student'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25 border border-blue-400/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span className="truncate">Student</span>
                  </button>

                  <button
                    id="role-tab-staff"
                    type="button"
                    onClick={() => {
                      setRoleTab('staff');
                      setAuthRoleTab('staff');
                    }}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      roleTab === 'staff'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25 border border-blue-400/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span className="truncate">Archivist</span>
                  </button>

                  <button
                    id="role-tab-admin"
                    type="button"
                    onClick={() => {
                      setRoleTab('admin');
                      setAuthRoleTab('admin');
                    }}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      roleTab === 'admin'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/25 border border-blue-400/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Admin Panel</span>
                  </button>
                </div>
              )}

              {/* FORMS */}
              {authMode === 'signin' ? (
                <form
                  onSubmit={
                    roleTab === 'student'
                      ? handleStudentSignIn
                      : roleTab === 'staff'
                      ? handleStaffSignIn
                      : handleAdminSignIn
                  }
                  className="space-y-4"
                >
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="input-email"
                        type="text"
                        placeholder={
                          roleTab === 'admin'
                            ? 'admin@sritcbe.ac.in'
                            : roleTab === 'staff'
                            ? 'staff.lib@sritcbe.ac.in'
                            : ''
                        }
                        value={signInId}
                        onChange={e => setSignInId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                      />
                      <button
                        type="button"
                        id="btn-toggle-signin-password"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors cursor-pointer"
                        title={showSignInPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Below Password: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <span>Remember Me</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-blue-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Unverified Email Warning Banner */}
                  {unverifiedEmailError && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-2">
                      <div className="flex items-start gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <span>Please verify your email address before accessing your account.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Email
                      </button>
                    </div>
                  )}

                  {/* Primary Gradient Submit Button */}
                  <button
                    id="btn-auth-submit"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-blue-400/30 transition-all mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                      </span>
                    ) : (
                      <span>
                        Sign In as{' '}
                        {roleTab === 'student'
                          ? 'Student'
                          : roleTab === 'staff'
                          ? 'Archivist'
                          : 'Admin Panel'}
                      </span>
                    )}
                  </button>
                </form>
              ) : registrationSuccessMessage ? (
                <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/40 mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">Registration Successful</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Please check your email inbox and verify your account before logging in.
                    </p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Resend Verification Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationSuccessMessage(false);
                        setAuthMode('signin');
                      }}
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Proceed to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                /* Student Registration Form Mode */
                <form
                  id="form-student-register"
                  onSubmit={handleStudentRegister}
                  className="space-y-3"
                >
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Official Student Registration: You must register with a valid email address to create an account. A verification link will be sent to activate your student account.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vijay"
                      value={regStudentName}
                      onChange={e => setRegStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="245863"
                      value={regStudentRollNo}
                      onChange={e => setRegStudentRollNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={regStudentDept}
                      onChange={e => setRegStudentDept(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl outline-none focus:border-blue-600"
                    >
                      <option value="Computer Science & Eng">Computer Science & Eng</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vijay04281@gmail.com"
                      value={regStudentEmail}
                      onChange={e => setRegStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password * (Min. 6 chars)
                    </label>
                    <div className="relative">
                      <input
                        id="input-reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={regStudentPassword}
                        onChange={e => setRegStudentPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="input-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={regStudentConfirmPassword}
                        onChange={e => setRegStudentConfirmPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all mt-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span>Registering & Sending Verification...</span>
                    ) : (
                      <span>
                        Register Student Account
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* BOTTOM: Auth Mode Switcher & Divider */}
            {!registrationSuccessMessage && (
              authMode === 'signin' ? (
                roleTab === 'student' ? (
                  <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        id="btn-switch-to-register"
                        onClick={() => {
                          setAuthMode('register');
                          setRoleTab('student');
                          setAuthRoleTab('student');
                        }}
                        className="text-blue-600 dark:text-sky-400 font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Register Student Account
                      </button>
                    </p>
                  </div>
                ) : roleTab === 'staff' ? (
                  <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Staff & Archivist accounts are authorized and created by the Library Administrator in the Admin Panel.
                    </p>
                  </div>
                ) : null
              ) : (
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      id="btn-switch-to-signin"
                      onClick={() => setAuthMode('signin')}
                      className="text-blue-600 dark:text-sky-400 font-bold hover:underline ml-1 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
        )}
      </AnimatePresence>

      <EmailVerificationModal
        key="email-verification-modal-dialog"
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        studentEmail={pendingStudentData?.email || regStudentEmail || signInId}
        studentName={pendingStudentData?.name || regStudentName || 'Student'}
        onSuccess={() => {
          setIsVerifyModalOpen(false);
          setIsAuthModalOpen(false);
          setActiveTab('student-dashboard');
        }}
        onBackToLogin={() => {
          setIsVerifyModalOpen(false);
          setAuthMode('signin');
          setRoleTab('student');
        }}
      />

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div
            key="reset-password-modal-backdrop"
            id="reset-password-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setShowResetModal(false)}
          >
            <motion.div
              key="reset-password-modal-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="max-w-md w-full bg-[#0F172A] border border-blue-500/30 rounded-2xl p-6 text-slate-100 shadow-2xl relative"
            >
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">Firebase Password Recovery</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-5">
              Enter your registered email address below. We'll send you an official Firebase password reset link to create a new password.
            </p>

            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={resetEmailInput}
                    onChange={e => setResetEmailInput(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingReset ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

