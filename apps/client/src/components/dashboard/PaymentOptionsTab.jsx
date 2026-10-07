import React, { useEffect, useRef, useState } from 'react';
import { Building2, ImagePlus, QrCode, Plus, Power, Wallet, X } from 'lucide-react';
import { landlordApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const emptyForm = () => ({ optionType: 'qr', displayName: '', providerName: '', accountHolder: '', accountNumber: '', branch: '', instructions: '' });
const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'];
const controlClass = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export const PaymentOptionsTab = () => {
  const toast = useToast();
  const fileInput = useRef(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl(editing?.qrImageUrl || '');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, editing?.qrImageUrl]);

  const load = async () => {
    try {
      const optionRes = await landlordApi.getPaymentOptions();
      setOptions(optionRes?.options || optionRes?.data?.options || optionRes?.data?.data || []);
    } catch (error) { toast.error(error.message || 'Could not load payment settings'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm()); setEditing(null); setFile(null); setFileError('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleFile = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFileError('');
    if (!selectedFile) { setFile(null); return; }
    if (!acceptedTypes.includes(selectedFile.type)) {
      setFile(null); setFileError('Choose a PNG, JPG, or WebP image.'); event.target.value = ''; return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null); setFileError('The QR image must be 5 MB or smaller.'); event.target.value = ''; return;
    }
    setFile(selectedFile);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.optionType === 'qr' && !editing?.qrImageUrl && !file) {
      setFileError('Select a QR image before saving.'); return;
    }
    if (fileError) return;
    setBusy(true);
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => { if (value) body.append(key, value); });
    if (file) body.append('qrImage', file);
    try {
      if (editing) await landlordApi.updatePaymentOption(editing._id, body);
      else await landlordApi.createPaymentOption(body);
      resetForm(); toast.success(editing ? 'Payment option updated.' : 'Payment option saved.'); await load();
    } catch (error) { toast.error(error.message || 'Could not save payment option'); }
    finally { setBusy(false); }
  };

  const toggle = async (option) => {
    try { await landlordApi.setPaymentOptionActive(option._id, !option.isActive); await load(); }
    catch (error) { toast.error(error.message || 'Could not update payment option'); }
  };

  const edit = (option) => {
    setEditing(option);
    setForm({ optionType: option.optionType, displayName: option.displayName || '', providerName: option.providerName || '', accountHolder: option.accountHolder || '', accountNumber: option.accountNumber || '', branch: option.branch || '', instructions: option.instructions || '' });
    setFile(null); setFileError('');
  };

  const uploadField = (label, required = false) => <div>
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}{required ? ' *' : ' (optional)'}</label>
    <div className="mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><ImagePlus size={17} className="shrink-0 text-indigo-500" /><span>{file?.name || (editing?.qrImageUrl ? 'Replace the current QR image' : 'Choose a QR image')}</span></div>
      <input ref={fileInput} required={required && !editing?.qrImageUrl} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="mt-3 block w-full cursor-pointer text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-indigo-800 hover:file:bg-indigo-200 dark:text-slate-300 dark:file:bg-indigo-950 dark:file:text-indigo-200 dark:hover:file:bg-indigo-900" />
      <p className="mt-2 text-[11px] text-slate-500">PNG, JPG, or WebP · maximum 5 MB</p>
      {previewUrl && <div className="mt-3 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-950"><img src={previewUrl} alt="Selected payment QR preview" className="h-24 w-24 rounded-md border border-slate-200 bg-white object-contain p-1 dark:border-slate-700" /><div className="min-w-0 flex-1"><p className="break-all text-xs font-semibold text-slate-700 dark:text-slate-200">{file?.name || 'Current QR image'}</p>{file && <button type="button" onClick={() => { setFile(null); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"><X size={13} /> Remove selection</button>}</div></div>}
    </div>
    {fileError && <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{fileError}</p>}
  </div>;

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#10131F]"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Tenant payment options</h2><p className="mt-1 text-sm text-slate-500">These options are available to your tenants across your properties. Deactivate an option to hide it from new submissions.</p>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading…</p> : options.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900">No payment options added yet.</p> : <div className="mt-5 space-y-3">{options.map((option) => <article key={option._id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center"><div className="flex items-start gap-3">{option.optionType === 'qr' ? <QrCode className="mt-1 text-indigo-500" size={20} /> : option.optionType === 'ewallet' ? <Wallet className="mt-1 text-indigo-500" size={20} /> : <Building2 className="mt-1 text-indigo-500" size={20} />}<div><b className="text-slate-900 dark:text-white">{option.displayName}</b><p className="text-sm text-slate-500">{option.providerName || (option.optionType === 'qr' ? 'QR payment' : option.optionType === 'ewallet' ? 'E-wallet' : 'Bank account')}</p>{option.accountNumber && <p className="text-xs text-slate-500">Account {option.accountNumber} · {option.accountHolder}</p>}{option.qrImageUrl && <a className="text-xs text-indigo-600 underline dark:text-indigo-400" href={option.qrImageUrl} target="_blank" rel="noreferrer">View QR image</a>}<span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${option.isActive ? 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200' : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>{option.isActive ? 'Active for tenants' : 'Inactive'}</span></div></div><div className="flex gap-2"><button type="button" onClick={() => edit(option)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200">Edit</button><button type="button" onClick={() => toggle(option)} className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200"><Power size={14} />{option.isActive ? 'Deactivate' : 'Activate'}</button></div></article>)}</div>}
    </section>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#10131F]"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? 'Edit payment option' : 'Add payment option'}</h2><p className="mt-1 text-sm text-slate-500">These instructions and account details are shown to tenants.</p></div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Type<select disabled={Boolean(editing)} value={form.optionType} onChange={(e) => { setForm({ ...form, optionType: e.target.value, providerName: e.target.value === 'ewallet' ? 'GCash' : '' }); setFile(null); setFileError(''); if (fileInput.current) fileInput.current.value = ''; }} className={controlClass}><option value="qr">QR code</option><option value="bank_account">Bank account</option><option value="ewallet">E-wallet (Maya / GCash)</option></select></label>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Display name<input required maxLength={120} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="e.g. BPI QR – Main account" className={controlClass} /></label>
      {form.optionType === 'ewallet' ? <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">E-wallet provider<select required value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} className={controlClass}><option value="Maya">Maya</option><option value="GCash">GCash</option></select></label> : <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Bank or provider<input maxLength={100} value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} placeholder="e.g. BPI" className={controlClass} /></label>}
      {form.optionType === 'qr' ? uploadField('QR image', true) : <><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{form.optionType === 'ewallet' ? 'Account name' : 'Account holder'}<input required value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} className={controlClass} /></label><label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{form.optionType === 'ewallet' ? 'Mobile number / account number' : 'Account number'}<input required value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} className={controlClass} /></label>{form.optionType === 'bank_account' ? <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Branch (optional)<input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className={controlClass} /></label> : uploadField('E-wallet QR image')}</>}
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Tenant instructions<textarea maxLength={1000} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Reference details or payment instructions" rows={3} className={controlClass} /></label>
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={16} />{busy ? 'Saving…' : editing ? 'Save changes' : 'Add option'}</button>{editing && <button type="button" onClick={resetForm} className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">Cancel edit</button>}
    </form>
  </div>;
};
