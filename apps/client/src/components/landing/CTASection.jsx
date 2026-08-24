import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const CTASection = ({ onOpenLogin }) => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#08080C] relative border-t border-slate-200 dark:border-white/10 z-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="spotlight-card rounded-3xl p-8 sm:p-14 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E0E18] glow-card relative overflow-hidden shadow-xl">
          
          <h2 className="font-grotesk text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Ready to Experience Next-Gen Property Management?
          </h2>

          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Test the live Tenant View or Landlord Console portals with instant demo role authentication.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => onOpenLogin && onOpenLogin('landlord')}
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-grotesk font-bold text-sm shadow-xl flex items-center justify-center gap-2 btn-press transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Instant Demo Account Access • Express REST + MongoDB</span>
          </div>

        </div>

      </div>
    </section>
  );
};
