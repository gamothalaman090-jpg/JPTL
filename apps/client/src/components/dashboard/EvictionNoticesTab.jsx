import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, FileText, LoaderCircle, Plus, ShieldAlert, X, Ban, Trash2 } from 'lucide-react';
import { landlordApi } from '../../services/api';

const dateText = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const idOf = (value) => value?._id || value?.id || value;

export const EvictionNoticesTab = () => {
  const [leases, setLeases] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [leaseId, setLeaseId] = useState('');
  const [reason, setReason] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [selectedNoticeId, setSelectedNoticeId] = useState('');
  const [busy, setBusy] = useState(false);
  const [terminationToReject, setTerminationToReject] = useState(null);
  const [terminationNote, setTerminationNote] = useState('');

  const activeLeases = useMemo(() => leases.filter((lease) => lease.status !== 'ended' && lease.tenant), [leases]);
  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [leaseRes, noticeRes] = await Promise.all([landlordApi.getManagedLeases(), landlordApi.getEvictionNotices()]);
      setLeases(leaseRes?.leases || leaseRes?.data?.leases || []);
      setNotices(noticeRes?.notices || noticeRes?.data?.notices || []);
    } catch (err) {
      setError(err.message || 'Unable to load eviction notices.');
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const startAction = (action) => {
    setLeaseId(activeLeases[0] ? String(idOf(activeLeases[0])) : '');
    setReason('');
    setDocumentUrl('');
    setModal(action);
  };

  const submit = async (event) => {
    event.preventDefault();
    if ((modal === 'notice' || modal === 'override') && (!leaseId || !reason.trim())) return;
    setBusy(true);
    setError('');
    try {
      if (modal === 'notice') {
        await landlordApi.issueEvictionNotice({ leaseId, reason: reason.trim(), documentUrl: documentUrl.trim() });
      } else if (modal === 'override') {
        await landlordApi.evictOverride(leaseId, reason.trim());
      } else if (modal === 'cancel') {
        await landlordApi.cancelEvictionNotice(selectedNoticeId, reason.trim());
      } else {
        await landlordApi.deleteCanceledEvictionNotice(selectedNoticeId);
      }
      setModal(null);
      await refresh();
    } catch (err) {
      setError(err.message || 'The request could not be completed.');
    } finally { setBusy(false); }
  };

  const reviewTermination = async (lease, request, status, landlordNotes = '') => {
    setBusy(true); setError('');
    try {
      await landlordApi.reviewEarlyLeaseEnd(String(idOf(lease)), String(idOf(request)), { status, landlordNotes });
      setTerminationToReject(null); setTerminationNote('');
      await refresh();
    } catch (err) { setError(err.message || 'Could not review early lease end request.'); }
    finally { setBusy(false); }
  };

  const terminationRequests = leases.flatMap((lease) => (lease.terminationRequests || []).map((request) => ({ lease, request })));

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Lease management</p><h1 className="mt-2 text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white sm:text-3xl">Eviction Notices</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Issue 40-day notices and review notice history for managed leases.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => startAction('notice')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"><Plus className="h-4 w-4" /> Issue 40-Day Notice</button>
          <button type="button" onClick={() => startAction('override')} className="inline-flex items-center gap-2 rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"><ShieldAlert className="h-4 w-4" /> Evict Override</button>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {terminationRequests.length > 0 && <section className="space-y-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Early lease end requests</h2><p className="text-sm text-slate-500">Review tenant requests here. Approval updates the lease end date; it does not immediately remove the tenant.</p></div>{terminationRequests.map(({ lease, request }) => <article key={String(idOf(request))} className="rounded-2xl border border-indigo-200 bg-white p-5 dark:border-indigo-900/70 dark:bg-[#10131F]"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{[lease.tenant?.firstName, lease.tenant?.lastName].filter(Boolean).join(' ') || lease.tenant?.email || 'Tenant'} · {lease.unit?.label || 'Unit'}</h3><p className="mt-1 text-sm text-slate-500">{lease.property?.name || 'Property'} · Requested move-out {dateText(request.requestedMoveOutDate)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${request.status === 'pending' ? 'bg-amber-100 text-amber-800' : request.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{request.status}</span></div><p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>{request.landlordNotes && <p className="mt-2 text-sm text-slate-500">Your note: {request.landlordNotes}</p>}{request.status === 'pending' && <div className="mt-4 flex justify-end gap-2"><button disabled={busy} onClick={() => { setTerminationToReject({ lease, request }); setTerminationNote(''); }} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Decline</button><button disabled={busy} onClick={() => reviewTermination(lease, request, 'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve new lease end date</button></div>}</article>)}</section>}
      {loading ? <div className="flex items-center gap-2 p-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading notices…</div> : notices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-9 text-center dark:border-slate-800 dark:bg-[#10131F]"><AlertTriangle className="mx-auto h-9 w-9 text-slate-400" /><h2 className="mt-3 font-bold text-slate-900 dark:text-white">No eviction notices yet</h2><p className="mt-1 text-sm text-slate-500">Notices you issue will be listed here.</p></div>
      ) : <div className="grid gap-4">{notices.map((notice) => <article key={notice._id || notice.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#10131F]">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-slate-900 dark:text-white">{[notice.tenant?.firstName, notice.tenant?.lastName].filter(Boolean).join(' ') || notice.tenant?.email || 'Tenant'} · {notice.unit?.label || 'Unit'}</h2><p className="mt-1 text-sm text-slate-500">{notice.property?.name || 'Property'} · Issued {dateText(notice.issuedAt)}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${notice.status === 'active' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{notice.status}</span></div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{notice.reason}</p><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> Move-out: {dateText(notice.moveOutDate)}</span>{notice.documentUrl && <a className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline dark:text-indigo-400" href={notice.documentUrl} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> Attached document</a>}{notice.status === 'canceled' && <><span>Canceled {dateText(notice.canceledAt)}</span><button type="button" aria-label="Delete canceled notice" title="Delete canceled notice" onClick={() => { setSelectedNoticeId(String(idOf(notice))); setModal('delete'); }} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"><Trash2 className="h-3.5 w-3.5" /><span>Delete</span></button></>}{notice.status === 'active' && <button type="button" onClick={() => { setSelectedNoticeId(String(idOf(notice))); setReason(''); setModal('cancel'); }} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Ban className="h-3.5 w-3.5" /> Cancel Notice</button>}</div>
      </article>)}</div>}

      {modal && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setModal(null); }}>
        <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="eviction-modal-title" className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#10131F]">
          <div className="flex items-start justify-between gap-3"><div><h2 id="eviction-modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white">{modal === 'notice' ? 'Issue 40-Day Notice' : modal === 'override' ? 'Confirm Evict Override' : modal === 'cancel' ? 'Cancel 40-Day Notice?' : 'Delete Canceled Notice?'}</h2><p className="mt-1 text-sm text-slate-500">{modal === 'notice' ? 'The move-out date will be set 40 days after today.' : modal === 'override' ? 'This immediately ends the lease, marks the unit vacant, and removes the tenant from the property assignment.' : modal === 'cancel' ? 'Canceling stops this notice. It will remain in the history with its canceled status.' : 'This permanently removes the canceled notice from both portals. This cannot be undone.'}</p></div><button type="button" onClick={() => setModal(null)} disabled={busy} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button></div>
          {modal !== 'cancel' && <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>Tenant and lease</span><select required value={leaseId} onChange={(event) => setLeaseId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"><option value="">Select an active lease</option>{activeLeases.map((lease) => <option key={String(idOf(lease))} value={String(idOf(lease))}>{[lease.tenant?.firstName, lease.tenant?.lastName].filter(Boolean).join(' ') || lease.tenant?.email || 'Tenant'} · {lease.unit?.label || 'Unit'} · {lease.property?.name || 'Property'}</option>)}</select></label>}
          {modal !== 'cancel' && <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>{modal === 'notice' ? 'Reason for notice' : 'Override reason'}</span><textarea required maxLength={2000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Enter the reason" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>}
          {modal === 'cancel' && <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>Cancellation reason (optional)</span><textarea maxLength={1000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Add a note for the record" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>}
          {modal === 'delete' && <p className="rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">Only canceled notices can be deleted. This removes the record from the landlord and tenant notice lists.</p>}
          {modal === 'notice' && <label className="block space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200"><span>Notice document URL (optional)</span><input type="url" value={documentUrl} onChange={(event) => setDocumentUrl(event.target.value)} placeholder="https://…" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>}
          {modal === 'override' && <p className="rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">This action cannot be undone from this screen. The tenant will lose their property and unit assignment immediately.</p>}
          <div className="flex justify-end gap-2 pt-2"><button type="button" disabled={busy} onClick={() => setModal(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">{modal === 'delete' ? 'Keep Notice' : 'Cancel'}</button><button type="submit" disabled={busy || (modal !== 'cancel' && modal !== 'delete' && !activeLeases.length)} className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50 ${modal === 'override' || modal === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : modal === 'cancel' ? 'bg-slate-700 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{busy ? 'Saving…' : modal === 'notice' ? 'Issue Notice' : modal === 'override' ? 'Confirm Evict Override' : modal === 'cancel' ? 'Cancel Notice' : 'Delete Notice'}</button></div>
          {modal !== 'cancel' && !activeLeases.length && <p className="text-xs text-rose-600">No active tenant leases are available.</p>}
        </form>
      </div>}
      {terminationToReject && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"><form onSubmit={(event) => { event.preventDefault(); reviewTermination(terminationToReject.lease, terminationToReject.request, 'rejected', terminationNote); }} role="dialog" aria-modal="true" aria-labelledby="reject-termination-title" className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 dark:bg-[#10131F]"><div><h2 id="reject-termination-title" className="text-lg font-bold">Decline early lease end request</h2><p className="mt-1 text-sm text-slate-500">Add a note to explain your decision to the tenant.</p></div><textarea required maxLength={1000} value={terminationNote} onChange={(event) => setTerminationNote(event.target.value)} rows={4} className="w-full rounded-xl border bg-transparent p-3 text-sm dark:border-slate-700" placeholder="Reason or next steps" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setTerminationToReject(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button><button disabled={busy} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Decline request'}</button></div></form></div>}
    </section>
  );
};
