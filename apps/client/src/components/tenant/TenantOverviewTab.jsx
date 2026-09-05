import React, { useState } from 'react';
import {
  Home, CreditCard, Wrench, Megaphone, Calendar, ShieldCheck, ArrowUpRight,
  Key, Wifi, Car, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { AccessAuditModal } from './AccessAuditModal';

export const TenantOverviewTab = ({
  tenant,
  unit,
  property,
  tickets = [],
  announcements = [],
  onPayRentClick,
  onRequestRepairClick,
  onNavigateTab,
}) => {
  const [showGateCode, setShowGateCode] = useState(false);
  const [showWifiPass, setShowWifiPass] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  // Compute lease remaining days
  const today = new Date('2026-08-27');
  const leaseEndDate = new Date(unit?.leaseEnd || tenant?.leaseEnd || '2027-01-14');
  const diffTime = Math.max(0, leaseEndDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Active tickets for this tenant
  const tenantTickets = tickets.filter((t) => t.unitId === unit?.id || t.tenantName === tenant?.name);
  const activeTickets = tenantTickets.filter((t) => t.status !== 'resolved');

  return (
    <div className="space-y-6">

      {/* ─── 1. HERO RESIDENT LEASE BANNER ─── */}
      <div className="relative overflow-hidden rounded-3xl apple-glass top-shade p-6 sm:p-8 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <Home className="w-3.5 h-3.5 text-indigo-500" />
            <span>{property?.name || 'Aura Sky Towers & Residences'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-grotesk tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome home, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{tenant?.name || 'Sophia'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono flex items-center gap-3 flex-wrap">
            <span className="text-slate-900 dark:text-white font-bold">{unit?.label || 'Unit 14B'}</span>
            <span>&bull;</span>
            <span>{unit?.bedrooms || 2} Bed &bull; {unit?.bathrooms || 2} Bath ({unit?.sqft || 1150} sqft)</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{diffDays} days remaining on lease</span>
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//JPTL//Resident Portal Calendar//EN\nBEGIN:VEVENT\nSUMMARY:JPTL Monthly Rent Due ($2,450.00)\nDESCRIPTION:Monthly rent payment due for Unit 14B.\nRRULE:FREQ=MONTHLY;BYMONTHDAY=1\nEND:VEVENT\nEND:VCALENDAR";
              const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'JPTL_Resident_Schedule.ics');
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
            className="px-3.5 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-grotesk font-semibold text-xs border border-indigo-500/20 flex items-center gap-1.5 btn-press"
            title="Export iCal / Google Calendar Feed"
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Sync iCal Feed</span>
          </button>

          <button
            type="button"
            onClick={onRequestRepairClick}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-grotesk font-semibold text-xs border border-slate-200 dark:border-slate-800 flex items-center gap-2 btn-press"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Report Repair</span>
          </button>

          <button
            type="button"
            onClick={onPayRentClick}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 btn-press"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Rent</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KEY STATS & ACTION WIDGETS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* WIDGET 1: Rent Payment Card */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Current Rent Balance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Paid for Aug
              </span>
            </div>

            <h3 className="text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight mt-2">
              ${(unit?.monthlyRent || 2400).toLocaleString()}<span className="text-xs font-normal text-slate-400 font-mono">/mo</span>
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Next cycle due <strong className="text-slate-700 dark:text-slate-300">September 1, 2026</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-Pay Active
            </span>
            <button
              onClick={onPayRentClick}
              className="text-xs font-bold font-grotesk text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press"
            >
              Pay Early <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* WIDGET 2: Active Maintenance Tracker */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> Service Requests
              </span>
              {activeTickets.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {activeTickets.length} In Progress
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  All Good
                </span>
              )}
            </div>

            {activeTickets.length > 0 ? (
              <div className="mt-2 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{activeTickets[0].title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{activeTickets[0].description}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-amber-500">
                  <Clock className="w-3 h-3" /> Technician dispatched within 24h
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">0 Active Issues</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Need a repair? Submit a request anytime.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={onRequestRepairClick}
              className="text-xs font-bold font-grotesk text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 btn-press"
            >
              + New Request
            </button>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 btn-press"
            >
              History <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* WIDGET 3: Quick Building & Access Codes */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> Unit & Access Keys
              </span>
              <button
                onClick={() => setIsAuditLogsOpen(true)}
                className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press"
              >
                <ShieldCheck className="w-3 h-3" /> Audit Trail
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1"><Key className="w-3 h-3" /> Gate / Front Code:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 dark:text-white tracking-widest">
                    {showGateCode ? '#8821' : '••••••'}
                  </strong>
                  <button
                    onClick={() => setShowGateCode((p) => !p)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                    aria-label={showGateCode ? 'Hide gate code' : 'Show gate code'}
                  >
                    {showGateCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1"><Car className="w-3 h-3" /> Assigned Parking:</span>
                <strong className="text-indigo-500">Bay #14B (L2)</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-indigo-400" /> Aura-Resident_5G</span>
            <div className="flex items-center gap-1.5">
              <span>Key: <strong className="text-slate-700 dark:text-slate-300">{showWifiPass ? 'sky@2026' : '••••••••'}</strong></span>
              <button
                onClick={() => setShowWifiPass((p) => !p)}
                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                aria-label={showWifiPass ? 'Hide WiFi key' : 'Show WiFi key'}
              >
                {showWifiPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ─── 3. COMMUNITY BROADCASTS & RECENT UPDATES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Announcements Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-500" /> Community Broadcasts & Notices
            </h2>
            <button
              onClick={() => onNavigateTab('announcements')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 2).map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-2 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                    {a.category}
                  </span>
                  <span className="text-slate-400">{a.date}</span>
                </div>
                <h3 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">{a.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Landlord & Emergency Contacts */}
        <div className="space-y-3">
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" /> Property Contacts
          </h2>

          <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Landlord</span>
              <strong className="text-slate-900 dark:text-white block text-sm font-grotesk">{property?.landlordName || 'Alexander Vance'}</strong>
              <p className="text-slate-500 dark:text-slate-400 font-mono">alexander.vance@jptl.com</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
              <span className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-wider block">24/7 Emergency Dispatch</span>
              <strong className="text-slate-900 dark:text-white block font-mono">+1 (800) 555-0199</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">For active plumbing leaks, electrical fire hazards, or lockouts.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Access Audit Trail Modal */}
      <AccessAuditModal isOpen={isAuditLogsOpen} onClose={() => setIsAuditLogsOpen(false)} />

    </div>
  );
};
