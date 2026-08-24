import React, { useState } from 'react';
import { Building2, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, ShieldCheck, X, Sun, Moon, Check, Circle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const RegisterPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Field validation - only triggers on blur or submit
  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value.trim()) {
        error = 'Full name is required';
      } else if (value.trim().length < 2 || value.trim().length > 100) {
        error = 'Full name must be 2–100 characters';
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = 'Email address is required';
      } else if (!emailRegex.test(value.trim())) {
        error = 'Enter a valid email address';
      }
    }

    if (name === 'password') {
      const hasNumber = /\d/.test(value);
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters';
      } else if (!hasNumber) {
        error = 'Password must contain at least one number';
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== password) {
        error = 'Passwords do not match';
      }
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'fullName') val = fullName;
    if (field === 'email') val = email;
    if (field === 'password') val = password;
    if (field === 'confirmPassword') val = confirmPassword;

    setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleChange = (field, val) => {
    setSubmitError(null);
    if (field === 'fullName') {
      setFullName(val);
      if (touched.fullName) setErrors((prev) => ({ ...prev, fullName: validateField('fullName', val) }));
    }
    if (field === 'email') {
      setEmail(val);
      if (touched.email) setErrors((prev) => ({ ...prev, email: validateField('email', val) }));
    }
    if (field === 'password') {
      setPassword(val);
      if (touched.password) setErrors((prev) => ({ ...prev, password: validateField('password', val) }));
      if (touched.confirmPassword && confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: val !== confirmPassword ? 'Passwords do not match' : '',
        }));
      }
    }
    if (field === 'confirmPassword') {
      setConfirmPassword(val);
      if (touched.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: val !== password ? 'Passwords do not match' : '',
        }));
      }
    }
  };

  // Checkmark criteria boolean logic (strictly false when empty)
  const is8Chars = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const isFormValid =
    fullName.trim().length >= 2 &&
    fullName.trim().length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    is8Chars &&
    hasDigit &&
    confirmPassword === password;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);

    const nameErr = validateField('fullName', fullName);
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const confirmErr = validateField('confirmPassword', confirmPassword);

    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    setErrors({ fullName: nameErr, email: emailErr, password: passErr, confirmPassword: confirmErr });

    if (nameErr || emailErr || passErr || confirmErr) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      sessionStorage.setItem(
        'jptl_landlord_account',
        JSON.stringify({ fullName: fullName.trim(), email: email.trim() })
      );
      onNavigate('/onboarding?step=1');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-300">
      
      {/* LEFT PANEL: Split Screen Hero (~45% width) - Designed with Emil Kowalski Craft */}
      <div className="w-full md:w-[45%] lg:w-[42%] min-h-[340px] md:min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 dark:from-[#090B18] dark:via-[#0C0F22] dark:to-[#05060E] p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200/10 dark:border-white/[0.08]">
        
        {/* Glow Ambient Layering */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Logo Badge & Theme Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 font-bold group-hover:scale-105 transition-transform duration-200 ease-out">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-grotesk font-extrabold text-xl tracking-tight text-white">
              JPTL<span className="text-indigo-400">.SYSTEM</span>
            </span>
          </a>

          {/* Theme Toggle Button with Press Feedback */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15 backdrop-blur-xl transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-200" />}
          </button>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-10 md:my-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] text-indigo-300 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-grotesk text-white leading-[1.08] tracking-[-0.03em]">
            Property Portal Setup
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-md leading-relaxed font-sans font-normal">
            Centralized landlord controls for unit leasing, tenant directory management, and property operations.
          </p>

          {/* Glassmorphic Real Estate Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-white/20 transition-all duration-200 ease-out">
              <span className="text-2xl sm:text-3xl font-extrabold font-grotesk text-white block tracking-tight">2,480+</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Managed Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-xl hover:border-white/20 transition-all duration-200 ease-out">
              <span className="text-2xl sm:text-3xl font-extrabold font-grotesk text-white block tracking-tight">98.4%</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-slate-400 font-mono tracking-wide">
          Landlord Self-Serve Portal &bull; Step 1 of Account Setup
        </div>
      </div>

      {/* RIGHT PANEL: Form Content (~55% width) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 max-w-xl mx-auto w-full my-auto">
        
        {/* Header Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-grotesk text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
            Sign up to set up your landlord workspace
          </p>
        </div>

        {/* Dismissible Generic Submit Error Banner */}
        {submitError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Registration failed</strong>
                <span>{submitError}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 p-1 rounded-lg"
              aria-label="Dismiss error banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label htmlFor="reg-fullName" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Full name
            </label>
            <input
              id="reg-fullName"
              type="text"
              required
              disabled={isSubmitting}
              value={fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="Alexander Vance"
              className={`w-full bg-white dark:bg-[#0D111D] border ${
                touched.fullName && errors.fullName
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
              } rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-150 ease-out shadow-sm`}
            />
            {touched.fullName && errors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="reg-email" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="vance.landlord@horizonliving.io"
              className={`w-full bg-white dark:bg-[#0D111D] border ${
                touched.email && errors.email
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
              } rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-150 ease-out shadow-sm`}
            />
            {touched.email && errors.email && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Create password"
                className={`w-full bg-white dark:bg-[#0D111D] border ${
                  touched.password && errors.password
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                } rounded-2xl pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-150 ease-out shadow-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white active:scale-95 transition-all p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Validation Indicators with smooth transitions */}
            <div className="flex items-center gap-4 mt-2.5 text-[11px]">
              <span
                className={`flex items-center gap-1.5 font-medium transition-all duration-150 ease-out ${
                  is8Chars ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {is8Chars ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-400" />}
                <span>8+ chars</span>
              </span>

              <span
                className={`flex items-center gap-1.5 font-medium transition-all duration-150 ease-out ${
                  hasDigit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {hasDigit ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3 h-3 text-slate-400" />}
                <span>Number</span>
              </span>
            </div>

            {touched.password && errors.password && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirmPassword" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="reg-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Re-enter password"
                className={`w-full bg-white dark:bg-[#0D111D] border ${
                  touched.confirmPassword && errors.confirmPassword
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                } rounded-2xl pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all duration-150 ease-out shadow-sm`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white active:scale-95 transition-all p-0.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Submit Action Button with Emil active:scale-[0.97] press feedback */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl font-grotesk font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Setting up workspace...</span>
              </>
            ) : (
              <>
                <span>Continue to onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Sign in
          </button>
        </div>

      </div>

    </div>
  );
};
