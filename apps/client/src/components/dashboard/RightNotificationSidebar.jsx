import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, AlertTriangle, ShieldAlert, X, Check, Sparkles, Loader2 } from 'lucide-react';
import { notificationApi } from '../../services/api';

export const RightNotificationSidebar = ({
  isOpen,
  onClose,
}) => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      const rawList = res.data || res.notifications || [];
      const formatted = rawList.map((n) => ({
        id: n._id || n.id,
        title: n.title,
        body: n.body,
        type: n.type || 'system',
        unread: n.unread !== undefined ? n.unread : !n.read,
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : n.time || 'Recent',
      }));
      setNotifs(formatted);
    } catch (e) {
      console.warn('Could not fetch notifications from server:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      console.warn('Failed to mark all as read:', e.message);
    }
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markSingleRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      console.warn('Failed to mark notification as read:', e.message);
    }
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
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

      {/* Sliding Drawer */}
      <aside className="relative w-full max-w-sm h-full bg-white/95 dark:bg-[#0A0D18]/95 apple-glass border-l border-slate-200 dark:border-slate-800/80 shadow-2xl z-10 flex flex-col drawer-slide-in top-shade">
        
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
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="space-y-2">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Loading notifications...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold font-grotesk text-slate-800 dark:text-slate-200">All caught up!</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  No notifications to display right now.
                </p>
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => n.unread && markSingleRead(n.id)}
                  className={`p-3.5 rounded-2xl apple-glass top-shade border transition-all space-y-1 relative cursor-pointer ${
                    n.unread
                      ? 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500/60'
                      : 'border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100'
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
