import React, { useState } from 'react';
import { Building2, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar = ({ onOpenLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#08080C]/85 backdrop-blur-xl border-b border-white/10 font-sans transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group active:scale-[0.98] transition-transform">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-grotesk font-extrabold text-xl tracking-tight text-white">
              JPTL<span className="text-blue-500">.SYSTEM</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-grotesk font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#roles" className="hover:text-white transition-colors">
            Role Dashboards
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Integration Specs
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors">
            Benchmarks
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onOpenLogin && onOpenLogin('landlord')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-grotesk font-bold shadow-lg flex items-center gap-1.5 btn-press"
          >
            <span>Portal Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 rounded-lg bg-[#141420] border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0C14] border-b border-white/10 p-4 space-y-3 font-grotesk text-xs text-slate-300">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white">Capabilities</a>
          <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white">Role Dashboards</a>
          <a href="#workflow" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-white">Integration Specs</a>
          
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={() => { onOpenLogin && onOpenLogin('landlord'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold text-center flex items-center justify-center gap-1.5"
            >
              Portal Sign In <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
