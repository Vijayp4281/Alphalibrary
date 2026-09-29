import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLibrary } from '../../context/LibraryContext';
import {
  Shield,
  User,
  Mail,
  Building2,
  Phone,
  Camera,
  X,
  Save,
  Check,
  Sparkles,
  BadgeCheck
} from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentAdmin, updateAdminProfile, addToast } = useLibrary();

  const [form, setForm] = useState({
    name: currentAdmin?.name || 'System Administrator',
    email: currentAdmin?.email || 'admin@university.edu',
    department: currentAdmin?.department || 'Central University Library',
    position: currentAdmin?.position || 'Chief Administrator & DevOps',
    adminId: currentAdmin?.adminId || currentAdmin?.staffId || 'ADM-001',
    phone: currentAdmin?.phone || '+1 (555) 019-2834',
    avatar:
      currentAdmin?.avatar ||
      currentAdmin?.photoURL ||
      currentAdmin?.photoUrl ||
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && currentAdmin) {
      setForm({
        name: currentAdmin.name || 'System Administrator',
        email: currentAdmin.email || 'admin@university.edu',
        department: currentAdmin.department || 'Central University Library',
        position: currentAdmin.position || 'Chief Administrator & DevOps',
        adminId: currentAdmin.adminId || currentAdmin.staffId || 'ADM-001',
        phone: currentAdmin.phone || '+1 (555) 019-2834',
        avatar:
          currentAdmin.avatar ||
          currentAdmin.photoURL ||
          currentAdmin.photoUrl ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
      });
    }
  }, [isOpen, currentAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Validation Error', 'Admin full name and email are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateAdminProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        position: form.position.trim(),
        adminId: form.adminId.trim(),
        staffId: form.adminId.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar,
        photoURL: form.avatar,
        photoUrl: form.avatar
      });
      onClose();
    } catch (err) {
      console.error('Failed to save admin profile:', err);
      addToast('Update Failed', 'An error occurred while updating admin profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image Too Large', 'Please select an image smaller than 2 MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setForm(prev => ({ ...prev, avatar: photoData }));
        addToast('Avatar Selected', 'Image preview loaded. Click "Save Changes" to apply.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="admin-profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          id="admin-profile-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-xl w-full relative my-8"
        >
          {/* Close Button */}
          <button
            id="btn-close-admin-profile-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-[#24324A]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-lg shadow-amber-600/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Edit Administrator Profile
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your administrative credentials, department, and account avatar.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Preview & Upload Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Administrator Avatar / Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-amber-500 text-xl font-black">
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="Admin Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      form.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-amber-600 text-white rounded-full shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label
                      id="btn-admin-upload-photo"
                      className="flex-1 cursor-pointer py-2 px-3 bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] hover:border-amber-500 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste image URL"
                      value={form.avatar}
                      onChange={e => setForm({ ...form, avatar: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">Presets:</span>
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={`admin-preset-avatar-${idx}`}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, avatar: url }))}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          form.avatar === url
                            ? 'border-amber-500 scale-110 shadow-sm'
                            : 'border-slate-200 dark:border-[#24324A] hover:border-amber-400'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {form.avatar && (
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, avatar: '' }))}
                        className="text-[10px] text-rose-500 hover:underline px-1 font-semibold cursor-pointer shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    id="input-admin-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-semibold transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    id="input-admin-email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-semibold transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Office
                </label>
                <div className="relative">
                  <input
                    id="input-admin-department"
                    type="text"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-semibold transition-colors"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Position / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Designation / Position
                </label>
                <input
                  id="input-admin-position"
                  type="text"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-semibold transition-colors"
                />
              </div>

              {/* Admin ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Administrator ID Code
                </label>
                <input
                  id="input-admin-id"
                  type="text"
                  value={form.adminId}
                  onChange={e => setForm({ ...form, adminId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-mono transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <input
                    id="input-admin-phone"
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] text-xs rounded-xl outline-none focus:border-amber-500 text-slate-900 dark:text-white font-medium transition-colors"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-[#24324A] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#111A2E] hover:bg-slate-200 dark:hover:bg-[#1A2640] text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-save-admin-profile-submit"
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Admin Profile
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
