import React, { useEffect, useState } from 'react';
import { Mail, UserPlus, UserRound, UserX, ShieldCheck } from 'lucide-react';
import { landlordApi } from '../../services/api';

export const StaffManagementTab = () => {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStaff = async () => {
    try {
      const response = await landlordApi.getStaff();
      setStaff(response.data || []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load staff accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const invite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const response = await landlordApi.inviteStaff(form);
      if (response.data) setStaff((current) => [response.data, ...current]);
      setForm({ firstName: '', lastName: '', email: '' });
      setSuccess(`Invitation sent to ${response.data?.email || form.email}.`);
    } catch (requestError) {
      setError(requestError.message || 'Could not invite staff member.');
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (member) => {
    if (!window.confirm(`Deactivate ${member.firstName} ${member.lastName}? They will lose access immediately.`)) return;
    try {
      await landlordApi.deactivateStaff(member._id || member.id);
      setStaff((current) => current.map((entry) => (entry._id || entry.id) === (member._id || member.id) ? { ...entry, status: 'suspended' } : entry));
    } catch (requestError) {
      setError(requestError.message || 'Could not deactivate staff member.');
    }
  };

  return (
    <div className="space-y-5">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#10131F]">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-500"><UserRound size={20} /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff</h1><p className="mt-1 text-sm text-slate-500">Invite staff to help with rent review, maintenance, and resident announcements.</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800"><ShieldCheck size={14} /> Staff access is limited to three modules</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">Rent Roll</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">Maintenance</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">Announcements</span>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <form onSubmit={invite} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#10131F]">
          <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite staff member</h2><p className="mt-1 text-xs text-slate-500">We’ll email their sign-in address and a temporary password.</p></div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">First name<input required maxLength={80} value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-slate-900 dark:border-slate-700 dark:text-white" /></label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Last name<input required maxLength={80} value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-slate-900 dark:border-slate-700 dark:text-white" /></label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-slate-900 dark:border-slate-700 dark:text-white" /></label>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          {success && <p role="status" className="text-sm text-emerald-600">{success}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><UserPlus size={16} />{busy ? 'Sending invitation…' : 'Invite and email credentials'}</button>
        </form>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#10131F]">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Staff accounts</h2><p className="text-xs text-slate-500">{staff.filter((member) => member.status === 'active').length} active</p></div><Mail size={18} className="text-slate-400" /></div>
          {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading staff…</p> : staff.length === 0 ? <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-900">No staff invited yet.</p> : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {staff.map((member) => <div key={member._id || member.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate font-semibold text-slate-900 dark:text-white">{member.firstName} {member.lastName}</p><p className="truncate text-xs text-slate-500">{member.email}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>{member.status}</span></div>{member.status === 'active' && <button type="button" onClick={() => deactivate(member)} aria-label={`Deactivate ${member.firstName}`} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"><UserX size={16} /></button>}</div>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
