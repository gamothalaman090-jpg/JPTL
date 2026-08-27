import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Check, Calendar, ArrowRight } from 'lucide-react';

export const TenantMaintenanceTab = ({
  tickets = [],
  tenant,
  unit,
  onRequestRepairClick,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const tenantTickets = tickets.filter(
    (t) => t.unitId === unit?.id || t.tenantName === tenant?.name
  );

  const filteredTickets = tenantTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-medium">
            <Wrench className="w-3.5 h-3.5" />
            <span>Service Dispatch</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">Maintenance & Repairs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track technician dispatches and report issues in your unit in real-time.</p>
        </div>

        <button
          type="button"
          onClick={onRequestRepairClick}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-amber-600/20 flex items-center gap-2 btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report Repair</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto w-fit">
        {['all', 'submitted', 'in_progress', 'resolved'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 rounded-xl font-mono text-[11px] capitalize btn-press transition-all ${
              statusFilter === filter
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono">
            No service requests found for this filter.
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {t.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      t.priority === 'high'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {t.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Created {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">{t.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{t.description}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border self-start ${
                  t.status === 'resolved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : t.status === 'in_progress'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}>
                  {t.status === 'resolved' ? '✓ Resolved' : t.status === 'in_progress' ? '⚡ In Dispatch' : '⏳ Review Pending'}
                </span>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Entry Permission: <strong className="text-slate-700 dark:text-slate-300">{t.permissionToEnter ? 'Granted' : 'Call First'}</strong></span>
                </div>
                <span>Assigned Unit: <strong className="text-slate-700 dark:text-slate-300">{t.unitLabel}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
