import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { tenantApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdvancePaymentModal = ({ isOpen, onClose, onInvoiceCreated = () => {}, tenant, unit, payments = [] }) => {
  const toast = useToast();
  const [months, setMonths] = useState('1');
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;
  const monthlyRent = Number(tenant?.monthlyRent || unit?.monthlyRent || 0);
  const parkingFee = Boolean(tenant?.hasParking ?? unit?.hasParking) ? Number(tenant?.parkingFee ?? unit?.parkingFee ?? 0) : 0;
  const monthlyTotal = monthlyRent + parkingFee + 45;
  const latestDueDate = payments.reduce((latest, payment) => {
    if (payment?.status === 'draft' || (payment?.isAdvancePayment && payment?.status !== 'paid' && !payment?.submittedAt)) return latest;
    const due = payment?.dueDate ? new Date(payment.dueDate) : null;
    return due && !Number.isNaN(due.getTime()) && (!latest || due > latest) ? due : latest;
  }, null);
  const firstMonth = latestDueDate ? new Date(latestDueDate.getFullYear(), latestDueDate.getMonth() + 1, 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + Number(months) - 1, 1);
  const monthLabel = (date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const submit = async (event) => {
    event.preventDefault(); setBusy(true);
    try {
      const response = await tenantApi.createAdvanceRentInvoice(Number(months));
      onInvoiceCreated(response?.data);
      onClose();
    } catch (error) { toast.error(error.message || 'Could not create an advance rent invoice'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4">
    <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="advance-rent-title" className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#10131F]">
      <div className="flex items-start justify-between"><div><CalendarPlus className="mb-2 text-indigo-500" /><h2 id="advance-rent-title" className="text-xl font-bold text-slate-900 dark:text-white">Pay Rent in Advance</h2><p className="mt-1 text-sm text-slate-500">Choose the number of months to prepare. Nothing is sent to your landlord unless you submit a receipt or report an onsite payment.</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500"><X size={18} /></button></div>
      <label className="block text-sm font-semibold">Months (1–12)<select min="1" max="12" required value={months} onChange={(event) => setMonths(event.target.value)} className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 dark:border-slate-700">{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} month{index ? 's' : ''}</option>)}</select></label>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">Estimated total for {months} month{Number(months) === 1 ? '' : 's'}</p><p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">₱{(monthlyTotal * Number(months)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Coverage: {monthLabel(firstMonth)}{Number(months) > 1 ? ` – ${monthLabel(lastMonth)}` : ''}</p><p className="mt-1 text-[11px] text-slate-500">Final invoice amount and coverage are confirmed by the server.</p></div>
      <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Continue opens your payment form. Your landlord will only see the advance payment after you submit transfer proof or notify them about an onsite payment.</p>
      <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel</button><button disabled={busy} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Preparing payment…' : 'Continue to payment'}</button></div>
    </form>
  </div>;
};
