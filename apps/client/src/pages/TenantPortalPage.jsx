import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, Sun, Moon, LogOut, Search, Sparkles, User, ShieldCheck, 
  ChevronDown, CreditCard, Wrench, FileText, Megaphone, ArrowRight, FileWarning
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tenantApi } from '../services/api';
import { 
  MOCK_PROPERTIES, 
  MOCK_UNITS, 
  MOCK_TENANTS, 
  MOCK_TICKETS as INITIAL_TICKETS 
} from '../data/mockData';
import { TenantSidebar } from '../components/tenant/TenantSidebar';
import { TenantOverviewTab } from '../components/tenant/TenantOverviewTab';
import { TenantPaymentsTab } from '../components/tenant/TenantPaymentsTab';
import { TenantMaintenanceTab } from '../components/tenant/TenantMaintenanceTab';
import { TenantLeaseTab } from '../components/tenant/TenantLeaseTab';
import { TenantAnnouncementsTab } from '../components/tenant/TenantAnnouncementsTab';
import { TenantSettingsTab } from '../components/tenant/TenantSettingsTab';
import { TenantDocumentsTab } from '../components/tenant/TenantDocumentsTab';
import { TenantNoticesTab } from '../components/tenant/TenantNoticesTab';
import { PayRentModal } from '../components/tenant/PayRentModal';
import { AdvancePaymentModal } from '../components/tenant/AdvancePaymentModal';
import { ReportIssueModal } from '../components/tenant/ReportIssueModal';
import { RightNotificationSidebar } from '../components/dashboard/RightNotificationSidebar';
import { MobileNavBar } from '../components/common/MobileNavBar';
import { MobileNavDrawer } from '../components/common/MobileNavDrawer';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { FileCheck, LayoutDashboard, Settings } from 'lucide-react';
import { TenantPortalSkeleton, DashboardSkeleton } from '../components/ui/SkeletonLoader';

const MOCK_RESIDENT_ANNOUNCEMENTS = [
  {
    id: 'anc-101',
    title: 'Property Portal Upgrade & System Enhancements 🚀',
    body: 'Welcome to your upgraded resident portal! You can now pay rent online with zero fees via ACH, track real-time maintenance technician dispatches, and access smart locker notifications.',
    category: 'System',
    isPinned: true,
    author: 'Alexander Vance (Landlord)',
    date: 'Aug 24, 2026',
  },
  {
    id: 'anc-102',
    title: 'Scheduled HVAC Inspection & Filter Replacements',
    body: 'Annual cooling tower inspection and in-unit AC filter replacements will occur this Friday between 9:00 AM and 2:00 PM. Please indicate entry permission if you will be away.',
    category: 'Maintenance',
    isPinned: false,
    author: 'Alexander Vance',
    date: 'Aug 22, 2026',
  },
  {
    id: 'anc-103',
    title: 'Rooftop Sky Lounge Reservation Hours Extended',
    body: 'Resident rooftop terrace and BBQ grills are now open until 11:00 PM on Friday and Saturday evenings. Please reserve party spaces 48h in advance.',
    category: 'General',
    isPinned: false,
    author: 'Alexander Vance',
    date: 'Aug 18, 2026',
  },
];

const TENANT_TAB_ROUTES = {
  overview: '/tenant',
  announcements: '/tenant-announcements',
  payments: '/tenant-payments',
  maintenance: '/tenant-maintenance',
  lease: '/tenant-lease',
  documents: '/tenant-documents',
  notices: '/tenant-notices',
  settings: '/tenant-settings',
};

function getTabFromPath(pathname) {
  const clean = (pathname || '').toLowerCase().split('?')[0].replace(/\/$/, '');
  if (clean === '/tenant-announcements' || clean === '/tenant/announcements') return 'announcements';
  if (clean === '/tenant-payments' || clean === '/tenant/payments') return 'payments';
  if (clean === '/tenant-maintenance' || clean === '/tenant/maintenance') return 'maintenance';
  if (clean === '/tenant-lease' || clean === '/tenant/lease') return 'lease';
  if (clean === '/tenant-documents' || clean === '/tenant/documents') return 'documents';
  if (clean === '/tenant-notices' || clean === '/tenant/notices') return 'notices';
  if (clean === '/tenant-settings' || clean === '/tenant/settings') return 'settings';
  if (clean === '/tenant-overview' || clean === '/tenant/overview' || clean === '/tenant') return 'overview';
  return 'overview';
}

function getCachedTenantSnapshot(userId) {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(`jptl_tenant_cache_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const TenantPortalPage = ({ currentPath = window.location.pathname, onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();
  const userId = user?.id || user?._id;
  const initialCache = getCachedTenantSnapshot(userId);

  // Active Tab & Resident selection - synced with URL
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(currentPath || window.location.pathname));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync activeTab if browser back/forward or external navigation occurs
  useEffect(() => {
    const tabFromUrl = getTabFromPath(window.location.pathname);
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [currentPath]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const targetUrl = TENANT_TAB_ROUTES[tab] || '/tenant';
    if (window.location.pathname !== targetUrl) {
      onNavigate(targetUrl);
    }
  };

  // Live state from backend - Instant SWR
  const [isLoading, setIsLoading] = useState(() => !initialCache);
  const [tenantData, setTenantData] = useState(() => initialCache?.tenantData || null);
  const [unitData, setUnitData] = useState(() => initialCache?.unitData || null);
  const [propertyData, setPropertyData] = useState(() => initialCache?.propertyData || null);
  const [landlordData, setLandlordData] = useState(() => initialCache?.landlordData || null);
  const [leaseData, setLeaseData] = useState(() => initialCache?.leaseData || null);
  const [payments, setPayments] = useState(() => initialCache?.payments || []);
  const [tickets, setTickets] = useState(() => initialCache?.tickets || []);
  const [announcements, setAnnouncements] = useState(() => initialCache?.announcements || []);
  const [evictionNotices, setEvictionNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticesError, setNoticesError] = useState('');

  useEffect(() => {
    if (activeTab !== 'notices') return undefined;
    let active = true;
    setNoticesLoading(true);
    setNoticesError('');
    tenantApi.getEvictionNotices()
      .then((res) => { if (active) setEvictionNotices(res?.notices || res?.data?.notices || []); })
      .catch((err) => { if (active) setNoticesError(err.message || 'Unable to load notices.'); })
      .finally(() => { if (active) setNoticesLoading(false); });
    return () => { active = false; };
  }, [activeTab]);

  // Modals & Drawers
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isPayAdvanceOpen, setIsPayAdvanceOpen] = useState(false);
  const [paymentToSubmit, setPaymentToSubmit] = useState(null);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Load live data from server on mount + auto-refresh polling
  useEffect(() => {
    let isMounted = true;

    async function loadTenantData() {
      try {
        // ── PRIMARY: singular consolidated endpoint (1 HTTP call) ──
        const res = await tenantApi.getPortalInit();
        if (!isMounted) return;

        const batch = res?.data; // { dash, payments, tickets, announcements, lease }

        // Process dash results
        const dashVal = batch?.dash?.data;
        if (dashVal?.data) {
          const d = dashVal.data;
          if (d.tenant) setTenantData(d.tenant);
          if (d.unit) setUnitData(d.unit);
          if (d.property) setPropertyData(d.property);
          if (d.landlord) setLandlordData(d.landlord);
          if (d.lease) setLeaseData(d.lease);
          if (Array.isArray(d.payments?.recent)) setPayments(d.payments.recent);
          if (Array.isArray(d.tickets?.recent)) setTickets(d.tickets.recent);
          if (Array.isArray(d.announcements)) setAnnouncements(d.announcements);
        }

        // Process tickets results
        const ticketVal = batch?.tickets?.data;
        if (ticketVal) {
          const tList = ticketVal.tickets || ticketVal.data || (Array.isArray(ticketVal) ? ticketVal : []);
          if (Array.isArray(tList) && tList.length > 0) setTickets(tList);
        }

        // Process announcements results
        const ancVal = batch?.announcements?.data;
        if (ancVal) {
          const aList = ancVal.announcements || ancVal.data || (Array.isArray(ancVal) ? ancVal : []);
          if (Array.isArray(aList) && aList.length > 0) setAnnouncements(aList);
        }

        // Process payments results
        const paymentsVal = batch?.payments?.data;
        if (paymentsVal) {
          const pList = paymentsVal.data?.history || paymentsVal.history || paymentsVal.payments || paymentsVal.data?.recentPayments || (Array.isArray(paymentsVal) ? paymentsVal : []);
          if (Array.isArray(pList)) setPayments(pList);
        }

        // Process lease results
        const leaseVal = batch?.lease?.data;
        if (leaseVal?.data) {
          setLeaseData(leaseVal.data);
        }

        // Cache fresh snapshot to sessionStorage for instant 0ms mount on next visit
        if (userId && batch) {
          try {
            sessionStorage.setItem(`jptl_tenant_cache_${userId}`, JSON.stringify({
              tenantData: dashVal?.data?.tenant || null,
              unitData: dashVal?.data?.unit || null,
              propertyData: dashVal?.data?.property || null,
              landlordData: dashVal?.data?.landlord || null,
              leaseData: leaseVal?.data || dashVal?.data?.lease || null,
              payments: paymentsVal?.payments || paymentsVal?.data?.recentPayments || (Array.isArray(paymentsVal?.data) ? paymentsVal.data : []) || dashVal?.data?.payments?.recent || [],
              tickets: ticketVal?.tickets || ticketVal?.data || (Array.isArray(ticketVal) ? ticketVal : []) || dashVal?.data?.tickets?.recent || [],
              announcements: ancVal?.announcements || ancVal?.data || (Array.isArray(ancVal) ? ancVal : []) || dashVal?.data?.announcements || [],
            }));
          } catch (e) {
            // Ignore quota errors
          }
        }
      } catch (err) {
        console.warn('Singular /init failed, falling back to concurrent fetch:', err.message);
        try {
          // ── FALLBACK: worker-based multi-fetch ──
          const batch = await tenantApi.getConcurrentPortalData();

          if (!isMounted) return;

          const dashVal = batch?.dash?.data;
          if (dashVal?.data) {
            const d = dashVal.data;
            if (d.tenant) setTenantData(d.tenant);
            if (d.unit) setUnitData(d.unit);
            if (d.property) setPropertyData(d.property);
            if (d.landlord) setLandlordData(d.landlord);
            if (d.lease) setLeaseData(d.lease);
            if (Array.isArray(d.payments?.recent)) setPayments(d.payments.recent);
            if (Array.isArray(d.tickets?.recent)) setTickets(d.tickets.recent);
            if (Array.isArray(d.announcements)) setAnnouncements(d.announcements);
          }
          const ticketVal = batch?.tickets?.data;
          if (ticketVal) {
            const tList = ticketVal.tickets || ticketVal.data || (Array.isArray(ticketVal) ? ticketVal : []);
            if (Array.isArray(tList) && tList.length > 0) setTickets(tList);
          }
          const ancVal = batch?.announcements?.data;
          if (ancVal) {
            const aList = ancVal.announcements || ancVal.data || (Array.isArray(ancVal) ? ancVal : []);
            if (Array.isArray(aList) && aList.length > 0) setAnnouncements(aList);
          }
          const paymentsVal = batch?.payments?.data;
          if (paymentsVal) {
            const pList = paymentsVal.data?.history || paymentsVal.history || paymentsVal.payments || paymentsVal.data?.recentPayments || (Array.isArray(paymentsVal) ? paymentsVal : []);
            if (Array.isArray(pList)) setPayments(pList);
          }
          const leaseVal = batch?.lease?.data;
          if (leaseVal?.data) {
            setLeaseData(leaseVal.data);
          }
        } catch (fallbackErr) {
          console.warn('Tenant live data fetch fallback:', fallbackErr.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTenantData();

    // Auto-refresh polling every 10 seconds when tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadTenantData();
      }
    }, 30000);

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadTenantData();
      }
    };

    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, []);

  // Compute active tenant, unit, and property (live only, no fallback to mock tenants/units)
  const currentTenant = {
    ...(user || {}),
    ...(tenantData || {}),
    id: user?._id || user?.id || tenantData?._id || tenantData?.id,
    name: tenantData?.fullName || tenantData?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Resident',
    email: user?.email || tenantData?.email || '',
    hasParking: tenantData?.hasParking ?? unitData?.hasParking ?? false,
    parkingSpot: tenantData?.parkingSpot ?? unitData?.parkingSpot ?? null,
    parkingFee: tenantData?.parkingFee ?? unitData?.parkingFee ?? 0,
  };
  const currentUnit = unitData ? {
    ...unitData,
    id: unitData._id || unitData.id,
    label: unitData.label || 'Unit',
    propertyName: propertyData?.name || unitData.propertyName,
  } : null;
  const currentProperty = propertyData ? {
    ...propertyData,
    id: propertyData._id || propertyData.id,
    name: propertyData.name || 'Property',
    landlordName: landlordData?.name || propertyData.landlordName,
    landlordEmail: landlordData?.email || propertyData.landlordEmail,
  } : null;

  const handleTicketSubmitted = async (newTicket) => {
    try {
      const res = await tenantApi.createTicket({
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
        photoUrls: newTicket.photoUrls || [],
      });
      const created = res.data || newTicket;
      setTickets((prev) => [created, ...prev]);
    } catch (err) {
      console.warn('Server ticket submission fallback:', err.message);
      setTickets((prev) => [newTicket, ...prev]);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await tenantApi.deleteTicket(ticketId);
    } catch (err) {
      console.warn('Server ticket deletion notice:', err.message);
    }
    setTickets((prev) => prev.filter((t) => t.id !== ticketId && t._id !== ticketId));
  };

  const handleOpenPayment = async (invoice = null) => {
    try {
      let target = invoice || payments.find((item) => ['pending', 'overdue'].includes(item.status) && item.reviewStatus !== 'pending_review');
      if (!target) {
        const response = await tenantApi.getOrCreateCurrentRentInvoice();
        target = response?.data;
        if (target) setPayments((current) => [target, ...current.filter((item) => String(item.paymentId || item._id || item.id) !== String(target._id))]);
      }
      if (!target) throw new Error('Could not find or create your rent invoice. Contact your landlord if you need help.');
      if (target.reviewStatus === 'pending_review') {
        toast.info('This invoice is already waiting for landlord review.');
        return;
      }
      setPaymentToSubmit(target);
      setIsPayRentOpen(true);
    } catch (error) { toast.error(error.message || 'Could not start rent payment'); }
  };

  const handleAdvanceInvoiceCreated = (invoice) => {
    if (!invoice) return;
    const invoiceId = String(invoice.paymentId || invoice._id || invoice.id);
    setPayments((current) => [invoice, ...current.filter((item) => String(item.paymentId || item._id || item.id) !== invoiceId)]);
    setPaymentToSubmit(invoice);
    setIsPayRentOpen(true);
  };

  const handleAdvanceDraftDiscarded = (paymentId) => {
    setPayments((current) => current.filter((item) => String(item.paymentId || item._id || item.id) !== String(paymentId)));
  };

  const handleDiscardAdvanceDraft = async (invoice) => {
    const id = invoice?.paymentId || invoice?._id || invoice?.id;
    try {
      await tenantApi.discardAdvanceRentDraft(id);
      handleAdvanceDraftDiscarded(id);
      toast.success('Unsubmitted advance payment discarded.');
    } catch (error) { toast.error(error.message || 'Could not discard the advance draft'); }
  };

  const handlePaymentSubmitted = async () => {
    try {
      const response = await tenantApi.getPayments();
      const list = response?.data?.data?.history || response?.data?.history || [];
      if (Array.isArray(list)) setPayments(list);
    } catch (err) {
      console.warn('Failed to refresh payment ledger:', err.message);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const displayName = currentTenant.name || 'Resident';
  const unitLabel = currentUnit?.label || 'Unassigned';
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'R';

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans flex selection:bg-indigo-600/30 selection:text-indigo-300 transition-colors duration-300">
      
      {/* ─── LEFT SIDEBAR NAV ─── */}
      <TenantSidebar
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onLogout={handleLogout}
        tenant={{ ...currentTenant, unitLabel: currentUnit?.label || 'Unassigned', propertyName: currentProperty?.name || 'Property' }}
      />

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* ─── TOP BAR ─── */}
        <header className="sticky top-0 z-30 apple-glass border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">

            {/* Mobile Brand Identity */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="font-grotesk font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
                  JPTL<span className="text-indigo-600 dark:text-indigo-400">.RESIDENT</span>
                </span>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 block leading-none">
                  {unitLabel}
                </span>
              </div>
            </div>

            {/* Desktop Search (⌘K) */}
            <div className="hidden md:flex items-center gap-3 w-full max-w-md">
              <button
                type="button"
                className="flex items-center w-full bg-slate-100 dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-2 py-2 text-xs text-slate-400 hover:border-indigo-500/50 transition-colors cursor-pointer btn-press"
              >
                <Search className="w-3.5 h-3.5 mr-2 shrink-0" />
                <span className="flex-1 text-left">Search…</span>
                <span className="font-mono text-xs bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Ctrl K</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                aria-label="Open notifications"
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-[#10131F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#10131F] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 btn-press"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>

              {/* User Avatar + Unit Pill (opens MobileNavDrawer on mobile) */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="flex items-center gap-2.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800 btn-press cursor-pointer"
                aria-label="Open menu"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-grotesk overflow-hidden shadow-sm">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{displayName}</span>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{unitLabel}</span>
                </div>
              </button>

            </div>

          </div>
        </header>

        {/* ─── SCROLLABLE MAIN TAB CONTENT ─── */}
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 space-y-5 sm:space-y-6 overflow-y-auto pb-28 md:pb-8">
          
          {isLoading && !tenantData ? (
            <TenantPortalSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && (
                <TenantOverviewTab
                  tenant={{ ...currentTenant, unitLabel: currentUnit?.label || 'Unassigned', propertyName: currentProperty?.name || 'Property' }}
                  unit={currentUnit}
                  property={currentProperty}
                  landlord={landlordData}
                  lease={leaseData}
                  tickets={tickets}
                  announcements={announcements}
                  onPayRentClick={() => handleOpenPayment()}
                  onPayAdvanceClick={() => setIsPayAdvanceOpen(true)}
                  onRequestRepairClick={() => setIsReportIssueOpen(true)}
                  onNavigateTab={handleTabChange}
                />
              )}

              {activeTab === 'payments' && (
                <TenantPaymentsTab
                  tenant={currentTenant}
                  unit={currentUnit}
                  property={currentProperty}
                  lease={leaseData}
                  payments={payments}
                  securityDeposit={tenantData?.securityDeposit ?? leaseData?.securityDeposit}
                  onPayRentClick={handleOpenPayment}
                  onPayAdvanceClick={() => setIsPayAdvanceOpen(true)}
                  onDiscardAdvanceClick={handleDiscardAdvanceDraft}
                />
              )}

              {activeTab === 'maintenance' && (
                <TenantMaintenanceTab
                  tickets={tickets}
                  tenant={currentTenant}
                  unit={currentUnit}
                  onRequestRepairClick={() => setIsReportIssueOpen(true)}
                  onDeleteTicket={handleDeleteTicket}
                />
              )}

              {activeTab === 'lease' && (
                <TenantLeaseTab
                  tenant={currentTenant}
                  unit={currentUnit}
                  property={currentProperty}
                  lease={leaseData}
                  onExtensionRequested={async () => {
                    try {
                      const res = await tenantApi.getPortalInit();
                      const leaseVal = res?.data?.lease?.data;
                      if (leaseVal?.data) {
                        setLeaseData(leaseVal.data);
                      } else if (res?.data?.dash?.data?.data?.lease) {
                        setLeaseData(res.data.dash.data.data.lease);
                      }
                    } catch (e) {
                      console.warn('Failed to refresh lease after extension request:', e.message);
                    }
                  }}
                />
              )}

              {activeTab === 'announcements' && (
                <TenantAnnouncementsTab
                  announcements={announcements}
                />
              )}

              {activeTab === 'documents' && (
                <TenantDocumentsTab
                  tenant={currentTenant}
                  unit={currentUnit}
                />
              )}

              {activeTab === 'notices' && (
                <TenantNoticesTab
                  notices={evictionNotices}
                  loading={noticesLoading}
                  error={noticesError}
                  lease={leaseData}
                  onEarlyTerminationRequested={async () => {
                    const response = await tenantApi.getEvictionNotices();
                    setEvictionNotices(response?.notices || response?.data?.notices || []);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <TenantSettingsTab
                  tenant={currentTenant}
                  unit={currentUnit}
                  property={currentProperty}
                  landlord={landlordData}
                  lease={leaseData}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* ─── NOTIFICATION DRAWER ─── */}
      <RightNotificationSidebar
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* ─── ACTION MODALS ─── */}
      <PayRentModal
        isOpen={isPayRentOpen}
        onClose={() => { setIsPayRentOpen(false); setPaymentToSubmit(null); }}
        tenant={currentTenant}
        unit={currentUnit}
        payment={paymentToSubmit}
        onPaymentSubmitted={handlePaymentSubmitted}
        onDraftDiscarded={handleAdvanceDraftDiscarded}
      />

      <AdvancePaymentModal
        isOpen={isPayAdvanceOpen}
        onClose={() => setIsPayAdvanceOpen(false)}
        onInvoiceCreated={handleAdvanceInvoiceCreated}
        tenant={currentTenant}
        unit={currentUnit}
        payments={payments}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        tenant={currentTenant}
        unit={currentUnit}
        onTicketSubmitted={handleTicketSubmitted}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => !isLoggingOut && setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out of JPTL?"
        description="Are you sure you want to log out of your resident account? You will need to sign in again to access the portal."
        confirmText={isLoggingOut ? 'Logging out...' : 'Log Out'}
        cancelText="Cancel"
        variant="danger"
        loading={isLoggingOut}
        icon={LogOut}
      />

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <MobileNavBar
        items={[
          { key: 'overview', label: 'Home', icon: LayoutDashboard },
          { key: 'payments', label: 'Rent', icon: CreditCard },
          { key: 'maintenance', label: 'Repairs', icon: Wrench, badge: tickets.filter((t) => t.status !== 'resolved').length || undefined },
          { key: 'lease', label: 'My Lease', icon: FileText },
        ]}
        activeKey={activeTab}
        onSelect={handleTabChange}
        onOpenMore={() => setIsMobileNavOpen(true)}
      />

      {/* ─── MOBILE NAV DRAWER (MORE SHEET) ─── */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={currentTenant}
        roleTitle="Resident"
        metaInfo={unitLabel}
        items={[
          { key: 'overview', label: 'Home Overview', icon: LayoutDashboard },
          { key: 'payments', label: 'Rent & Payments', icon: CreditCard },
          { key: 'maintenance', label: 'Maintenance Requests', icon: Wrench, badge: tickets.filter((t) => t.status !== 'resolved').length || undefined },
          { key: 'lease', label: 'My Lease Agreement', icon: FileText },
          { key: 'announcements', label: 'Building Announcements', icon: Megaphone },
          { key: 'documents', label: 'Documents & Verification', icon: FileCheck },
          { key: 'notices', label: 'Notices', icon: FileWarning },
          { key: 'settings', label: 'Account & Settings', icon: Settings },
        ]}
        activeKey={activeTab}
        onSelect={handleTabChange}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

    </div>
  );
};
