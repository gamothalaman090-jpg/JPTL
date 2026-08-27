import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, AlertTriangle, FileText, Download, ShieldCheck, 
  User, Building2, Calendar, HardDrive, ZoomIn, ZoomOut, RotateCw, 
  Check, AlertCircle, Clock, FileCheck, ArrowRight
} from 'lucide-react';

export const DocumentInspectionModal = ({ 
  document: doc, 
  onClose, 
  onVerify, 
  onReject 
}) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isVerifying, setIsVerifying] = useState(false);

  // Keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!doc) return null;

  const handleApprove = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onVerify(doc.id);
      setIsVerifying(false);
      onClose();
    }, 400);
  };

  const handleConfirmReject = (e) => {
    if (e) e.preventDefault();
    if (!rejectionReason.trim()) return;
    onReject(doc.id, rejectionReason.trim());
    onClose();
  };

  const QUICK_REJECTION_REASONS = [
    'Document scan or photo is blurry / illegible',
    'Document date has expired or is invalid',
    'Missing required tenant signature or notary seal',
    'Insurance liability coverage is below $100,000 requirement',
    'Incorrect tenant name or unit number specified',
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0C0F1D] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all transform scale-100 opacity-100"
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
      >
        {/* ─── MODAL HEADER ─── */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-[#101426]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-grotesk font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                  {doc.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                  doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                  doc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse'
                }`}>
                  {doc.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Submitted by <span className="font-semibold text-slate-700 dark:text-slate-200">{doc.tenantName}</span> &bull; {doc.unitLabel} ({doc.propertyName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Downloading document ${doc.name}...`)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors btn-press text-xs font-mono flex items-center gap-1.5"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors btn-press"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── MODAL BODY: Split View (Metadata Sidebar + Interactive PDF Reader) ─── */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* LEFT SIDEBAR: Document Metadata & Details */}
          <div className="lg:col-span-4 p-5 space-y-5 bg-slate-50/50 dark:bg-[#080B15]/50 overflow-y-auto">
            
            {/* Resident Info Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#101426] border border-slate-200 dark:border-slate-800/80 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Resident & Unit Context
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-grotesk font-bold">{doc.tenantName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{doc.unitLabel} &bull; {doc.propertyName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Uploaded on {doc.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{doc.size} &bull; {doc.type}</span>
                </div>
              </div>
            </div>

            {/* Current Status Callout */}
            {doc.status === 'Verified' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono space-y-1.5 text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2 font-bold font-grotesk">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified & Approved</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  This document was inspected and verified by <strong>{doc.reviewedBy || 'Landlord'}</strong> on {doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : doc.date}.
                </p>
              </div>
            )}

            {doc.status === 'Rejected' && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono space-y-1.5 text-rose-700 dark:text-rose-400">
                <div className="flex items-center gap-2 font-bold font-grotesk">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Verification Rejected</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  <strong>Reason:</strong> {doc.rejectionReason || 'Document did not meet compliance requirements.'}
                </p>
                {doc.reviewedBy && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block pt-1">
                    Reviewed by {doc.reviewedBy}
                  </span>
                )}
              </div>
            )}

            {/* Verification Guidance Checklist (Landlord Only) */}
            {(onVerify || onReject) && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#101426] border border-slate-200 dark:border-slate-800/80 space-y-2.5 text-xs font-mono">
                <span className="font-grotesk font-bold text-slate-900 dark:text-white block">
                  Verification Guidelines
                </span>
                <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Verify tenant name matches active lease agreement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Check policy expiration date extends through lease term.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Ensure document image is clear, unedited, and readable.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Rejection Form Drawer */}
            {rejecting ? (
              <form onSubmit={handleConfirmReject} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-grotesk font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Reject Document
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setRejecting(false)} 
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-mono"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Select Quick Reason or Type Below:
                  </label>
                  <div className="space-y-1">
                    {QUICK_REJECTION_REASONS.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRejectionReason(r)}
                        className={`w-full text-left p-1.5 rounded-lg text-[10px] font-mono border transition-colors ${
                          rejectionReason === r 
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold' 
                            : 'bg-white dark:bg-[#101426] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        &bull; {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter specific feedback for the tenant..."
                    className="w-full bg-white dark:bg-[#101426] border border-slate-300 dark:border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-grotesk font-bold text-xs shadow-md shadow-rose-600/20 btn-press transition-all disabled:opacity-50"
                >
                  Confirm & Reject Document
                </button>
              </form>
            ) : null}

          </div>

          {/* RIGHT SIDE: Interactive Document Canvas Viewer */}
          <div className="lg:col-span-8 p-6 bg-slate-900/10 dark:bg-black/40 flex flex-col justify-between items-center relative overflow-hidden min-h-[440px]">
            
            {/* Viewer Floating Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-white text-xs font-mono shadow-lg">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 15))}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors btn-press"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-bold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(150, prev + 15))}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors btn-press"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Document Canvas Sheet */}
            <div className="w-full flex-1 flex items-center justify-center p-4 overflow-auto scrollbar-thin">
              <div 
                className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 space-y-6 transition-transform duration-200 transform origin-center select-none"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* Simulated Document Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      <span className="font-grotesk font-black text-sm tracking-wider uppercase text-slate-900">
                        OFFICIAL RESIDENTIAL DOCUMENT
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                      JPTL PROPERTY MANAGEMENT VERIFICATION SYSTEM &bull; REF #{doc.id.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Document Category</span>
                    <span className="text-xs font-mono font-bold text-slate-800">{doc.type}</span>
                  </div>
                </div>

                {/* Simulated Document Body Graphic */}
                <div className="space-y-4 font-mono text-xs text-slate-700">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1 text-[11px]">
                      <span className="text-slate-500">Document Name:</span>
                      <strong className="font-bold">{doc.name}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1 text-[11px]">
                      <span className="text-slate-500">Resident / Policy Holder:</span>
                      <strong>{doc.tenantName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1 text-[11px]">
                      <span className="text-slate-500">Assigned Residence:</span>
                      <strong>{doc.unitLabel} &bull; {doc.propertyName}</strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Filing Date:</span>
                      <strong>{doc.date}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 py-2">
                    <div className="h-2 bg-slate-200 rounded w-full" />
                    <div className="h-2 bg-slate-200 rounded w-11/12" />
                    <div className="h-2 bg-slate-200 rounded w-4/5" />
                    <div className="h-2 bg-slate-200 rounded w-9/12" />
                  </div>

                  {/* Watermark / Stamp */}
                  <div className="pt-4 flex items-center justify-between">
                    <div className="p-3 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">
                        DIGITAL STAMP: VERIFICATION PENDING
                      </span>
                    </div>

                    <div className="text-right text-[10px] text-slate-400">
                      <span>Page 1 of 1</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Floating Action Bar for Verification Decision */}
            {!rejecting && (
              <div className="w-full pt-4 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 dark:bg-[#0C0F1D]/90 backdrop-blur-md p-4 rounded-2xl border shrink-0">
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Verification Status:</span>
                  <strong className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    doc.status === 'Verified' || doc.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    doc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {doc.status}
                  </strong>
                </div>

                {(onVerify || onReject) ? (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {onReject && (
                      <button
                        type="button"
                        onClick={() => setRejecting(true)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-grotesk font-bold text-xs btn-press transition-all flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Reject Document</span>
                      </button>
                    )}

                    {onVerify && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isVerifying || doc.status === 'Verified'}
                        className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-emerald-600/25 btn-press transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{doc.status === 'Verified' ? 'Already Verified' : 'Approve & Mark Verified'}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading official copy of ${doc.name}...`)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-grotesk font-bold text-xs btn-press flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Copy
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
