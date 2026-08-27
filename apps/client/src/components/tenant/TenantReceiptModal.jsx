import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2, FileText } from 'lucide-react';

export const TenantReceiptModal = ({
  isOpen,
  onClose,
  transaction,
  tenant,
  unit,
  property,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const amount = transaction.amount || 2400;
  const baseRent = Math.round(amount * 0.90);
  const parkingFee = 150;
  const utilitiesFee = Math.max(0, amount - baseRent - parkingFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200 print:hidden"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 top-shade modal-enter modal-enter-active apple-glass print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:bg-white print:text-black">
        
        {/* Close & Print Buttons */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-grotesk text-slate-900 dark:text-white uppercase tracking-wider">
              Official Tax Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 btn-press"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RECEIPT FORMAL CONTENT */}
        <div className="space-y-6 text-slate-900 dark:text-slate-100 print:text-black">
          
          {/* Header Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-grotesk font-extrabold text-base tracking-tight">
                  JPTL<span className="text-indigo-600 dark:text-indigo-400 print:text-indigo-600">.SYSTEM</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 font-mono">
                Property Management & Leasing Services LLC
              </p>
              <p className="text-[10px] text-slate-400 print:text-slate-500 font-mono">
                EIN: 84-2901452 &bull; License #PM-992014
              </p>
            </div>

            <div className="sm:text-right font-mono text-xs">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3" /> Paid & Cleared
              </span>
              <p className="text-slate-400 font-mono text-[11px]">Date: {transaction.paidAt || 'Aug 1, 2026'}</p>
              <p className="text-indigo-500 font-bold text-[11px]">Receipt #: {transaction.id || transaction.transactionId}</p>
            </div>
          </div>

          {/* Tenant & Unit Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-xs font-mono">
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Resident / Billed To</span>
              <strong className="text-slate-900 dark:text-white text-sm">{tenant?.name || 'Sophia Lin'}</strong>
              <p className="text-slate-500">{tenant?.email || 'sophia.lin@example.com'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[10px] block">Property & Unit</span>
              <strong className="text-slate-900 dark:text-white text-sm">{unit?.label || 'Unit 14B'}</strong>
              <p className="text-slate-500">{property?.name || 'Aura Sky Towers'}</p>
            </div>
          </div>

          {/* Itemized Charge Ledger Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Itemized Line Items
            </span>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden text-xs font-mono">
              <div className="p-3 flex justify-between bg-slate-100/50 dark:bg-slate-900/50 font-semibold text-slate-500">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 flex justify-between">
                <span>Base Monthly Rent ({transaction.period || 'August 2026'})</span>
                <span className="font-bold text-slate-900 dark:text-white">${baseRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span>Assigned Parking Bay #14B</span>
                <span className="font-bold text-slate-900 dark:text-white">${parkingFee.toFixed(2)}</span>
              </div>
              {utilitiesFee > 0 && (
                <div className="p-3 flex justify-between">
                  <span>Water & Trash Utility Service</span>
                  <span className="font-bold text-slate-900 dark:text-white">${utilitiesFee.toFixed(2)}</span>
                </div>
              )}
              <div className="p-3.5 bg-emerald-500/5 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60">
            <span className="text-slate-400">Payment Instrument:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{transaction.method || 'Visa ending in 4242'}</span>
          </div>

          {/* Legal Manager Signature */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Electronically signed & verified by JPTL Property Management.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block">Authorized Signature</span>
              <span className="font-bold font-grotesk text-slate-900 dark:text-white">Alexander Vance</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
