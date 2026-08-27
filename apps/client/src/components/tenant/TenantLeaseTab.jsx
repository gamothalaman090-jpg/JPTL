import React from 'react';
import { FileText, Download, ShieldCheck, Home, Calendar, UserCheck, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const TenantLeaseTab = ({
  tenant,
  unit,
  property,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Lease Agreement</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">My Lease & Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">View official tenancy contracts, building rules, and renewal terms.</p>
        </div>

        <button
          type="button"
          onClick={() => alert('Downloading official Signed Lease Agreement PDF')}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Signed Lease PDF</span>
        </button>
      </div>

      {/* Lease Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Lease Term</span>
          <strong className="text-sm text-slate-900 dark:text-white font-mono block">12 Months (Standard)</strong>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">{unit?.leaseStart || '2026-01-15'} → {unit?.leaseEnd || '2027-01-14'}</p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Monthly Rent Rate</span>
          <strong className="text-xl text-slate-900 dark:text-white font-grotesk block">${(unit?.monthlyRent || 2400).toLocaleString()}/mo</strong>
          <p className="text-[11px] text-slate-400 font-mono">Due on the 1st of every month</p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Security Deposit Held</span>
          <strong className="text-xl text-indigo-500 font-grotesk block">${((unit?.monthlyRent || 2400) * 1.5).toLocaleString()}</strong>
          <p className="text-[11px] text-slate-400 font-mono">Refundable upon move-out</p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Renewal Window</span>
          <strong className="text-sm text-slate-900 dark:text-white font-mono block">Opens Nov 15, 2026</strong>
          <p className="text-[11px] text-indigo-400 font-mono">60-day notice period</p>
        </div>

      </div>

      {/* Unit Specs & Building Bylaws */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Unit Info */}
        <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <Home className="w-4 h-4 text-indigo-500" /> Unit Specifications & Amenities
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
              <span className="text-slate-500">Property:</span>
              <strong className="text-slate-900 dark:text-white">{property?.name || 'Aura Sky Towers & Residences'}</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
              <span className="text-slate-500">Unit Number:</span>
              <strong className="text-slate-900 dark:text-white">{unit?.label || 'Unit 14B'}</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
              <span className="text-slate-500">Floor Plan:</span>
              <strong className="text-slate-900 dark:text-white">{unit?.bedrooms || 2} Bedrooms, {unit?.bathrooms || 2} Bathrooms ({unit?.sqft || 1150} sqft)</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
              <span className="text-slate-500">Assigned Parking Bay:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">Level 2, Bay #14B</strong>
            </div>
          </div>
        </div>

        {/* Building Rules & Bylaws */}
        <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Building Rules & Policies
          </h2>

          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Quiet Hours:</strong> 10:00 PM – 7:00 AM daily for residential floors.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Trash Disposal:</strong> Trash chutes on each floor (7:00 AM - 10:00 PM). Recyclables on B1.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Guest Policy:</strong> Visitors must register at concierge lobby for visits exceeding 48 hours.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Package Concierge:</strong> Deliveries are placed in automated smart lockers in the lobby.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
