import React, { useState } from 'react';
import { 
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Check, 
  Calendar, ArrowRight, UserCheck, Star, MessageSquare, Phone, ChevronDown, Paperclip 
} from 'lucide-react';
import { TechnicianDetailModal } from './TechnicianDetailModal';

export const TenantMaintenanceTab = ({
  tickets = [],
  tenant,
  unit,
  onRequestRepairClick,
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTechTicket, setSelectedTechTicket] = useState(null);
  const [ratings, setRatings] = useState({});

  const tenantTickets = tickets.filter(
    (t) => t.unitId === unit?.id || t.tenantName === tenant?.name
  );

  const filteredTickets = tenantTickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const handleRate = (ticketId, starCount) => {
    setRatings((prev) => ({ ...prev, [ticketId]: starCount }));
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'submitted': return 1;
      case 'in_progress': return 3;
      case 'resolved': return 4;
      default: return 2;
    }
  };

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
          <p className="text-xs text-slate-500 dark:text-slate-400">Track real-time technician dispatches, view 4-step progress steppers, and submit repair tickets.</p>
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
      <div className="space-y-6">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono">
            No service requests found for this filter.
          </div>
        ) : (
          filteredTickets.map((t) => {
            const currentStep = getStepIndex(t.status);
            const isResolved = t.status === 'resolved';

            return (
              <div
                key={t.id}
                className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-6"
              >
                {/* Header info */}
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
                        Submitted {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">{t.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{t.description}</p>
                  </div>

                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono border self-start ${
                    isResolved
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : t.status === 'in_progress'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {isResolved ? '✓ Completed & Signed Off' : t.status === 'in_progress' ? '⚡ Technician Dispatched' : '⏳ Review Pending'}
                  </span>
                </div>

                {/* ─── 4-STEP PROGRESS STEPPER ─── */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#080B14]/80 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Dispatch Lifecycle Progress
                  </span>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                    {[
                      { step: 1, label: 'Submitted' },
                      { step: 2, label: 'Approved' },
                      { step: 3, label: 'Dispatched' },
                      { step: 4, label: 'Resolved' },
                    ].map((s) => (
                      <div key={s.step} className="space-y-1">
                        <div className={`h-2 rounded-full transition-all ${
                          currentStep >= s.step
                            ? 'bg-indigo-600 dark:bg-indigo-400 shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800'
                        }`} />
                        <span className={`block font-semibold ${
                          currentStep >= s.step
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400'
                        }`}>
                          {s.step}. {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Technician Card (If Dispatched or In Progress) */}
                {t.status === 'in_progress' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs font-grotesk shrink-0">
                        MS
                      </div>
                      <div className="text-xs">
                        <strong className="text-slate-900 dark:text-white font-grotesk block text-sm">Marcus Sterling — Tech Dispatched</strong>
                        <span className="text-amber-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ETA: Today between 2:00 PM – 4:00 PM
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTechTicket(t)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk btn-press shadow-md shadow-indigo-600/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Track Technician Details</span>
                    </button>
                  </div>
                )}

                {/* 5-Star Rating Sign-off (If Resolved) */}
                {isResolved && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-emerald-700 dark:text-emerald-300 font-grotesk block text-sm">Rate Technician Service</strong>
                      <span className="text-slate-500 dark:text-slate-400">How was your repair experience for {t.id}?</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(t.id, star)}
                          className="p-1 text-amber-400 hover:scale-115 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${
                            (ratings[t.id] || 5) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event History & Attachments */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Permission to Enter: <strong className="text-slate-700 dark:text-slate-300">{t.permissionToEnter ? 'Granted' : 'Call First'}</strong></span>
                  </div>

                  {t.attachments && t.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Paperclip className="w-3.5 h-3.5" /> {t.attachments.length} Attachment(s)
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      <TechnicianDetailModal
        isOpen={Boolean(selectedTechTicket)}
        onClose={() => setSelectedTechTicket(null)}
        ticket={selectedTechTicket}
      />

    </div>
  );
};
