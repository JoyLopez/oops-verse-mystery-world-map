import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../types';
import {
  getAllSavedAccounts,
  createNewDetectiveAccount,
  authenticateAndSwitchAccount,
  logoutCurrentAccount,
  switchActiveAccount,
} from '../utils/storage';
import {
  ShieldCheck,
  User,
  KeyRound,
  PlusCircle,
  LogIn,
  LogOut,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Lock,
  RefreshCw,
  Github,
  Check,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface LoginPageProps {
  currentProfile: PlayerProfile;
  onProfileUpdated: (profile: PlayerProfile) => void;
  onClose?: () => void;
  isModalMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentProfile,
  onProfileUpdated,
  onClose,
  isModalMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [savedAccounts, setSavedAccounts] = useState<PlayerProfile[]>(() => getAllSavedAccounts());

  // Social Login state
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Sign In Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState('');

  // Sign Up Form state
  const [newEmail, setNewEmail] = useState('');
  const [newCallsign, setNewCallsign] = useState('');
  const [newPassword, setNewPassword] = useState('1234');
  const [newAvatar, setNewAvatar] = useState('🕵️');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetError, setResetError] = useState('');

  const availableAvatars = ['🕵️', '🕵️‍♀️', '🤖', '🛸', '🧙', '🐯', '🦾', '🥷', '👾', '👽'];

  const refreshAccounts = () => {
    setSavedAccounts(getAllSavedAccounts());
  };

  // Handle Social Logins
  const handleSocialAuth = (provider: 'Google' | 'GitHub' | 'Apple') => {
    sounds.playPop();
    setSocialLoading(provider);
    setSignInError('');

    setTimeout(() => {
      setSocialLoading(null);
      const providerAvatars: Record<string, string> = {
        Google: '🌐',
        GitHub: '👾',
        Apple: '🍎',
      };

      const socialProfile = createNewDetectiveAccount({
        username: `${provider} Agent`,
        pinCode: '1234',
        avatar: providerAvatars[provider] || '🕵️',
        accountType: 'hq_cloud',
        email: `agent.${provider.toLowerCase()}@oopsverse.hq`,
      });

      sounds.playSuccess();
      onProfileUpdated(socialProfile);
      refreshAccounts();
      if (onClose) onClose();
    }, 1200);
  };

  // Handle Sign In Submit
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setSignInError('');

    if (!identifier.trim()) {
      setSignInError('Please enter your Badge ID, Email, or Callsign.');
      return;
    }

    const result = authenticateAndSwitchAccount(identifier, password || '1234');
    if (result.success && result.profile) {
      sounds.playSuccess();
      onProfileUpdated(result.profile);
      refreshAccounts();
      if (onClose) onClose();
    } else {
      sounds.playError();
      setSignInError(result.error || 'Authentication failed. Please check your password/PIN.');
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setSignUpError('');
    setSignUpSuccess('');

    if (!newCallsign.trim()) {
      setSignUpError('Please choose a Detective Callsign / Username.');
      return;
    }

    if (!agreedTerms) {
      setSignUpError('You must accept the HQ Security Directives to proceed.');
      return;
    }

    const newAcc = createNewDetectiveAccount({
      username: newCallsign.trim(),
      pinCode: newPassword || '1234',
      avatar: newAvatar,
      email: newEmail.trim() || undefined,
      accountType: 'detective',
    });

    sounds.playSuccess();
    setSignUpSuccess(`Detective Badge Issued! ID: ${newAcc.badgeId}`);
    onProfileUpdated(newAcc);
    refreshAccounts();

    setTimeout(() => {
      if (onClose) onClose();
    }, 1200);
  };

  // Handle Forgot Password Submit
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();
    setResetError('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your email or Detective Badge ID.');
      return;
    }

    setResetSubmitted(true);
    sounds.playSuccess();
  };

  const handleLogout = () => {
    sounds.playPop();
    const guest = logoutCurrentAccount();
    onProfileUpdated(guest);
    refreshAccounts();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden font-sans">
      {/* Dynamic Background Glow FX */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Optional Close Button for Modal Mode */}
      {isModalMode && onClose && (
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95 z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              OopsVerse Security Portal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
            Detective Login System
          </h2>
        </div>
      </div>

      {/* Active User Card Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
            {currentProfile.avatar}
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-mono">
              ACTIVE BADGE: <span className="text-amber-400 font-bold">{currentProfile.badgeId}</span>
            </p>
            <h3 className="text-base font-bold text-white leading-tight">{currentProfile.username}</h3>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentProfile.isLoggedIn ? 'Authenticated Detective' : 'Guest Officer Clearance'}
            </p>
          </div>
        </div>

        {currentProfile.isLoggedIn && (
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1 mb-6">
        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('signin');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'signin'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('signup');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'signup'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Account</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setActiveTab('forgot');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            activeTab === 'forgot'
              ? 'bg-amber-500 text-slate-950 shadow-lg font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Forgot Password</span>
        </button>
      </div>

      {/* TAB 1: SIGN IN */}
      {activeTab === 'signin' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Social Logins */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Social Sign In
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                disabled={!!socialLoading}
                className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {socialLoading === 'Google' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('GitHub')}
                disabled={!!socialLoading}
                className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {socialLoading === 'GitHub' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Github className="w-4 h-4 text-slate-200" />
                )}
                <span>GitHub</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                disabled={!!socialLoading}
                className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {socialLoading === 'Apple' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <span className="text-sm">🍎</span>
                )}
                <span>Apple</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              or sign in with credentials
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Badge ID, Callsign, or Email</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. DET-1001 or Detective Joy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password or 4-Digit PIN</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPop();
                    setActiveTab('forgot');
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••• (Default PIN: 1234)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {signInError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticate & Sign In</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* TAB 2: CREATE ACCOUNT */}
      {activeTab === 'signup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Social Sign up options */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Social Registration
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('GitHub')}
                className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>Apple</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center my-3">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              or register custom detective profile
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Detective Callsign / Username *
              </label>
              <input
                type="text"
                value={newCallsign}
                onChange={(e) => setNewCallsign(e.target.value)}
                placeholder="e.g. Detective Nova"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                HQ Backup Email (Optional)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. detective.nova@oopsverse.hq"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Detective Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAvatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setNewAvatar(av);
                    }}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      newAvatar === av
                        ? 'bg-amber-500/20 border-amber-500 scale-110 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Security Password / 4-Digit PIN *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="e.g. 1234 or secret_password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
              />
              <span>I agree to HQ Security Directives & Case Data Terms</span>
            </label>

            {signUpError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{signUpError}</span>
              </div>
            )}

            {signUpSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{signUpSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Issue Detective Badge & Account</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* TAB 3: FORGOT PASSWORD */}
      {activeTab === 'forgot' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {!resetSubmitted ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>HQ Password Recovery Protocol</span>
                </p>
                Enter your registered Email address or Detective Badge ID. We will send an emergency security link to reset your PIN or password.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Registered Email or Badge ID</span>
                </label>
                <input
                  type="text"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. detective.joy@oopsverse.hq or DET-1001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Dispatch Recovery Link</span>
              </button>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                <Check className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Recovery Dispatch Sent!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  A security reset code has been dispatched for <span className="text-amber-400 font-mono">{resetEmail}</span>. Check your inbox or enter default PIN <span className="font-mono text-amber-400">1234</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setResetSubmitted(false);
                  setActiveTab('signin');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
