import React, { useState } from 'react';
import { ArrowRight, Sparkles, Building2, ShieldCheck, CheckCircle2, Wrench, CreditCard, Smartphone } from 'lucide-react';
import { ShaderHeroCanvas } from './ShaderHeroCanvas';

export const HeroSection = ({ onOpenLogin, theme }) => {
  const [activeTab, setActiveTab] = useState('tenant');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState(false);

  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-slate-50 dark:bg-[#08080C] min-h-[90vh] flex items-center transition-colors duration-300">
      
      {/* 1. Interactive Aurora Canvas Shader Background */}
      <ShaderHeroCanvas theme={theme} />

      {/* Grid overlay texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Animated Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#12121D] border border-slate-200 dark:border-white/10 border-beam text-xs font-mono text-blue-600 dark:text-blue-400 backdrop-blur-xl shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>21st.dev Component Architecture • Express REST + React</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="font-grotesk text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Next-Gen Property & <br />
            <span className="gradient-shimmer">Maintenance System</span>
          </h1>

          <p className="font-sans text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            One React codebase serving Tenants, Landlords, and Superadmins. Real-time maintenance workflows, synchronous event-driven payments, and automated audit logging.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenLogin && onOpenLogin('landlord')}
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-grotesk font-bold text-sm shadow-xl flex items-center gap-2.5 btn-press transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Hero Component Showcase */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="spotlight-card glow-card rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#0E0E16]/90 backdrop-blur-2xl shadow-2xl transition-colors duration-300">
            
            {/* Top Widget Nav Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 pr-3 border-r border-slate-200 dark:border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold pl-1">
                  jptl-platform-v1.0
                </span>
              </div>

              {/* Role Switcher Pills */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#161624] p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-grotesk">
                <button
                  onClick={() => setActiveTab('tenant')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 btn-press transition-all ${
                    activeTab === 'tenant' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Tenant View
                </button>

                <button
                  onClick={() => setActiveTab('landlord')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 btn-press transition-all ${
                    activeTab === 'landlord' ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Landlord
                </button>

                <button
                  onClick={() => setActiveTab('superadmin')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 btn-press transition-all ${
                    activeTab === 'superadmin' ? 'bg-pink-600 text-white font-bold shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </button>
              </div>

            </div>

            {/* Widget Content Body */}
            <div className="pt-5">
              {activeTab === 'tenant' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  
                  {/* Ticket Filing Simulator */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-grotesk font-semibold">
                      <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> File Ticket (FR-005)</span>
                      <span className="font-mono text-[10px] text-slate-500">Tenant View</span>
                    </div>

                    {!ticketSubmitted ? (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B0B12] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 font-sans">
                          Issue: Leaking Kitchen Faucet
                        </div>
                        <button
                          onClick={() => setTicketSubmitted(true)}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-grotesk font-semibold text-xs btn-press"
                        >
                          Submit Maintenance Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center space-y-1.5">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
                        <div className="font-grotesk font-bold text-slate-900 dark:text-white">Ticket #409 Submitted</div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300">Synchronous Status Cascade Dispatched</p>
                        <button onClick={() => setTicketSubmitted(false)} className="text-[10px] text-blue-600 dark:text-blue-400 underline font-semibold">
                          Reset Demo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rent Payment Simulator */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-grotesk font-semibold">
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Rent Pay (FR-009)</span>
                      <span className="font-mono text-[10px] text-slate-500">Unit 14B</span>
                    </div>

                    {!paymentPaid ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-slate-800 dark:text-slate-300 font-grotesk">
                          <span>September Rent Due</span>
                          <span className="font-bold text-slate-950 dark:text-white">$2,400.00</span>
                        </div>
                        <button
                          onClick={() => setPaymentPaid(true)}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-grotesk font-semibold text-xs btn-press"
                        >
                          Simulate 1-Click Pay
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                        <div className="font-grotesk font-bold text-emerald-600 dark:text-emerald-400">EventEmitter Fired & Paid!</div>
                        <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300">Txn: TXN_SIM_20268841</div>
                        <button onClick={() => setPaymentPaid(false)} className="text-[10px] text-emerald-600 dark:text-emerald-400 underline font-semibold">
                          Reset Payment
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === 'landlord' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between items-center font-grotesk text-purple-600 dark:text-purple-400 font-semibold">
                    <span>Landlord Console • Active Tickets Queue</span>
                    <span className="font-mono text-[10px] text-slate-500">3 Pending Tickets</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#0B0B12] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-grotesk font-bold text-slate-900 dark:text-white">#401 Plumbing Leaks</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Unit 2B • Aura Towers</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        IN_PROGRESS
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#0B0B12] border border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-grotesk font-bold text-slate-900 dark:text-white">#402 HVAC Inspection</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Unit 4A • Zenith Lofts</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        RESOLVED
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'superadmin' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141420] border border-slate-200 dark:border-white/10 space-y-2 font-mono text-[11px] text-slate-700 dark:text-slate-300 animate-in fade-in duration-200">
                  <div className="flex justify-between text-slate-500 text-[10px] pb-1 border-b border-slate-200 dark:border-white/10">
                    <span>TIMESTAMP</span>
                    <span>ACTOR</span>
                    <span>ACTION</span>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-300">
                    <span>15:32:04</span>
                    <span>landlord_vance</span>
                    <span className="text-emerald-600 dark:text-emerald-400">TICKET_STATUS_UPDATED</span>
                  </div>
                  <div className="flex justify-between text-purple-600 dark:text-purple-300">
                    <span>15:31:12</span>
                    <span>tenant_sophia</span>
                    <span className="text-blue-600 dark:text-blue-400">PAYMENT_CONFIRMED</span>
                  </div>
                  <div className="flex justify-between text-pink-600 dark:text-pink-300">
                    <span>15:28:44</span>
                    <span>superadmin</span>
                    <span className="text-amber-600 dark:text-amber-400">USER_ACCOUNT_SUSPENDED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Widget Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              <span>RBAC Scoped MongoDB Queries</span>
              <button
                onClick={() => onOpenLogin && onOpenLogin(activeTab)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-grotesk font-medium flex items-center gap-1"
              >
                Launch {activeTab.toUpperCase()} Portal <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
