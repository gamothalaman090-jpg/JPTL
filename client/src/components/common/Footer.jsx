import React from 'react';
import { Building2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#050508] border-t border-white/10 pt-16 pb-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-grotesk font-extrabold text-xl text-white">
                JPTL<span className="text-blue-500">.SYSTEM</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              Integrated Home Rental & Property Maintenance System. Powered by React, Express REST, MongoDB, and VAPID Push Notifications.
            </p>

            {/* Operational Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-grotesk">
            
            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                Platform Roles
              </h4>
              <ul className="space-y-2.5 text-slate-400 font-sans">
                <li><a href="#roles" className="hover:text-white transition-colors">Tenant Mobile PWA</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Landlord Console</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">Superadmin Oversight</a></li>
                <li><a href="#roles" className="hover:text-white transition-colors">RBAC Rules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                Architecture Specs
              </h4>
              <ul className="space-y-2.5 text-slate-400 font-sans">
                <li><a href="#workflow" className="hover:text-white transition-colors">Workflow Automation</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">EventEmitter Payments</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Immutable Audit Trail</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Cloudinary Storage</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">
                System Meta
              </h4>
              <ul className="space-y-2.5 text-slate-400 font-sans">
                <li><span className="text-slate-500">Course: Systems Integration</span></li>
                <li><span className="text-slate-500">Theme: #2 Property System</span></li>
                <li><span className="text-slate-500">Stack: React + Express</span></li>
                <li><span className="text-slate-500">Database: MongoDB</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-sans gap-4">
          <p>© 2026 JPTL Systems. All rights reserved.</p>
          <div className="flex gap-6 font-grotesk">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">System Health</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
