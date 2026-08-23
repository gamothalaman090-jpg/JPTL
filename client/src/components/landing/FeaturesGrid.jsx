import React from 'react';
import { Wrench, CreditCard, Building2, Smartphone, ShieldCheck, Lock, Sparkles } from 'lucide-react';

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Wrench,
      title: 'Maintenance Ticket Workflow',
      description: 'Tenants file tickets with category tagging and photo uploads. Landlords update status with automatic cascading history and notifications.',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      specRef: 'FR-005 & FR-006',
    },
    {
      icon: CreditCard,
      title: 'Synchronous Rent Payments',
      description: 'Internal EventEmitter chain simulates rent checkout. Automatically updates payment records, writes audit logs, and enqueues tenant push alerts.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      specRef: 'FR-008 & FR-009',
    },
    {
      icon: Building2,
      title: 'Property & Unit Management',
      description: 'Landlords create multi-unit properties, set lease terms, and assign tenants with complete visibility over occupancy rates.',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      specRef: 'FR-002 & FR-003',
    },
    {
      icon: Smartphone,
      title: 'Mobile PWA Experience',
      description: 'Installable progressive web app experience for tenants with VAPID web-push notifications, offline fallbacks, and touch controls.',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      specRef: 'FR-017 & NFR-004',
    },
    {
      icon: ShieldCheck,
      title: 'Platform Audit Log',
      description: 'Every administrative action, user login, ticket change, and payment transaction writes an immutable log record for compliance.',
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      specRef: 'FR-013 & NFR-003',
    },
    {
      icon: Lock,
      title: 'Server-Side Scoped RBAC',
      description: 'MongoDB queries are strictly scoped server-side by role. Landlords only see their owned units; tenants only access their own lease.',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      specRef: 'FR-001 & RBAC',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[var(--bg-surface-subtle)] border-y border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-init">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/20 text-xs font-sans font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comprehensive System Capabilities</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            Built for Complete Property & Maintenance Control
          </h2>
          <p className="font-sans text-base text-[var(--text-secondary)] mt-3 font-normal">
            Every feature is designed around real property workflows — from quick maintenance requests to automated compliance auditing.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-6 sm:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] card-hover flex flex-col justify-between reveal-init stagger-${idx + 1}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                      {feat.specRef}
                    </span>
                  </div>

                  <h3 className="font-sans font-semibold text-lg text-[var(--text-primary)] mb-2">
                    {feat.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--accent-text)] font-sans font-medium">
                  <span>Learn workflow spec</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
