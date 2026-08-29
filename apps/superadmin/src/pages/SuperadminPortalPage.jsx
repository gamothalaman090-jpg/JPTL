import React, { useState } from 'react';
import {
  ShieldCheck, Server, Activity, Database, Key, Lock, Users, FileText,
  AlertTriangle, RefreshCw, Download, HardDrive, Cpu, Terminal, Eye,
  CheckCircle2, Clock, LogOut, ArrowRight, ToggleLeft, ToggleRight, Layers, Sliders, ShieldAlert, Sparkles, Search, Filter
} from 'lucide-react';

export const SuperadminPortalPage = ({ onLogout = () => {} }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monitoring' | 'governance' | 'maintenance'

  // Subtab selections
  const [monitoringTab, setMonitoringTab] = useState('apiLogs'); // 'apiLogs' | 'healthQueue' | 'etlSync'
  const [governanceTab, setGovernanceTab] = useState('rbac'); // 'rbac' | 'audit' | 'apiKeys'
  const [maintenanceTab, setMaintenanceTab] = useState('backups'); // 'backups' | 'storage' | 'config'

  // Interactive System Controls State
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(false);
  const [backupLogs, setBackupLogs] = useState([
    { id: 'snap-8901', date: '2026-08-29 02:00:00 UTC', type: 'Automated Daily', size: '1.42 GB', status: 'Completed (Clean)' },
    { id: 'snap-8890', date: '2026-08-28 02:00:00 UTC', type: 'Automated Daily', size: '1.40 GB', status: 'Completed (Clean)' },
  ]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleTriggerManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      const newSnap = {
        id: `snap-${Math.floor(9000 + Math.random() * 999)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        type: 'Manual Trigger',
        size: '1.43 GB',
        status: 'Completed (Clean)'
      };
      setBackupLogs((prev) => [newSnap, ...prev]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-300 flex flex-col">
      
      {/* ─── TOP CONTROL HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#0A0E1A]/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold font-grotesk tracking-tight text-white">
                JPTL<span className="text-indigo-400">.SUPERADMIN</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ROOT COMMAND CENTER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Uptime: 99.99% &bull; Database Latency: 12ms</span>
            </p>
          </div>
        </div>

        {/* Global Maintenance Status & Logout */}
        <div className="flex items-center gap-4 font-mono text-xs">
          {maintenanceModeEnabled && (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Maintenance Mode Active
            </span>
          )}

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-2 btn-press cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ─── NAVIGATION MODULE TABS ─── */}
      <div className="bg-[#090D17] border-b border-slate-800/80 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs font-grotesk font-semibold">
        {[
          { key: 'overview', label: 'Command Overview', icon: Activity },
          { key: 'monitoring', label: 'Platform & Integration Monitoring', icon: Terminal },
          { key: 'governance', label: 'Security & Governance', icon: Lock },
          { key: 'maintenance', label: 'Infrastructure & Maintenance', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all btn-press shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">

        {/* ═════════════════════════════════════════════════ */}
        {/* ─── TAB 1: COMMAND OVERVIEW ─── */}
        {/* ═════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* KPI Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase">Registered System Users</span>
                <strong className="text-2xl font-grotesk font-extrabold text-white block">1,420 Users</strong>
                <span className="text-emerald-400 text-[10px]">+14 registered today</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase">Database Response Time</span>
                <strong className="text-2xl font-grotesk font-extrabold text-emerald-400 block">12 ms</strong>
                <span className="text-emerald-400 text-[10px]">PostgreSQL Pool Healthy</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase">Redis Queue Throughput</span>
                <strong className="text-2xl font-grotesk font-extrabold text-indigo-400 block">840 req/sec</strong>
                <span className="text-indigo-400 text-[10px]">0 Failed Background Jobs</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[10px] uppercase">S3 Storage Usage</span>
                <strong className="text-2xl font-grotesk font-extrabold text-purple-400 block">42.8 GB</strong>
                <span className="text-slate-500 text-[10px]">Quota: 100.0 GB (42.8%)</span>
              </div>
            </div>

            {/* Quick Actions & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Platform Infrastructure Status
                </h2>
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-grotesk">Primary Web Node (US-East AWS)</strong>
                      <span className="text-[#8E9B9A]">Node ID: srv-node-01 &bull; CPU: 14% &bull; RAM: 3.2GB / 16GB</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Operational</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-grotesk">Stripe Payment Gateway Webhook Relay</strong>
                      <span className="text-[#8E9B9A]">Endpoint: /api/webhooks/stripe &bull; Latency: 38ms</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">100% Synced</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-grotesk">Twilio SMS Broadcast Dispatcher</strong>
                      <span className="text-[#8E9B9A]">Gateway API Status: Connected &bull; Delivery: 99.8%</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Connected</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Toggle Card */}
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Platform Maintenance Controls
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Toggle system-wide maintenance mode to restrict non-admin access during deployment updates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#070A12] border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-grotesk text-white">System Maintenance Mode</span>
                    <button
                      onClick={() => setMaintenanceModeEnabled(!maintenanceModeEnabled)}
                      className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[11px] btn-press cursor-pointer ${
                        maintenanceModeEnabled ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {maintenanceModeEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {maintenanceModeEnabled ? 'Non-admin logins locked.' : 'Normal operation for all users.'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ─── TAB 2: PLATFORM & INTEGRATION MONITORING ─── */}
        {/* ═════════════════════════════════════════════════ */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            
            {/* Secondary Subtab Nav */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
              {[
                { key: 'apiLogs', label: 'API & Integration Log Console' },
                { key: 'healthQueue', label: 'System Health & Queue Dashboard' },
                { key: 'etlSync', label: 'ETL & Data Sync Monitor' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setMonitoringTab(st.key)}
                  className={`px-3.5 py-1.5 rounded-lg border btn-press cursor-pointer ${
                    monitoringTab === st.key
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Subtab 1: API & Integration Log Console */}
            {monitoringTab === 'apiLogs' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" /> Incoming / Outgoing API Request & Webhook Stream
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    Live Stream Connected
                  </span>
                </div>

                <div className="rounded-2xl bg-[#050811] border border-slate-800/80 p-4 font-mono text-xs space-y-2 overflow-x-auto">
                  {[
                    { method: 'POST', path: '/api/v1/payments/stripe-webhook', status: 200, time: '14:32:01.042', latency: '38ms', client: 'Stripe/v2' },
                    { method: 'GET', path: '/api/v1/tenants/usr-tenant-1/lease', status: 200, time: '14:31:58.891', latency: '12ms', client: 'WebClient/Windows' },
                    { method: 'POST', path: '/api/v1/iot/smartlock/unlock-gate', status: 200, time: '14:31:45.102', latency: '54ms', client: 'IoT-Hub/Unit14B' },
                    { method: 'POST', path: '/api/v1/announcements/broadcast', status: 200, time: '14:30:12.330', latency: '41ms', client: 'Twilio-Relay' },
                    { method: 'GET', path: '/api/v1/healthcheck', status: 200, time: '14:30:00.001', latency: '4ms', client: 'UptimeRobot/v3' },
                  ].map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#0D111D] border border-slate-800/60 hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.method === 'POST' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                          {log.method}
                        </span>
                        <span className="text-white font-semibold">{log.path}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-slate-400">{log.client}</span>
                        <span className="text-emerald-400 font-bold">{log.status} OK</span>
                        <span className="text-slate-500">{log.latency}</span>
                        <span className="text-slate-500">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 2: System Health & Queue Dashboard */}
            {monitoringTab === 'healthQueue' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" /> Background Job Queues (BullMQ / Redis)
                  </h2>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">Active Working Jobs:</span>
                      <strong className="text-indigo-400">3 Jobs processing</strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">Total Processed (24h):</span>
                      <strong className="text-emerald-400">12,480 Jobs</strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">Failed / Retried Queue:</span>
                      <strong className="text-emerald-400">0 Failed Jobs</strong>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4">
                  <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" /> External Service Telemetry
                  </h2>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">Stripe Payment Gateway:</span>
                      <strong className="text-emerald-400">Online (38ms)</strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">Twilio SMS Relay API:</span>
                      <strong className="text-emerald-400">Online (52ms)</strong>
                    </div>
                    <div className="flex justify-between p-3 rounded-2xl bg-[#070A12] border border-slate-800">
                      <span className="text-slate-400">AWS S3 Vault Bucket:</span>
                      <strong className="text-emerald-400">Online (18ms)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subtab 3: ETL & Data Sync Monitor */}
            {monitoringTab === 'etlSync' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 text-xs font-mono">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400" /> ETL Data Syncs & Batch Jobs
                </h2>
                <div className="p-4 rounded-2xl bg-[#070A12] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-white block font-grotesk">Nightly Rent Invoice & Ledger Batch Generator</strong>
                      <span className="text-slate-500">Cron: 00:00 UTC &bull; Next Execution in 9h 28m</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Success (Last Run: 00:00 UTC)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <strong className="text-white block font-grotesk">Tenant Compliance Expiration Reminders Dispatcher</strong>
                      <span className="text-slate-500">Cron: Every 12 Hours &bull; Active</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Success (Last Run: 12:00 UTC)</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ─── TAB 3: SECURITY, ACCESS & GOVERNANCE ─── */}
        {/* ═════════════════════════════════════════════════ */}
        {activeTab === 'governance' && (
          <div className="space-y-6">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
              {[
                { key: 'rbac', label: 'RBAC & Privilege Matrix' },
                { key: 'audit', label: 'Immutable System Audit Trail' },
                { key: 'apiKeys', label: 'API Key & Webhook Management' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setGovernanceTab(st.key)}
                  className={`px-3.5 py-1.5 rounded-lg border btn-press cursor-pointer ${
                    governanceTab === st.key
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Subtab 1: RBAC Matrix */}
            {governanceTab === 'rbac' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> System User Roles & Access Control Matrix
                </h2>
                <div className="divide-y divide-slate-800 font-mono text-xs">
                  {[
                    { role: 'SUPERADMIN_ROOT', permissions: 'Full Read/Write, System Config, Backup Trigger, Audit Purge', count: '1 User' },
                    { role: 'LANDLORD_ADMIN', permissions: 'Property Management, Lease CRUD, Unit Dispatches, Rent Roll', count: '14 Users' },
                    { role: 'MAINTENANCE_TECH', permissions: 'Ticket Status Updates, Technician Field Notes, GPS Broadcast', count: '28 Users' },
                    { role: 'RESIDENT_TENANT', permissions: 'Tenant Portal Access, Rent Pay ACH, Repair Requests, iCal Export', count: '1,377 Users' },
                  ].map((r, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <strong className="text-white block font-grotesk text-sm">{r.role}</strong>
                        <span className="text-slate-400 text-[11px]">{r.permissions}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 2: System Audit Trail */}
            {governanceTab === 'audit' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 font-mono text-xs">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Immutable System Audit Trail Logs
                </h2>
                <div className="space-y-2">
                  {[
                    { event: 'SUPERADMIN_LOGIN_SUCCESS', user: 'superadmin@jptl.sys', ip: '192.168.1.100', time: '2026-08-29 14:30:12' },
                    { event: 'DOCUMENT_VAULT_DECRYPT', user: 'Alexander Vance (Landlord)', ip: '192.168.1.104', time: '2026-08-29 12:14:02' },
                    { event: 'LEASE_RENEWAL_OFFER_ISSUED', user: 'Alexander Vance (Landlord)', ip: '192.168.1.104', time: '2026-08-29 10:02:44' },
                    { event: 'MFA_AUTH_VERIFIED', user: 'Sophia Lin (Tenant)', ip: '192.168.1.110', time: '2026-08-29 08:42:10' },
                  ].map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#070A12] border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{log.event}</span>
                        <span className="text-white">{log.user}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-4">
                        <span>IP: {log.ip}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 3: API Keys */}
            {governanceTab === 'apiKeys' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 font-mono text-xs">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" /> Integration API Secret Key Vault
                </h2>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-grotesk">Stripe Live Secret Key</strong>
                      <span className="text-slate-500">sk_live_99428••••••••••••••••••••3810</span>
                    </div>
                    <button onClick={() => alert("Stripe Live Secret Key verified & active.")} className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white btn-press cursor-pointer">Inspect</button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#070A12] border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white block font-grotesk">Twilio SMS Account SID</strong>
                      <span className="text-slate-500">AC_live_8402••••••••••••••••••••1092</span>
                    </div>
                    <button onClick={() => alert("Twilio SMS Account SID verified & active.")} className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white btn-press cursor-pointer">Inspect</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ═════════════════════════════════════════════════ */}
        {/* ─── TAB 4: INFRASTRUCTURE & MAINTENANCE ─── */}
        {/* ═════════════════════════════════════════════════ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-mono">
              {[
                { key: 'backups', label: 'Backup & Disaster Recovery' },
                { key: 'storage', label: 'Storage & File Management' },
                { key: 'config', label: 'Global System Configuration' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setMaintenanceTab(st.key)}
                  className={`px-3.5 py-1.5 rounded-lg border btn-press cursor-pointer ${
                    maintenanceTab === st.key
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Subtab 1: Backup & Recovery */}
            {maintenanceTab === 'backups' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" /> Database Backup & Snapshot Controls
                  </h2>
                  <button
                    onClick={handleTriggerManualBackup}
                    disabled={isBackingUp}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs flex items-center gap-2 btn-press shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                    <span>{isBackingUp ? 'Creating Snapshot…' : 'Trigger Manual Backup Snapshot'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {backupLogs.map((b) => (
                    <div key={b.id} className="p-3 rounded-xl bg-[#070A12] border border-slate-800 flex items-center justify-between">
                      <div>
                        <strong className="text-white block font-grotesk">{b.id} ({b.type})</strong>
                        <span className="text-slate-500 text-[11px]">Date: {b.date} &bull; Size: {b.size}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtab 2: Storage & File Management */}
            {maintenanceTab === 'storage' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 text-xs font-mono">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-purple-400" /> Storage Quota & Attachment Cleanup
                </h2>
                <div className="p-4 rounded-2xl bg-[#070A12] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>AWS S3 Primary Storage Bucket (42.8 GB / 100 GB)</span>
                    <strong className="text-indigo-400">42.8% Capacity</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[42.8%]" />
                  </div>
                  <button onClick={() => alert("Orphaned attachment scan completed: 0 unlinked files found.")} className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-grotesk font-bold text-[11px] btn-press cursor-pointer">Run Orphaned File Cleanup</button>
                </div>
              </div>
            )}

            {/* Subtab 3: Global System Configuration */}
            {maintenanceTab === 'config' && (
              <div className="p-6 rounded-3xl bg-[#0D111D] border border-slate-800 space-y-4 text-xs font-mono">
                <h2 className="text-base font-bold font-grotesk text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" /> System Module Switches
                </h2>
                <div className="p-4 rounded-2xl bg-[#070A12] border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Stripe ACH Auto-Pay Processing Engine</span>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Twilio SMS Resident Alert Broadcasts</span>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Smart Lock IoT Access Key Dispenser</span>
                    <span className="text-emerald-400 font-bold">Enabled</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};
