import React, { useEffect, useState } from 'react';
import { X, Upload, Building2, Clock3, Wallet } from 'lucide-react';
import { tenantApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PayRentModal = ({ isOpen, onClose, payment, unit, tenant, onPaymentSubmitted = () => {}, onDraftDiscarded = () => {} }) => {
  const toast = useToast();
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [channel, setChannel] = useState('qr_transfer');

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false); setReceipt(null); setReference(''); setNote(''); setSelectedId('');
    tenantApi.getPaymentOptions().then((res) => {
      const list = Array.isArray(res?.data) ? res.data : [];
      setOptions(list);
      setSelectedId(list[0]?.id || '');
      setChannel(list[0]?.optionType === 'bank_account' ? 'bank_transfer' : list[0]?.optionType === 'ewallet' ? 'ewallet_transfer' : 'qr_transfer');
    }).catch((error) => toast.error(error.message || 'Could not load payment options'));
  }, [isOpen]);

  if (!isOpen) return null;
  const selected = options.find((option) => String(option.id) === String(selectedId));
  const amount = Number(payment?.amount || 0);
  const close = async () => {
    if (!submitted && payment?.isAdvancePayment && payment?.status === 'draft') {
      const id = payment.paymentId || payment.id || payment._id;
      try {
        await tenantApi.discardAdvanceRentDraft(id);
        onDraftDiscarded(id);
      } catch (error) {
        toast.error(error.message || 'Could not discard the unsubmitted advance draft');
      }
    }
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (channel === 'onsite') {
        await tenantApi.submitOnsitePayment(payment.paymentId || payment.id || payment._id, { note });
      } else {
        if (!selected) throw new Error('Choose a landlord payment option.');
        if (!receipt) throw new Error('Upload your transfer receipt.');
        const form = new FormData();
        form.append('channel', channel); form.append('optionId', selected.id); form.append('receipt', receipt);
        form.append('transferReference', reference); form.append('note', note);
        await tenantApi.submitPaymentEvidence(payment.paymentId || payment.id || payment._id, form);
      }
      setSubmitted(true);
      onPaymentSubmitted();
    } catch (error) { toast.error(error.message || 'Could not submit payment'); }
    finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <button aria-label="Close payment dialog" className="fixed inset-0 bg-slate-950/80" onClick={close} />
    <section role="dialog" aria-modal="true" aria-labelledby="payment-title" className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10131F] p-6 shadow-2xl">
      <button onClick={close} aria-label="Close" className="absolute right-4 top-4 p-2 text-slate-500"><X size={18} /></button>
      {submitted ? <div className="py-8 text-center">
        <Clock3 className="mx-auto mb-3 text-amber-500" size={36} />
        <h2 id="payment-title" className="text-xl font-bold text-slate-900 dark:text-white">Submitted for landlord review</h2>
        <p className="mt-2 text-sm text-slate-500">Your invoice remains unpaid until the landlord confirms the transfer or onsite payment.</p>
        <button onClick={close} className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">Done</button>
      </div> : <form onSubmit={submit}>
        <h2 id="payment-title" className="text-xl font-bold text-slate-900 dark:text-white">Submit rent payment</h2>
        <p className="mt-1 text-sm text-slate-500">{payment?.period || 'Rent invoice'} · {unit?.label || tenant?.unitLabel || 'Unit'} · ₱{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {[['qr_transfer', 'QR transfer'], ['bank_transfer', 'Bank transfer'], ['ewallet_transfer', 'E-wallet (Maya / GCash)'], ['onsite', 'I paid onsite']].map(([value, label]) => <button type="button" key={value} onClick={() => { setChannel(value); const type = { qr_transfer: 'qr', bank_transfer: 'bank_account', ewallet_transfer: 'ewallet' }[value]; if (type) setSelectedId(options.find((o) => o.optionType === type)?.id || ''); }} className={`rounded-xl border p-3 text-sm font-semibold ${channel === value ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{label}</button>)}
        </div>
        {channel !== 'onsite' && <>
          <label className="mt-4 block text-xs font-semibold text-slate-600 dark:text-slate-300">Landlord payment option</label>
          <select required value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700">
            {options.filter((o) => o.optionType === ({ qr_transfer: 'qr', bank_transfer: 'bank_account', ewallet_transfer: 'ewallet' }[channel])).map((o) => <option key={o.id} value={o.id}>{o.displayName}{o.providerName ? ` · ${o.providerName}` : ''}</option>)}
          </select>
          {['qr', 'ewallet'].includes(selected?.optionType) && selected.qrImageUrl && <img src={selected.qrImageUrl} alt={`${selected.displayName} QR code`} className="mx-auto mt-4 max-h-56 rounded-xl border border-slate-200 object-contain" />}
          {['bank_account', 'ewallet'].includes(selected?.optionType) && <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900">{selected.optionType === 'ewallet' ? <Wallet size={16} className="mb-2 text-indigo-500" /> : <Building2 size={16} className="mb-2 text-indigo-500" />}<p><b>{selected.accountHolder}</b></p><p>{selected.providerName} · {selected.optionType === 'ewallet' ? 'Mobile / account' : 'Account'} {selected.accountNumber}</p>{selected.branch && <p>Branch: {selected.branch}</p>}</div>}
          {selected?.instructions && <p className="mt-3 text-sm text-slate-500">{selected.instructions}</p>}
          <p className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-300">Complete the transfer first, then upload its receipt to submit for review. A receipt is required.</p>
          <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-sm dark:border-slate-700"><Upload size={16} />{receipt?.name || 'Choose transfer receipt (PNG, JPG, WebP, PDF)'}<input required type="file" accept="image/png,image/jpeg,image/webp,application/pdf" className="sr-only" onChange={(event) => setReceipt(event.target.files?.[0] || null)} /></label>
          <input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} placeholder="Transfer reference (optional)" className="mt-3 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700" />
        </>}
        <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder={channel === 'onsite' ? 'Where and when did you pay onsite? (optional)' : 'Note for landlord (optional)'} className="mt-3 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700" rows={2} />
        <button disabled={busy || (channel !== 'onsite' && !options.some((o) => o.optionType === ({ qr_transfer: 'qr', bank_transfer: 'bank_account', ewallet_transfer: 'ewallet' }[channel])))} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting…' : channel === 'onsite' ? 'Notify landlord: I paid onsite' : 'Submit receipt for landlord review'}</button>
      </form>}
    </section>
  </div>;
};
