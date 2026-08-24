import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Smartphone, Building2, CheckCircle2, ArrowRight, UserPlus, User } from 'lucide-react';

export const LoginModal = ({ isOpen, initialRole = 'tenant', onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialRole === 'superadmin' ? 'tenant' : initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const demoAccounts = {
    tenant: { name: 'Sophia Lin', email: 'sophia.tenant@horizonliving.io' },
    landlord: { name: 'Alexander Vance', email: 'vance.landlord@horizonliving.io' },
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (mode === 'login') {
      setEmail(demoAccounts[role].email);
      setPassword('••••••••••••');
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setIsSuccess(false);
    if (newMode === 'login') {
      setEmail(demoAccounts[selectedRole]?.email || '');
      setPassword('••••••••••••');
    } else {
      setFullName('');
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          name: mode === 'register' ? (fullName || 'New User') : (demoAccounts[selectedRole]?.name || 'User'),
          email: email || demoAccounts[selectedRole]?.email,
          role: selectedRole,
        });
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative bg-[#0F0F1A]"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
          >

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 active:scale-[0.92] transition-transform z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mb-6 relative">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors relative z-10 ${mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Sign In
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors relative z-10 ${mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                Create Account
                {mode === 'register' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/30"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            </div>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <motion.div
                key={mode}
                className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                {mode === 'login' ? <Lock className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
              </motion.div>
              <h3 className="text-2xl font-bold text-white font-grotesk">
                {mode === 'login' ? 'Portal Authentication' : 'Create Portal Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {mode === 'login'
                  ? 'Select demo role profile or enter credentials'
                  : 'Register a new profile to access the platform'}
              </p>
            </div>

            {/* Role Quick Switcher Pills */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => handleSelectRole('tenant')}
                className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.96] transition-all ${selectedRole === 'tenant'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400/50'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                  }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Tenant View</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('landlord')}
                className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.96] transition-all ${selectedRole === 'landlord'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-400/50'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Landlord Console</span>
              </button>
            </div>

            {/* Form Container with animated transition */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'register' ? -20 : 20 }}
                transition={{ duration: 0.18 }}
              >
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs text-slate-300 font-medium mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder={mode === 'register' ? 'name@example.com' : ''}
                      value={email || (mode === 'login' ? demoAccounts[selectedRole]?.email || '' : '')}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder={mode === 'register' ? 'Create a secure password' : ''}
                      value={password || (mode === 'login' ? '••••••••••••' : '')}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                {!isSuccess ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 text-xs font-semibold rounded-xl text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] ${selectedRole === 'tenant'
                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                      }`}
                  >
                    {loading ? (
                      <span>{mode === 'login' ? 'Authenticating JWT...' : 'Creating Account...'}</span>
                    ) : (
                      <>
                        <span>
                          {mode === 'login'
                            ? `Sign In as ${demoAccounts[selectedRole]?.name}`
                            : `Register as ${selectedRole === 'tenant' ? 'Tenant' : 'Landlord'}`}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <motion.div
                    className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {mode === 'login' ? 'JWT Authenticated! Launching Session...' : 'Account Created! Signing In...'}
                  </motion.div>
                )}
              </motion.form>
            </AnimatePresence>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-500">
                FR-001 Compliant: Role-based JWT Auth simulation
              </p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
