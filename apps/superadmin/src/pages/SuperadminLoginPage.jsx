import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export const SuperadminLoginPage = ({ onLoginSuccess = () => {} }) => {
  const [email, setEmail] = useState('superadmin@jptl.sys');
  const [password, setPassword] = useState('admin123');
  const [mfaCode, setMfaCode] = useState('849201');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide valid Superadmin credentials.');
      return;
    }

    if (mfaCode.trim().length !== 6) {
      setError('MFA Security PIN must be exactly 6 digits.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('jptl_superadmin_auth', 'true');
      sessionStorage.setItem('jptl_superadmin_user', JSON.stringify({
        email: email.trim(),
        role: 'SUPERADMIN_ROOT',
        loginTime: new Date().toISOString(),
        ip: '192.168.1.100'
      }));
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans flex items-center justify-center p-4 selection:bg-indigo-600/30 selection:text-indigo-300">
      
      {/* Background Cyber Grid Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0D111D]/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <span>Root System Access</span>
          </div>

          <h1 className="text-2xl font-extrabold font-grotesk tracking-tight text-white">
            JPTL<span className="text-indigo-500">.SUPERADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Platform Security & Infrastructure Command Gateway
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-semibold">Superadmin Account Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@jptl.sys"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070A12] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block font-semibold">Master Access Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070A12] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <label className="text-slate-400 font-semibold">6-Digit MFA Security PIN</label>
              <span className="text-[10px] text-indigo-400 font-bold">Preset: 849201</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="849201"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#070A12] border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs flex items-center justify-center gap-2 btn-press shadow-lg shadow-indigo-600/30 transition-all mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Cryptographic Key…</span>
            ) : (
              <>
                <span>Authenticate & Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Auto-Fill Button */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              setEmail('superadmin@jptl.sys');
              setPassword('admin123');
              setMfaCode('849201');
            }}
            className="text-[11px] font-mono text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Auto-Fill Demo Superadmin Credentials
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] font-mono text-slate-500">
          <span>JPTL System Infrastructure v4.2.0 &bull; TLS 1.3 Strict Access</span>
        </div>

      </div>
    </div>
  );
};
