import React, { useState, useEffect } from 'react';
import { 
  Building2, UserPlus, Users, Search, Home, LogOut, ShieldCheck, ArrowUpRight, 
  Sun, Moon, Sparkles, Megaphone, Wrench, DollarSign, X, Bell, ArrowRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle, Trash2, Layers, MapPin, Key
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { 
  MOCK_PROPERTIES, 
  MOCK_UNITS as INITIAL_UNITS, 
  MOCK_TENANTS as INITIAL_TENANTS,
  MOCK_TICKETS as INITIAL_TICKETS,
  MOCK_PAYMENTS as INITIAL_PAYMENTS,
  MOCK_DOCUMENTS
} from '../data/mockData';
import { AddTenantModal } from '../components/dashboard/AddTenantModal';
import { AssignTenantModal } from '../components/dashboard/AssignTenantModal';
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
import { LandlordSettingsTab } from '../components/dashboard/LandlordSettingsTab';
import { LandlordDocumentsTab } from '../components/dashboard/LandlordDocumentsTab';
import { DeletePropertyModal } from '../components/dashboard/DeletePropertyModal';
import { AddPropertyOrUnitModal } from '../components/dashboard/AddPropertyOrUnitModal';
import { useAuth } from '../context/AuthContext';
import { landlordApi } from '../services/api';

export const DashboardPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [activeView, setActiveView] = useState('overview');

  const [properties, setProperties] = useState(() => {
    try {
      const savedProps = sessionStorage.getItem('jptl_custom_properties');
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [units, setUnits] = useState(() => {
    try {
      const savedUnits = sessionStorage.getItem('jptl_custom_units');
      if (savedUnits) {
        const parsed = JSON.parse(savedUnits);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [tenants, setTenants] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState(() => {
    try {
      const savedDocs = sessionStorage.getItem('jptl_documents');
      if (savedDocs) {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [announcements, setAnnouncements] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleUpdateDocumentStatus = async (docId, status, rejectionReason) => {
    try {
      await landlordApi.updateDocumentStatus(docId, status, rejectionReason);
    } catch (err) {
      console.warn('Could not persist document status to server:', err.message);
    }
    setDocuments((prev) => {
      const updated = prev.map((d) => 
        (d.id === docId || d._id === docId) ? { 
          ...d, 
          status, 
          rejectionReason: status === 'Rejected' ? rejectionReason : undefined,
          verifiedAt: status === 'Verified' ? new Date().toISOString() : d.verifiedAt,
          reviewedBy: `${user?.name || 'Alexander Vance'} (Landlord)`
        } : d
      );
      try {
        sessionStorage.setItem('jptl_documents', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

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

  // Property / Unit Sub-Tab & Delete Property State
  const [propSubTab, setPropSubTab] = useState('properties'); // 'properties' | 'units'
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  // Property / Unit Creation Modal
  const [isAddPropUnitOpen, setIsAddPropUnitOpen] = useState(false);
  const [addPropUnitTab, setAddPropUnitTab] = useState('unit');
  const [addPropPreselectedPropertyId, setAddPropPreselectedPropertyId] = useState(null);

  // Tenant Assignment Modal State
  const [assigningTenant, setAssigningTenant] = useState(null);

  // Lease Duration Helper
  const getLeaseDuration = (start, end) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '0 Days';
    const diffMonths = Math.round(diffDays / 30.44);
    if (diffMonths >= 12) {
      const years = (diffMonths / 12).toFixed(diffMonths % 12 === 0 ? 0 : 1);
      return `${years} ${years === '1' ? 'Year' : 'Years'} (${diffMonths} mo)`;
    }
    return `${diffMonths} ${diffMonths === 1 ? 'Month' : 'Months'}`;
  };

  // Lease Expiration Helper
  const getLeaseExpirationInfo = (end) => {
    if (!end) return null;
    const e = new Date(end);
    if (isNaN(e.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil((e.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formattedDate = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (diffDays < 0) {
      return {
        formattedDate,
        badgeText: `Expired ${Math.abs(diffDays)}d ago`,
        statusClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      };
    }
    if (diffDays <= 30) {
      return {
        formattedDate,
        badgeText: `Expires in ${diffDays}d`,
        statusClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      };
    }
    return {
      formattedDate,
      badgeText: `${diffDays} days left`,
      statusClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    };
  };

  const handleDashboardPropertyCreated = async (newProp) => {
    try {
      const res = await landlordApi.createProperty({
        name: newProp.name,
        address: newProp.address,
        city: newProp.city,
        category: newProp.category,
        image: newProp.image,
      });
      const created = res.data || newProp;
      const finalProp = { ...created, id: created._id || created.id, units: [] };
      setProperties((prev) => [finalProp, ...prev]);
      setToastNotification(`Property "${finalProp.name}" created successfully!`);
      setTimeout(() => setToastNotification(null), 4000);
      return finalProp;
    } catch (err) {
      console.warn('Server createProperty fallback to local:', err.message);
      const fallback = { ...newProp, id: newProp.id || `prop-custom-${Date.now()}`, units: [] };
      setProperties((prev) => {
        const updated = [...prev, fallback];
        try {
          const customOnly = updated.filter((p) => String(p.id).startsWith('prop-custom-'));
          sessionStorage.setItem('jptl_custom_properties', JSON.stringify(customOnly));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      setToastNotification(`Property "${newProp.name}" created!`);
      setTimeout(() => setToastNotification(null), 4000);
      return fallback;
    }
  };

  const handleDashboardUnitCreated = async (newUnit) => {
    try {
      const targetPropId = newUnit.propertyId || newUnit.property;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(targetPropId));
      if (!isMongoId) {
        console.warn('Property ID is not a MongoDB ObjectId, creating unit locally:', targetPropId);
        const fallbackUnit = { ...newUnit, id: newUnit.id || `unit-custom-${Date.now()}` };
        setUnits((prev) => [fallbackUnit, ...prev]);
        setToastNotification(`Unit "${fallbackUnit.label}" created locally.`);
        setTimeout(() => setToastNotification(null), 4000);
        return fallbackUnit;
      }
      const res = await landlordApi.createUnit(targetPropId, {
        label: newUnit.label,
        monthlyRent: newUnit.monthlyRent,
        bedrooms: newUnit.bedrooms,
        bathrooms: newUnit.bathrooms,
        sqft: newUnit.sqft,
      });
      const created = res.data || newUnit;
      const targetProp = properties.find((p) => (p.id === targetPropId || p._id === targetPropId));
      const finalUnit = {
        ...created,
        id: created._id || created.id,
        propertyId: targetPropId,
        propertyName: targetProp?.name || 'Property',
      };
      setUnits((prev) => [finalUnit, ...prev]);
      setToastNotification(`Unit "${finalUnit.label}" created successfully!`);
      setTimeout(() => setToastNotification(null), 4000);
      return finalUnit;
    } catch (err) {
      console.warn('Server createUnit fallback to local:', err.message);
      setUnits((prev) => {
        const updated = [...prev, newUnit];
        try {
          const customOnly = updated.filter((u) => String(u.id).startsWith('unit-custom-'));
          sessionStorage.setItem('jptl_custom_units', JSON.stringify(customOnly));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
      setToastNotification(`Unit "${newUnit.label}" created!`);
      setTimeout(() => setToastNotification(null), 4000);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    const propToDelete = properties.find((p) => p.id === propertyId || p._id === propertyId);
    const propName = propToDelete ? propToDelete.name : 'Property';

    try {
      await landlordApi.deleteProperty(propertyId, true);
    } catch (err) {
      console.warn('Server deleteProperty notice:', err.message);
    }

    // Remove property
    setProperties((prev) => prev.filter((p) => p.id !== propertyId && p._id !== propertyId));

    // Remove vacant units belonging to this property
    setUnits((prev) => prev.filter((u) => u.propertyId !== propertyId && u.property !== propertyId));

    setToastNotification(`Property "${propName}" and its vacant units were deleted.`);
    setTimeout(() => setToastNotification(null), 4500);
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus, updatedTicket) => {
    try {
      await landlordApi.updateTicketStatus(ticketId, newStatus);
    } catch (err) {
      console.warn('Server updateTicketStatus notice:', err.message);
    }
    setTickets((prev) =>
      prev.map((t) => ((t.id === ticketId || t._id === ticketId) ? (updatedTicket || { ...t, status: newStatus }) : t))
    );
    setToastNotification(`Ticket status updated to "${newStatus.replace('_', ' ')}"`);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

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

  // Load live data from server
  useEffect(() => {
    let isMounted = true;

    async function loadLiveDashboardData() {
      try {
        const [dashRes, propsRes, ticketsRes, tenantsRes, docsRes, rentRollRes, ancRes] = await Promise.allSettled([
          landlordApi.getDashboard(),
          landlordApi.getProperties(),
          landlordApi.getTickets(),
          landlordApi.getTenants(),
          landlordApi.getDocuments(),
          landlordApi.getRentRoll(),
          landlordApi.getAnnouncements(),
        ]);

        if (!isMounted) return;

        if (propsRes.status === 'fulfilled') {
          const liveProps = propsRes.value?.data || [];
          setProperties(liveProps);
          const liveUnits = liveProps.flatMap((p) =>
            (p.units || []).map((u) => ({
              ...u,
              id: u._id || u.id,
              propertyId: p._id || p.id,
              propertyName: p.name,
              propertyAddress: p.address,
            }))
          );
          setUnits(liveUnits);
        }

        if (ticketsRes.status === 'fulfilled') {
          const tList = ticketsRes.value?.tickets || ticketsRes.value?.data || (Array.isArray(ticketsRes.value) ? ticketsRes.value : []);
          setTickets(Array.isArray(tList) ? tList : []);
        }

        if (tenantsRes.status === 'fulfilled') {
          const serverTenants = tenantsRes.value?.data || [];
          const map = new Map();
          serverTenants.forEach((t) => {
            const id = String(t.id || t._id || t.email);
            map.set(id, { ...t, id: t.id || t._id });
          });
          try {
            const savedTenants = sessionStorage.getItem('jptl_onboarding_tenants');
            if (savedTenants) {
              const parsed = JSON.parse(savedTenants);
              if (Array.isArray(parsed)) {
                parsed.forEach((t) => {
                  const id = String(t.id || t._id || t.email);
                  if (id && !map.has(id)) {
                    map.set(id, t);
                  }
                });
              }
            }
          } catch (e) {
            console.error('Failed to load session data', e);
          }
          setTenants(Array.from(map.values()));
        }

        if (docsRes.status === 'fulfilled') {
          const dList = docsRes.value?.documents || docsRes.value?.data || (Array.isArray(docsRes.value) ? docsRes.value : []);
          setDocuments(Array.isArray(dList) ? dList : []);
        }

        if (rentRollRes.status === 'fulfilled') {
          setPayments(rentRollRes.value?.data || []);
        }

        if (ancRes.status === 'fulfilled') {
          const ancList = ancRes.value?.data || [];
          setAnnouncements(ancList);
          const pinned = ancList.find((a) => a.isPinned) || ancList[0];
          if (pinned) {
            setAnnouncement({
              subject: pinned.title,
              body: pinned.content || pinned.body,
            });
          } else {
            setAnnouncement(null);
          }
        } else if (dashRes.status === 'fulfilled' && dashRes.value?.data?.pinnedAnnouncement) {
          const p = dashRes.value.data.pinnedAnnouncement;
          setAnnouncement({
            subject: p.title,
            body: p.content || p.body,
          });
        }
      } catch (err) {
        console.warn('Dashboard live data fetch fallback:', err.message);
      }
    }

    loadLiveDashboardData();

    return () => {
      isMounted = false;
    };
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
          (u.id === newTenant.unitId || u._id === newTenant.unitId)
            ? { ...u, status: 'occupied', tenantId: newTenant.id, tenantName: newTenant.name, tenantEmail: newTenant.email, leaseStart: newTenant.leaseStart, leaseEnd: newTenant.leaseEnd }
            : u
        )
      );
    }
  };

  const handleTenantAssigned = (updatedTenant) => {
    setTenants((prev) =>
      prev.map((t) => ((t.id === updatedTenant.id || t._id === updatedTenant.id || t.email === updatedTenant.email) ? updatedTenant : t))
    );
    if (updatedTenant.unitId) {
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === updatedTenant.unitId || u._id === updatedTenant.unitId) {
            return {
              ...u,
              status: 'occupied',
              tenantId: updatedTenant.id,
              tenantName: updatedTenant.name,
              tenantEmail: updatedTenant.email,
              leaseStart: updatedTenant.leaseStart,
              leaseEnd: updatedTenant.leaseEnd,
              monthlyRent: updatedTenant.monthlyRent || u.monthlyRent,
            };
          }
          if (u.tenantId === updatedTenant.id && u.id !== updatedTenant.unitId && u._id !== updatedTenant.unitId) {
            return { ...u, status: 'vacant', tenantId: null, tenantName: null, tenantEmail: null };
          }
          return u;
        })
      );
    }
    setToastNotification(`${updatedTenant.name} successfully assigned to ${updatedTenant.unitLabel || 'unit'} at ${updatedTenant.propertyName || 'property'}!`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleAnnouncementCreated = async (newAnc) => {
    try {
      const res = await landlordApi.createAnnouncement({
        title: newAnc.title,
        content: newAnc.body,
        category: newAnc.category,
        isPinned: newAnc.isPinned,
      });
      const created = res.data || newAnc;
      setAnnouncements((prev) => [created, ...prev]);
      if (newAnc.isPinned) {
        setAnnouncement({
          subject: newAnc.title,
          body: newAnc.body,
        });
        setBroadcastDismissed(false);
      }
    } catch (err) {
      console.warn('Server createAnnouncement notice:', err.message);
      setAnnouncements((prev) => [newAnc, ...prev]);
      if (newAnc.isPinned) {
        setAnnouncement({
          subject: newAnc.title,
          body: newAnc.body,
        });
        setBroadcastDismissed(false);
      }
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

  const vacantCount = (units || []).filter((u) => u?.status === 'vacant').length;
  const occupiedCount = (units || []).filter((u) => u?.status === 'occupied').length;
  const totalMonthlyRevenue = (units || []).filter((u) => u?.status === 'occupied').reduce((sum, u) => sum + (u?.monthlyRent || 0), 0);
  const pendingTickets = (tickets || []).filter((t) => t?.status !== 'resolved').length;

  const filteredUnits = (units || []).filter((u) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = (u?.label || '').toLowerCase().includes(q) || (u?.propertyName || '').toLowerCase().includes(q);
    if (filterStatus === 'vacant') return matchesSearch && u?.status === 'vacant';
    if (filterStatus === 'occupied') return matchesSearch && u?.status === 'occupied';
    return matchesSearch;
  });

  const filteredTenants = (tenants || []).filter((t) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = (t?.name || '').toLowerCase().includes(q) || (t?.email || '').toLowerCase().includes(q) || (t?.propertyName || '').toLowerCase().includes(q);
    if (filterStatus === 'pre_added') return matchesSearch && t?.status === 'pre_added';
    if (filterStatus === 'occupied') return matchesSearch && t?.status === 'active';
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
        onLogout={handleLogout}
        onNavigate={onNavigate}
        pendingDocCount={documents.filter((d) => d.status === 'Pending Review').length}
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
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-grotesk">
                  {(user?.firstName?.[0] || 'J') + (user?.lastName?.[0] || 'T')}
                </div>
                <div className="text-right hidden md:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {user?.name || user?.firstName || 'Julian Thorne'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Landlord'}
                  </span>
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
                  {greeting}, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user?.firstName || 'Julian'}</span> 👋
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
            <AnnouncementsTab announcements={announcements} onOpenNewAnnouncement={() => setIsNewAnnouncementOpen(true)} />
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your real estate portfolio — {units.length} total units across {properties.length} properties.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setAddPropPreselectedPropertyId(null); setAddPropUnitTab('property'); setIsAddPropUnitOpen(true); }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold font-grotesk btn-press flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-indigo-500" /> + Add Property / Unit
                  </button>
                  <button
                    onClick={() => onNavigate('/onboarding?step=2')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold btn-press flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Onboarding Wizard
                  </button>
                  <button
                    onClick={() => handleOpenAddTenant()}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-2 shadow-md shadow-indigo-600/20"
                  >
                    <UserPlus className="w-4 h-4" /> + Add Tenant
                  </button>
                </div>
              </div>

              {/* Sub-view Segmented Switcher */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setPropSubTab('properties')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-grotesk flex items-center gap-2 transition-all ${
                      propSubTab === 'properties'
                        ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Properties ({properties.length})
                  </button>
                  <button
                    onClick={() => setPropSubTab('units')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold font-grotesk flex items-center gap-2 transition-all ${
                      propSubTab === 'units'
                        ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    All Units ({units.length})
                  </button>
                </div>

                {propSubTab === 'units' && (
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search units…"
                        className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All status</option>
                      <option value="vacant">Vacant ({vacantCount})</option>
                      <option value="occupied">Occupied ({occupiedCount})</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ─── TAB 1: PROPERTIES GRID ─── */}
              {propSubTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((p) => {
                    const propUnits = units.filter((u) => u.propertyId === p.id || u.property === p.id);
                    const occupiedUnits = propUnits.filter((u) => u.status === 'occupied').length;
                    const occRate = propUnits.length > 0 ? Math.round((occupiedUnits / propUnits.length) * 100) : (p.occupancyRate || 0);
                    const totalGrossRent = propUnits.reduce((sum, u) => sum + (Number(u.monthlyRent) || 0), 0);

                    return (
                      <div
                        key={p.id}
                        className="top-shade apple-glass rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-indigo-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm group"
                      >
                        <div>
                          {/* Property Image & Badge Header */}
                          <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={p.image || '/images/property-1.jpg'}
                              alt={p.name}
                              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider bg-indigo-600/90 text-white backdrop-blur-md shadow-sm">
                                {p.category || 'Residential'}
                              </span>
                              {p.featured && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-500/90 text-white">
                                  Featured
                                </span>
                              )}
                            </div>
                            
                            {/* Delete Property Action Icon */}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPropertyForDelete(p);
                                }}
                                title="Delete Property"
                                className="p-2 rounded-xl bg-slate-950/70 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md transition-all btn-press border border-white/10 shadow-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="text-base font-bold font-grotesk text-white truncate drop-shadow-sm">
                                {p.name}
                              </h3>
                              <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" /> {p.address}, {p.city}
                              </p>
                            </div>
                          </div>

                          {/* Stats Metrics Matrix */}
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60">
                                <span className="text-[10px] font-mono text-slate-500 block">Units</span>
                                <span className="text-sm font-extrabold font-grotesk text-slate-900 dark:text-white">{propUnits.length}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60">
                                <span className="text-[10px] font-mono text-slate-500 block">Occupied</span>
                                <span className="text-sm font-extrabold font-grotesk text-emerald-600 dark:text-emerald-400">{occupiedUnits}</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60">
                                <span className="text-[10px] font-mono text-slate-500 block">Occupancy</span>
                                <span className="text-sm font-extrabold font-grotesk text-indigo-600 dark:text-indigo-400">{occRate}%</span>
                              </div>
                            </div>

                            {/* Occupancy Progress Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                                <span>Occupancy status</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{occupiedUnits} / {propUnits.length} Units</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${occRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                          <button
                            onClick={() => {
                              setSelectedPropertyForDelete(p);
                            }}
                            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold font-grotesk btn-press flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Property
                          </button>
                          
                          <button
                            onClick={() => {
                              setAddPropPreselectedPropertyId(p.id);
                              setAddPropUnitTab('unit');
                              setIsAddPropUnitOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk btn-press flex items-center gap-1.5 shadow-sm"
                          >
                            <Layers className="w-3.5 h-3.5" /> + Add Unit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ─── TAB 2: ALL UNITS GRID ─── */}
              {propSubTab === 'units' && (
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
                  {filteredUnits.length === 0 && (
                    <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-400">
                      No units matching search criteria.
                    </div>
                  )}
                </div>
              )}
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
                  filteredTenants.map((t, idx) => {
                    const duration = getLeaseDuration(t.leaseStart, t.leaseEnd);
                    const expiration = getLeaseExpirationInfo(t.leaseEnd);
                    const isAssigned = Boolean(t.unitId && t.unitId !== 'pre_add_unassigned');

                    return (
                      <div key={t.id || t._id || `tenant-${idx}`} className="p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        {/* Tenant Identity */}
                        <div className="space-y-1 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-grotesk">{t.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                              isAssigned
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {isAssigned ? 'Active Lease' : 'Unassigned'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{t.email} {t.phone ? `• ${t.phone}` : ''}</p>
                        </div>

                        {/* Property, Unit, Rent, Duration, Expiration Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-xs font-mono items-center flex-1">
                          {/* Property & Unit */}
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Property & Unit</span>
                            {isAssigned ? (
                              <div className="flex flex-col">
                                <strong className="text-slate-900 dark:text-white flex items-center gap-1 truncate font-sans text-xs">
                                  <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  {t.propertyName || 'Property'}
                                </strong>
                                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                                  <Home className="w-3 h-3 text-slate-400 shrink-0" />
                                  {t.unitLabel || 'Unit'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 text-xs italic font-sans font-medium">Unassigned</span>
                            )}
                          </div>

                          {/* Rent */}
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Rent</span>
                            {t.monthlyRent > 0 ? (
                              <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">${t.monthlyRent}/mo</strong>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>

                          {/* Lease Duration */}
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Lease Duration</span>
                            {duration ? (
                              <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <strong>{duration}</strong>
                              </div>
                            ) : (
                              <span className="text-slate-400">No active term</span>
                            )}
                          </div>

                          {/* Expiration Date & Status */}
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold mb-0.5">Expiration</span>
                            {expiration ? (
                              <div className="space-y-1">
                                <strong className="text-slate-900 dark:text-slate-100 block">{expiration.formattedDate}</strong>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${expiration.statusClass}`}>
                                  {expiration.badgeText}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setAssigningTenant(t)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-grotesk btn-press flex items-center gap-1.5 transition-all ${
                              !isAssigned
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <Key className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{!isAssigned ? 'Assign Unit' : 'Manage Lease'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* ─── VIEW 5: MAINTENANCE QUEUE (full CRUD) ─── */}
          {/* ═══════════════════════════════════════════ */}
          {activeView === 'tickets' && (
            <TicketsTab
              tickets={tickets}
              searchQuery={searchQuery}
              onOpenNewTicket={() => setIsNewTicketOpen(true)}
              onUpdateStatus={handleUpdateTicketStatus}
            />
          )}

          {/* ═════════════════════════════════════ */}
          {/* ─── VIEW 6: RENT ROLL (full CRUD) ───── */}
          {/* ═════════════════════════════════════ */}
          {activeView === 'payments' && (
            <PaymentsTab payments={payments} searchQuery={searchQuery} />
          )}

          {/* ─── VIEW 7: DOCUMENTS & VERIFICATION ─── */}
          {activeView === 'documents' && (
            <LandlordDocumentsTab
              properties={properties}
              units={units}
              tenants={tenants}
              documents={documents}
              onUpdateDocumentStatus={handleUpdateDocumentStatus}
            />
          )}

          {/* ─── VIEW 8: LANDLORD SETTINGS ─── */}
          {activeView === 'settings' && (
            <LandlordSettingsTab
              properties={properties}
              units={units}
              tenants={tenants}
            />
          )}

        </main>
      </div>

      {/* ─── TOAST NOTIFICATION ─── */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white border border-indigo-500/40 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold font-grotesk">{toastNotification}</span>
        </div>
      )}

      {/* ─── RIGHT SIDEBAR: NOTIFICATIONS ─── */}
      <RightNotificationSidebar isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

      {/* ─── MODALS ─── */}
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} properties={properties} units={units} tenants={tenants} tickets={tickets} onSelectResult={handleCommandPaletteSelect} />
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        properties={properties}
        units={units}
        tenants={tenants}
        initialPropertyId={addTenantPropertyId}
        initialUnitId={addTenantUnitId}
        onTenantAdded={handleTenantAdded}
        onTenantAssigned={handleTenantAssigned}
      />
      <UnitDetailModal isOpen={Boolean(selectedUnitForDetail)} unit={selectedUnitForDetail} property={properties.find((p) => p.id === selectedUnitForDetail?.propertyId)} onClose={() => setSelectedUnitForDetail(null)} onAddTenant={handleOpenAddTenant} />
      <NewTicketModal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} properties={properties} units={units} onTicketCreated={handleTicketCreated} />
      <NewAnnouncementModal isOpen={isNewAnnouncementOpen} onClose={() => setIsNewAnnouncementOpen(false)} onAnnouncementCreated={handleAnnouncementCreated} />
      
      {/* Add Property / Unit Modal */}
      <AddPropertyOrUnitModal
        isOpen={isAddPropUnitOpen}
        onClose={() => setIsAddPropUnitOpen(false)}
        initialTab={addPropUnitTab}
        properties={properties}
        initialPropertyId={addPropPreselectedPropertyId}
        onPropertyCreated={handleDashboardPropertyCreated}
        onUnitCreated={handleDashboardUnitCreated}
      />

      {/* Delete Property Modal */}
      <DeletePropertyModal
        isOpen={Boolean(selectedPropertyForDelete)}
        onClose={() => setSelectedPropertyForDelete(null)}
        property={selectedPropertyForDelete}
        units={units}
        onConfirmDelete={handleDeleteProperty}
      />

      {/* Assign Tenant Modal */}
      <AssignTenantModal
        isOpen={Boolean(assigningTenant)}
        onClose={() => setAssigningTenant(null)}
        tenant={assigningTenant}
        properties={properties}
        units={units}
        onTenantAssigned={handleTenantAssigned}
      />

    </div>
  );
};
