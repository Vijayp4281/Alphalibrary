import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, RefreshCw, ShieldCheck, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { auth } from '../../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

export interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentEmail: string;
  studentName?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  studentEmail,
  studentName = 'Student',
  onSuccess,
  onBackToLogin
}) => {
  const { addToast, verifyStudentEmailAndCreateProfile } = useLibrary();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset status message on modal open
  useEffect(() => {
    if (isOpen) {
      setIsVerified(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    try {
      if (!auth.currentUser) {
        setStatusMessage({
          type: 'warning',
          text: 'Verification session expired. Please log in to verify your email.'
        });
        return;
      }

      await auth.currentUser.reload();
      const user = auth.currentUser;

      if (!user.emailVerified) {
        setStatusMessage({
          type: 'warning',
          text: 'Your email has not been verified yet. Please verify your email first.'
        });
        addToast(
          'Email Not Verified Yet',
          'Your email has not been verified yet. Please verify your email first.',
          'warning'
        );
        return;
      }

      // Email is verified in Auth! Create Firestore profile
      const res = await verifyStudentEmailAndCreateProfile();
      if (res.success) {
        setIsVerified(true);
        setStatusMessage({
          type: 'success',
          text: 'Email verified successfully! Your student account has been created.'
        });

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to create student profile.'
        });
      }
    } catch (err: any) {
      console.error('Verification check error:', err);
      const msg = err?.message || 'Could not verify email status.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setStatusMessage(null);

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(60);
        setStatusMessage({
          type: 'info',
          text: 'Verification email sent. Please check your inbox.'
        });
        addToast('Verification Sent 📩', 'Verification email sent. Please check your inbox.', 'success');
      } else {
        setStatusMessage({
          type: 'warning',
          text: 'Verification session expired. Please log in to resend the verification link.'
        });
      }
    } catch (err: any) {
      console.error('Resend verification error:', err);
      if (err?.code === 'auth/too-many-requests') {
        setStatusMessage({
          type: 'error',
          text: 'Too many requests. Please wait a few minutes before requesting another verification email.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Failed to send verification email. Please try again later.'
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    onClose();
    if (onBackToLogin) {
      onBackToLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Top Header Decorator */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

        <button
          onClick={onClose}
          id="btn-close-verify-modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Your Email</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Student Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Firebase Email Authentication
              </p>
            </div>
          </div>

          {!isVerified ? (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  We sent a verification link to your registered email address:
                </p>
                <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white font-mono break-all bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  {studentEmail}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  If the verification email is not in your Inbox, please check your Spam/Junk folder. Open your email inbox, click the verification link, then return here and click <span className="font-semibold text-slate-700 dark:text-slate-200">Check Verification</span> below.
                </p>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : statusMessage.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : statusMessage.type === 'info'
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                      : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  id="btn-check-verification"
                  onClick={handleCheckVerification}
                  disabled={isChecking}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking Firebase Status...
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
                  id="btn-resend-verification"
                  onClick={handleResendEmail}
                  disabled={resendCooldown > 0 || isResending}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isResending ? (
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
                  id="btn-back-to-login"
                  onClick={handleBackToLogin}
                  className="w-full py-2.5 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            /* Success View */
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-950/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Email Verified!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your student email address <span className="font-semibold text-slate-700 dark:text-slate-300">{studentEmail}</span> is verified in Firebase Authentication.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                ✓ Redirecting to Student Dashboard...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
