import React, { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { sendResetPasswordEmail, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Palette,
  Bell,
  BookOpen,
  Globe,
  Eye,
  Lock,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Camera,
  Check,
  Moon,
  Sun,
  Volume2,
  Mail,
  Calendar,
  RefreshCw,
  Clock,
  Type,
  ZapOff,
  Trash2,
  FileCheck,
  MessageSquare,
  Bug,
  KeyRound,
  CreditCard,
  Laptop,
  Edit3,
  Save,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export type SettingsCategory =
  | 'account'
  | 'appearance'
  | 'notifications'
  | 'library'
  | 'language'
  | 'accessibility'
  | 'privacy'
  | 'help'
  | 'about';

export const SettingsCenter: React.FC = () => {
  const {
    currentStudent,
    currentStaff,
    currentAdmin,
    currentRole,
    theme,
    toggleTheme,
    themePalette,
    setThemePalette,
    systemSettings,
    signOutWithFirebase,
    updateStudentProfile,
    updateStaffProfile,
    updateAdminProfile,
    addToast,
    setActiveTab
  } = useLibrary();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('account');

  // Interactive settings state (persisted to localStorage)
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem('lms_language') || 'English'
  );
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    () => localStorage.getItem('lms_email_alerts') !== 'false'
  );
  const [soundFxEnabled, setSoundFxEnabled] = useState(
    () => localStorage.getItem('lms_sound_fx') !== 'false'
  );
  const [highContrastEnabled, setHighContrastEnabled] = useState(
    () => localStorage.getItem('lms_high_contrast') === 'true'
  );
  const [compactModeEnabled, setCompactModeEnabled] = useState(
    () => localStorage.getItem('lms_compact_mode') === 'true'
  );
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(
    () => localStorage.getItem('lms_reduce_motion') === 'true'
  );
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('lms_font_size') || 'Standard (100%)'
  );
  const [dateFormat, setDateFormat] = useState(
    () => localStorage.getItem('lms_date_format') || 'YYYY-MM-DD'
  );

  // Profile Edit Mode state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    name:
      (currentRole === 'admin'
        ? currentAdmin?.name
        : currentRole === 'staff'
        ? currentStaff?.name
        : currentStudent?.name) || '',
    email:
      (currentRole === 'admin'
        ? currentAdmin?.email
        : currentRole === 'staff'
        ? currentStaff?.email
        : currentStudent?.email) || '',
    department:
      (currentRole === 'admin'
        ? currentAdmin?.department
        : currentRole === 'staff'
        ? currentStaff?.department
        : currentStudent?.department) || '',
    rollNumber:
      (currentRole === 'admin'
        ? currentAdmin?.adminId || currentAdmin?.staffId
        : currentRole === 'staff'
        ? currentStaff?.staffId
        : currentStudent?.rollNumber) || '',
    photoUrl:
      (currentRole === 'admin'
        ? currentAdmin?.avatar || currentAdmin?.photoURL || currentAdmin?.photoUrl
        : currentRole === 'staff'
        ? currentStaff?.avatar || currentStaff?.photoURL || currentStaff?.photoUrl
        : currentStudent?.avatar || currentStudent?.photoURL || currentStudent?.photoUrl) || ''
  }));

  useEffect(() => {
    if (!isEditingProfile) {
      const currentPhoto =
        (currentRole === 'admin'
          ? currentAdmin?.avatar || currentAdmin?.photoURL || currentAdmin?.photoUrl
          : currentRole === 'staff'
          ? currentStaff?.avatar || currentStaff?.photoURL || currentStaff?.photoUrl
          : currentStudent?.avatar || currentStudent?.photoURL || currentStudent?.photoUrl) || '';
      setProfileForm({
        name:
          (currentRole === 'admin'
            ? currentAdmin?.name
            : currentRole === 'staff'
            ? currentStaff?.name
            : currentStudent?.name) || '',
        email:
          (currentRole === 'admin'
            ? currentAdmin?.email
            : currentRole === 'staff'
            ? currentStaff?.email
            : currentStudent?.email) || '',
        department:
          (currentRole === 'admin'
            ? currentAdmin?.department
            : currentRole === 'staff'
            ? currentStaff?.department
            : currentStudent?.department) || '',
        rollNumber:
          (currentRole === 'admin'
            ? currentAdmin?.adminId || currentAdmin?.staffId
            : currentRole === 'staff'
            ? currentStaff?.staffId
            : currentStudent?.rollNumber) || '',
        photoUrl: currentPhoto
      });
    }
  }, [currentStudent, currentStaff, currentAdmin, currentRole, isEditingProfile]);

  const displayName =
    (currentRole === 'admin'
      ? currentAdmin?.name
      : currentRole === 'staff'
      ? currentStaff?.name
      : currentStudent?.name) || 'Library User';
  const displayEmail =
    (currentRole === 'admin'
      ? currentAdmin?.email
      : currentRole === 'staff'
      ? currentStaff?.email
      : currentStudent?.email) || 'user@campus.edu';
  const displayPhoto =
    currentRole === 'admin'
      ? currentAdmin?.avatar || currentAdmin?.photoURL || currentAdmin?.photoUrl
      : currentRole === 'staff'
      ? currentStaff?.avatar || currentStaff?.photoURL || currentStaff?.photoUrl
      : currentStudent?.avatar || currentStudent?.photoURL || currentStudent?.photoUrl;
  const displayRoleLabel =
    currentRole === 'admin'
      ? 'System Administrator'
      : currentRole === 'staff'
      ? 'Library Staff'
      : 'Student Account';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === 'student') {
      await updateStudentProfile({
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        rollNumber: profileForm.rollNumber,
        avatar: profileForm.photoUrl,
        photoURL: profileForm.photoUrl,
        photoUrl: profileForm.photoUrl
      });
    } else if (currentRole === 'staff') {
      updateStaffProfile({
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        staffId: profileForm.rollNumber,
        avatar: profileForm.photoUrl,
        photoURL: profileForm.photoUrl,
        photoUrl: profileForm.photoUrl
      });
    } else if (currentRole === 'admin') {
      await updateAdminProfile({
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        adminId: profileForm.rollNumber,
        staffId: profileForm.rollNumber,
        avatar: profileForm.photoUrl,
        photoURL: profileForm.photoUrl,
        photoUrl: profileForm.photoUrl
      });
    }
    setIsEditingProfile(false);
    addToast('Profile Updated', 'Your profile details and photo have been saved successfully.', 'success');
  };

  const handleToggleEmailAlerts = () => {
    const newVal = !emailAlertsEnabled;
    setEmailAlertsEnabled(newVal);
    localStorage.setItem('lms_email_alerts', String(newVal));
    addToast('Notification Settings', `Email due-date reminders ${newVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleToggleSoundFx = () => {
    const newVal = !soundFxEnabled;
    setSoundFxEnabled(newVal);
    localStorage.setItem('lms_sound_fx', String(newVal));
    addToast('Sound Effects', `Audio cues ${newVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleToggleHighContrast = () => {
    const newVal = !highContrastEnabled;
    setHighContrastEnabled(newVal);
    localStorage.setItem('lms_high_contrast', String(newVal));
    addToast('Accessibility', `High contrast mode ${newVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleToggleCompactMode = () => {
    const newVal = !compactModeEnabled;
    setCompactModeEnabled(newVal);
    localStorage.setItem('lms_compact_mode', String(newVal));
    addToast('Display Density', `Compact layout ${newVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleToggleReduceMotion = () => {
    const newVal = !reduceMotionEnabled;
    setReduceMotionEnabled(newVal);
    localStorage.setItem('lms_reduce_motion', String(newVal));
    addToast('Animations', `Reduced motion ${newVal ? 'enabled' : 'disabled'}.`, 'info');
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem('lms_language', lang);
    addToast('Language Updated', `Interface language changed to ${lang}.`, 'success');
  };

  const handleClearCache = () => {
    localStorage.removeItem('lms_compact_mode');
    localStorage.removeItem('lms_reduce_motion');
    addToast('Local Cache Cleared', 'Temporary application settings cache cleared.', 'info');
  };

  const navItems: { id: SettingsCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-300 border border-blue-200 dark:border-blue-800/60">
                Settings Center
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your account, library preferences, and application experience.
            </p>
          </div>
        </div>

        <button
          id="btn-settings-back-to-catalog"
          onClick={() => setActiveTab('catalog')}
          className="self-start sm:self-auto py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
        >
          &larr; Back to Catalog
        </button>
      </div>

      {/* Main Settings Responsive Grid */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Mobile Category Dropdown / Horizontal Scroll Selector */}
        <div className="w-full md:hidden space-y-2">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Category
          </label>
          <div className="relative">
            <select
              id="mobile-settings-category-select"
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value as SettingsCategory)}
              className="w-full py-2.5 px-3.5 bg-slate-900 text-white border border-slate-800 rounded-xl font-bold text-xs outline-none appearance-none cursor-pointer"
            >
              {navItems.map((item, idx) => (
                <option key={`settings-opt-${item.id}-${idx}`} value={item.id} className="bg-slate-900 text-white">
                  {item.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Left Settings Navigation (Desktop & Tablet) */}
        <aside className="hidden md:flex flex-col justify-between w-60 lg:w-64 bg-[#0F172A] text-slate-300 rounded-2xl border border-slate-800/90 p-3 shrink-0 shadow-md min-h-[520px]">
          {/* Category Navigation Items */}
          <div className="space-y-1">
            {/* Profile Picture Card in Left Sidebar Navigation */}
            <div className="p-3 mb-2 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center overflow-hidden shrink-0 border-2 border-blue-500/30">
                {displayPhoto ? (
                  <img src={displayPhoto} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-slate-400 truncate">{displayRoleLabel}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Preferences
            </div>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;
              return (
                <button
                  key={`settings-nav-btn-${item.id}-${idx}`}
                  id={`settings-nav-${item.id}`}
                  onClick={() => setActiveCategory(item.id)}
                  className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {item.label}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 opacity-60'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* SIGN OUT Section at Bottom of Navigation (Subtle Red Style) */}
          <div className="pt-3 border-t border-slate-800/90 mt-4">
            <button
              id="settings-nav-sign-out"
              onClick={() => signOutWithFirebase()}
              className="w-full text-left py-2.5 px-3 rounded-xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-rose-400" />
                Sign Out
              </span>
              <span className="text-[10px] font-mono text-rose-300 font-normal">Account</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full bg-[#F6F8FC] dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm transition-colors min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* Category 1: ACCOUNT */}
              {activeCategory === 'account' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Account Settings
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        View and update your personal profile, credentials, and verification status.
                      </p>
                    </div>
                  </div>

                  {/* PROFILE CARD */}
                  <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-white dark:border-slate-700">
                          {displayPhoto ? (
                            <img
                              src={displayPhoto}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {displayName}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                              {displayRoleLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {displayEmail}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <span>
                              Dept:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {currentRole === 'admin'
                                  ? currentAdmin?.department || 'Central University Library'
                                  : currentStudent?.department || currentStaff?.department || 'General'}
                              </strong>
                            </span>
                            <span>•</span>
                            <span>
                              ID:{' '}
                              <strong className="text-slate-800 dark:text-slate-200 font-mono">
                                {currentRole === 'admin'
                                  ? currentAdmin?.adminId || currentAdmin?.staffId || 'ADM-001'
                                  : currentStudent?.rollNumber || currentStaff?.staffId || 'SYS-001'}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        id="btn-edit-profile-toggle"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        {isEditingProfile ? (
                          <>
                            <X className="w-3.5 h-3.5" /> Cancel Edit
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                          </>
                        )}
                      </button>
                    </div>

                    {/* Edit Profile Form (Inline) */}
                    {isEditingProfile && (
                      <form
                        onSubmit={handleSaveProfile}
                        className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/80 space-y-4"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Update Personal Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.name}
                              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              value={profileForm.department}
                              onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                              {currentRole === 'admin' ? 'Admin ID / Staff ID' : currentRole === 'staff' ? 'Staff ID' : 'Roll Number'}
                            </label>
                            <input
                              type="text"
                              value={profileForm.rollNumber}
                              onChange={e => setProfileForm({ ...profileForm, rollNumber: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-medium"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Profile Picture (Upload File, Enter URL, or Choose Preset)
                            </label>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              {/* File Upload Input */}
                              <label className="flex-1 cursor-pointer py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                <Camera className="w-4 h-4 text-blue-600" />
                                <span>Upload Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async e => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 2 * 1024 * 1024) {
                                        addToast('Image Too Large', 'Please select an image smaller than 2 MB.', 'error');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onloadend = async () => {
                                        const photoData = reader.result as string;
                                        setProfileForm(prev => ({ ...prev, photoUrl: photoData }));
                                        if (currentRole === 'student') {
                                          await updateStudentProfile({
                                            avatar: photoData,
                                            photoURL: photoData,
                                            photoUrl: photoData
                                          });
                                        } else if (currentRole === 'staff') {
                                          updateStaffProfile({
                                            avatar: photoData,
                                            photoURL: photoData,
                                            photoUrl: photoData
                                          });
                                        } else if (currentRole === 'admin') {
                                          await updateAdminProfile({
                                            avatar: photoData,
                                            photoURL: photoData,
                                            photoUrl: photoData
                                          });
                                        }
                                        addToast('Photo Uploaded 📸', 'Profile photo updated successfully across all sections.', 'success');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              {/* URL Input */}
                              <input
                                type="url"
                                placeholder="https://example.com/avatar.jpg"
                                value={profileForm.photoUrl}
                                onChange={e => setProfileForm({ ...profileForm, photoUrl: e.target.value })}
                                className="flex-[2] px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-white font-medium"
                              />
                            </div>

                            {/* Preset Avatar Selection */}
                            <div className="pt-1">
                              <span className="text-[10px] text-slate-400 font-medium">Or choose a preset avatar:</span>
                              <div className="flex items-center gap-2 mt-1.5 overflow-x-auto pb-1">
                                {[
                                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
                                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                                ].map((url, idx) => (
                                  <button
                                    key={`preset-avatar-${idx}`}
                                    type="button"
                                    onClick={async () => {
                                      setProfileForm(prev => ({ ...prev, photoUrl: url }));
                                      if (currentRole === 'student') {
                                        await updateStudentProfile({ avatar: url, photoURL: url, photoUrl: url });
                                      } else if (currentRole === 'staff') {
                                        updateStaffProfile({ avatar: url, photoURL: url, photoUrl: url });
                                      } else if (currentRole === 'admin') {
                                        await updateAdminProfile({ avatar: url, photoURL: url, photoUrl: url });
                                      }
                                    }}
                                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                                      profileForm.photoUrl === url ? 'border-blue-600 scale-110 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                                    }`}
                                  >
                                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                                  </button>
                                ))}
                                {profileForm.photoUrl && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setProfileForm(prev => ({ ...prev, photoUrl: '' }));
                                      if (currentRole === 'student') {
                                        await updateStudentProfile({ avatar: '', photoURL: '', photoUrl: '' });
                                      } else if (currentRole === 'staff') {
                                        updateStaffProfile({ avatar: '', photoURL: '', photoUrl: '' });
                                      } else if (currentRole === 'admin') {
                                        await updateAdminProfile({ avatar: '', photoURL: '', photoUrl: '' });
                                      }
                                    }}
                                    className="text-[10px] text-rose-500 hover:underline px-2 py-1 font-semibold cursor-pointer"
                                  >
                                    Remove Photo
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="py-1.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Setting Rows */}
                  <div className="space-y-3">
                    <SettingRow
                      icon={KeyRound}
                      title="Password & Security"
                      description="Manage account password, authentication credentials, and security history."
                      control={
                        <button
                          onClick={async () => {
                            const userEmail = currentStudent?.email || currentStaff?.email || auth.currentUser?.email;
                            if (userEmail) {
                              try {
                                await sendResetPasswordEmail(userEmail);
                                addToast(
                                  'Password Reset Email Dispatched 📧',
                                  `A Firebase password reset link has been sent to ${userEmail}. Check your inbox to update your password.`,
                                  'success'
                                );
                              } catch (err: any) {
                                addToast('Reset Error', err.message || 'Failed to send password reset email.', 'error');
                              }
                            } else {
                              addToast('Email Missing', 'No email address found for this active session.', 'error');
                            }
                          }}
                          className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Change Password <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      }
                    />

                    <SettingRow
                      icon={CreditCard}
                      title="Linked Student Roll Mapping"
                      description="Active campus roll number linked to library borrowing credentials."
                      control={
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {currentStudent?.rollNumber || currentStaff?.staffId || 'Verified'}
                        </span>
                      }
                    />

                    <SettingRow
                      icon={Laptop}
                      title="Active Device Sessions"
                      description="Current session active on Cloud Run container environment."
                      control={
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Active Now
                        </span>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 2: APPEARANCE */}
              {activeCategory === 'appearance' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Appearance Settings
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize the visual theme, color palette, and interface density.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={theme === 'dark' ? Moon : Sun}
                      title="Theme Mode"
                      description="Switch between light and dark display modes for comfortable viewing."
                      control={
                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleTheme}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              theme === 'dark'
                                ? 'bg-slate-800 text-amber-300 border-slate-700'
                                : 'bg-slate-100 text-blue-600 border-slate-300'
                            }`}
                          >
                            {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </button>
                        </div>
                      }
                    />

                    <SettingRow
                      icon={Palette}
                      title="Primary Color Palette"
                      description="Select the primary brand highlight color used across the interface."
                      control={
                        <div className="flex items-center gap-1.5">
                          {(['emerald', 'indigo', 'violet'] as const).map((p, idx) => (
                            <button
                              key={`palette-btn-${p}-${idx}`}
                              onClick={() => {
                                setThemePalette(p);
                                addToast('Theme Palette', `Accent color changed to ${p}.`, 'info');
                              }}
                              className={`w-6 h-6 rounded-full cursor-pointer transition-transform border-2 ${
                                p === 'emerald'
                                  ? 'bg-emerald-600 border-emerald-400'
                                  : p === 'indigo'
                                  ? 'bg-blue-600 border-blue-400'
                                  : 'bg-violet-600 border-violet-400'
                              } ${themePalette === p ? 'scale-110 ring-2 ring-blue-500' : 'opacity-80'}`}
                              title={p}
                            />
                          ))}
                        </div>
                      }
                    />

                    <SettingRow
                      icon={Sparkles}
                      title="Compact Layout Mode"
                      description="Reduce padding and list row heights to fit more content on screen."
                      control={
                        <ToggleSwitch
                          checked={compactModeEnabled}
                          onChange={handleToggleCompactMode}
                        />
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 3: NOTIFICATIONS */}
              {activeCategory === 'notifications' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Notifications & Alerts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage automated due-date warnings, email reminders, and audio cues.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={Mail}
                      title="Email Due-Date Reminders"
                      description="Get email alerts 48 hours before any borrowed book's due date."
                      control={
                        <ToggleSwitch
                          checked={emailAlertsEnabled}
                          onChange={handleToggleEmailAlerts}
                        />
                      }
                    />

                    <SettingRow
                      icon={Volume2}
                      title="Audio Feedback & Sound Effects"
                      description="Play subtle audio cues upon successful checkout, return, or renewal."
                      control={
                        <ToggleSwitch
                          checked={soundFxEnabled}
                          onChange={handleToggleSoundFx}
                        />
                      }
                    />

                    <SettingRow
                      icon={Bell}
                      title="Overdue Header Warning Badge"
                      description="Highlight urgent book warnings in the top navigation header bar."
                      control={
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Enabled
                        </span>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 4: LIBRARY PREFERENCES */}
              {activeCategory === 'library' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Library Preferences
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage default borrowing durations, loan extensions, and receipt settings.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={Calendar}
                      title="Standard Borrowing Duration"
                      description="Default loan period configured for student circulation."
                      control={
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                          {systemSettings.maxLoanDays || 14} Days
                        </span>
                      }
                    />

                    <SettingRow
                      icon={RefreshCw}
                      title="Loan Auto-Extension Limit"
                      description="Maximum allowed consecutive online renewals per borrowed title."
                      control={
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
                          1 Extension (14 days)
                        </span>
                      }
                    />

                    <SettingRow
                      icon={BookOpen}
                      title="Active Loans & History"
                      description="Jump directly to your active loan records and receipt downloads."
                      control={
                        <button
                          onClick={() =>
                            setActiveTab(currentRole === 'staff' ? 'staff-dashboard' : 'student-dashboard')
                          }
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          View Dashboard <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 5: LANGUAGE */}
              {activeCategory === 'language' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Language & Region
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select interface display language and regional time representation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={Globe}
                      title="Application Language"
                      description="Choose the primary interface language for catalog and dashboard text."
                      control={
                        <select
                          value={selectedLanguage}
                          onChange={e => handleLanguageChange(e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="English">English (US)</option>
                          <option value="Spanish">Spanish (Español)</option>
                          <option value="French">French (Français)</option>
                          <option value="German">German (Deutsch)</option>
                          <option value="Hindi">Hindi (हिन्दी)</option>
                          <option value="Tamil">Tamil (தமிழ்)</option>
                        </select>
                      }
                    />

                    <SettingRow
                      icon={Clock}
                      title="Date & Time Format"
                      description="Representation of due dates and circulation timestamps."
                      control={
                        <select
                          value={dateFormat}
                          onChange={e => {
                            setDateFormat(e.target.value);
                            localStorage.setItem('lms_date_format', e.target.value);
                            addToast('Format Saved', `Date format set to ${e.target.value}`, 'info');
                          }}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (UK/IN)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                        </select>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 6: ACCESSIBILITY */}
              {activeCategory === 'accessibility' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Accessibility Options
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure high-contrast contrast ratios, text sizing, and reduced motion.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={Eye}
                      title="High-Contrast Mode"
                      description="Enhance text and border contrast for clearer visual legibility."
                      control={
                        <ToggleSwitch
                          checked={highContrastEnabled}
                          onChange={handleToggleHighContrast}
                        />
                      }
                    />

                    <SettingRow
                      icon={Type}
                      title="Font Sizing"
                      description="Adjust the relative font size scale used throughout the application."
                      control={
                        <select
                          value={fontSize}
                          onChange={e => {
                            setFontSize(e.target.value);
                            localStorage.setItem('lms_font_size', e.target.value);
                            addToast('Font Scale', `Font size set to ${e.target.value}`, 'info');
                          }}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="Standard (100%)">Standard (100%)</option>
                          <option value="Large (110%)">Large (110%)</option>
                          <option value="Extra Large (125%)">Extra Large (125%)</option>
                        </select>
                      }
                    />

                    <SettingRow
                      icon={ZapOff}
                      title="Reduce Motion & Animations"
                      description="Minimize visual slide transitions and background particle effects."
                      control={
                        <ToggleSwitch
                          checked={reduceMotionEnabled}
                          onChange={handleToggleReduceMotion}
                        />
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 7: PRIVACY */}
              {activeCategory === 'privacy' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Privacy & Data Control
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Manage data retention, local storage cache, and campus privacy policies.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={ShieldCheck}
                      title="Profile Directory Visibility"
                      description="Allow library archivists to verify your active enrollment status."
                      control={
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Verified Campus User
                        </span>
                      }
                    />

                    <SettingRow
                      icon={Trash2}
                      title="Clear Local Storage Cache"
                      description="Remove temporary cached UI preferences from this browser session."
                      control={
                        <button
                          onClick={handleClearCache}
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-rose-500/10 text-slate-800 dark:text-slate-200 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Clear Cache
                        </button>
                      }
                    />

                    <SettingRow
                      icon={FileCheck}
                      title="Campus Privacy Agreement"
                      description="Read the official library catalog data policy and user agreement."
                      control={
                        <button
                          onClick={() =>
                            addToast('Privacy Policy', 'Campus Library Data Policy: All borrowing logs are encrypted.', 'info')
                          }
                          className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          View Policy <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 8: HELP & SUPPORT */}
              {activeCategory === 'help' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Help & Support Center
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Find answer guides for borrowing, renewal limits, fines, and support contact.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <SettingRow
                      icon={HelpCircle}
                      title="Library FAQ & Borrowing Guide"
                      description="Answers regarding max loan limits, return procedures, and overdue rates."
                      control={
                        <button
                          onClick={() =>
                            addToast('FAQ Guide', 'Borrowing Rule: Max 5 books for 14 days ($1.00/day fine).', 'info')
                          }
                          className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Read FAQ <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      }
                    />

                    <SettingRow
                      icon={MessageSquare}
                      title="Contact Desk / Chief Archivist"
                      description="Send an inquiry to library staff regarding missing titles or holds."
                      control={
                        <button
                          onClick={() =>
                            addToast('Contact Help', 'Library Help Desk: support@campus-library.edu', 'info')
                          }
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                        >
                          Email Support
                        </button>
                      }
                    />

                    <SettingRow
                      icon={Bug}
                      title="Report System Issue"
                      description="Notify system administrators of technical or catalog bugs."
                      control={
                        <button
                          onClick={() =>
                            addToast('Feedback Sent', 'Thank you! Your feedback has been logged.', 'success')
                          }
                          className="py-1.5 px-3 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer"
                        >
                          Submit Report
                        </button>
                      }
                    />
                  </div>
                </div>
              )}

              {/* Category 9: ABOUT */}
              {activeCategory === 'about' && (
                <div className="space-y-5">
                  <div className="pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      About Application
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      System architecture, software versioning, and environment telemetry.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                        <BookOpen className="w-5 h-5 text-sky-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Alpha Library System
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Version 2.4.0 • Enterprise Academic Edition
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      A modern, full-stack library management and circulation platform designed for academic institutions, supporting multi-role authentication, real-time book loan tracking, barcode scanning, and automated due-date warnings.
                    </p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Framework</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">React 18 + Vite</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Styling</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Tailwind CSS</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Backend</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">Firebase Firestore</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Runtime</div>
                        <div className="font-bold text-blue-600 dark:text-sky-400 mt-0.5">Cloud Run</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* Reusable Setting Row Component conforming to specification */
interface SettingRowProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  control?: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon: Icon, title, description, control }) => {
  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 sm:p-4 shadow-xs hover:border-blue-200 dark:hover:border-slate-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 border border-blue-100 dark:border-blue-900/40 shrink-0 mt-0.5 sm:mt-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end sm:ml-4">
        {control ? control : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
  );
};

/* Reusable Toggle Switch Component */
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};
