import React, { useEffect, useState } from 'react';
import { ArrowRight, Building2, Wrench, CreditCard, Shield, ChevronRight } from 'lucide-react';
import { ShaderHeroCanvas } from './ShaderHeroCanvas';

export const HeroSection = ({ onOpenLogin, theme }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Emil stagger helper — each element gets its own delay
  const stagger = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 650ms cubic-bezier(0.23,1,0.32,1), transform 650ms cubic-bezier(0.23,1,0.32,1)`,
    transitionDelay: `${delay}ms`,
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#08080C] transition-colors duration-300">

      {/* Background */}
      <ShaderHeroCanvas theme={theme} />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06] z-[1]"
        style={{
          backgroundImage: `linear-gradient(rgba(100,116,139,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.4) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">

        {/* Top section: Badge + Headline + Subtitle + CTAs */}
        <div className="flex flex-col items-center text-center">

          {/* Pill badge */}
          <div style={stagger(80)}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10 backdrop-blur-lg shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] tracking-wide text-slate-600 dark:text-slate-400">
                Course Prototype • Systems Integration
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="mt-8 font-grotesk font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.05]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}
          >
            <span className="block" style={stagger(160)}>
              Property Operations
            </span>
            <span className="block" style={stagger(230)}>
              Integration <span className="gradient-shimmer">Engine</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 max-w-lg font-sans text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed"
            style={stagger(320)}
          >
            3-tier RBAC access, maintenance status cascades, MongoDB audit logs, and VAPID push notifications — pre-loaded for course demonstration.
          </p>

          {/* CTA row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4" style={stagger(420)}>
            <button
              onClick={() => onOpenLogin && onOpenLogin('tenant')}
              className="group relative px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-sm shadow-lg shadow-indigo-600/30 btn-press"
              style={{ transition: 'all 200ms cubic-bezier(0.23,1,0.32,1)' }}
            >
              <span className="flex items-center gap-2">
                Launch Portal Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5" style={{ transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1)' }} />
              </span>
            </button>

            <button
              onClick={() => onOpenLogin && onOpenLogin('landlord')}
              className="px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 font-grotesk font-bold text-sm bg-white/50 dark:bg-white/[0.04] backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/[0.08] btn-press"
              style={{ transition: 'background-color 200ms cubic-bezier(0.23,1,0.32,1)' }}
            >
              Landlord Console
            </button>
          </div>
        </div>

        {/* Floating dashboard preview card */}
        <div
          className="mt-16 lg:mt-20 max-w-3xl mx-auto"
          style={stagger(560)}
        >
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#0E0E16]/80 backdrop-blur-2xl shadow-2xl dark:shadow-[0_0_80px_-20px_rgba(99,102,241,0.12)] overflow-hidden">

            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200/60 dark:border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-slate-100 dark:bg-white/[0.05] text-[11px] font-mono text-slate-400 dark:text-slate-500 w-56 text-center truncate">
                  app.jptl.io/system-dashboard
                </div>
              </div>
              <div className="w-12" /> {/* Spacer for symmetry */}
            </div>

            {/* Dashboard preview content */}
            <div className="p-5 sm:p-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Active Units', value: '24 Units', icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Open Tickets', value: '12 Active', icon: Wrench, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Audit Log', value: 'MongoDB', icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'RBAC Model', value: '3 Roles', icon: Shield, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.05]"
                    style={{
                      ...stagger(650 + i * 60),
                    }}
                  >
                    <div className={`inline-flex p-1.5 rounded-lg ${stat.bg} mb-2`}>
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                    <div className="font-grotesk font-bold text-base text-slate-900 dark:text-white leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="space-y-2" style={stagger(920)}>
                {[
                  { id: '#409', title: 'Kitchen faucet leak — Unit 14B', status: 'In Progress', statusColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
                  { id: '#408', title: 'HVAC inspection — Unit 4A', status: 'Resolved', statusColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/40 dark:border-white/[0.04] group cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">{ticket.id}</span>
                      <span className="font-sans text-sm text-slate-700 dark:text-slate-300 truncate">{ticket.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${ticket.statusColor}`}>
                        {ticket.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100" style={{ transition: 'opacity 150ms ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#08080C] to-transparent z-[5] pointer-events-none" />
    </section>
  );
};
