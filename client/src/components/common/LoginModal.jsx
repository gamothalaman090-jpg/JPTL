import React, { useState } from 'react';
import { X, Lock, Mail, Smartphone, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginModal = ({ isOpen, initialRole = 'tenant', onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState(initialRole === 'superadmin' ? 'tenant' : initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const demoAccounts = {
    tenant: { name: 'Sophia Lin', email: 'sophia.tenant@horizonliving.io' },
    landlord: { name: 'Alexander Vance', email: 'vance.landlord@horizonliving.io' },
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail(demoAccounts[role].email);
    setPassword('••••••••••••');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onLoginSuccess({
          name: demoAccounts[selectedRole]?.name || 'User',
          email: email || demoAccounts[selectedRole]?.email,
          role: selectedRole,
        });
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative transition-all transform scale-100 origin-center bg-[#0F0F1A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 active:scale-[0.92] transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-white font-grotesk">Portal Authentication</h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">Select demo role profile or enter credentials</p>
        </div>

        {/* Role Quick Switcher Pills */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSelectRole('tenant')}
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.96] transition-all ${
              selectedRole === 'tenant'
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
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.96] transition-all ${
              selectedRole === 'landlord'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-400/50'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Landlord Console</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email || demoAccounts[selectedRole]?.email || ''}
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
                value={password || '••••••••••••'}
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
              className={`w-full py-3 text-xs font-semibold rounded-xl text-white transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] ${
                selectedRole === 'tenant'
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              {loading ? (
                <span>Authenticating JWT...</span>
              ) : (
                <>
                  <span>Sign In as {demoAccounts[selectedRole]?.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> JWT Authenticated! Launching Session...
            </div>
          )}
        </form>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500">
            FR-001 Compliant: Role-based JWT Auth simulation
          </p>
        </div>

      </div>
    </div>
  );
};
