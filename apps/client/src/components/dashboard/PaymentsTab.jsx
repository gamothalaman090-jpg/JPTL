import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Download, Eye, XCircle } from 'lucide-react';
import { landlordApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PaymentsTab = ({ payments: initialPayments = [], searchQuery = '' }) => {
  const [payments, setPayments] = useState(initialPayments);
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [busyId, setBusyId] = useState('');
  const toast = useToast();
  useEffect(() => setPayments(initialPayments || []), [initialPayments]);

  const refresh = async () => {
    const response = await landlordApi.getRentRoll();
    setPayments(Array.isArray(response?.data) ? response.data : (response?.payments || []));
  };
  const review = async (payment, action, rejectionReason = '') => {
    const id = payment.id || payment._id;
    setBusyId(id);
    try {
      await landlordApi.reviewPayment(id, action === 'approve' ? { action } : { action, reason: rejectionReason });
      toast.success(action === 'approve' ? 'Payment approved and invoice marked paid.' : 'Receipt declined. Tenant can resubmit.');
      setRejecting(null); setReason(''); await refresh();
    } catch (error) { toast.error(error.message || 'Could not review payment'); }
    finally { setBusyId(''); }
  };
  const openEvidence = async (payment) => {
    try { const blob = await landlordApi.getPaymentEvidence(payment.id || payment._id); const url = URL.createObjectURL(blob); window.open(url, '_blank', 'noopener'); setTimeout(() => URL.revokeObjectURL(url), 60000); }
    catch (error) { toast.error(error.message); }
  };
  const exportCsv = () => {
    const headers = ['Tenant', 'Property', 'Unit', 'Amount', 'Invoice status', 'Review status', 'Due date'];
    const rows = payments.map((p) => [p.tenantName || 'Tenant', p.propertyName || '', p.unitLabel || '', p.amount || 0, p.status || '', p.reviewStatus || '', p.dueDate || ''].map((v) => `"${String(v).replaceAll('"', '""')}"`));
    const url = URL.createObjectURL(new Blob([[headers.join(','), ...rows.map((r) => r.join(','))].join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'jptl-rent-roll.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const filtered = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    if (![p.tenantName, p.propertyName, p.unitLabel].some((value) => String(value || '').toLowerCase().includes(q))) return false;
    return statusFilter === 'all' || (statusFilter === 'pending_review' ? p.reviewStatus === 'pending_review' : p.status === statusFilter);
  });
  const collected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const outstanding = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((s, p) => s + Number(p.amount || 0), 0);
  const statusClass = (payment) => {
    if (payment.reviewStatus === 'pending_review') return 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200';
    if (payment.reviewStatus === 'rejected') return 'border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200';
    if (payment.status === 'paid') return 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200';
    if (payment.status === 'overdue') return 'border-rose-200 bg-rose-100 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200';
    return 'border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';
  };

  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#10131F] dark:text-white"><p className="text-xs uppercase text-slate-500">Collected</p><strong className="text-2xl">₱{collected.toLocaleString()}</strong></div><div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#10131F] dark:text-white"><p className="text-xs uppercase text-slate-500">Outstanding, including review queue</p><strong className="text-2xl">₱{outstanding.toLocaleString()}</strong></div><div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#10131F] dark:text-white"><div><p className="text-xs uppercase text-slate-500">Payment workflow</p><strong className="text-sm">Manual confirmation</strong></div><button onClick={exportCsv} className="rounded-lg border border-slate-300 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200" title="Export CSV"><Download size={17} /></button></div></div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#10131F]"><div><h2 className="font-bold text-slate-900 dark:text-white">Rent roll and payment review</h2><p className="text-xs text-slate-500">Submitted receipts and onsite requests stay outstanding until approved.</p></div><div className="flex flex-wrap gap-1">{[['all', 'All'], ['pending_review', 'Needs review'], ['pending', 'Pending'], ['overdue', 'Overdue'], ['paid', 'Paid']].map(([key, label]) => <button key={key} onClick={() => setStatusFilter(key)} className={`rounded-lg px-3 py-1.5 text-xs ${statusFilter === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{label}</button>)}</div></div>
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#10131F] dark:text-white">{filtered.length ? filtered.map((p) => {
      const id = p.id || p._id; const review = p.reviewStatus === 'pending_review';
      return <article key={id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><b>{p.tenantName || 'Tenant'}</b><span className="text-xs text-slate-500">{p.unitLabel} · {p.propertyName}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(p)}`}>{review ? 'Awaiting review' : p.reviewStatus === 'rejected' ? 'Rejected' : p.status === 'pending' ? 'Unpaid' : p.status}</span></div><p className="mt-1 text-xs text-slate-500">{p.period} · Due {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'} · {p.paymentChannel?.replace('_', ' ') || p.paymentMethod || 'No payment submitted'}</p>{p.transferReference && <p className="mt-1 text-xs">Reference: {p.transferReference}</p>}{p.tenantPaymentNote && <p className="mt-1 text-xs text-slate-500">Tenant note: {p.tenantPaymentNote}</p>}{p.rejectionReason && <p className="mt-1 text-xs text-rose-600">Previous rejection: {p.rejectionReason}</p>}</div><div className="flex flex-wrap items-center gap-3"><strong>₱{Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>{p.hasReceipt && <button onClick={() => openEvidence(p)} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"><Eye size={14} /> View receipt</button>}{review && <><button disabled={busyId === id} onClick={() => review(p, 'approve')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 className="mr-1 inline" size={14} />Approve</button><button disabled={busyId === id} onClick={() => { setRejecting(p); setReason(''); }} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><XCircle className="mr-1 inline" size={14} />Decline</button></>}</div></article>;
    }) : <p className="p-10 text-center text-sm text-slate-500">No payments match this view.</p>}</div>
    {rejecting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><form onSubmit={(event) => { event.preventDefault(); review(rejecting, 'reject', reason); }} className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900"><h3 className="font-bold">Decline payment evidence</h3><p className="mt-1 text-sm text-slate-500">Tell the tenant what needs to be corrected.</p><textarea autoFocus required minLength={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-4 w-full rounded-xl border bg-transparent p-3 text-sm" rows={4} placeholder="Reason for decline" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setRejecting(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={busyId === (rejecting.id || rejecting._id)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Decline</button></div></form></div>}
  </div>;
};
