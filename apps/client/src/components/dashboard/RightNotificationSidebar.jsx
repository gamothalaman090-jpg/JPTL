import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, ShieldAlert, X, Check } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Maintenance Update',
    body: 'HVAC Air Conditioning pressure ticket updated to In Dispatch.',
    time: '10m ago',
    type: 'maintenance',
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'Payment Received',
    body: 'Liam Carter paid $1,950 rent for Loft 304 via Stripe.',
    time: '1h ago',
    type: 'payment',
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'Lease Renewal Alert',
    body: 'Sophia Lin lease for Unit 14B ends in 120 days.',
    time: '3h ago',
    type: 'lease',
    unread: false,
  },
  {
    id: 'notif-4',
    title: 'New Tenant Registered',
    body: 'David K. Miller pre-added profile verified.',
    time: '1d ago',
    type: 'tenant',
    unread: false,
  },
];

export const RightNotificationSidebar = ({
  isOpen,
  onClose,
  notifications: initialNotifs = MOCK_NOTIFICATIONS,
}) => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = notifs.filter((n) => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sliding Drawer (Emil Kowalski principle: interruptible translateX(100%) -> translateX(0) with ease-out under 200ms) */}
      <aside className="relative w-full max-w-sm h-full bg-white/90 dark:bg-[#0A0D18]/90 apple-glass border-l border-slate-200 dark:border-slate-800/80 shadow-2xl z-10 flex flex-col drawer-slide-in top-shade">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-4 h-4 text-indigo-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <h3 className="text-xs font-bold font-grotesk tracking-wide text-slate-900 dark:text-white uppercase">
              Notifications ({unreadCount})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 btn-press"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          
          {/* Controls: Mark Read + Filter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'unread' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-mono text-indigo-500 hover:underline flex items-center gap-1 btn-press"
              >
                <Check className="w-3 h-3" /> Mark read
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono">
                No notifications to display.
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl apple-glass top-shade border transition-all space-y-1 relative ${
                    n.unread
                      ? 'border-indigo-500/30 bg-indigo-500/5'
                      : 'border-slate-200 dark:border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-400 font-semibold uppercase">{n.type}</span>
                    <span className="text-slate-400">{n.time}</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                    {n.title}
                  </h5>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>

      </aside>
    </div>
  );
};
