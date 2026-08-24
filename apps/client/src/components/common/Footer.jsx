import React, { useState } from 'react';
import { Building2, ArrowRight, CheckCircle2, Mail } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    // Trigger Mailto client email prompt
    const subject = encodeURIComponent('Platform & Enterprise Solution Inquiry');
    const body = encodeURIComponent(
      `Hello JPTL Engineering & Operations Team,\n\n` +
      `I am reaching out regarding a platform inquiry or custom landlord deployment.\n\n` +
      `Contact Email: ${email}\n\n` +
      `Best regards,`
    );

    window.location.href = `mailto:inquiry@jptl.system?subject=${subject}&body=${body}`;

    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 4000);
  };

  return (
    <footer className="bg-slate-100 dark:bg-[#050508] border-t border-slate-200 dark:border-white/10 pt-20 pb-12 font-sans relative overflow-hidden text-slate-700 dark:text-slate-300 transition-colors duration-300">

      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Email Inquiry Banner (Replaced Systems Integration Project Banner) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0B0B14] border border-slate-200 dark:border-white/10 shadow-xl mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center spotlight-card">

          <div className="lg:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Inquiry & Support</span>
            </div>
            <h3 className="font-grotesk text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Have questions or need a custom solution?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-lg">
              Send an inquiry directly to our systems & engineering team for custom landlord onboarding, firm deployment, or technical specifications.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Inquiry email prepared! Our team will get back to you within 24 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email address..."
                    className="w-full bg-slate-50 dark:bg-[#141420] border border-slate-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white text-xs font-grotesk font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <span>Send Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Multi-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-slate-200 dark:border-white/10">

          {/* Brand & Mission Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-grotesk font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                JPTL<span className="text-blue-600 dark:text-blue-500">.SYSTEM</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal max-w-sm">
              Integrated Home Rental & Property Maintenance System. Engineered with React, Express REST API, MongoDB, and VAPID Push Notifications.
            </p>

          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 font-grotesk text-xs">

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                Platform Roles
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tenant View</a></li>
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Landlord Console</a></li>
                <li><a href="#roles" className="hover:text-slate-900 dark:hover:text-white transition-colors">Scoped RBAC Rules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                Architecture Specs
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">REST API Core</a></li>
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">VAPID Push Engine</a></li>
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Ticket State Machine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[11px] mb-4">
                Quick Navigation
              </h4>
              <ul className="space-y-3 font-sans text-slate-600 dark:text-slate-400 text-xs">
                <li><a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">System Capabilities</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tiered Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} JPTL Living System &bull; All Rights Reserved
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Architecture</span>
          </div>
        </div>

        {/* Giant Watermark Background */}
        <div className="pt-12 pb-4 text-center overflow-hidden pointer-events-none select-none">
          <div className="font-grotesk font-black text-[13vw] leading-none text-transparent opacity-[0.15] tracking-tighter uppercase"
            style={{ WebkitTextStroke: '2px rgba(148, 163, 184, 0.5)' }}>
            JPTL LIVING
          </div>
        </div>

      </div>
    </footer>
  );
};
