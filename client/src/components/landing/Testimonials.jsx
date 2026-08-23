import React from 'react';
import { Building, Users, CheckCircle, Smartphone } from 'lucide-react';

export const Testimonials = () => {
  const metrics = [
    {
      icon: Building,
      value: '120+',
      label: 'Managed Properties',
      detail: 'Multi-unit residential & commercial complexes',
    },
    {
      icon: Users,
      value: '1,450+',
      label: 'Active Tenants',
      detail: 'Registered across mobile PWAs',
    },
    {
      icon: CheckCircle,
      value: '99.4%',
      label: 'Ticket Resolution Rate',
      detail: 'Average status update under 15 minutes',
    },
    {
      icon: Smartphone,
      value: '88%',
      label: 'PWA Adoption Rate',
      detail: 'Tenants installed app directly to home screen',
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#08080C] relative border-t border-white/10 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-init">
          <h2 className="font-grotesk text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Platform Operational Benchmarks
          </h2>
          <p className="font-sans text-slate-400 text-base mt-3 font-normal">
            Real-world metrics demonstrating system performance and mobile tenant adoption.
          </p>
        </div>

        {/* 4-Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`spotlight-card rounded-3xl p-6 text-center reveal-init stagger-${idx + 1}`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="font-grotesk text-3xl sm:text-4xl font-extrabold text-white mb-1">
                  {item.value}
                </div>

                <div className="font-grotesk font-semibold text-xs sm:text-sm text-slate-200 mb-1">
                  {item.label}
                </div>

                <div className="font-sans text-[11px] text-slate-400 leading-normal">
                  {item.detail}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
