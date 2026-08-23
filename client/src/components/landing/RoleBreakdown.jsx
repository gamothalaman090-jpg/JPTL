import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Building2, ShieldCheck, Wrench, CreditCard, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

export const RoleBreakdown = ({ onOpenLogin }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'tenant',
      stepNum: 'STEP 01',
      title: 'TENANT VIEW.',
      subtitle: 'Maintenance & Rent Checkout',
      description: 'Tenants submit repair tickets with Cloudinary photos, receive VAPID push alerts, and simulate 1-click rent checkout.',
      addressUrl: 'jptl.app/tenant-portal',
      accentColor: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: Smartphone,
    },
    {
      id: 'landlord',
      stepNum: 'STEP 02',
      title: 'LANDLORD CONSOLE.',
      subtitle: 'Property & Ticket Cascades',
      description: 'Landlords manage multi-unit properties, assign tenant leases, and resolve ticket pipelines with status cascades.',
      addressUrl: 'jptl.app/landlord-dashboard',
      accentColor: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      icon: Building2,
    },
    {
      id: 'superadmin',
      stepNum: 'STEP 03',
      title: 'SUPERADMIN OVERSIGHT.',
      subtitle: 'Audit Logs & Account Controls',
      description: 'Superadmins monitor platform-wide health, inspect immutable audit trails, and suspend/reactivate user accounts.',
      addressUrl: 'jptl.app/admin-audit-logs',
      accentColor: 'from-pink-500 to-purple-600',
      badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      icon: ShieldCheck,
    },
  ];

  const currentStep = steps[activeStep];

  return (
    <section id="roles" className="py-24 bg-slate-50 dark:bg-[#08080C] relative border-t border-slate-200 dark:border-white/10 overflow-hidden z-10 transition-colors duration-300">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Step Selector Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Display Title */}
            <div>
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-widest uppercase mb-2 block">
                Role-Based Access Control (RBAC)
              </span>
              <h2 className="font-grotesk text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                CONTROL EVERY <br />
                <span className="gradient-shimmer">PERSONA.</span>
              </h2>
              <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-4 font-normal leading-relaxed">
                The platform behaves like an integrated stage. Tenants, Landlords, and Superadmins each take the lead when you need them.
              </p>
            </div>

            {/* Vertical Interactive Step Cards List */}
            <div className="space-y-3 pt-2">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <motion.div
                    key={step.id}
                    onMouseEnter={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-white dark:bg-[#141422] border-slate-300 dark:border-white/30 shadow-xl'
                        : 'bg-slate-100/80 dark:bg-[#0E0E16]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 opacity-80 hover:opacity-100'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {step.stepNum}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${step.badgeColor}`}>
                        {step.subtitle}
                      </span>
                    </div>

                    <h3 className="font-grotesk font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                      {step.title}
                    </h3>

                    <p className="font-sans text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* Right Column: macOS Style App Window */}
          <div className="lg:col-span-7 lg:pl-4">
            <div className="rounded-3xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#0C0C14] shadow-2xl overflow-hidden spotlight-card glow-card aspect-[4/3] flex flex-col min-h-[460px] sm:min-h-[520px] transition-colors duration-300">
              
              {/* macOS Window Titlebar */}
              <div className="px-5 py-3.5 bg-slate-200/80 dark:bg-[#08080E] border-b border-slate-300 dark:border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="ml-3 px-3.5 py-1 rounded-lg bg-white dark:bg-[#141420] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 font-mono text-xs flex items-center gap-2">
                    <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{currentStep.addressUrl}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenLogin && onOpenLogin(currentStep.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-grotesk font-bold text-xs flex items-center gap-1.5 btn-press shadow-md transition-all"
                >
                  <span>Launch {currentStep.id.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Interactive Window Content */}
              <div className="p-6 sm:p-8 flex-1 flex items-center justify-center relative overflow-y-auto">
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full space-y-6"
                  >
                    
                    {/* Header Card Inside Showcase */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#141422] border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr ${currentStep.accentColor} text-white font-bold`}>
                            <currentStep.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-grotesk font-black text-slate-900 dark:text-white text-lg">
                              {currentStep.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                              {currentStep.subtitle}
                            </div>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
                          ● RBAC Active
                        </span>
                      </div>
                    </div>

                    {/* Step Specific Dynamic Mock Widgets */}
                    {activeStep === 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Tenant Widget 1 */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs font-grotesk text-blue-600 dark:text-blue-400 font-bold">
                            <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4" /> Ticket #402 Submitted</span>
                            <span className="text-[10px] font-mono text-slate-500">Just Now</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-sans">
                            Leaking Kitchen Sink Faucet attached with Cloudinary photo.
                          </p>
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            Status: SUBMITTED → LANDLORD NOTIFIED
                          </div>
                        </div>

                        {/* Tenant Widget 2 */}
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs font-grotesk text-emerald-600 dark:text-emerald-400 font-bold">
                            <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Rent Charge Paid</span>
                            <span className="text-[10px] font-mono text-slate-500">Unit 14B</span>
                          </div>
                          <div className="text-lg font-grotesk font-bold text-slate-950 dark:text-white">
                            $2,400.00
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            Txn ID: TXN_SIM_20268841 (EventEmitter)
                          </div>
                        </div>

                      </div>
                    )}

                    {activeStep === 1 && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-grotesk font-bold text-slate-950 dark:text-white">Aura Sky Towers • Unit 2B</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Sophia Lin (Tenant) • Rent $2,400/mo</div>
                          </div>
                          <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            IN_PROGRESS
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-grotesk font-bold text-slate-950 dark:text-white">Zenith Lofts • Unit 4A</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Alexander Vance (Landlord) • Rent $3,100/mo</div>
                          </div>
                          <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            RESOLVED
                          </span>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="p-4 rounded-xl bg-white dark:bg-[#0E0E18] border border-slate-200 dark:border-white/10 space-y-2.5 font-mono text-xs">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-white/10 flex justify-between">
                          <span>SYSTEM AUDIT STREAM</span>
                          <span>UNSCOPED SUPERADMIN VIEW</span>
                        </div>

                        <div className="flex justify-between items-center text-blue-600 dark:text-blue-300 text-[11px]">
                          <span>16:04:12</span>
                          <span>actor: landlord_vance</span>
                          <span className="text-emerald-600 dark:text-emerald-400">TICKET_STATUS_UPDATED</span>
                        </div>

                        <div className="flex justify-between items-center text-purple-600 dark:text-purple-300 text-[11px]">
                          <span>16:02:44</span>
                          <span>actor: tenant_sophia</span>
                          <span className="text-blue-600 dark:text-blue-400">PAYMENT_CONFIRMED</span>
                        </div>

                        <div className="flex justify-between items-center text-pink-600 dark:text-pink-300 text-[11px]">
                          <span>15:58:20</span>
                          <span>actor: superadmin</span>
                          <span className="text-amber-600 dark:text-amber-400">USER_ACCOUNT_SUSPENDED</span>
                        </div>
                      </div>
                    )}

                    {/* Bottom Feature Capabilities List */}
                    <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-sans text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Server-Scoped Query Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Instant Status Transition</span>
                      </div>
                    </div>

                  </motion.div>
                </AnimatePresence>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
