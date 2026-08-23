import React from 'react';
import { Wrench, Bell, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Tenant Files Request',
      subtitle: 'Mobile PWA Upload',
      description: 'Tenant snaps a photo of a maintenance issue, selects a category, and submits the ticket via PWA.',
      icon: Wrench,
    },
    {
      num: '02',
      title: 'Landlord Receives Alert',
      subtitle: 'Real-time VAPID Push',
      description: 'System dispatches a web-push alert to the landlord’s device and adds an item to their console queue.',
      icon: Bell,
    },
    {
      num: '03',
      title: 'Synchronous Workflow',
      subtitle: 'Cascade & Audit Log',
      description: 'Landlord updates status. Status change automatically appends status history and writes an immutable audit log.',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: 'Resolution & Rent Sync',
      subtitle: 'EventEmitter Payment',
      description: 'Ticket is marked resolved. Rent checkout fires an internal EventEmitter to clear dues and notify tenant.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="workflow" className="py-20 bg-[var(--bg-surface-subtle)] border-y border-[var(--border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-init">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/20 text-xs font-sans font-semibold mb-3">
            <span>Section 6 Integration Engine</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            How the Synchronous Workflow Works
          </h2>
          <p className="font-sans text-base text-[var(--text-secondary)] mt-3 font-normal">
            From tenant ticket filing to landlord status updates and payment confirmation in a single request cycle.
          </p>
        </div>

        {/* 4-Step Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] relative card-hover reveal-init stagger-${idx + 1}`}
              >
                {/* Step Number Accent */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-serif text-3xl font-bold text-[var(--accent-text)] opacity-80">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-[10px] font-mono uppercase font-semibold text-[var(--text-muted)] tracking-wider mb-1">
                  {step.subtitle}
                </div>

                <h3 className="font-sans font-bold text-base text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>

                <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                  {step.description}
                </p>

                {/* Connecting Arrow for Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[var(--border-strong)]">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
