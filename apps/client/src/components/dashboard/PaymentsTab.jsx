import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, AlertCircle, ShieldCheck, Download, ArrowUpRight } from 'lucide-react';

export const PaymentsTab = ({ payments: initialPayments = [], searchQuery = '' }) => {
  const [payments, setPayments] = useState(initialPayments);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setPayments(initialPayments || []);
  }, [initialPayments]);

  const handleMarkAsPaid = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) =>
        (p.id === paymentId || p._id === paymentId)
          ? {
              ...p,
              status: 'paid',
              mockTransactionId: `TXN_MANUAL_${Math.floor(10000000 + Math.random() * 90000000)}`,
              paidAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert('No payments to export.');
      return;
    }
    const headers = ['ID', 'Tenant', 'Property', 'Unit', 'Amount', 'Status', 'Due Date', 'Transaction ID'];
    const rows = payments.map((p) => [
      p.id || p._id,
      `"${p.tenantName || 'Tenant'}"`,
      `"${p.propertyName || 'Property'}"`,
      `"${p.unitLabel || 'Unit'}"`,
      p.amount || 0,
      p.status || 'pending',
      p.dueDate || '',
      `"${p.mockTransactionId || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jptl_rent_roll_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPayments = payments.filter((p) => {
    const name = (p.tenantName || '').toLowerCase();
    const prop = (p.propertyName || '').toLowerCase();
    const unit = (p.unitLabel || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || prop.includes(q) || unit.includes(q);

    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return matchesSearch;
  });

  const totalCollected = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Cleared
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Invoice
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Financial Summary Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl apple-glass border border-slate-200 dark:border-slate-800/80 top-shade">
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Total Paid (Current Cycle)
          </span>
          <div className="text-2xl font-extrabold font-grotesk text-emerald-600 dark:text-emerald-400">
            ${totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl apple-glass border border-slate-200 dark:border-slate-800/80 top-shade">
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Outstanding / Pending
          </span>
          <div className="text-2xl font-extrabold font-grotesk text-amber-600 dark:text-amber-400">
            ${totalPending.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl apple-glass border border-slate-200 dark:border-slate-800/80 top-shade flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Automated Receipts
            </span>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Stripe / Bank Webhooks
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs btn-press flex items-center gap-1"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-mono">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Rent Roll Header */}
      <div className="p-4 sm:p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Rent Roll & Financial Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time ledger of paid rent, pending charges, and overdue accounts.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          {['all', 'paid', 'pending', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1 rounded-lg capitalize font-mono text-[11px] btn-press transition-all ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden apple-glass top-shade shadow-xs">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono space-y-2">
            <DollarSign className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
            <p>
              {payments.length === 0
                ? 'No payments or transactions recorded in your rent roll yet.'
                : 'No payments match the search criteria.'}
            </p>
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p.id || p._id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">
                    {p.tenantName || 'Tenant'}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                    ({p.unitLabel || 'Unit'} &bull; {p.propertyName || 'Property'})
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                  <span>Due Date: <strong className="text-slate-700 dark:text-slate-300 font-mono">{p.dueDate || '—'}</strong></span>
                  {p.mockTransactionId && (
                    <span className="font-mono text-[11px] text-indigo-500">
                      Ref: {p.mockTransactionId}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-base font-extrabold font-grotesk text-slate-900 dark:text-white block">
                    ${(p.amount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(p.status)}

                  {p.status !== 'paid' && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsPaid(p.id || p._id)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-grotesk btn-press shadow-xs flex items-center gap-1"
                    >
                      <span>Mark Paid</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
