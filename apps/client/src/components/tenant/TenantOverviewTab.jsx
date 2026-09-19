import React from 'react';
import { 
  Home, CreditCard, Wrench, Megaphone, Calendar, ShieldCheck, ArrowUpRight, 
  Key, Wifi, Car, FileText, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck, BookOpen
} from 'lucide-react';

export const TenantOverviewTab = ({
  tenant,
  unit,
  property,
  landlord,
  tickets = [],
  announcements = [],
  onPayRentClick,
  onRequestRepairClick,
  onNavigateTab,
}) => {
  // Detect if tenant is pre-added (no unit assigned yet)
  const isPreAdded = !unit;

  // Compute lease remaining days (only when a unit is assigned)
  const today = new Date();
  const leaseEndDate = unit?.leaseEnd || tenant?.leaseEnd ? new Date(unit?.leaseEnd || tenant?.leaseEnd) : null;
  const diffDays = leaseEndDate ? Math.max(0, Math.ceil((leaseEndDate - today) / (1000 * 60 * 60 * 24))) : null;

  // Active tickets for this tenant
  const tenantTickets = tickets.filter((t) => t.unitId === unit?.id || t.tenantName === tenant?.name);
  const activeTickets = tenantTickets.filter((t) => t.status !== 'resolved');

  // Monthly rent — only real data, no fallback
  const monthlyRent = unit?.monthlyRent ?? null;

  return (
    <div className="space-y-6">
      
      {/* ─── 1. HERO RESIDENT LEASE BANNER ─── */}
      <div className="relative overflow-hidden rounded-3xl apple-glass top-shade p-5 sm:p-8 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
        <div className="space-y-2 w-full md:w-auto">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <Home className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate max-w-[240px] sm:max-w-none">{property?.name || 'JPTL Property Management'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-grotesk tracking-tight text-slate-900 dark:text-white leading-tight break-words">
            Welcome, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{tenant?.name || tenant?.firstName || 'Resident'}</span>
          </h1>

          {isPreAdded ? (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs">
                <Clock className="w-3 h-3" /> Pending Unit Assignment
              </span>
              <span className="text-slate-500">Your unit will be assigned by your landlord.</span>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-slate-900 dark:text-white font-bold">{unit?.label}</span>
              <span>&bull;</span>
              <span>{unit?.bedrooms} Bed &bull; {unit?.bathrooms} Bath{unit?.sqft ? ` (${unit.sqft} sqft)` : ''}</span>
              {diffDays !== null && (
                <>
                  <span className="hidden sm:inline">&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold block sm:inline">{diffDays} days remaining on lease</span>
                </>
              )}
            </p>
          )}
        </div>

        {/* Action CTAs: 2-column full-width touch grid on mobile, inline flex on desktop */}
        {!isPreAdded && (
          <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center shrink-0">
            <button
              type="button"
              onClick={onRequestRepairClick}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-grotesk font-semibold text-xs border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 btn-press"
            >
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Report Repair</span>
            </button>

            <button
              type="button"
              onClick={onPayRentClick}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 btn-press"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Rent</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. KEY STATS & ACTION WIDGETS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* WIDGET 1: Rent Payment Card */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Monthly Rent
              </span>
              {!isPreAdded && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active Lease
                </span>
              )}
              {isPreAdded && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-500/10 text-slate-500 border border-slate-500/20">
                  Not Assigned
                </span>
              )}
            </div>

            {isPreAdded ? (
              <>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-400 dark:text-slate-500 tracking-tight mt-2">
                  —<span className="text-xs font-normal font-mono">/mo</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Rent amount will be set when a unit is assigned.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight mt-2">
                  ${monthlyRent !== null ? monthlyRent.toLocaleString() : '—'}<span className="text-xs font-normal text-slate-400 font-mono">/mo</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Contact your landlord for next payment details.
                </p>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            {!isPreAdded ? (
              <>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Lease Active
                </span>
                <button
                  onClick={onPayRentClick}
                  className="text-xs font-bold font-grotesk text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 min-h-[36px] btn-press"
                >
                  Pay Rent <ArrowRight className="w-3 h-3" />
                </button>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Awaiting unit assignment
              </span>
            )}
          </div>
        </div>

        {/* WIDGET 2: Active Maintenance Tracker */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-500" /> Service Requests
              </span>
              {activeTickets.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {activeTickets.length} In Progress
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  All Good
                </span>
              )}
            </div>

            {activeTickets.length > 0 ? (
              <div className="mt-2 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{activeTickets[0].title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{activeTickets[0].description}</p>
                <div className="flex items-center gap-2 pt-1 text-xs font-mono text-amber-500">
                  <Clock className="w-3 h-3" /> Technician dispatched within 24h
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">0 Active Issues</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Need a repair? Submit a request anytime.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <button
              onClick={onRequestRepairClick}
              className="text-xs font-bold font-grotesk text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 min-h-[36px] btn-press"
            >
              + New Request
            </button>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 min-h-[36px] btn-press"
            >
              History <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* WIDGET 3: Quick Building & Access Codes */}
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" /> Unit &amp; Access Keys
              </span>
              <span className="text-xs font-mono text-slate-400">Encrypted</span>
            </div>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60 gap-2">
                <span className="text-slate-400 flex items-center gap-1 text-xs shrink-0"><Key className="w-3 h-3" /> Gate / Front Code:</span>
                <strong className="text-slate-900 dark:text-white tracking-widest text-right">
                  {property?.accessCodes?.gateCode || '—'}
                </strong>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60 gap-2">
                <span className="text-slate-400 flex items-center gap-1 text-xs shrink-0"><Car className="w-3 h-3" /> Assigned Parking:</span>
                {Boolean(tenant?.hasParking ?? unit?.hasParking) ? (
                  <strong className="text-indigo-500 truncate text-right">{tenant?.parkingSpot || unit?.parkingSpot || 'Assigned Slot'}</strong>
                ) : (
                  <span className="text-slate-400 font-mono italic text-xs">None assigned</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-1">
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[150px]">{property?.accessCodes?.wifiSsid || 'WiFi not configured'}</span>
            </span>
            {property?.accessCodes?.wifiPassword ? (
              <span>Key: <strong className="text-slate-700 dark:text-slate-300">{property.accessCodes.wifiPassword}</strong></span>
            ) : (
              <span className="italic">—</span>
            )}
          </div>
        </div>

      </div>

      {/* ─── 2b. BUILDING RULES & POLICIES ─── */}
      {property?.buildingRules?.length > 0 && (
        <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">Building Rules &amp; Policies</span>
            <span className="text-xs font-mono text-slate-400 ml-auto">Set by Property Management</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {property.buildingRules.map((rule, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60"
              >
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
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
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Landlord / Property Manager</span>
              <strong className="text-slate-900 dark:text-white block text-sm font-grotesk">
                {property?.landlordName || landlord?.name || 'Property Management'}
              </strong>
              <p className="text-slate-500 dark:text-slate-400 font-mono">
                {property?.landlordEmail || landlord?.email || 'contact@jptl.com'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-mono text-rose-500 font-bold uppercase tracking-wider block">
                24/7 Emergency Dispatch & Maintenance
              </span>
              <strong className="text-slate-900 dark:text-white block font-mono text-sm">
                {property?.landlordPhone || landlord?.phone || landlord?.officePhone || '+1 (555) 019-2831'}
              </strong>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct phone line to landlord / property management for urgent leaks, fire hazards, or lockouts.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
