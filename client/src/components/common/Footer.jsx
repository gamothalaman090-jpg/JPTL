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
    <footer className="bg-slate-100 dark:bg-[#050508] border-t border-slate-200 dark:border-white/10 pt-20 pb-12 font-sans relative overflow-hidden text-slate-700 dark:text-slate-300 transition-colors duration-300">
      
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top System Summary Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B0B14] border border-slate-200 dark:border-white/10 shadow-xl mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center spotlight-card">
          
          <div className="lg:col-span-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Systems Integration Project</span>
            </div>
            <h3 className="font-grotesk text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              JPTL Home Rental & Property Management System
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
              Built to fulfill 3-tier RBAC requirements, maintenance ticket state machine, MongoDB activity logging, and VAPID push notifications.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-grotesk text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ready for Technical Defense
            </div>
          </div>

        </div>

        {/* Multi-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-slate-200 dark:border-white/10">
          
          {/* Brand & Mission Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-grotesk font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                JPTL<span className="text-blue-600 dark:text-blue-500">.SYSTEM</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-sm">
              Integrated Home Rental & Property Maintenance System. Engineered with React, Express REST API, MongoDB, and VAPID Push Notifications.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Course Prototype Active • Local & Vercel Ready</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 font-grotesk text-xs">
            
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                Platform Roles
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tenant View</a></li>
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Landlord Console</a></li>
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Scoped RBAC Rules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                Architecture Specs
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Workflow Cascades</a></li>
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">EventEmitter Payments</a></li>
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">MongoDB Audit Logging</a></li>
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">VAPID Push Engine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                System Meta
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><span className="text-slate-500">Course: Systems Integration</span></li>
                <li><span className="text-slate-500">Theme: Property System</span></li>
                <li><span className="text-slate-500">Stack: React + Express</span></li>
                <li><span className="text-slate-500">Database: MongoDB</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Giant Watermark Background */}
        <div className="pt-12 pb-4 text-center overflow-hidden pointer-events-none select-none">
          <div className="font-grotesk font-black text-[13vw] leading-none text-transparent opacity-[0.15] tracking-tighter uppercase"
               style={{ WebkitTextStroke: '2px rgba(148, 163, 184, 0.5)' }}>
            JPTL LIVING
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-4 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>© 2026 JPTL Systems. Systems Integration Course Project.</span>
          </div>

          <div className="flex items-center gap-6 font-grotesk">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> System Capabilities
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
