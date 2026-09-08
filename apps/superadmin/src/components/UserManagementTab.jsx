import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Building, Search, Filter, Plus, Minus, ChevronRight, ChevronDown,
  ShieldCheck, AlertTriangle, Mail, Phone, Home, DollarSign, Calendar, Eye,
  CheckCircle2, Clock, MoreVertical, Ban, Sparkles, ExternalLink
} from 'lucide-react';
import { INITIAL_LANDLORDS } from '../data/mockUserData';
import { AddLandlordModal } from './AddLandlordModal';
import { AddTenantModal } from './AddTenantModal';

export const UserManagementTab = () => {
  const [landlords, setLandlords] = useState(INITIAL_LANDLORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'pending' | 'suspended'

  // Expanded landlord rows map: { 'lnd-1': true, ... }
  const [expandedLandlords, setExpandedLandlords] = useState({ 'lnd-1': true });

  // Modal controls
  const [isAddLandlordOpen, setIsAddLandlordOpen] = useState(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [targetLandlordForTenant, setTargetLandlordForTenant] = useState(null);

  // Property drawer state for viewing a landlord's properties
  const [selectedLandlordForProps, setSelectedLandlordForProps] = useState(null);

  // Toggle expansion of landlord row
  const toggleExpand = (id) => {
    setExpandedLandlords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand all / Collapse all
  const expandAll = () => {
    const all = {};
    landlords.forEach((l) => (all[l.id] = true));
    setExpandedLandlords(all);
  };
  const collapseAll = () => setExpandedLandlords({});

  // Handlers for adding data
  const handleAddLandlord = (newLandlord) => {
    setLandlords((prev) => [newLandlord, ...prev]);
    // Auto-expand new landlord
    setExpandedLandlords((prev) => ({ ...prev, [newLandlord.id]: true }));
  };

  const handleAddTenant = (landlordId, newTenant) => {
    setLandlords((prev) =>
      prev.map((lnd) => {
        if (lnd.id === landlordId) {
          return {
            ...lnd,
            tenants: [newTenant, ...lnd.tenants],
          };
        }
        return lnd;
      })
    );
    // Ensure landlord row is expanded to show newly added tenant
    setExpandedLandlords((prev) => ({ ...prev, [landlordId]: true }));
  };

  // Toggle Landlord status (Active <-> Suspended)
  const handleToggleStatus = (landlordId) => {
    setLandlords((prev) =>
      prev.map((lnd) => {
        if (lnd.id === landlordId) {
          const nextStatus = lnd.status === 'active' ? 'suspended' : 'active';
          return { ...lnd, status: nextStatus };
        }
        return lnd;
      })
    );
  };

  // Filtered landlords based on search & status filter
  const filteredLandlords = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return landlords.filter((lnd) => {
      // Status filter check
      if (statusFilter !== 'all' && lnd.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      // Check if landlord matches query
      const matchLandlord =
        lnd.name.toLowerCase().includes(query) ||
        lnd.email.toLowerCase().includes(query) ||
        lnd.company.toLowerCase().includes(query);

      // Check if any child tenant matches query
      const matchTenant = lnd.tenants.some(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.propertyName.toLowerCase().includes(query) ||
          t.unitLabel.toLowerCase().includes(query)
      );

      return matchLandlord || matchTenant;
    });
  }, [landlords, searchQuery, statusFilter]);

  // If searching, auto expand landlords with matching query
  useMemo(() => {
    if (searchQuery.trim().length > 1) {
      const autoExpanded = {};
      filteredLandlords.forEach((l) => {
        autoExpanded[l.id] = true;
      });
      setExpandedLandlords(autoExpanded);
    }
  }, [searchQuery, filteredLandlords]);

  // Aggregate KPI stats
  const totalLandlordsCount = landlords.length;
  const totalTenantsCount = landlords.reduce((acc, l) => acc + l.tenants.length, 0);
  const totalRentVolume = landlords.reduce(
    (acc, l) => acc + l.tenants.reduce((tAcc, t) => tAcc + (t.monthlyRent || 0), 0),
    0
  );
  const totalPropertiesCount = landlords.reduce((acc, l) => acc + l.properties.length, 0);

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* ─── TOP KPI TELEMETRY BAR ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2 relative overflow-hidden group transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
            <Building className="w-4 h-4" />
          </div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Managed Landlords</span>
          <strong className="text-2xl font-grotesk font-extrabold text-white block">{totalLandlordsCount} Accounts</strong>
          <span className="text-emerald-400 text-[10px] font-bold">+1 Registered this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2 relative overflow-hidden group transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Handled Tenants</span>
          <strong className="text-2xl font-grotesk font-extrabold text-emerald-400 block">{totalTenantsCount} Residents</strong>
          <span className="text-emerald-400 text-[10px] font-bold">100% Assigned to Landlords</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2 relative overflow-hidden group transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-purple-500/5">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Monthly Rent Portfolio</span>
          <strong className="text-2xl font-grotesk font-extrabold text-purple-400 block">
            ${totalRentVolume.toLocaleString()}/mo
          </strong>
          <span className="text-slate-500 text-[10px]">Tracked Rent Roll Volume</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D111D] border border-slate-800 space-y-2 relative overflow-hidden group transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="absolute right-3 top-3 w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Registered Properties</span>
          <strong className="text-2xl font-grotesk font-extrabold text-amber-400 block">{totalPropertiesCount} Estates</strong>
          <span className="text-slate-500 text-[10px]">Active Portfolios</span>
        </div>
      </div>

      {/* ─── CONTROLS & FILTERING TOOLBAR ─── */}
      <div className="p-5 rounded-3xl bg-[#0D111D] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 transition-colors group-focus-within:text-indigo-400" />
          <input
            type="text"
            placeholder="Search landlord name, company, email, or tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050811] border border-slate-800 rounded-2xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdown & Actions */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#050811] border border-slate-800 rounded-2xl px-3 py-1.5 transition-colors focus-within:border-indigo-500/60">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0D111D]">All Statuses</option>
              <option value="active" className="bg-[#0D111D]">Active Only</option>
              <option value="pending" className="bg-[#0D111D]">Pending Verification</option>
              <option value="suspended" className="bg-[#0D111D]">Suspended</option>
            </select>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 btn-press cursor-pointer text-[11px]"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 btn-press cursor-pointer text-[11px]"
            >
              Collapse All
            </button>
          </div>

          <button
            onClick={() => setIsAddLandlordOpen(true)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all btn-press cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Landlord</span>
          </button>
        </div>
      </div>

      {/* ─── HIERARCHY TREE / EXPANDABLE LANDLORDS & TENANTS TABLE ─── */}
      <div className="rounded-3xl bg-[#0D111D] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-[#090D17] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Building className="w-3.5 h-3.5 text-indigo-400" /> Landlords & Handled Tenant Structure
          </div>
          <span className="text-slate-500 text-[11px]">
            Showing {filteredLandlords.length} Landlords
          </span>
        </div>

        {filteredLandlords.length === 0 ? (
          <div className="p-12 text-center space-y-3 animate-accordion-expand">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-grotesk font-semibold text-sm">No Landlords or Tenants match your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="text-xs text-indigo-400 hover:underline font-mono"
            >
              Reset search filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredLandlords.map((landlord) => {
              const isExpanded = !!expandedLandlords[landlord.id];
              const tenantCount = landlord.tenants.length;
              const propCount = landlord.properties.length;

              return (
                <div key={landlord.id} className="transition-colors duration-150">
                  {/* ─── PARENT LANDLORD ROW ─── */}
                  <div
                    className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors duration-150 ${
                      isExpanded ? 'bg-slate-900/40' : 'hover:bg-slate-900/20'
                    }`}
                    onClick={() => toggleExpand(landlord.id)}
                  >
                    {/* Left: Plus Toggle & Landlord Profile */}
                    <div className="flex items-center gap-3">
                      {/* Plus/Minus Toggle Button with smooth 135° morphing rotation & scale physics */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(landlord.id);
                        }}
                        title={isExpanded ? 'Collapse Tenants' : 'Expand Tenants'}
                        className={`group/plus w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-300 btn-press cursor-pointer shrink-0 ${
                          isExpanded
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/40 scale-105'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        <Plus
                          className={`w-4 h-4 stroke-[3] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                            isExpanded
                              ? 'rotate-[135deg] text-white scale-110'
                              : 'rotate-0 text-slate-400 group-hover/plus:text-white group-hover/plus:rotate-90'
                          }`}
                        />
                      </button>

                      {/* Landlord Avatar & Main Details */}
                      <img
                        src={landlord.avatar}
                        alt={landlord.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-grotesk font-extrabold text-sm text-white hover:text-indigo-400 transition-colors">
                            {landlord.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">({landlord.company})</span>

                          {/* Account Status Pill */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                              landlord.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : landlord.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {landlord.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" /> {landlord.email}
                          </span>
                          <span className="hidden sm:inline-block text-slate-600">&bull;</span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" /> {landlord.phone}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Badges & Action Toolbar */}
                    <div
                      className="flex items-center gap-3 font-mono text-xs self-end md:self-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Properties Count Badge */}
                      <button
                        onClick={() => setSelectedLandlordForProps(landlord)}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] flex items-center gap-1.5 btn-press cursor-pointer"
                      >
                        <Home className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{propCount} Properties</span>
                      </button>

                      {/* Tenants Count Badge */}
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{tenantCount} Tenants</span>
                      </span>

                      {/* Direct "+ Add Tenant under this Landlord" button */}
                      <button
                        onClick={() => {
                          setTargetLandlordForTenant(landlord);
                          setIsAddTenantOpen(true);
                        }}
                        className="group/addbtn px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-grotesk font-bold flex items-center gap-1.5 transition-all duration-200 btn-press cursor-pointer"
                        title="Add tenant directly to this landlord"
                      >
                        <Plus className="w-3.5 h-3.5 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/addbtn:rotate-90" />
                        <span>Add Tenant</span>
                      </button>

                      {/* Suspend / Activate account toggle */}
                      <button
                        onClick={() => handleToggleStatus(landlord.id)}
                        className={`p-2 rounded-xl border btn-press cursor-pointer ${
                          landlord.status === 'active'
                            ? 'bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border-slate-800'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                        title={landlord.status === 'active' ? 'Suspend Landlord Account' : 'Activate Account'}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ─── NESTED CHILD TENANTS TABLE (SMOOTH GRID SLIDE EXPAND ON '+' CLICK) ─── */}
                  <div className="accordion-wrapper" data-expanded={isExpanded}>
                    <div className="accordion-inner bg-[#070A12] border-t border-slate-800/80 p-4 pl-8 md:pl-12 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider pb-2 border-b border-slate-800/60">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          Handled Tenants Under {landlord.name} ({tenantCount})
                        </span>
                        <button
                          onClick={() => {
                            setTargetLandlordForTenant(landlord);
                            setIsAddTenantOpen(true);
                          }}
                          className="group/addhdr text-emerald-400 hover:underline text-[11px] font-normal flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3 transition-transform duration-300 group-hover/addhdr:rotate-90" /> Add Tenant
                        </button>
                      </div>

                      {tenantCount === 0 ? (
                        <div className="p-4 rounded-2xl bg-[#090D17] border border-slate-800/60 text-slate-500 text-[11px] text-center flex justify-between items-center">
                          <span>No tenants currently assigned to this landlord.</span>
                          <button
                            onClick={() => {
                              setTargetLandlordForTenant(landlord);
                              setIsAddTenantOpen(true);
                            }}
                            className="px-3 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 font-bold hover:bg-indigo-600 hover:text-white btn-press transition-colors"
                          >
                            + Assign Tenant Now
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {landlord.tenants.map((tenant, idx) => (
                            <div
                              key={tenant.id}
                              style={{ animationDelay: `${idx * 40}ms` }}
                              className="p-3.5 rounded-2xl bg-[#0B0F1A] border border-slate-800/80 hover:border-slate-700 hover:bg-[#0E1322] transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-stagger-item"
                            >
                              {/* Tenant Avatar & Contact */}
                              <div className="flex items-center gap-3">
                                <img
                                  src={tenant.avatar}
                                  alt={tenant.name}
                                  className="w-8 h-8 rounded-xl object-cover border border-slate-800 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-white font-grotesk text-xs">{tenant.name}</strong>
                                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                      {tenant.unitLabel}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-2">
                                    <span>{tenant.email}</span>
                                    <span>&bull;</span>
                                    <span>{tenant.phone}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Property & Rent info */}
                              <div className="flex items-center gap-4 text-[11px] text-slate-300">
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase">Property</span>
                                  <span className="font-semibold text-white">{tenant.propertyName}</span>
                                </div>
                                <div className="border-l border-slate-800 pl-4">
                                  <span className="text-slate-500 block text-[9px] uppercase">Monthly Rent</span>
                                  <span className="text-emerald-400 font-bold">${tenant.monthlyRent}/mo</span>
                                </div>
                                <div className="border-l border-slate-800 pl-4 hidden lg:block">
                                  <span className="text-slate-500 block text-[9px] uppercase">Lease Period</span>
                                  <span className="text-slate-400">{tenant.leaseStart} to {tenant.leaseEnd}</span>
                                </div>
                              </div>

                              {/* Status Badge & Actions */}
                              <div className="flex items-center gap-3 self-end md:self-auto">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {tenant.paymentStatus}
                                </span>
                                <button
                                  onClick={() => alert(`Viewing full lease dossier for tenant: ${tenant.name}`)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 btn-press cursor-pointer"
                                  title="View Tenant Dossier"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── PROPERTIES OVERLAY MODAL / DRAWER ─── */}
      {selectedLandlordForProps && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-backdrop">
          <div className="bg-[#0D111D] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 font-sans text-slate-100 animate-modal-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold font-grotesk text-white text-base">
                  {selectedLandlordForProps.name}'s Properties
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedLandlordForProps.company}</p>
              </div>
              <button
                onClick={() => setSelectedLandlordForProps(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 btn-press cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {selectedLandlordForProps.properties.map((prop, idx) => (
                <div
                  key={prop.id}
                  style={{ animationDelay: `${idx * 45}ms` }}
                  className="p-3 rounded-2xl bg-[#070A12] border border-slate-800 flex justify-between items-center animate-stagger-item"
                >
                  <div>
                    <strong className="text-white font-grotesk block">{prop.name}</strong>
                    <span className="text-slate-500 text-[10px]">ID: {prop.id}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-[10px] border border-indigo-500/20">
                    {prop.unitsCount} Units
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedLandlordForProps(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-grotesk font-bold text-xs btn-press cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* ─── ADD LANDLORD MODAL ─── */}
      <AddLandlordModal
        isOpen={isAddLandlordOpen}
        onClose={() => setIsAddLandlordOpen(false)}
        onAddLandlord={handleAddLandlord}
      />

      {/* ─── ADD TENANT MODAL ─── */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => {
          setIsAddTenantOpen(false);
          setTargetLandlordForTenant(null);
        }}
        targetLandlord={targetLandlordForTenant}
        landlords={landlords}
        onAddTenant={handleAddTenant}
      />
    </div>
  );
};
