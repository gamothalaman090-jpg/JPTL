import React, { useState } from 'react';
import { FileText, Download, ShieldCheck, Home, Calendar, CheckCircle2, Clock, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { LeaseRenewalModal } from './LeaseRenewalModal';

export const TenantLeaseTab = ({
  tenant,
  unit,
  property,
  lease,
  onExtensionRequested = () => {},
}) => {
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [renewalStatus, setRenewalStatus] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const pendingExtension = renewalStatus || (lease?.extensionRequests?.find((r) => r.status === 'pending') ? {
    term: lease.extensionRequests.find((r) => r.status === 'pending').termMonths,
    proposedStartDate: new Date(lease.extensionRequests.find((r) => r.status === 'pending').proposedStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    proposedEndDate: new Date(lease.extensionRequests.find((r) => r.status === 'pending').proposedEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  } : null);

  const isPreAdded = !unit && !lease?.leaseStart;

  // Resolve real values — prefer lease profile data, fall back to unit
  const leaseStart = lease?.leaseStart || unit?.leaseStart || null;
  const leaseEnd = lease?.leaseEnd || unit?.leaseEnd || null;
  const leaseType = lease?.leaseType || unit?.leaseType || (leaseEnd ? 'fixed_term' : 'indefinite');
  const isIndefiniteLease = leaseType === 'indefinite';
  const monthlyRent = lease?.monthlyRent ?? unit?.monthlyRent ?? null;
  const securityDeposit = lease?.securityDeposit ?? (monthlyRent ? monthlyRent * 1.5 : null);

  // Compute lease term in months
  let leaseTerm = null;
  if (leaseStart && leaseEnd) {
    const s = new Date(leaseStart);
    const e = new Date(leaseEnd);
    const months = Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.44));
    leaseTerm = months > 0 ? `${months} Month${months !== 1 ? 's' : ''}` : null;
  }

  // Compute renewal window (60 days before lease end)
  let renewalWindowDate = null;
  if (leaseEnd) {
    const end = new Date(leaseEnd);
    end.setDate(end.getDate() - 60);
    renewalWindowDate = end.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRenewalSubmitted = (data) => {
    setRenewalStatus(data);
  };

  const handleDownloadLease = async () => {
    setIsDownloading(true);
    try {
      const token = sessionStorage.getItem('jptl_token');
      const apiBase = import.meta.env.VITE_API_URL || '/api';

      const response = await fetch(`${apiBase}/tenant/lease/document`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Try to parse error message from JSON body
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody?.message || 'Failed to generate lease PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Build a descriptive filename
      const unitLabel = unit?.label || lease?.unitLabel || 'unit';
      const propName = property?.name || lease?.propertyName || 'property';
      const safeName = `${propName}-${unitLabel}-Lease-Agreement`.replace(/[^a-zA-Z0-9-_]/g, '_');

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Lease download failed:', err);
      alert(err?.message || 'Unable to download lease agreement. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Pre-added empty state
  if (isPreAdded) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>Digital Lease Agreement</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">My Lease & Documents</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">View official tenancy contracts, building rules, and renewal terms.</p>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl apple-glass top-shade border border-dashed border-amber-400/30 bg-amber-500/5 text-center space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">No Lease Assigned Yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Your account has been created but you haven't been assigned to a unit yet.
              Your landlord will assign you a unit and your lease details will appear here.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> Pending unit assignment
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center gap-3 shrink-0">
          {!isIndefiniteLease && <button
            type="button"
            disabled={Boolean(pendingExtension)}
            onClick={() => setIsRenewalOpen(true)}
            className={`px-4 py-3 rounded-2xl font-grotesk font-semibold text-xs flex items-center gap-2 btn-press border transition-all ${
              pendingExtension
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 cursor-not-allowed opacity-80'
                : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
            }`}
          >
            {pendingExtension ? <Clock className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4" />}
            <span>{pendingExtension ? 'Extension Pending Review' : 'Request Extension'}</span>
          </button>}

          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadLease}
            className={`px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press transition-opacity ${
              isDownloading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? 'Downloading…' : 'Download Signed Lease PDF'}</span>
          </button>
        </div>
      </div>

      {/* Renewal Status Banner if requested or pending */}
      {pendingExtension && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Extension request pending for <strong>{pendingExtension.term} Months</strong> (Starting {pendingExtension.proposedStartDate}
              {pendingExtension.proposedEndDate ? ` → Ending ${pendingExtension.proposedEndDate}` : ''})
            </span>
          </div>
          <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md shrink-0">
            Pending Landlord Review
          </span>
        </div>
      )}

      {/* Lease Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Lease Term</span>
          <strong className="text-sm text-slate-900 dark:text-white font-mono block">
            {isIndefiniteLease ? 'Indefinite' : leaseTerm ? `${leaseTerm} (Standard)` : '—'}
          </strong>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
            {leaseStart ? formatDate(leaseStart) : '—'} → {isIndefiniteLease ? 'No fixed expiration' : leaseEnd ? formatDate(leaseEnd) : '—'}
          </p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Monthly Rent Rate</span>
          <strong className="text-xl text-slate-900 dark:text-white font-grotesk block">
            {monthlyRent !== null ? `$${monthlyRent.toLocaleString()}/mo` : '—'}
          </strong>
          <p className="text-xs text-slate-400 font-mono">Due on the 1st of every month</p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Security Deposit Held</span>
          <strong className="text-xl text-indigo-500 font-grotesk block">
            {securityDeposit !== null ? `$${securityDeposit.toLocaleString()}` : '—'}
          </strong>
          <p className="text-xs text-slate-400 font-mono">Refundable upon move-out</p>
        </div>

        <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Renewal Window</span>
          <strong className="text-sm text-slate-900 dark:text-white font-mono block">
            {isIndefiniteLease ? 'Not required' : renewalWindowDate ? `Opens ${renewalWindowDate}` : '—'}
          </strong>
          <p className="text-xs text-indigo-400 font-mono">60-day notice period</p>
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
              <strong className="text-slate-900 dark:text-white">{property?.name || '—'}</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
              <span className="text-slate-500">Unit Number:</span>
              <strong className="text-slate-900 dark:text-white">{unit?.label || '—'}</strong>
            </div>
            {(unit?.bedrooms || unit?.bathrooms || unit?.sqft) && (
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14]">
                <span className="text-slate-500">Floor Plan:</span>
                <strong className="text-slate-900 dark:text-white">
                  {[
                    unit?.bedrooms ? `${unit.bedrooms} Bed` : null,
                    unit?.bathrooms ? `${unit.bathrooms} Bath` : null,
                    unit?.sqft ? `(${unit.sqft} sqft)` : null,
                  ].filter(Boolean).join(', ')}
                </strong>
              </div>
            )}
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

      {/* MODAL */}
      <LeaseRenewalModal
        isOpen={isRenewalOpen}
        onClose={() => setIsRenewalOpen(false)}
        tenant={tenant}
        unit={unit}
        property={property}
        lease={lease}
        onRenewalSubmitted={(data) => {
          handleRenewalSubmitted(data);
          onExtensionRequested();
        }}
      />

    </div>
  );
};
