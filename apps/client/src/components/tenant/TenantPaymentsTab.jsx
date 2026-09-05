import React, { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Clock, Download, ArrowUpRight, DollarSign, 
  ShieldCheck, Building, Plus, FileText, Eye, ChevronRight, PieChart, Sparkles 
} from 'lucide-react';
import { TenantReceiptModal } from './TenantReceiptModal';
import { PaymentMethodsModal } from './PaymentMethodsModal';

const MOCK_PAYMENT_HISTORY = [
  {
    id: 'TXN-9842103',
    period: 'August 2026 Rent',
    amount: 2595,
    paidAt: 'Aug 1, 2026, 09:14 AM',
    status: 'paid',
    method: 'Visa •••• 4242',
  },
  {
    id: 'TXN-9120448',
    period: 'July 2026 Rent',
    amount: 2595,
    paidAt: 'Jul 1, 2026, 10:02 AM',
    status: 'paid',
    method: 'Visa •••• 4242',
  },
  {
    id: 'TXN-8451992',
    period: 'June 2026 Rent',
    amount: 2595,
    paidAt: 'Jun 1, 2026, 08:30 AM',
    status: 'paid',
    method: 'Chase ACH •••• 9102',
  },
  {
    id: 'TXN-7901244',
    period: 'May 2026 Rent',
    amount: 2595,
    paidAt: 'May 1, 2026, 09:00 AM',
    status: 'paid',
    method: 'Chase ACH •••• 9102',
  },
];

export const TenantPaymentsTab = ({
  tenant,
  unit,
  property,
  onPayRentClick,
}) => {
  const [history, setHistory] = useState(MOCK_PAYMENT_HISTORY);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  
  // Modals state
  const [selectedReceiptTx, setSelectedReceiptTx] = useState(null);
  const [isMethodsOpen, setIsMethodsOpen] = useState(false);

  const rentAmount = unit?.monthlyRent || tenant?.monthlyRent || 2400;
  const parkingFee = 150;
  const utilityFee = 45;
  const totalMonthlyDue = rentAmount + parkingFee + utilityFee;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-medium">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Rent & Ledger Center</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">Payment History & Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">View itemized monthly charges, manage saved payment cards, and print tax receipts.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMethodsOpen(true)}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-indigo-500" />
            <span>Manage Methods</span>
          </button>

          <button
            type="button"
            onClick={onPayRentClick}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 btn-press"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Rent Now</span>
          </button>
        </div>
      </div>

      {/* Itemized Monthly Bill Breakdown & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Itemized Statement */}
        <div className="lg:col-span-2 p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" /> Itemized Monthly Statement (September 2026)
            </h2>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Due Sep 1
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500">Base Unit Rent ({unit?.label || 'Unit 14B'})</span>
              <strong className="text-slate-900 dark:text-white">${rentAmount.toLocaleString()}.00</strong>
            </div>

            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500">Assigned Parking (Level 2, Bay #14B)</span>
              <strong className="text-slate-900 dark:text-white">${parkingFee}.00</strong>
            </div>

            <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-slate-500">Water, Sewer & Trash Service</span>
              <strong className="text-slate-900 dark:text-white">${utilityFee}.00</strong>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
              <span>Total Statement Due</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-lg font-grotesk">${totalMonthlyDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Co-Tenant Split Payment Calculator */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold font-grotesk flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Co-Tenant Split Allocation (50/50 Roommate Split)
                </span>
                <span className="text-slate-500 font-mono">${(totalMonthlyDue / 2).toFixed(2)} / roommate</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-slate-500 block">Sophia Lin (Your Share)</span>
                  <strong className="text-indigo-500 text-xs font-bold font-mono">${(totalMonthlyDue / 2).toFixed(2)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block">Co-Tenant Share</span>
                  <strong className="text-slate-700 dark:text-slate-300 text-xs font-bold font-mono">${(totalMonthlyDue / 2).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Escrow Card + Gateway Telemetry */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Security Deposit & Escrow Accounting</span>
            <div className="text-2xl font-extrabold font-grotesk text-indigo-500">${(rentAmount * 1.5).toLocaleString()}.00</div>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Accrued Interest (1.2% APY):</span>
                <strong className="text-emerald-400">+$42.18</strong>
              </div>
              <span className="text-[10px] text-slate-400 block">FDIC Escrow Account Protected</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1 text-xs font-mono">
            <span className="text-emerald-500 font-bold block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gateway Telemetry Operational
            </span>
            <p className="text-[10px] text-slate-500">Stripe ACH Webhooks 100% Synced &bull; Auto-Retry Active &bull; 0 Delay</p>
          </div>

          <div className="p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Auto-Pay Schedule</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {autoPayEnabled ? 'Active (1st of month)' : 'Disabled'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoPayEnabled((p) => !p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold btn-press border ${
                autoPayEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              {autoPayEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

      </div>

      {/* Transaction Table with Receipt Action */}
      <div className="space-y-3">
        <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" /> Payment History & Official Tax Receipts
        </h2>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden apple-glass top-shade shadow-xs">
          {history.map((tx) => (
            <div
              key={tx.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{tx.period}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cleared
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-3">
                  <span>Ref: {tx.id}</span>
                  <span>&bull;</span>
                  <span>{tx.method}</span>
                  <span>&bull;</span>
                  <span>{tx.paidAt}</span>
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Amount Paid</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReceiptTx(tx)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>View Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <TenantReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
        tenant={tenant}
        unit={unit}
        property={property}
      />

      <PaymentMethodsModal
        isOpen={isMethodsOpen}
        onClose={() => setIsMethodsOpen(false)}
      />

    </div>
  );
};
