import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, UserCheck, Clock, Smartphone, Filter, CheckCircle2 } from 'lucide-react';

export const AccessAuditModal = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const AUDIT_LOGS = [
    { id: 'LOG-8891', type: 'smart_lock', title: 'Smart Lock Unlock (Unit 14B)', timestamp: '2026-08-29 19:42:10', method: 'PIN Keypad (#8821)', status: 'Authorized', actor: 'Sophia Lin (Resident)' },
    { id: 'LOG-8889', type: 'technician', title: 'Technician Access Authorized', timestamp: '2026-08-28 14:15:00', method: 'Temporary Vendor PIN', status: 'Authorized', actor: 'Marcus Vance (Apex Plumbing)' },
    { id: 'LOG-8874', type: 'smart_lock', title: 'Gate Entrance Unlocked', timestamp: '2026-08-28 09:30:22', method: 'Mobile App Bluetooth', status: 'Authorized', actor: 'Sophia Lin (Resident)' },
    { id: 'LOG-8850', type: 'admin', title: 'Security Credentials Viewed', timestamp: '2026-08-27 18:05:44', method: 'Encrypted Vault Decrypt', status: 'Verified', actor: 'Sophia Lin (Resident)' },
    { id: 'LOG-8822', type: 'smart_lock', title: 'Smart Lock Battery Self-Test', timestamp: '2026-08-26 04:00:00', method: 'IoT Hub Telemetry', status: 'Healthy (88%)', actor: 'IoT Hub Auto-Check' },
  ];

  const filteredLogs = filter === 'all' ? AUDIT_LOGS : AUDIT_LOGS.filter((l) => l.type === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D111D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">Security & Access Audit Logs</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unit 14B smart lock, gate entry, and technician access timestamps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#090C16] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Filter:</span>
            {[
              { id: 'all', label: 'All Logs' },
              { id: 'smart_lock', label: 'Smart Lock' },
              { id: 'technician', label: 'Technicians' },
              { id: 'admin', label: 'Admin Access' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  filter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
          </span>
        </div>

        {/* Audit Log Entries */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090C16] border border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-4 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-indigo-500 shrink-0 mt-0.5">
                  {log.type === 'smart_lock' ? <Lock className="w-4 h-4" /> : log.type === 'technician' ? <UserCheck className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">{log.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Actor: <span className="font-semibold text-slate-700 dark:text-slate-300">{log.actor}</span> &bull; Method: {log.method}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {log.status}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#090C16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Encryption: AES-256 GCM (At Rest)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs btn-press"
          >
            Close Audit Logs
          </button>
        </div>

      </div>
    </div>
  );
};
