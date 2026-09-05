import React, { useState, useEffect } from 'react';
import { Wrench, Clock, CheckCircle2, AlertTriangle, ShieldAlert, User, Building2 } from 'lucide-react';

export const TicketsTab = ({ tickets: initialTickets = [], searchQuery = '', onOpenNewTicket, onUpdateStatus }) => {
  const [tickets, setTickets] = useState(initialTickets);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleUpdateStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newHistoryItem = {
            status: newStatus,
            changedBy: 'Alexander Vance',
            userRole: 'landlord',
            timestamp: new Date().toISOString(),
            note: `Status changed to ${newStatus.replace('_', ' ')}`,
          };
          const updated = {
            ...t,
            status: newStatus,
            statusHistory: [...(t.statusHistory || []), newHistoryItem],
          };
          if (onUpdateStatus) {
            onUpdateStatus(ticketId, newStatus, updated);
          }
          return updated;
        }
        return t;
      })
    );
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unitLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return matchesSearch;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin text-indigo-500" /> In Dispatch
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner & Status Filter Pills */}
      <div className="p-4 sm:p-5 rounded-2xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-500" />
            Maintenance Ticket Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time technician assignments and service requests across all properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {['all', 'submitted', 'in_progress', 'resolved'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] capitalize btn-press transition-all ${
                  statusFilter === filter
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          {onOpenNewTicket && (
            <button
              type="button"
              onClick={onOpenNewTicket}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-1.5 shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>+ New Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 apple-glass text-slate-500 dark:text-slate-400 text-xs">
            No maintenance tickets match the active search or filter state.
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl apple-glass border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all top-shade shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {t.id}
                    </span>
                    {getPriorityBadge(t.priority)}
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      Category: <strong className="text-slate-700 dark:text-slate-300">{t.category}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-grotesk text-slate-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                    {t.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getStatusBadge(t.status)}
                </div>
              </div>

              {/* Work Order Cost Threshold & Approval Workflow */}
              <div className="p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/[0.03] border border-indigo-500/20 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                    Est. Cost Threshold: $650.00 (Exceeds $500 Limit)
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">&bull; Vendor: Apex Plumbing & HVAC</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-grotesk text-[11px] btn-press shadow-xs"
                  >
                    ✓ Approve $650 Work Order
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] hover:bg-slate-300 dark:hover:bg-slate-700 btn-press"
                  >
                    Request Re-Quote
                  </button>
                </div>
              </div>

              {/* Location & Tenant Info Bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t.propertyName} &bull; <strong className="text-slate-900 dark:text-white">{t.unitLabel}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Reported by: <strong>{t.tenantName}</strong></span>
                  </div>
                </div>

                {/* Quick Status Action Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Set Status:</span>
                  <select
                    value={t.status}
                    onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                    className="bg-white dark:bg-[#111625] border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Status History Logs */}
              {t.statusHistory && t.statusHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Technician & Activity Log
                  </span>
                  <div className="space-y-1">
                    {t.statusHistory.slice(-2).map((h, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-slate-700 dark:text-slate-300">{h.changedBy}</strong> updated status to <span className="font-mono text-indigo-500 font-semibold">{h.status}</span> {h.note ? `— "${h.note}"` : ''}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};
