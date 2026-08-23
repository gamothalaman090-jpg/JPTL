import React, { useState } from 'react';
import { Building2, ArrowRight, CheckCircle2, ShieldCheck, Globe, Code, Terminal, Sparkles } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <footer className="bg-[#050508] border-t border-white/10 pt-20 pb-12 font-sans relative overflow-hidden text-slate-300">
      
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Newsletter & System Status Banner (footer.design style) */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0B0B14] border border-white/10 shadow-2xl mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center spotlight-card">
          
          <div className="lg:col-span-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Updates</span>
            </div>
            <h3 className="font-grotesk text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Stay in the Loop with JPTL Specs
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Receive live release notes, integration benchmarks, and feature additions.
            </p>
          </div>

          <div className="lg:col-span-6">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121220] border border-white/15 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-sans"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-grotesk font-bold text-xs flex items-center gap-1.5 btn-press shadow-md"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-grotesk text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Subscribed to JPTL Platform Updates!
              </div>
            )}
          </div>

        </div>

        {/* Multi-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-grotesk font-black text-2xl text-white tracking-tight">
                JPTL<span className="text-blue-500">.SYSTEM</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-sm">
              Integrated Home Rental & Property Maintenance System. Engineered with React, Express REST API, MongoDB, and VAPID Push Notifications.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • 99.98% Uptime</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 font-grotesk text-xs">
            
            <div>
              <h4 className="font-bold text-white uppercase tracking-widest text-[11px] mb-4">
                Platform Roles
              </h4>
              <ul className="space-y-3 font-sans text-slate-400 text-xs">
                <li><a href="#roles" className="hover:text-white transition-colors">Tenant Mobile View</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Landlord Console</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Superadmin Oversight</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Scoped RBAC Rules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-widest text-[11px] mb-4">
                Architecture Specs
              </h4>
              <ul className="space-y-3 font-sans text-slate-400 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Workflow Cascades</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">EventEmitter Payments</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Immutable Audit Logs</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">VAPID Push Engine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-widest text-[11px] mb-4">
                System Meta
              </h4>
              <ul className="space-y-3 font-sans text-slate-400 text-xs">
                <li><span className="text-slate-500">Course: Systems Integration</span></li>
                <li><span className="text-slate-500">Theme: #2 Property System</span></li>
                <li><span className="text-slate-500">Stack: React + Express</span></li>
                <li><span className="text-slate-500">Database: MongoDB</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Giant footer.design Background Watermark */}
        <div className="pt-12 pb-4 text-center overflow-hidden pointer-events-none select-none">
          <div className="font-grotesk font-black text-[13vw] leading-none text-transparent stroke-text opacity-10 tracking-tighter uppercase"
               style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.4)' }}>
            JPTL LIVING
          </div>
        </div>

        {/* Bottom Social & Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>© 2026 JPTL Systems. Built for Systems Integration.</span>
          </div>

          <div className="flex items-center gap-6 font-grotesk">
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> Repository
            </a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> API Specs
            </a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Global Network
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
