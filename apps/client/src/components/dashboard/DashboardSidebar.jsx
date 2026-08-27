import React from 'react';
import {
  LayoutDashboard, Building2, Users, Wrench, DollarSign,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell, Megaphone, CalendarDays, Home
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'units', label: 'Properties & Units', icon: Building2 },
  { key: 'tenants', label: 'Tenants Directory', icon: Users },
  { key: 'tickets', label: 'Maintenance', icon: Wrench },
  { key: 'payments', label: 'Rent Roll', icon: DollarSign },
];

const BOTTOM_ITEMS = [
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const DashboardSidebar = ({
  activeView,
  onChangeView,
  collapsed,
  onToggleCollapse,
  onLogout,
  onNavigate,
}) => {
  return (
    <aside
      className={`
        sticky top-0 z-30 h-screen flex flex-col
        apple-glass
        border-r border-slate-200 dark:border-slate-800/80
        transition-all duration-200
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
      style={{ transitionTimingFunction: 'var(--ease-out)' }}
    >
      {/* ─── LOGO + COLLAPSE TOGGLE ─── */}
      <div className={`flex items-center justify-between px-3.5 py-4 border-b border-slate-200 dark:border-slate-800/80 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-grotesk font-extrabold text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              JPTL<span className="text-indigo-600 dark:text-indigo-400">.SYS</span>
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 btn-press shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ─── MAIN NAV ─── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onChangeView(item.key)}
              title={collapsed ? item.label : undefined}
              className={`
                group w-full flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold btn-press transition-all relative
                ${collapsed ? 'justify-center px-0' : 'px-3'}
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              {/* Active left accent bar (flush inside button) */}
              {isActive && !collapsed && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white/80" />
              )}

              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-500 group-hover:text-indigo-500'}`} />

              {!collapsed && (
                <span className="whitespace-nowrap font-grotesk">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ─── BOTTOM NAV ─── */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onChangeView(item.key)}
              title={collapsed ? item.label : undefined}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white btn-press transition-all"
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-500 group-hover:text-indigo-500" />
              {!collapsed && <span className="whitespace-nowrap font-grotesk">{item.label}</span>}
            </button>
          );
        })}

        <button
          onClick={() => onNavigate && onNavigate('/tenant')}
          title={collapsed ? 'Resident Portal' : undefined}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 btn-press transition-all"
        >
          <Home className="w-4 h-4 shrink-0 text-indigo-500" />
          {!collapsed && <span className="whitespace-nowrap font-grotesk">Tenant Portal View</span>}
        </button>

        <button
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 btn-press transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-rose-500" />
          {!collapsed && <span className="whitespace-nowrap font-grotesk">Log out</span>}
        </button>
      </div>
    </aside>
  );
};
