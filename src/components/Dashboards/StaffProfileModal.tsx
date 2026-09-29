import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLibrary } from '../../context/LibraryContext';
import { compressImageToBase64 } from '../../lib/firebase';
import {
  ShieldCheck,
  User,
  Mail,
  Building2,
  Phone,
  Camera,
  X,
  Save,
  Check,
  Sparkles,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentStaff, updateStaffProfile, addToast } = useLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: currentStaff?.name || 'Staff Member',
    email: currentStaff?.email || 'staff@university.edu',
    department: currentStaff?.department || 'Central Library Admin',
    position: currentStaff?.position || 'Assistant Librarian',
    staffId: currentStaff?.staffId || 'LIB-001',
    phone: currentStaff?.phone || '+1 (555) 019-2834',
    avatar:
      currentStaff?.avatar ||
      currentStaff?.photoURL ||
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (isOpen && currentStaff) {
      setForm({
        name: currentStaff.name || 'Staff Member',
        email: currentStaff.email || 'staff@university.edu',
        department: currentStaff.department || 'Central Library Admin',
        position: currentStaff.position || 'Assistant Librarian',
        staffId: currentStaff.staffId || 'LIB-001',
        phone: currentStaff.phone || '+1 (555) 019-2834',
        avatar:
          currentStaff.avatar ||
          currentStaff.photoURL ||
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
      });
      setShowUrlInput(false);
      setCustomUrl('');
    }
  }, [isOpen, currentStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast('Validation Error', 'Full Name and Email are required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateStaffProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        position: form.position.trim(),
        staffId: form.staffId.trim(),
        phone: form.phone.trim(),
        avatar: form.avatar,
        photoURL: form.avatar
      });
      addToast('Profile Updated', 'Your staff profile and picture have been updated.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Failed to save staff profile:', err);
      addToast('Update Failed', err?.message || 'Could not update staff profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers event
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image Too Large', 'Please select an image smaller than 2 MB.', 'error');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImageToBase64(file, 400, 0.85);
      setForm(prev => ({ ...prev, avatar: compressedBase64 }));
      addToast('Photo Uploaded 📸', 'New profile picture loaded. Click Save Changes to apply.', 'info');
    } catch (err: any) {
      console.error('Photo compression error:', err);
      addToast('Upload Error', err?.message || 'Failed to process selected image.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image')) {
      addToast('Invalid URL', 'Please enter a valid image URL starting with http:// or https://', 'warning');
      return;
    }
    setForm(prev => ({ ...prev, avatar: trimmed }));
    setShowUrlInput(false);
    setCustomUrl('');
    addToast('Avatar URL Applied', 'Preview updated. Click Save Changes to finalize.', 'info');
  };

  const presetStaffAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="staff-profile-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          id="staff-profile-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#24324A] text-slate-900 dark:text-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-xl w-full relative my-8"
        >
          {/* Close Button */}
          <button
            id="btn-close-staff-profile-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#111A2E] transition-colors cursor-pointer"
            aria-label="Close Profile Editor"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-200 dark:border-[#24324A]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Staff Profile & Picture
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  STAFF / LIBRARIAN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your staff avatar, display name, department, and contact details.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* AVATAR UPLOAD & CHANGE CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Staff Profile Picture
                </label>
                <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 2MB)</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview with Camera Overlay */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-blue-600 text-2xl font-black">
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="Staff Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      form.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Interactive Camera Button Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    title="Click to choose a new photo"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-2xl text-white text-[10px] font-bold transition-all cursor-pointer backdrop-blur-[2px]"
                  >
                    {isCompressing ? (
                      <RefreshCw className="w-5 h-5 animate-spin mb-1 text-teal-300" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-0.5 text-teal-300" />
                        <span>Change</span>
                      </>
                    )}
                  </button>

                  <span className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-blue-600 text-white shadow-md border border-blue-400/40">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>

                {/* Upload Action Buttons */}
                <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="staff-avatar-file-input"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressing}
                      className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/25 border border-blue-400/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCompressing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload from Device</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-[#1E293B] hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-[#334155] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                      <span>{showUrlInput ? 'Hide URL' : 'Image URL'}</span>
                    </button>
                  </div>

                  {/* URL Input Expanded */}
                  {showUrlInput && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={customUrl}
                        onChange={e => setCustomUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#0B1220] border border-slate-300 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    High quality square image recommended. Auto-compressed for performance.
                  </p>
                </div>
              </div>

              {/* Preset Avatar Picker */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#24324A]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Or select a preset staff avatar:
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {presetStaffAvatars.map((url, idx) => {
                    const isSelected = form.avatar === url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, avatar: url }))}
                        className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105 shadow-md'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 opacity-75 hover:opacity-100'
                        }`}
                        title={`Select preset avatar ${idx + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Preset avatar ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PROFILE FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Librarian / Staff Full Name"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Staff ID
                </label>
                <input
                  type="text"
                  value={form.staffId}
                  onChange={e => setForm({ ...form, staffId: e.target.value })}
                  placeholder="e.g. LIB-001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> Position / Role
                </label>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  placeholder="e.g. Assistant Librarian"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> Department
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Central Library Admin"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-500" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="staff@university.edu"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-500" /> Contact Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#111A2E] border border-slate-200 dark:border-[#24324A] rounded-xl outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#24324A]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-[#111A2E] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || isCompressing}
                className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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
