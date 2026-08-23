import React from 'react';
import { Smartphone, Building2, ShieldCheck, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

export const RoleBreakdown = ({ onOpenLogin }) => {
  const roles = [
    {
      id: 'tenant',
      title: 'Tenant PWA Experience',
      badge: 'Mobile-First PWA',
      icon: Smartphone,
      accentColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
      description: 'Mobile PWA for smartphone usage. Submit repair tickets, track status, and pay rent in 1-click.',
      capabilities: [
        'Submit tickets with photo attachments',
        'Receive live VAPID push notifications',
        'Simulate 1-click rent checkout',
        'Access unit lease & receipt history',
      ],
    },
    {
      id: 'landlord',
      title: 'Landlord Console',
      badge: 'Web Dashboard',
      icon: Building2,
      accentColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      btnBg: 'bg-purple-600 hover:bg-purple-500 text-white',
      description: 'Centralized web dashboard for landlords. Manage multi-unit properties and ticket pipelines.',
      capabilities: [
        'Create properties, units & assign leases',
        'Transition ticket status (submitted → resolved)',
        'Issue rent charges & track payments',
        'Review property occupancy metrics',
      ],
    },
    {
      id: 'superadmin',
      title: 'Superadmin Oversight',
      badge: 'Platform Control',
      icon: ShieldCheck,
      accentColor: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
      btnBg: 'bg-pink-600 hover:bg-pink-500 text-white',
      description: 'Platform-wide administrator view. Monitor system health, user accounts, and immutable audit logs.',
      capabilities: [
        'Unscoped read-only access to all properties',
        'Suspend or reactivate any user account',
        'Inspect system-wide immutable audit trail',
        'Review Express API error logs & health',
      ],
    },
  ];

  return (
    <section id="roles" className="py-24 bg-[#08080C] relative border-t border-white/10 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-init">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs font-semibold mb-3">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Single Codebase • Triple Persona Support
          </h2>
          <p className="font-sans text-slate-400 text-base mt-3 font-normal">
            Tailored experiences for Tenants, Landlords, and Superadmins backed by scoped server-side queries.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className={`spotlight-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between reveal-init stagger-${idx + 1}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${role.accentColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="font-grotesk font-bold text-xl text-white mb-2">
                    {role.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed mb-6 font-normal">
                    {role.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {role.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onOpenLogin && onOpenLogin(role.id)}
                  className={`w-full py-3 rounded-xl font-grotesk font-bold text-xs flex items-center justify-center gap-2 btn-press ${role.btnBg}`}
                >
                  <span>Explore {role.id.toUpperCase()} Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
