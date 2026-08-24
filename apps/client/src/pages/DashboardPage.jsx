import React, { useState, useEffect } from 'react';
import { Building2, UserPlus, Users, Search, Home, LogOut, ShieldCheck, ArrowUpRight, Sun, Moon, Sparkles, Megaphone } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { MOCK_PROPERTIES, MOCK_UNITS as INITIAL_UNITS, MOCK_TENANTS as INITIAL_TENANTS } from '../data/mockData';
import { AddTenantModal } from '../components/dashboard/AddTenantModal';
import { UnitDetailModal } from '../components/dashboard/UnitDetailModal';

export const DashboardPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('units'); // 'units' | 'tenants'
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [tenants, setTenants] = useState(INITIAL_TENANTS);

  const [announcement, setAnnouncement] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [addTenantPropertyId, setAddTenantPropertyId] = useState('');
  const [addTenantUnitId, setAddTenantUnitId] = useState('');

  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState(null);

  // Load onboarding tenants or announcements from sessionStorage on mount
  useEffect(() => {
    try {
      const savedTenants = sessionStorage.getItem('jptl_onboarding_tenants');
      if (savedTenants) {
        const parsed = JSON.parse(savedTenants);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTenants((prev) => [...parsed, ...prev]);

          // Update assigned units in local state
          parsed.forEach((t) => {
            if (t.unitId) {
              setUnits((prevUnits) =>
                prevUnits.map((u) =>
                  u.id === t.unitId
                    ? {
                        ...u,
                        status: 'occupied',
                        tenantId: t.id,
                        tenantName: t.name,
                        tenantEmail: t.email,
                      }
                    : u
                )
              );
            }
          });
        }
      }

      const savedAnnouncement = sessionStorage.getItem('jptl_announcement');
      if (savedAnnouncement) {
        setAnnouncement(JSON.parse(savedAnnouncement));
      }
    } catch (e) {
      console.error('Failed to load session data', e);
    }
  }, []);

  // Handle opening Add Tenant modal with optional pre-filled unit
  const handleOpenAddTenant = (propertyId = '', unitId = '') => {
    setAddTenantPropertyId(propertyId);
    setAddTenantUnitId(unitId);
    setIsAddTenantOpen(true);
  };

  // Callback when a new tenant is added via modal
  const handleTenantAdded = (newTenant) => {
    setTenants((prev) => [newTenant, ...prev]);

    if (newTenant.unitId) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === newTenant.unitId
            ? {
                ...u,
                status: 'occupied',
                tenantId: newTenant.id,
                tenantName: newTenant.name,
                tenantEmail: newTenant.email,
                leaseStart: newTenant.leaseStart,
                leaseEnd: newTenant.leaseEnd,
              }
            : u
        )
      );
    }
  };

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'vacant') return matchesSearch && u.status === 'vacant';
    if (filterStatus === 'occupied') return matchesSearch && u.status === 'occupied';
    return matchesSearch;
  });

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.propertyName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'pre_added') return matchesSearch && t.status === 'pre_added';
    if (filterStatus === 'occupied') return matchesSearch && t.status === 'active';
    return matchesSearch;
  });

  const vacantCount = units.filter((u) => u.status === 'vacant').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-indigo-600/30 selection:text-indigo-300 transition-colors duration-300">
      
      {/* Dashboard Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#070A12]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Console Badge */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-grotesk font-extrabold text-lg text-slate-900 dark:text-white hidden sm:inline">
                JPTL<span className="text-indigo-600 dark:text-indigo-400">.SYSTEM</span>
              </span>
            </a>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Landlord Console</span>
            </div>
          </div>

          {/* Controls: Light/Dark Mode & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Alexander Vance</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Landlord Account</span>
            </div>

            <button
              onClick={() => onNavigate('/')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Log out to home"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Pinned Broadcast Announcement (if set during onboarding) */}
        {announcement && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-3 animate-in fade-in">
            <Megaphone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Pinned Workspace Broadcast
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{announcement.subject}</h4>
              <p className="text-slate-600 dark:text-slate-300">{announcement.body}</p>
            </div>
          </div>
        )}

        {/* Hero Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-indigo-950 text-white border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-grotesk">
              Welcome back, Alexander
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              You have <strong className="text-emerald-400">{vacantCount} vacant units</strong> available for placement. Add tenants directly or launch the onboarding wizard.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Shortcut to full split-screen Onboarding Flow */}
            <button
              type="button"
              onClick={() => onNavigate('/onboarding?step=2')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-grotesk font-semibold text-xs border border-white/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Onboarding Wizard</span>
            </button>

            {/* Quick Add Tenant Modal CTA */}
            <button
              type="button"
              onClick={() => handleOpenAddTenant()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Tenant</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          
          {/* Tabs */}
          <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('units');
                setFilterStatus('all');
              }}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-semibold font-grotesk flex items-center justify-center gap-2 transition-all ${
                activeTab === 'units'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Properties & Units ({units.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('tenants');
                setFilterStatus('all');
              }}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-semibold font-grotesk flex items-center justify-center gap-2 transition-all ${
                activeTab === 'tenants'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tenants Directory ({tenants.length})</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'units' ? 'Search units...' : 'Search tenants...'}
                className="w-full bg-white dark:bg-[#111625] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-[#111625] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All statuses</option>
              {activeTab === 'units' ? (
                <>
                  <option value="vacant">Vacant only ({vacantCount})</option>
                  <option value="occupied">Occupied only</option>
                </>
              ) : (
                <>
                  <option value="occupied">Active Leases</option>
                  <option value="pre_added">Pre-added / Unassigned</option>
                </>
              )}
            </select>
          </div>

        </div>

        {/* TAB 1: Units Grid View */}
        {activeTab === 'units' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnits.map((u) => {
                const isVacant = u.status === 'vacant';
                return (
                  <div
                    key={u.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.propertyName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isVacant
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white mb-1">{u.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span>{u.bedrooms} Bed &bull; {u.bathrooms} Bath</span>
                        <span>&bull;</span>
                        <span>{u.sqft} sqft</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090C16] border border-slate-200 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Monthly Rent:</span>
                        <span className="font-bold text-slate-900 dark:text-white">${u.monthlyRent}/mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Current Occupant:</span>
                        <span className={`font-semibold ${isVacant ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                          {isVacant ? 'None (Vacant)' : u.tenantName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedUnitForDetail(u)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {isVacant && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddTenant(u.propertyId, u.id)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-grotesk shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add tenant</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Tenants Directory View */}
        {activeTab === 'tenants' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white">Tenant Directory</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage tenant profiles, active leases, and pre-added occupants.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/onboarding?step=2')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Onboarding Wizard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddTenant()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Tenant</span>
                </button>
              </div>
            </div>

            {/* Tenants List Table */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#111625] shadow-sm">
              {filteredTenants.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No tenants match the search filter.
                </div>
              ) : (
                filteredTenants.map((t) => (
                  <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{t.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'active'
                              ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                              : 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {t.status === 'active' ? 'Active Lease' : 'Pre-added'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.email}</p>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Assigned Unit</span>
                        <strong className="text-slate-900 dark:text-white">{t.unitLabel || 'Unassigned'}</strong>
                      </div>
                      {t.monthlyRent > 0 && (
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Rent</span>
                          <strong className="text-emerald-600 dark:text-emerald-400">${t.monthlyRent}/mo</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Add Tenant Modal */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        properties={MOCK_PROPERTIES}
        units={units}
        initialPropertyId={addTenantPropertyId}
        initialUnitId={addTenantUnitId}
        onTenantAdded={handleTenantAdded}
      />

      {/* MODAL 2: Unit Detail Modal */}
      <UnitDetailModal
        isOpen={Boolean(selectedUnitForDetail)}
        unit={selectedUnitForDetail}
        property={MOCK_PROPERTIES.find((p) => p.id === selectedUnitForDetail?.propertyId)}
        onClose={() => setSelectedUnitForDetail(null)}
        onAddTenant={handleOpenAddTenant}
      />

    </div>
  );
};
