import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { HelpSupportModal } from './HelpSupportModal';
import { AboutModal } from './AboutModal';
import {
  BookOpen,
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  BookCheck,
  LayoutDashboard,
  Layers,
  Sparkles,
  BookMarked,
  Bell,
  AlertTriangle,
  Shield,
  Settings,
  BellRing,
  Volume2,
  VolumeX,
  Sliders,
  UserCog,
  HelpCircle,
  Info,
  Globe,
  Palette,
  Eye,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentStudent,
    currentStaff,
    borrowRecords,
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    themePalette,
    setThemePalette,
    setRole,
    setIsAuthModalOpen,
    openAuthModal,
    signOutWithFirebase,
    filters,
    setFilters
  } = useLibrary();

  const dueSoonBooks = useMemo(() => {
    if (currentRole !== 'student' || !currentStudent) return [];
    const myRecords = (borrowRecords || []).filter(r => r && (r.studentId === currentStudent.id || (r.studentRollNo && currentStudent.rollNumber && r.studentRollNo.toLowerCase().trim() === currentStudent.rollNumber.toLowerCase().trim())));
    return myRecords.filter(r => {
      if (!r || r.status === 'Submitted' || !r.dueDate) return false;
      const due = new Date(r.dueDate);
      if (typeof r.dueDate === 'string' && r.dueDate.length === 10) {
        due.setHours(23, 59, 59, 999);
      }
      const diffMs = due.getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours <= 48;
    });
  }, [borrowRecords, currentRole, currentStudent]);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavHelpOpen, setIsNavHelpOpen] = useState(false);
  const [isNavAboutOpen, setIsNavAboutOpen] = useState(false);
  const [isNavNotificationsOpen, setIsNavNotificationsOpen] = useState(false);
  const [isNavAccountOpen, setIsNavAccountOpen] = useState(false);
  const [isNavLanguageOpen, setIsNavLanguageOpen] = useState(false);
  const [isNavAppearanceOpen, setIsNavAppearanceOpen] = useState(false);
  const [isNavAccessibilityOpen, setIsNavAccessibilityOpen] = useState(false);
  const [isNavPrivacyOpen, setIsNavPrivacyOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('lms_language') || 'English';
  });

  // Profile quick settings states
  const [emailAlerts, setEmailAlerts] = useState(() => {
    return localStorage.getItem('lms_setting_email_alerts') !== 'false';
  });
  const [soundEffects, setSoundEffects] = useState(() => {
    return localStorage.getItem('lms_setting_sound_effects') === 'true';
  });

  const toggleEmailAlerts = () => {
    const val = !emailAlerts;
    setEmailAlerts(val);
    localStorage.setItem('lms_setting_email_alerts', String(val));
  };

  const toggleSoundEffects = () => {
    const val = !soundEffects;
    setSoundEffects(val);
    localStorage.setItem('lms_setting_sound_effects', String(val));
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: 'catalog' | 'student-dashboard' | 'staff-dashboard' | 'admin-dashboard' | 'devops-panel') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const displayName = currentRole === 'student'
    ? (currentStudent?.name || 'Vijay')
    : currentRole === 'staff'
    ? (currentStaff?.name || 'Dr. Vance')
    : currentRole === 'admin'
    ? 'System Administrator'
    : 'Guest User';

  const displayEmail = currentRole === 'student'
    ? (currentStudent?.email || 'vijay04281@gmail.com')
    : currentRole === 'staff'
    ? (currentStaff?.email || 'r.vance@university.edu')
    : currentRole === 'admin'
    ? 'admin@sritcbe.ac.in'
    : 'Sign in to access dashboard';

  const displayPhoto = currentRole === 'student'
    ? (currentStudent?.avatar || currentStudent?.photoURL || currentStudent?.photoUrl)
    : currentRole === 'staff'
    ? (currentStaff?.avatar || currentStaff?.photoURL || currentStaff?.photoUrl)
    : null;

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-[#0f172a] text-white border-b border-slate-800/80 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="nav-brand-logo"
            onClick={() => handleNavClick('catalog')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight flex items-center gap-1 text-white">
                Alpha <span className="text-sky-400">Library</span>
              </span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                MANAGEMENT SYSTEM
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60 backdrop-blur-md">
          <button
            id="nav-tab-home"
            onClick={() => handleNavClick('catalog')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Catalog
          </button>

          {currentRole === 'student' && (
            <button
              id="nav-tab-student-dashboard"
              onClick={() => handleNavClick('student-dashboard')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'student-dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              My Student Dashboard
            </button>
          )}

          {currentRole === 'staff' && (
            <button
              id="nav-tab-staff-dashboard"
              onClick={() => handleNavClick('staff-dashboard')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'staff-dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Staff Portal
            </button>
          )}

          {/* Admin Panel Tab */}
          {currentRole === 'admin' && (
            <button
              id="nav-tab-admin-dashboard"
              onClick={() => handleNavClick('admin-dashboard')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border cursor-pointer ${
                activeTab === 'admin-dashboard'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Admin Control
            </button>
          )}
        </nav>

        {/* Right Actions: Notifications, Quick Theme Toggle & User Profile Circle */}
        <div className="flex items-center gap-2.5 shrink-0 relative">
          {/* Due Soon Notification Bell Button (Student Only) */}
          {currentRole === 'student' && (
            <div className="relative" ref={notificationRef}>
              <button
                id="btn-navbar-notifications"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center border relative ${
                  dueSoonBooks.length > 0
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
                title={dueSoonBooks.length > 0 ? `${dueSoonBooks.length} book(s) due within 48 hours!` : 'No urgent due warnings'}
              >
                <Bell className="w-4 h-4" />
                {dueSoonBooks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                    {dueSoonBooks.length}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-100 z-50 text-left"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Due Date Warnings ({dueSoonBooks.length})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Urgent
                      </span>
                    </div>

                    {dueSoonBooks.length > 0 ? (
                      <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {dueSoonBooks.map((b, idx) => (
                          <div key={`nav-due-book-${b.id}-${idx}`} className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                            <div className="font-bold text-white truncate">{b.bookTitle}</div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Due: <strong className="text-rose-400 font-mono">{b.dueDate}</strong></span>
                              <span className="text-rose-400 font-semibold">&lt; 48 hrs remaining</span>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            handleNavClick('student-dashboard');
                            setIsNotificationOpen(false);
                          }}
                          className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center block cursor-pointer"
                        >
                          View in Student Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        All active borrowed books are safely within their due dates!
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}



          {currentRole !== 'guest' ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="btn-user-avatar"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md hover:ring-2 hover:ring-sky-400 transition-all cursor-pointer overflow-hidden shrink-0 border border-slate-700"
              >
                {displayPhoto ? (
                  <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </button>

              {/* Profile Popover Card (Quick Settings & Support Menu) */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-72 max-h-[82vh] overflow-y-auto bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-800 text-slate-100 z-50 text-center custom-scrollbar"
                  >
                    {/* User Avatar Circle */}
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-2 shadow-md overflow-hidden shrink-0 border border-slate-700">
                      {displayPhoto ? (
                        <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>

                    {/* Name & Email */}
                    <h3 className="text-base font-bold text-white">{displayName}</h3>
                    <p className="text-xs text-slate-400 truncate">{displayEmail}</p>

                    {/* Account Badge */}
                    <div className="mt-1.5">
                      <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                        currentRole === 'admin'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-sky-300 border-blue-500/30'
                      }`}>
                        {currentRole === 'admin' ? 'System Administrator' : currentRole === 'staff' ? 'Library Staff' : 'Student Account'}
                      </span>
                    </div>

                    {/* View Dashboard Button */}
                    <button
                      id="btn-view-dashboard"
                      onClick={() => {
                        handleNavClick(currentRole === 'admin' ? 'admin-dashboard' : currentRole === 'staff' ? 'staff-dashboard' : 'student-dashboard');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full mt-3 py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      View Dashboard
                    </button>

                    {/* QUICK SETTINGS Section */}
                    <div className="mt-4 pt-3 border-t border-slate-800 text-left">
                      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Settings className="w-3 h-3 text-sky-400" />
                          QUICK SETTINGS
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-medium text-slate-300">
                        {/* Settings Button */}
                        <button
                          id="dropdown-setting-settings"
                          onClick={() => {
                            setActiveTab('settings');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full py-2 px-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 font-semibold text-slate-200">
                            <Settings className="w-3.5 h-3.5 text-sky-400" />
                            Settings
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">&rarr;</span>
                        </button>

                        {/* Sign Out Button */}
                        <button
                          id="dropdown-btn-sign-out"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            signOutWithFirebase();
                          }}
                          className="w-full py-2 px-2.5 rounded-xl hover:bg-rose-500/20 text-rose-400 font-bold flex items-center justify-between transition-colors text-left cursor-pointer"
                        >
                          <span className="flex items-center gap-2 font-semibold">
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              id="btn-open-login"
              onClick={() => openAuthModal('signin')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden p-4 bg-slate-900 border-b border-slate-800 space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleNavClick('catalog')}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 ${
                activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              Book Catalog
            </button>
            {currentRole === 'student' && (
              <button
                onClick={() => handleNavClick('student-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 ${
                  activeTab === 'student-dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                Student Dashboard & Activity
              </button>
            )}
            {currentRole === 'staff' && (
              <button
                onClick={() => handleNavClick('staff-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 ${
                  activeTab === 'staff-dashboard' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                Staff Portal & Borrowed Books
              </button>
            )}
            {currentRole === 'admin' && (
              <button
                onClick={() => handleNavClick('admin-dashboard')}
                className={`p-2.5 rounded-xl text-xs font-semibold text-left flex items-center gap-2 ${
                  activeTab === 'admin-dashboard' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-300'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Control
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navbar Help & Support Modal */}
      <HelpSupportModal
        isOpen={isNavHelpOpen}
        onClose={() => setIsNavHelpOpen(false)}
      />

      {/* Navbar About Modal */}
      <AboutModal
        isOpen={isNavAboutOpen}
        onClose={() => setIsNavAboutOpen(false)}
      />

      {/* 🔔 NOTIFICATIONS MODAL */}
      {isNavNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Notifications Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage email alerts & sound feedback</p>
                </div>
              </div>
              <button onClick={() => setIsNavNotificationsOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold">Email Alerts</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Receive due date reminders via email</div>
                </div>
                <button
                  onClick={toggleEmailAlerts}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${emailAlerts ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold">Sound Effects</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Play audio sound on key user actions</div>
                </div>
                <button
                  onClick={toggleSoundEffects}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${soundEffects ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${soundEffects ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsNavNotificationsOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 🔐 ACCOUNT & SECURITY MODAL */}
      {isNavAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Account & Security</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Profile identity & security credentials</p>
                </div>
              </div>
              <button onClick={() => setIsNavAccountOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Holder</div>
                <div className="font-extrabold text-sm">{displayName}</div>
                <div className="text-slate-500 dark:text-slate-400">{displayEmail}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold">Student Authentication</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Firebase Auth & Firestore Verified</div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>

              {currentRole === 'student' && (
                <button
                  onClick={() => {
                    setIsNavAccountOpen(false);
                    handleNavClick('student-dashboard');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <UserCog className="w-4 h-4 text-emerald-500" />
                  Edit Profile Details
                </button>
              )}
            </div>

            <button
              onClick={() => setIsNavAccountOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 🌐 LANGUAGE MODAL */}
      {isNavLanguageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Language Preferences</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select display language preference</p>
                </div>
              </div>
              <button onClick={() => setIsNavLanguageOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {['English', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Hindi (हिंदी)'].map((lang, idx) => {
                const langName = lang.split(' ')[0];
                const isSelected = selectedLanguage.startsWith(langName);
                return (
                  <button
                    key={`nav-lang-opt-${langName}-${idx}`}
                    onClick={() => {
                      setSelectedLanguage(langName);
                      localStorage.setItem('lms_language', langName);
                      setIsNavLanguageOpen(false);
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

            <button
              onClick={() => setIsNavLanguageOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 🎨 APPEARANCE MODAL */}
      {isNavAppearanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Appearance & Themes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Theme customization & dark mode</p>
                </div>
              </div>
              <button onClick={() => setIsNavAppearanceOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold">Theme Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (theme === 'dark') toggleTheme();
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 font-extrabold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" /> Light
                  </button>
                  <button
                    onClick={() => {
                      if (theme === 'light') toggleTheme();
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 font-extrabold'
                        : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" /> Dark
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold">Accent Color Palette</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setThemePalette('emerald')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themePalette === 'emerald'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Emerald
                  </button>
                  <button
                    onClick={() => setThemePalette('indigo')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themePalette === 'indigo'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Indigo
                  </button>
                  <button
                    onClick={() => setThemePalette('violet')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themePalette === 'violet'
                        ? 'bg-violet-500/10 border-violet-500 text-violet-600 dark:text-violet-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Violet
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsNavAppearanceOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ♿ ACCESSIBILITY MODAL */}
      {isNavAccessibilityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Accessibility Standard</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Display legibility & text density</p>
                </div>
              </div>
              <button onClick={() => setIsNavAccessibilityOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-4 h-4" /> High Contrast & Scalable Layout
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This library dashboard complies with WCAG AA standard text contrast ratios, minimum touch targets (44px), semantic HTML tags, and screen-reader compliant aria metadata.
              </p>
            </div>

            <button
              onClick={() => setIsNavAccessibilityOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 🔒 PRIVACY MODAL */}
      {isNavPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Data Privacy & Protection</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Firestore security rules & data handling</p>
                </div>
              </div>
              <button onClick={() => setIsNavPrivacyOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white">🔒 Firestore Row-Level Security</div>
                <p>Your student data is isolated to <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">students/{'{uid}'}</code> in Firebase Firestore with owner permissions.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-white">🖼️ Avatar Photo Privacy</div>
                <p>Profile avatars are stored directly in your isolated student document record (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">avatar</code>) without external tracking.</p>
              </div>
            </div>

            <button
              onClick={() => setIsNavPrivacyOpen(false)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Back to Student Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
