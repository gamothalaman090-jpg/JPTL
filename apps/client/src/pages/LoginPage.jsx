import React, { useState } from 'react';
import { Building2, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Sun, Moon, CheckCircle2, Lock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const LoginPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  const [role, setRole] = useState('landlord'); // 'landlord' | 'tenant'
  const [email, setEmail] = useState('vance.landlord@horizonliving.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setTouched({});
    setErrors({});
    if (newRole === 'landlord') {
      setEmail('vance.landlord@horizonliving.io');
    } else {
      setEmail('sophia.lin@example.com');
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = 'Email address is required';
      } else if (!emailRegex.test(value.trim())) {
        error = 'Enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      }
    }

    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = field === 'email' ? email : password;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleChange = (field, val) => {
    if (field === 'email') {
      setEmail(val);
      if (touched.email) setErrors((prev) => ({ ...prev, email: validateField('email', val) }));
    }
    if (field === 'password') {
      setPassword(val);
      if (touched.password) setErrors((prev) => ({ ...prev, password: validateField('password', val) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (role === 'landlord') {
          onNavigate('/dashboard');
        } else {
          onNavigate('/tenant');
        }
      }, 700);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-300">
      
      {/* LEFT PANEL: Split Screen Hero */}
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

          {/* Theme Toggle Button */}
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
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-grotesk text-white leading-[1.08] tracking-[-0.03em]">
            {role === 'landlord' ? 'Landlord Portal.' : 'Resident Portal.'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-md leading-relaxed font-sans font-normal">
            {role === 'landlord'
              ? 'Access your landlord control panel, view unit occupancy, track rent collections, and manage tenant requests.'
              : 'Pay rent online, submit repair tickets, track technician dispatches, and access building announcements.'}
          </p>

          {/* Real Estate Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <span className="text-2xl sm:text-3xl font-extrabold font-grotesk text-white block tracking-tight">2,480+</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Managed Units</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-xl">
              <span className="text-2xl sm:text-3xl font-extrabold font-grotesk text-white block tracking-tight">98.4%</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-slate-400 font-mono tracking-wide">
          {role === 'landlord' ? 'Landlord Control Panel' : 'Resident Portal'} &bull; Secure Authentication
        </div>
      </div>

      {/* RIGHT PANEL: Form Content */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 max-w-xl mx-auto w-full my-auto">
        
        <div>
          {/* ROLE SELECTOR TABS */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-[#10131F] border border-slate-300/60 dark:border-slate-800 mb-8 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleSwitch('landlord')}
              className={`flex-1 py-2.5 rounded-xl font-grotesk font-bold transition-all btn-press ${
                role === 'landlord'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Landlord Console
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('tenant')}
              className={`flex-1 py-2.5 rounded-xl font-grotesk font-bold transition-all btn-press ${
                role === 'tenant'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Resident Portal
            </button>
          </div>

          {/* Header Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-grotesk text-slate-900 dark:text-white tracking-tight">
              {role === 'landlord' ? 'Landlord Sign In' : 'Resident Sign In'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              {role === 'landlord'
                ? 'Access your property management dashboard'
                : 'Sign in with the resident credentials provided by your landlord'}
            </p>
          </div>

          {/* Quick Fill Demo Chips */}
          <div className="mb-6 space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              1-Click Demo Accounts:
            </span>
            {role === 'landlord' ? (
              <button
                type="button"
                onClick={() => handleQuickFill('vance.landlord@horizonliving.io')}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono btn-press"
              >
                🏢 Alexander Vance (Landlord)
              </button>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('sophia.lin@example.com')}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono btn-press"
                >
                  🏠 Sophia Lin (Unit 14B)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('liam.carter@example.com')}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-mono btn-press"
                >
                  🏠 Liam Carter (Loft 304)
                </button>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {isSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs text-center flex flex-col items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Authenticated!</span>
              <span className="text-slate-600 dark:text-slate-300">
                Entering {role === 'landlord' ? 'Landlord Console...' : 'Resident Portal...'}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                disabled={isSubmitting || isSuccess}
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder={role === 'landlord' ? 'vance.landlord@horizonliving.io' : 'sophia.lin@example.com'}
                className={`w-full bg-white dark:bg-[#0D111D] border ${
                  touched.email && errors.email
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                } rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none shadow-sm`}
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
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isSubmitting || isSuccess}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter password"
                  className={`w-full bg-white dark:bg-[#0D111D] border ${
                    touched.password && errors.password
                      ? 'border-rose-500 focus:ring-rose-500'
                      : 'border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15'
                  } rounded-2xl pl-4 pr-11 py-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none shadow-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white active:scale-95 transition-all p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full py-3.5 px-4 rounded-2xl font-grotesk font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {role === 'landlord' ? 'Landlord' : 'Resident'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-slate-600 dark:text-slate-400">
          {role === 'landlord' ? (
            <>
              Need a landlord account?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Create one now
              </button>
            </>
          ) : (
            <span>Don't have login credentials? Contact your landlord to issue your resident account.</span>
          )}
        </div>

      </div>

    </div>
  );
};
