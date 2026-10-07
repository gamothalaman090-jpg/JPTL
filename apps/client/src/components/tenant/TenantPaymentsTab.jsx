import React, { useState } from 'react';
import { CheckCircle2, Clock3, CreditCard, Eye, XCircle, CalendarPlus } from 'lucide-react';
import { TenantReceiptModal } from './TenantReceiptModal';

export const TenantPaymentsTab = ({ tenant, unit, property, lease, payments = [], securityDeposit, onPayRentClick = () => {}, onPayAdvanceClick = () => {}, onDiscardAdvanceClick = () => {} }) => {
  const [selectedReceiptTx, setSelectedReceiptTx] = useState(null);
  const entries = Array.isArray(payments) ? payments : [];
  const payable = entries.find((p) => ['pending', 'overdue'].includes(p.status) && p.reviewStatus !== 'pending_review');
  const deposit = Number(securityDeposit || tenant?.securityDeposit || 0);
  const labelFor = (item) => item.status === 'draft' ? 'Advance draft · Not submitted' : item.reviewStatus === 'pending_review' ? 'Awaiting landlord review' : item.reviewStatus === 'rejected' ? 'Receipt declined' : item.status === 'paid' ? 'Paid' : item.status === 'overdue' ? 'Overdue' : 'Unpaid';

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 p-6 dark:border-slate-800 sm:flex-row sm:items-center">
      <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500"><CreditCard size={15} /> Rent & payments</div><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Payment ledger</h1><p className="mt-1 text-sm text-slate-500">Submit transfer receipts or request onsite payment confirmation. The landlord must approve before an invoice is marked paid.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => onPayRentClick(payable || null)} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Pay Rent Now</button><button type="button" disabled={!lease || lease.status === 'ended'} onClick={onPayAdvanceClick} className="flex items-center gap-2 rounded-xl border border-indigo-300 px-4 py-3 text-sm font-semibold text-indigo-600 disabled:opacity-50"><CalendarPlus size={16} />Pay in Advance</button></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><p className="text-xs text-slate-500">Current unit</p><p className="mt-1 font-semibold">{unit?.label || tenant?.unitLabel || '—'}</p><p className="text-sm text-slate-500">{property?.name || tenant?.propertyName || 'Property'}</p></div>
      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><p className="text-xs text-slate-500">Security deposit</p><p className="mt-1 text-xl font-bold">₱{deposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
      <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><p className="text-xs text-slate-500">Lease</p><p className="mt-1 font-semibold">{lease?.status || 'Current lease'}</p></div>
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="border-b border-slate-200 p-4 font-bold dark:border-slate-800">Invoices and payment history</div>
      {!entries.length ? <p className="p-8 text-center text-sm text-slate-500">No invoices or payment history yet.</p> : entries.map((entry) => {
        const isPaid = entry.status === 'paid';
        const isPendingReview = entry.reviewStatus === 'pending_review';
        const isDraft = entry.status === 'draft';
        const id = entry.paymentId || entry._id || entry.id;
        return <div key={String(id)} className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 last:border-0 dark:border-slate-800 sm:flex-row sm:items-center">
          <div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{entry.period || entry.notes || 'Rent invoice'}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${isPaid ? 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200' : isPendingReview ? 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200' : entry.reviewStatus === 'rejected' ? 'border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200' : isDraft ? 'border-indigo-200 bg-indigo-100 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200' : 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}`}>{labelFor(entry)}</span></div><p className="mt-1 text-xs text-slate-500">Due {entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : 'date not set'}{entry.paymentChannel ? ` · ${entry.paymentChannel.replace('_', ' ')}` : ''}</p>{entry.rejectionReason && <p className="mt-1 text-sm text-rose-600">Landlord note: {entry.rejectionReason}</p>}</div>
          <div className="flex flex-wrap items-center gap-2"><strong className="mr-2">₱{Number(entry.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>{isPaid ? <button type="button" onClick={() => setSelectedReceiptTx({ ...entry, id, transactionId: entry.receiptNumber || id })} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"><Eye size={14} /> Receipt</button> : isPendingReview ? <span className="flex items-center gap-1 text-xs text-amber-700"><Clock3 size={14} /> In review</span> : isDraft ? <><button type="button" onClick={() => onPayRentClick(entry)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Continue</button><button type="button" onClick={() => onDiscardAdvanceClick(entry)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Discard</button></> : ['pending', 'overdue'].includes(entry.status) && <button type="button" onClick={() => onPayRentClick(entry)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">{entry.reviewStatus === 'rejected' ? 'Resubmit receipt' : 'Pay now'}</button>}</div>
        </div>;
      })}
    </section>
    <TenantReceiptModal isOpen={Boolean(selectedReceiptTx)} onClose={() => setSelectedReceiptTx(null)} transaction={selectedReceiptTx} tenant={tenant} unit={unit} property={property} />
  </div>;
};
