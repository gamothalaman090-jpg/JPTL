import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, Bell, Sun, Moon, LogOut, Search, Sparkles, User, ShieldCheck, 
  ChevronDown, CreditCard, Wrench, FileText, Megaphone, ArrowRight 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { tenantApi } from '../services/api';
import { fetchConcurrent } from '../services/workerClient';
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
import { PayRentModal } from '../components/tenant/PayRentModal';
import { ReportIssueModal } from '../components/tenant/ReportIssueModal';
import { RightNotificationSidebar } from '../components/dashboard/RightNotificationSidebar';
import { MobileNavBar } from '../components/common/MobileNavBar';
import { MobileNavDrawer } from '../components/common/MobileNavDrawer';
import { FileCheck, LayoutDashboard, Settings } from 'lucide-react';

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

export const TenantPortalPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Active Tab & Resident selection
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payments' | 'maintenance' | 'lease' | 'announcements' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Live state from backend
  const [tenantData, setTenantData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [landlordData, setLandlordData] = useState(null);
  const [leaseData, setLeaseData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [openTicketsCount, setOpenTicketsCount] = useState(0);

  // Track if full secondary datasets are loaded
  const [isFullPaymentsLoaded, setIsFullPaymentsLoaded] = useState(false);
  const [isFullTicketsLoaded, setIsFullTicketsLoaded] = useState(false);
  const [isFullAnnouncementsLoaded, setIsFullAnnouncementsLoaded] = useState(false);

  // Request guard and cooldown tracking
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Modals & Drawers
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Concurrent fetching via Web Worker off the main UI thread
  const loadTenantDataConcurrent = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    lastFetchTimeRef.current = Date.now();

    try {
      const results = await fetchConcurrent([
        { key: 'dash', endpoint: '/tenant/dash' },
        { key: 'payments', endpoint: '/tenant/payments' },
        { key: 'tickets', endpoint: '/tenant/tickets' },
        { key: 'announcements', endpoint: '/tenant/announcements' },
      ]);

      const dashRes = results.dash;
      const paymentsRes = results.payments;
      const ticketsRes = results.tickets;
      const ancRes = results.announcements;

      if (dashRes?.ok && dashRes.data?.data) {
        const d = dashRes.data.data;
        if (d.tenant) setTenantData(d.tenant);
        if (d.unit) setUnitData(d.unit);
        if (d.property) setPropertyData(d.property);
        if (d.landlord) setLandlordData(d.landlord);
        if (d.lease) setLeaseData(d.lease);
        if (d.tickets?.totalOpen !== undefined) setOpenTicketsCount(d.tickets.totalOpen);
      }

      if (paymentsRes?.ok) {
        const pList = paymentsRes.data?.payments || paymentsRes.data?.data?.recentPayments || paymentsRes.data?.data || (Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        if (Array.isArray(pList) && pList.length > 0) {
          setPayments(pList);
          setIsFullPaymentsLoaded(true);
        }
      }

      if (ticketsRes?.ok) {
        const tList = ticketsRes.data?.tickets || ticketsRes.data?.data || (Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        if (Array.isArray(tList) && tList.length > 0) {
          setTickets(tList);
          const open = tList.filter((t) => !['resolved', 'cancelled'].includes(t.status)).length;
          setOpenTicketsCount(open);
          setIsFullTicketsLoaded(true);
        }
      }

      if (ancRes?.ok) {
        const aList = ancRes.data?.announcements || ancRes.data?.data || (Array.isArray(ancRes.data) ? ancRes.data : []);
        if (Array.isArray(aList) && aList.length > 0) {
          setAnnouncements(aList);
          setIsFullAnnouncementsLoaded(true);
        }
      }
    } catch (err) {
      console.warn('Tenant concurrent worker fetch fallback:', err.message);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initial mount + controlled background refresh (no spurious focus double-firing)
  useEffect(() => {
    loadTenantDataConcurrent();

    // Auto-refresh polling every 60s when visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchTimeRef.current >= 60000) {
        loadTenantDataConcurrent();
      }
    }, 60000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetchTimeRef.current >= 60000) {
        loadTenantDataConcurrent();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [loadTenantDataConcurrent]);

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

  const handlePaymentSuccess = async (receipt) => {
    try {
      await tenantApi.payRent({
        amount: receipt.amount,
        paymentMethod: receipt.method || 'card',
        notes: receipt.period || 'Rent payment',
      });
    } catch (err) {
      console.warn('Server rent payment notice:', err.message);
    }
    const newPaymentRecord = {
      id: receipt.transactionId,
      amount: receipt.amount,
      dueDate: '2026-09-01',
      paidAt: receipt.paidAt,
      status: 'paid',
      method: receipt.method,
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

  const displayName = currentTenant.name || 'Resident';
  const unitLabel = currentUnit?.label || 'Unassigned';
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'R';

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans flex selection:bg-indigo-600/30 selection:text-indigo-300 transition-colors duration-300">
      
      {/* ─── LEFT SIDEBAR NAV ─── */}
      <TenantSidebar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
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
          
          {activeTab === 'overview' && (
            <TenantOverviewTab
              tenant={{ ...currentTenant, unitLabel: currentUnit?.label || 'Unassigned', propertyName: currentProperty?.name || 'Property' }}
              unit={currentUnit}
              property={currentProperty}
              landlord={landlordData}
              tickets={tickets}
              announcements={announcements}
              onPayRentClick={() => setIsPayRentOpen(true)}
              onRequestRepairClick={() => setIsReportIssueOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'payments' && (
            <TenantPaymentsTab
              tenant={currentTenant}
              unit={currentUnit}
              property={currentProperty}
              payments={payments}
              securityDeposit={tenantData?.securityDeposit ?? leaseData?.securityDeposit}
              onPayRentClick={() => setIsPayRentOpen(true)}
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

          {activeTab === 'settings' && (
            <TenantSettingsTab
              tenant={currentTenant}
              unit={currentUnit}
              property={currentProperty}
              landlord={landlordData}
              lease={leaseData}
            />
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
        onClose={() => setIsPayRentOpen(false)}
        tenant={currentTenant}
        unit={currentUnit}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        tenant={currentTenant}
        unit={currentUnit}
        onTicketSubmitted={handleTicketSubmitted}
      />

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <MobileNavBar
        items={[
          { key: 'overview', label: 'Home', icon: LayoutDashboard },
          { key: 'payments', label: 'Rent', icon: CreditCard },
          { key: 'maintenance', label: 'Repairs', icon: Wrench, badge: tickets.filter((t) => !['resolved', 'cancelled'].includes(t.status)).length || openTicketsCount || undefined },
          { key: 'lease', label: 'My Lease', icon: FileText },
        ]}
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
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
          { key: 'maintenance', label: 'Maintenance Requests', icon: Wrench, badge: tickets.filter((t) => !['resolved', 'cancelled'].includes(t.status)).length || openTicketsCount || undefined },
          { key: 'lease', label: 'My Lease Agreement', icon: FileText },
          { key: 'announcements', label: 'Building Announcements', icon: Megaphone },
          { key: 'documents', label: 'Documents & Verification', icon: FileCheck },
          { key: 'settings', label: 'Account & Settings', icon: Settings },
        ]}
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

    </div>
  );
};
