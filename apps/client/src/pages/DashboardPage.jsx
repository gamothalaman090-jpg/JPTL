import React, { useState, useEffect } from 'react';
import { 
  Building2, UserPlus, Users, Search, Home, LogOut, ShieldCheck, ArrowUpRight, 
  Sun, Moon, Sparkles, Megaphone, Wrench, DollarSign, X, Bell, ArrowRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { 
  MOCK_PROPERTIES, 
  MOCK_UNITS as INITIAL_UNITS, 
  MOCK_TENANTS as INITIAL_TENANTS,
  MOCK_TICKETS as INITIAL_TICKETS,
  MOCK_PAYMENTS as INITIAL_PAYMENTS
} from '../data/mockData';
import { AddTenantModal } from '../components/dashboard/AddTenantModal';
import { UnitDetailModal } from '../components/dashboard/UnitDetailModal';
import { KpiMetricsSection } from '../components/dashboard/KpiMetricsSection';
import { TicketsTab } from '../components/dashboard/TicketsTab';
import { PaymentsTab } from '../components/dashboard/PaymentsTab';
import { AnnouncementsTab } from '../components/dashboard/AnnouncementsTab';
import { SectionDivider } from '../components/dashboard/SectionDivider';
import { CommandPaletteModal } from '../components/dashboard/CommandPaletteModal';
import { NewTicketModal } from '../components/dashboard/NewTicketModal';
import { NewAnnouncementModal } from '../components/dashboard/NewAnnouncementModal';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { RightNotificationSidebar } from '../components/dashboard/RightNotificationSidebar';

export const DashboardPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  const [activeView, setActiveView] = useState('overview');
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [announcement, setAnnouncement] = useState({
    subject: 'Welcome to our new Property Portal! 🚀',
    body: 'We have upgraded the landlord workspace with a redesigned dashboard, real-time maintenance queue, and automated rent roll tracking.',
  });
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals & Drawers
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [addTenantPropertyId, setAddTenantPropertyId] = useState('');
  const [addTenantUnitId, setAddTenantUnitId] = useState('');
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load session data
  useEffect(() => {
    try {
      const savedTenants = sessionStorage.getItem('jptl_onboarding_tenants');
      if (savedTenants) {
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTenants((prev) => [...parsed, ...prev]);
          parsed.forEach((t) => {
            if (t.unitId) {
              setUnits((prevUnits) =>
                prevUnits.map((u) =>
                  u.id === t.unitId ? { ...u, status: 'occupied', tenantId: t.id, tenantName: t.name, tenantEmail: t.email } : u
                )
              );
            }
          });
        }
      }
      const savedAnnouncement = sessionStorage.getItem('jptl_announcement');
      if (savedAnnouncement) setAnnouncement(JSON.parse(savedAnnouncement));
    } catch (e) {
      console.error('Failed to load session data', e);
    }
  }, []);

  const handleOpenAddTenant = (propertyId = '', unitId = '') => {
    setAddTenantPropertyId(propertyId);
    setAddTenantUnitId(unitId);
    setIsAddTenantOpen(true);
  };

  const handleTenantAdded = (newTenant) => {
    setTenants((prev) => [newTenant, ...prev]);
    if (newTenant.unitId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === newTenant.unitId
            ? { ...u, status: 'occupied', tenantId: newTenant.id, tenantName: newTenant.name, tenantEmail: newTenant.email, leaseStart: newTenant.leaseStart, leaseEnd: newTenant.leaseEnd }
            : u
        )
      );
    }
  };

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleAnnouncementCreated = (newAnc) => {
    if (newAnc.isPinned) {
      setAnnouncement({
        subject: newAnc.title,
        body: newAnc.body,
      });
      setBroadcastDismissed(false);
    }
  };

  const handleCommandPaletteSelect = (item) => {
    if (item.type === 'property' || item.type === 'unit') {
      setActiveView('units');
      if (item.type === 'unit') setSelectedUnitForDetail(item.raw);
    } else if (item.type === 'tenant') {
      setActiveView('tenants');
    } else if (item.type === 'ticket') {
      setActiveView('tickets');
    }
  };

  const vacantCount = units.filter((u) => u.status === 'vacant').length;
  const occupiedCount = units.filter((u) => u.status === 'occupied').length;
  const totalMonthlyRevenue = units.filter((u) => u.status === 'occupied').reduce((sum, u) => sum + (u.monthlyRent || 0), 0);
  const pendingTickets = tickets.filter((t) => t.status !== 'resolved').length;

  const filteredUnits = units.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = u.label.toLowerCase().includes(q) || u.propertyName.toLowerCase().includes(q);
    if (filterStatus === 'vacant') return matchesSearch && u.status === 'vacant';
    if (filterStatus === 'occupied') return matchesSearch && u.status === 'occupied';
    return matchesSearch;
  });

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || (t.propertyName && t.propertyName.toLowerCase().includes(q));
    if (filterStatus === 'pre_added') return matchesSearch && t.status === 'pre_added';
    if (filterStatus === 'occupied') return matchesSearch && t.status === 'active';
    return matchesSearch;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans flex selection:bg-indigo-600/30 selection:text-indigo-300 transition-colors duration-300">
      
      {/* ─── LEFT SIDEBAR NAV ─── */}
      <DashboardSidebar
        activeView={activeView}
        onChangeView={(view) => { setActiveView(view); setSearchQuery(''); setFilterStatus('all'); }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onLogout={() => onNavigate('/')}
        onNavigate={onNavigate}
      />

      {/* ─── MAIN CENTER CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* ─── TOP BAR ─── */}
        <header className="sticky top-0 z-30 apple-glass border-b border-slate-200 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Search (⌘K) */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center w-full bg-slate-100 dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-2 py-2 text-xs text-slate-400 hover:border-indigo-500/50 transition-colors cursor-pointer btn-press"
              >
                <Search className="w-3.5 h-3.5 mr-2 shrink-0" />
                <span className="flex-1 text-left">Search…</span>
                <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Ctrl K</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Tenant Portal Link */}
              <button
                type="button"
                onClick={() => onNavigate('/tenant')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold btn-press"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Tenant Portal</span>
              </button>
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                aria-label="Open notifications"
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#10131F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
              >
                <Bell className="w-4 h-4" />
                {pendingTickets > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {pendingTickets}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#10131F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* User Avatar + Name */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-grotesk">AV</div>
                <div className="text-right hidden md:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">Alexander Vance</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Landlord</span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* ─── SCROLLABLE MAIN CONTENT ─── */}
        <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">

          {/* ═══════════════════════════════════════════ */}
          {/* ─── VIEW 1: OVERVIEW (informational only) ─── */}
          {/* ═══════════════════════════════════════════ */}
          {activeView === 'overview' && (
            <>
              {/* Broadcast Banner (dismissible) */}
              {announcement && !broadcastDismissed && (
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 top-shade apple-glass">
                  <Megaphone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block font-mono">Workspace Broadcast</span>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{announcement.subject}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{announcement.body}</p>
                  </div>
                  <button onClick={() => setBroadcastDismissed(true)} className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 btn-press shrink-0" aria-label="Dismiss">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Hero Greeting */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-grotesk tracking-tight text-slate-900 dark:text-white leading-tight">
                  {greeting}, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Alexander</span> 👋
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your properties today.</p>
              </div>

              {/* KPI Stat Cards (informational — link to sidebar pages) */}
              <KpiMetricsSection
                units={units}
                tenants={tenants}
                tickets={tickets}
                onAddTenant={() => setActiveView('units')}
                onNavigateTickets={() => setActiveView('tickets')}
              />

              <SectionDivider label="Recent Activity" />

              {/* Recent Tickets Preview & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
                    <h2 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-indigo-500" /> Recent Maintenance Requests
                    </h2>
                    <button onClick={() => setActiveView('tickets')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press">
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {tickets.slice(0, 3).map((t) => (
                      <div key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{t.id}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">{t.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.propertyName} &bull; {t.unitLabel}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                          t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : t.status === 'in_progress' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                    {tickets.length === 0 && (
                      <div className="px-5 py-8 text-center text-xs text-slate-400 font-mono">No recent requests found.</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
                    <h2 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">Quick Actions</h2>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    <button onClick={() => { setActiveView('units'); }} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-left btn-press">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Building2 className="w-4 h-4" /></div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Browse Properties</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">View all units and assign tenants</span>
                      </div>
                    </button>
                    <button onClick={() => { setActiveView('tenants'); }} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-left btn-press">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Users className="w-4 h-4" /></div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Manage Tenants</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">View directory and add new tenants</span>
                      </div>
                    </button>
                    <button onClick={() => { setActiveView('announcements'); }} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors text-left btn-press">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Megaphone className="w-4 h-4" /></div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Post Broadcast</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Publish announcements to all tenants</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═════════════════════════════════════════ */}
          {/* ─── VIEW 2: ANNOUNCEMENTS PAGE (dedicated) */}
          {/* ═════════════════════════════════════════ */}
          {activeView === 'announcements' && (
            <AnnouncementsTab onOpenNewAnnouncement={() => setIsNewAnnouncementOpen(true)} />
          )}

          {/* ═════════════════════════════════════════ */}
          {/* ─── VIEW 3: PROPERTIES & UNITS (full CRUD) */}
          {/* ═════════════════════════════════════════ */}
          {activeView === 'units' && (
            <div className="space-y-5">
              {/* Page Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">Properties & Units</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your real estate portfolio — {units.length} total units across {MOCK_PROPERTIES.length} properties.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => onNavigate('/onboarding?step=2')} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Onboarding Wizard
                  </button>
                  <button onClick={() => handleOpenAddTenant()} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-2 shadow-md shadow-indigo-600/20">
                    <UserPlus className="w-4 h-4" /> + Add Tenant
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search units…"
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="all">All status</option>
                  <option value="vacant">Vacant ({vacantCount})</option>
                  <option value="occupied">Occupied ({occupiedCount})</option>
                </select>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUnits.map((u) => {
                  const isVacant = u.status === 'vacant';
                  return (
                    <div key={u.id} className="top-shade apple-glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 hover:border-indigo-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.propertyName}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${isVacant ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'}`}>
                            {u.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white mb-1">{u.label}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{u.bedrooms} Bed &bull; {u.bathrooms} Bath &bull; {u.sqft} sqft</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-xs font-mono">
                        <div className="flex justify-between mb-1"><span className="text-slate-500">Rent:</span><span className="font-bold text-slate-900 dark:text-white">${u.monthlyRent}/mo</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Occupant:</span><span className={isVacant ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-slate-200 font-semibold'}>{isVacant ? 'None (Vacant)' : u.tenantName}</span></div>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <button onClick={() => setSelectedUnitForDetail(u)} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press flex items-center gap-1">
                          Details <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        {isVacant && (
                          <button onClick={() => handleOpenAddTenant(u.propertyId, u.id)} className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-1.5 shadow-sm">
                            <UserPlus className="w-3.5 h-3.5" /> Add tenant
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* ─── VIEW 4: TENANTS DIRECTORY (full CRUD) */}
          {/* ═══════════════════════════════════════ */}
          {activeView === 'tenants' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">Tenants Directory</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage tenant profiles, active leases, and pre-added occupants.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => onNavigate('/onboarding?step=2')} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Onboarding Wizard
                  </button>
                  <button onClick={() => handleOpenAddTenant()} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-2 shadow-md shadow-indigo-600/20">
                    <UserPlus className="w-4 h-4" /> + Add Tenant
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tenants…"
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="all">All tenants</option>
                  <option value="occupied">Active Leases</option>
                  <option value="pre_added">Pre-added / Unassigned</option>
                </select>
              </div>

              {/* Tenants Table */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden apple-glass shadow-xs top-shade">
                {filteredTenants.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-mono">No tenants match the search filter.</div>
                ) : (
                  filteredTenants.map((t) => (
                    <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{t.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${t.status === 'active' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'}`}>
                            {t.status === 'active' ? 'Active Lease' : 'Pre-added'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{t.email}</p>
                      </div>
                      <div className="flex items-center gap-6 text-xs font-mono">
                        <div><span className="text-slate-400 block text-[10px] uppercase tracking-wider">Unit</span><strong className="text-slate-900 dark:text-white">{t.unitLabel || 'Unassigned'}</strong></div>
                        {t.monthlyRent > 0 && <div><span className="text-slate-400 block text-[10px] uppercase tracking-wider">Rent</span><strong className="text-emerald-600 dark:text-emerald-400">${t.monthlyRent}/mo</strong></div>}
                        {t.leaseStart && <div className="hidden md:block"><span className="text-slate-400 block text-[10px] uppercase tracking-wider">Lease</span><strong className="text-slate-700 dark:text-slate-300">{t.leaseStart} → {t.leaseEnd || '—'}</strong></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* ─── VIEW 5: MAINTENANCE QUEUE (full CRUD) ─── */}
          {/* ═══════════════════════════════════════════ */}
          {activeView === 'tickets' && (
            <TicketsTab tickets={tickets} searchQuery={searchQuery} onOpenNewTicket={() => setIsNewTicketOpen(true)} />
          )}

          {/* ═════════════════════════════════════ */}
          {/* ─── VIEW 6: RENT ROLL (full CRUD) ───── */}
          {/* ═════════════════════════════════════ */}
          {activeView === 'payments' && (
            <PaymentsTab payments={payments} searchQuery={searchQuery} />
          )}

          {/* ─── VIEW 7: SETTINGS (placeholder) ─── */}
          {activeView === 'settings' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">Settings</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">Manage account permissions, billing webhooks, and theme preferences.</p>
              <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-400 font-mono apple-glass">
                Settings panel — system configuration ready.
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ─── RIGHT SIDEBAR: NOTIFICATIONS ─── */}
      <RightNotificationSidebar isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

      {/* ─── MODALS ─── */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} properties={MOCK_PROPERTIES} units={units} tenants={tenants} tickets={tickets} onSelectResult={handleCommandPaletteSelect} />
      <AddTenantModal isOpen={isAddTenantOpen} onClose={() => setIsAddTenantOpen(false)} properties={MOCK_PROPERTIES} units={units} initialPropertyId={addTenantPropertyId} initialUnitId={addTenantUnitId} onTenantAdded={handleTenantAdded} />
      <UnitDetailModal isOpen={Boolean(selectedUnitForDetail)} unit={selectedUnitForDetail} property={MOCK_PROPERTIES.find((p) => p.id === selectedUnitForDetail?.propertyId)} onClose={() => setSelectedUnitForDetail(null)} onAddTenant={handleOpenAddTenant} />
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} properties={MOCK_PROPERTIES} units={units} onTicketCreated={handleTicketCreated} />
      <NewAnnouncementModal isOpen={isNewAnnouncementOpen} onClose={() => setIsNewAnnouncementOpen(false)} onAnnouncementCreated={handleAnnouncementCreated} />

    </div>
  );
};
