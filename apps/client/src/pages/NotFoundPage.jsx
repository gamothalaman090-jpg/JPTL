import React from 'react';
import { 
  Building2, 
  Home, 
  ArrowLeft, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  KeyRound, 
  Layers 
} from 'lucide-react';

export function NotFoundPage({ onNavigate }) {
  const handleBack = () => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      onNavigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/20 to-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950/80 backdrop-blur rounded-[10px] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              JPTL
            </span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded">
              Property Cloud
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/login')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all shadow-sm"
        >
          <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sign In</span>
        </button>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center my-auto">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6 shadow-inner backdrop-blur-md">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Error 404 — Route Not Located</span>
        </div>

        {/* Large Decorative 404 Header */}
        <div className="relative mb-6">
          <h1 className="text-8xl sm:text-9xl md:text-[140px] font-black tracking-tighter bg-gradient-to-b from-white via-slate-300 to-slate-700 bg-clip-text text-transparent select-none leading-none drop-shadow-2xl">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/0 blur-2xl -z-10" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          This Unit or Page Doesn't Exist
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
          The requested platform resource has moved, been reassigned, or was entered with an invalid URL. Choose a portal destination below.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 text-sm font-semibold transition-all active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 hover:shadow-indigo-500/40"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>
        </div>

        {/* Navigation Destination Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div
            onClick={() => onNavigate('/dashboard')}
            className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
              Landlord Dashboard
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Manage properties, lease rolls, maintenance tickets, and vendors.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/tenant')}
            className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              Tenant Portal
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Pay rent, file work orders, view digital leases, and register vehicles.
            </p>
          </div>

          <div
            onClick={() => onNavigate('/onboarding')}
            className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/40 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/5"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-950/60 border border-violet-500/30 flex items-center justify-center mb-3 group-hover:bg-violet-600 group-hover:text-white transition-colors text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
              Landlord Setup
              <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Complete property onboarding and unit portfolio configuration.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>JPTL Enterprise Property Management Platform</span>
        </div>
        <div>
          <span>&copy; {new Date().getFullYear()} JPTL Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
