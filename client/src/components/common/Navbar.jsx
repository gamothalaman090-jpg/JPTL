import React, { useState } from 'react';
import { Building2, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';

export const Navbar = ({ theme, onToggleTheme, onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#08080C]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-grotesk font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              JPTL<span className="text-blue-600 dark:text-blue-500">.SYSTEM</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-grotesk font-semibold text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Role Dashboards
          </a>
          <a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Testimonials
          </a>
        </nav>

        {/* Right CTA Actions & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Light/Dark Theme"
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#141420] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center justify-center btn-press shadow-sm transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => onOpenLogin && onOpenLogin('landlord')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-grotesk font-bold shadow-lg flex items-center gap-1.5 btn-press transition-all"
          >
            <span>Portal Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle Light/Dark Theme"
            className="p-2 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#141420] text-slate-700 dark:text-slate-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 rounded-lg bg-slate-100 dark:bg-[#141420] border border-slate-200 dark:border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#0C0C14] border-b border-slate-200 dark:border-white/10 p-4 space-y-3 font-grotesk text-xs text-slate-700 dark:text-slate-300">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-slate-950 dark:hover:text-white">Capabilities</a>
          <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-slate-950 dark:hover:text-white">Role Dashboards</a>
          <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-slate-950 dark:hover:text-white">Testimonials</a>
          
          <div className="pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={() => { onOpenLogin && onOpenLogin('landlord'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-center flex items-center justify-center gap-1.5"
            >
              Portal Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
