import React from 'react';
import { Activity, ShieldCheck, Cpu, CreditCard, Send, CheckCircle2, Zap } from 'lucide-react';

export const IntegrationHealthWidget = () => {
  const TELEMETRY_ITEMS = [
    {
      name: 'Payment Gateway API',
      status: 'Online',
      latency: '38ms',
      uptime: '99.98%',
      details: '0 ACH Queue &bull; Auto-Retry Active',
      icon: CreditCard,
      color: 'emerald',
    },
    {
      name: 'Smart Lock IoT Hub',
      status: 'Online',
      latency: '14ms',
      uptime: '99.95%',
      details: 'Unit 14B Gateway &bull; Battery 88%',
      icon: Cpu,
      color: 'indigo',
    },
    {
      name: 'Broadcast Telemetry & SMS',
      status: 'Active',
      latency: '52ms',
      uptime: '100%',
      details: '98.4% Delivery &bull; 0 Queue Failures',
      icon: Send,
      color: 'purple',
    },
    {
      name: 'Maintenance Dispatcher',
      status: 'Active',
      latency: '22ms',
      uptime: '99.90%',
      details: 'Vendor Auto-Routing Enabled',
      icon: Zap,
      color: 'amber',
    },
  ];

  return (
    <div className="top-shade apple-glass rounded-3xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">
            System Observability & Integration Telemetry
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
          All Services Operational
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TELEMETRY_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.name}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090C16] border border-slate-200/80 dark:border-slate-800/80 space-y-2 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <IconComponent className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Latency: <strong className="text-slate-700 dark:text-slate-300">{item.latency}</strong></span>
                <span>Uptime: <strong className="text-slate-700 dark:text-slate-300">{item.uptime}</strong></span>
              </div>

              <div
                className="text-[10px] font-mono text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5 truncate"
                dangerouslySetInnerHTML={{ __html: item.details }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
