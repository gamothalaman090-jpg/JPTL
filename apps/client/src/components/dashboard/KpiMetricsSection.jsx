import React from 'react';
import { DollarSign, TrendingUp, Home, Users, Wrench, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const KpiMetricsSection = ({ units = [], tenants = [], tickets = [], onAddTenant, onNavigateTickets }) => {
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'occupied').length;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyPercentage = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const totalMonthlyRevenue = units
    .filter((u) => u.status === 'occupied')
    .reduce((sum, u) => sum + (u.monthlyRent || 0), 0);

  const pendingTickets = tickets.filter((t) => t.status !== 'resolved').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      
      {/* CARD 1: Monthly Revenue & Sparkline */}
      <div className="group relative top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 transition-all hover:border-indigo-500/50 dark:hover:border-indigo-500/30 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
            Monthly Revenue
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            +12.4%
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight">
              ${totalMonthlyRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Collected from {occupiedUnits} active leases
            </p>
          </div>
        </div>

        {/* Efferd Mini Sparkline Graph */}
        <div className="mt-4 flex items-end gap-1 h-7 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {[40, 45, 42, 55, 60, 58, 70, 75, 82, 90, 88, 100].map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t-xs bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors"
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      </div>

      {/* CARD 2: Occupancy Rate */}
      <div className="group relative top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 transition-all hover:border-indigo-500/50 dark:hover:border-indigo-500/30 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-500" />
            Portfolio Occupancy
          </span>
          <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
            {occupancyPercentage}%
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight">
          {occupiedUnits} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {totalUnits} Units</span>
        </h3>

        <div className="mt-3 space-y-1.5">
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>{occupiedUnits} Occupied</span>
            <span className="text-emerald-600 dark:text-emerald-400">{vacantUnits} Vacant</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Vacant Units & Fast Placement CTA */}
      <div className="group relative top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/30 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Placement Queue
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Ready
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight">
            {vacantUnits} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Vacant</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Immediate lease opportunities available
          </p>
        </div>

        <button
          type="button"
          onClick={onAddTenant}
          className="mt-3 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-grotesk btn-press flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Assign Tenant</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CARD 4: Maintenance Tickets Overview */}
      <div className="group relative top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 sm:p-5 transition-all hover:border-amber-500/50 dark:hover:border-amber-500/30 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              Service Requests
            </span>
            {pendingTickets > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                {pendingTickets} Pending
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                All Clear
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold font-grotesk text-slate-900 dark:text-white tracking-tight">
            {tickets.length} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Total</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pendingTickets > 0 ? `${pendingTickets} require technician review` : 'Zero active maintenance bottlenecks'}
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateTickets}
          className="mt-3 w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center justify-center gap-1.5"
        >
          <span>Manage Queue</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
