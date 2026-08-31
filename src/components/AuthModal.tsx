import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  X,
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { checkPasswordStrength } from '../lib/supabase.ts';
import { signInWithGoogle } from '../lib/firebase.ts';
import { UserProfile } from '../types/index.ts';

type AuthViewMode = 'login' | 'signup' | 'forgot_password' | 'email_verification' | 'reset_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (email: string, fullName?: string) => void;
  onLoginSuccess?: (email: string, fullName?: string) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');

  // UI state
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
      if (!email) {
        setEmail('candidate@jobbuddy.ai');
        setPassword('Demo@12345');
      }
    }
  }, [isOpen, initialMode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const passwordStrength = checkPasswordStrength(password);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const firebaseUser = await signInWithGoogle();
      const email = firebaseUser.email || 'user@example.com';
      const fullName = firebaseUser.displayName || email.split('@')[0];

      // Save/sync with server profile
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: firebaseUser.uid,
          email,
          fullName,
          onboardingCompleted: true,
        }),
      });

      if (onLogin) onLogin(email, fullName);
      if (onLoginSuccess) onLoginSuccess(email, fullName);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // If popup was closed by user or iframe constraint, show clear message
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else {
        setError(err.message || 'Google Sign-in encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sign in. Please check your credentials.');
      }

      if (onLogin) onLogin(data.user.email, data.user.fullName);
      if (onLoginSuccess) onLoginSuccess(data.user.email, data.user.fullName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!passwordStrength.isStrong) {
      setError('Please choose a stronger password satisfying all requirements below.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim() || email.split('@')[0],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account.');
      }

      if (data.emailConfirmationRequired) {
        setMode('email_verification');
        setSuccessMessage(data.message || `Verification link sent to ${email}.`);
      } else {
        if (onLogin) onLogin(data.user.email, data.user.user_metadata?.full_name);
        if (onLoginSuccess) onLoginSuccess(data.user.email, data.user.user_metadata?.full_name);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive reset instructions.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to request password reset.');
      }

      setSuccessMessage(data.message || `Password reset instructions sent to ${email}.`);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!passwordStrength.isStrong) {
      setError('New password does not meet security requirements.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: password,
          token: resetToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccessMessage('Password updated successfully! Please sign in with your new password.');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Verification email resent to ${email}.`);
        setResendCooldown(60);
      }
    } catch (err) {
      setError('Failed to resend verification email.');
    }
  };

  const handleSimulateVerifyEmail = async () => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'mock_verify_token' }),
      });
      const data = await res.json();
      setSuccessMessage('Email verified successfully! You can now sign in.');
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } catch (err) {
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" id="supabase-auth-modal">
      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1a24] bg-[#0a0a0f] p-6 sm:p-8 text-[#e0e0e6] shadow-[0_0_50px_rgba(0,0,0,0.85)] max-h-[95vh] overflow-y-auto">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white cursor-pointer transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.4)]">
            <Zap className="h-5 w-5 fill-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' && 'Sign in to Job Buddy'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot_password' && 'Reset your password'}
              {mode === 'reset_password' && 'Choose new password'}
              {mode === 'email_verification' && 'Verify your email'}
            </h2>
            <p className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">
              SUPABASE AUTHENTICATION ENGINE
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-300 border border-emerald-500/20 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* ==================== 1. SIGN IN MODE ==================== */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs" id="login-form">
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                Email Address
              </label>
              <input
                type="email"
                required
                id="login-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-gray-500" />
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode('forgot_password');
                  }}
                  className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 pr-10 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Authenticating with Supabase...' : 'Sign In'}</span>
            </button>

            {/* Google Sign In with Firebase */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1a1a24]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0a0a0f] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              id="btn_google_signin"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#0f0f18] hover:bg-[#161622] hover:border-white/20 py-2.5 px-4 text-xs font-medium text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.43 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>Sign in with Google (Firebase)</span>
            </button>

            <div className="mt-5 text-center text-xs text-gray-400 pt-2 border-t border-[#1a1a24]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('signup');
                }}
                className="text-teal-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign up free
              </button>
            </div>
          </form>
        )}

        {/* ==================== 2. SIGN UP MODE ==================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 text-xs" id="signup-form">
            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                required
                id="signup-name-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                Email Address
              </label>
              <input
                type="email"
                required
                id="signup-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.chen@example.com"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  id="signup-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password..."
                  className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 pr-10 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2 rounded-xl bg-[#0d0d15] p-3 border border-[#1a1a24]">
                  
                  {/* Strength Bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-400">Password Security:</span>
                    <span className={`font-bold ${
                      passwordStrength.score <= 2 ? 'text-rose-400' :
                      passwordStrength.score <= 4 ? 'text-amber-400' : 'text-teal-400'
                    }`}>
                      {passwordStrength.score <= 2 && 'Weak'}
                      {passwordStrength.score === 3 && 'Fair'}
                      {passwordStrength.score === 4 && 'Good'}
                      {passwordStrength.score === 5 && 'Strong'}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[#1a1a24] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= level
                            ? passwordStrength.score <= 2
                              ? 'bg-rose-500'
                              : passwordStrength.score <= 4
                              ? 'bg-amber-500'
                              : 'bg-teal-500 shadow-[0_0_6px_#14b8a6]'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1">
                    <div className={`flex items-center gap-1.5 ${passwordStrength.hasMinLength ? 'text-teal-400' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordStrength.hasMinLength ? 'text-teal-400' : 'text-gray-600'}`} />
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.hasUppercase ? 'text-teal-400' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordStrength.hasUppercase ? 'text-teal-400' : 'text-gray-600'}`} />
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.hasLowercase ? 'text-teal-400' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordStrength.hasLowercase ? 'text-teal-400' : 'text-gray-600'}`} />
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.hasNumber ? 'text-teal-400' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-teal-400' : 'text-gray-600'}`} />
                      <span>Number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordStrength.hasSpecialChar ? 'text-teal-400' : 'text-gray-500'} col-span-2`}>
                      <Check className={`h-3 w-3 ${passwordStrength.hasSpecialChar ? 'text-teal-400' : 'text-gray-600'}`} />
                      <span>Special Character (!@#$%^&*...)</span>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  id="signup-confirm-password-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password..."
                  className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 pr-10 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <span className="text-[10px] text-rose-400 mt-1 block">Passwords do not match.</span>
              )}
            </div>

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={loading || !passwordStrength.isStrong || password !== confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>{loading ? 'Registering with Supabase...' : 'Create Account'}</span>
            </button>

            {/* Google Sign Up with Firebase */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1a1a24]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-[#0a0a0f] px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              id="btn_google_signup"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-[#0f0f18] hover:bg-[#161622] hover:border-white/20 py-2.5 px-4 text-xs font-medium text-white transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.27 21.43 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>Sign up with Google (Firebase)</span>
            </button>

            <div className="mt-5 text-center text-xs text-gray-400 pt-2 border-t border-[#1a1a24]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-teal-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* ==================== 3. FORGOT PASSWORD MODE ==================== */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs" id="forgot-password-form">
            <p className="text-gray-400 leading-relaxed text-xs">
              Enter your registered account email and we'll dispatch Supabase password reset instructions.
            </p>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                Account Email
              </label>
              <input
                type="email"
                required
                id="reset-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
            >
              <KeyRound className="h-4 w-4" />
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Instructions'}</span>
            </button>

            {resetToken && (
              <div className="rounded-xl bg-[#0d0d15] p-3.5 border border-[#1a1a24] space-y-2">
                <span className="text-teal-400 font-mono text-[10px] block font-bold">
                  DEVELOPMENT RESET TOKEN GENERATED:
                </span>
                <button
                  type="button"
                  onClick={() => setMode('reset_password')}
                  className="w-full py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg font-mono text-xs hover:bg-indigo-500/30 cursor-pointer transition"
                >
                  Proceed to Set New Password →
                </button>
              </div>
            )}

            <div className="mt-5 text-center text-xs text-gray-400 pt-2 border-t border-[#1a1a24]">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-teal-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================== 4. RESET PASSWORD / NEW PASSWORD MODE ==================== */}
        {mode === 'reset_password' && (
          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs" id="update-password-form">
            <p className="text-gray-400 text-xs leading-relaxed">
              Create a new secure password for <span className="text-white font-semibold">{email}</span>.
            </p>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-500" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password..."
                  className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 pr-10 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password checklist */}
              {password.length > 0 && (
                <div className="mt-2.5 rounded-xl bg-[#0d0d15] p-3 border border-[#1a1a24] space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Check className={`h-3 w-3 ${passwordStrength.isStrong ? 'text-teal-400' : 'text-gray-500'}`} />
                    <span className={passwordStrength.isStrong ? 'text-teal-400' : 'text-gray-400'}>
                      Requires 8+ chars, uppercase, lowercase, number, and symbol.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password..."
                className="w-full rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-3 text-white placeholder:text-gray-600 focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !passwordStrength.isStrong || password !== confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 text-xs font-bold text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 disabled:opacity-50 cursor-pointer uppercase tracking-wider transition"
            >
              <KeyRound className="h-4 w-4" />
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>
        )}

        {/* ==================== 5. EMAIL VERIFICATION NOTICE ==================== */}
        {mode === 'email_verification' && (
          <div className="space-y-5 text-xs text-center py-2" id="verification-screen">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
              <Mail className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Check your email</h3>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                We have sent a Supabase confirmation link to{' '}
                <span className="text-teal-400 font-semibold">{email}</span>. Please click the link to verify your address.
              </p>
            </div>

            <div className="rounded-xl border border-[#1a1a24] bg-[#0d0d15] p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-gray-300 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>Didn't receive the email?</span>
              </div>
              <p className="text-gray-500 text-[11px]">
                Check your spam folder, or click below to request a new verification token.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendCooldown > 0}
                className="text-teal-400 hover:underline cursor-pointer disabled:text-gray-600 font-medium text-xs pt-1 block"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend verification email'}
              </button>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSimulateVerifyEmail}
                className="w-full py-2.5 bg-teal-500 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:brightness-110 cursor-pointer uppercase tracking-wider"
              >
                I Verified My Email → Sign In
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-gray-400 hover:text-white py-1 cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
