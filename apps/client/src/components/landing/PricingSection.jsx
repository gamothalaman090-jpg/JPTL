import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const tiers = [
  {
    label: 'STARTER',
    name: 'Free',
    subtitle: 'For independent landlords',
    price: '$0',
    period: '/ forever',
    description: 'Start managing your first properties with the tools that matter most.',
    features: [
      'Up to 3 properties',
      '5 maintenance tickets / month',
      'Tenant self-service portal',
      'Email notifications',
    ],
    cta: 'Start Free',
    tagline: 'Best when you need control before you need scale.',
    recommended: false,
    comingSoon: false,
    dotColor: 'bg-slate-400 dark:bg-slate-500',
  },
  {
    label: 'RECOMMENDED',
    name: 'Professional',
    subtitle: 'For growing portfolios',
    price: '$29',
    period: '/ month',
    description: 'The operational backbone for landlords scaling past a handful of units.',
    features: [
      'Up to 25 properties',
      'Unlimited maintenance tickets',
      'Automated rent collection',
      'Real-time analytics dashboard',
      'VAPID push notifications',
      'Priority support',
    ],
    cta: 'Start Professional',
    tagline: 'This is the plan JPTL has been building toward.',
    recommended: true,
    comingSoon: false,
    dotColor: 'bg-orange-500',
  },
  {
    label: 'COMING SOON',
    name: 'Enterprise',
    subtitle: 'For property management firms',
    price: null,
    priceLabel: 'Coming soon',
    description: 'Multi-team administration, custom integrations, and dedicated onboarding for firms at scale.',
    features: [
      'Unlimited properties',
      'Multi-landlord administration',
      'Custom API integrations',
      'SSO and seat management',
      'Dedicated onboarding & SLA',
    ],
    cta: 'Coming Soon',
    tagline: 'For multi-stakeholder operations with zero tolerance for friction.',
    recommended: false,
    comingSoon: true,
    dotColor: 'bg-emerald-500',
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-slate-50 dark:bg-[#08080C] transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 mb-16 lg:mb-20">

          {/* Left: Big headline */}
          <div className="reveal-init">
            <h2
              className="font-grotesk font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white leading-[1.05]"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}
            >
              Pricing should close the argument, not restart it.
            </h2>
          </div>

          {/* Right: Supporting text + pills */}
          <div className="reveal-init flex flex-col justify-end gap-6">
            <p className="font-sans text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              The structure is simple on purpose: start free, step into the main operating tier
              when your portfolio grows, and escalate only when coordination becomes the bottleneck.
            </p>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {['No hidden fees', 'Monthly billing', 'Cancel anytime'].map((pill) => (
                <span
                  key={pill}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] font-mono text-[11px] tracking-wide uppercase text-slate-600 dark:text-slate-400"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`reveal-init relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-colors duration-300 ${
                tier.recommended
                  ? 'bg-white dark:bg-[#0E0E16] border-slate-300 dark:border-white/15 shadow-xl dark:shadow-[0_0_60px_-15px_rgba(59,130,246,0.1)] z-10 md:-my-3'
                  : 'bg-slate-100/70 dark:bg-[#0A0A12] border-slate-200 dark:border-white/[0.07]'
              }`}
            >
              {/* Top row: label + dot */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 font-semibold">
                  {tier.label}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${tier.dotColor}`} />
              </div>

              {/* Plan name */}
              <h3 className="font-grotesk font-bold text-xl text-slate-900 dark:text-white mb-1">
                {tier.name}
              </h3>

              {/* Subtitle */}
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mb-6">
                {tier.subtitle}
              </p>

              {/* Price */}
              <div className="mb-4">
                {tier.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="font-grotesk font-extrabold text-5xl sm:text-6xl tracking-tight text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="font-sans text-sm text-slate-400 dark:text-slate-500">
                      {tier.period}
                    </span>
                  </div>
                ) : (
                  <span
                    className="font-grotesk font-extrabold tracking-tight text-slate-900 dark:text-white"
                    style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
                  >
                    {tier.priceLabel}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                {tier.description}
              </p>

              {/* Feature list */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0">
                      <span
                        className={`block w-5 h-[1.5px] mt-[7px] ${
                          tier.comingSoon
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : tier.recommended
                            ? 'bg-slate-900 dark:bg-white'
                            : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                      />
                    </span>
                    <span className="font-sans text-sm text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Tagline */}
              <p className="font-mono text-[10px] tracking-wide uppercase text-slate-400 dark:text-slate-500 mb-5 leading-relaxed">
                {tier.tagline}
              </p>

              {/* CTA button */}
              <button
                disabled={tier.comingSoon}
                className={`w-full py-3 rounded-xl font-grotesk font-bold text-sm btn-press transition-colors duration-200 ${
                  tier.recommended
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg'
                    : tier.comingSoon
                    ? 'bg-slate-200 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    : 'bg-white dark:bg-white/[0.06] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.1]'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom info strips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {[
            'Monthly billing with a clear upgrade path',
            'Automated rent collection included from Professional',
            'Enterprise rollout for multi-seat property firms',
          ].map((text) => (
            <div
              key={text}
              className="reveal-init px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-100/50 dark:bg-white/[0.02] font-mono text-[10px] tracking-wide uppercase text-slate-400 dark:text-slate-500 text-center"
            >
              {text}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
