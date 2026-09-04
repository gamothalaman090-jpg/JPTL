import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, Sun, Moon, LogOut, Search, Sparkles, User, ShieldCheck, 
  ChevronDown, CreditCard, Wrench, FileText, Megaphone, ArrowRight 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
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
import { PayRentModal } from '../components/tenant/PayRentModal';
import { ReportIssueModal } from '../components/tenant/ReportIssueModal';
import { RightNotificationSidebar } from '../components/dashboard/RightNotificationSidebar';

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

  // Modals & Drawers
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Load live data from server on mount
  useEffect(() => {
    let isMounted = true;

    async function loadTenantData() {
      try {
        const [dashRes, paymentsRes, ticketsRes, ancRes] = await Promise.allSettled([
          tenantApi.getDashboard(),
          tenantApi.getPayments(),
          tenantApi.getTickets(),
          tenantApi.getAnnouncements(),
        ]);

        if (!isMounted) return;

        if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
          const d = dashRes.value.data;
          if (d.tenant) setTenantData(d.tenant);
          if (d.unit) setUnitData(d.unit);
          if (d.property) setPropertyData(d.property);
          if (d.landlord) setLandlordData(d.landlord);
          if (d.lease) setLeaseData(d.lease);
          if (Array.isArray(d.payments?.recent)) setPayments(d.payments.recent);
          if (Array.isArray(d.tickets?.recent)) setTickets(d.tickets.recent);
          if (Array.isArray(d.announcements)) setAnnouncements(d.announcements);
        }

        if (ticketsRes.status === 'fulfilled') {
          const tList = ticketsRes.value?.tickets || ticketsRes.value?.data || (Array.isArray(ticketsRes.value) ? ticketsRes.value : []);
          if (Array.isArray(tList) && tList.length > 0) setTickets(tList);
        }

        if (ancRes.status === 'fulfilled') {
          const aList = ancRes.value?.announcements || ancRes.value?.data || (Array.isArray(ancRes.value) ? ancRes.value : []);
          if (Array.isArray(aList) && aList.length > 0) setAnnouncements(aList);
        }

        if (paymentsRes.status === 'fulfilled') {
          const pList = paymentsRes.value?.payments || paymentsRes.value?.data?.recentPayments || paymentsRes.value?.data || (Array.isArray(paymentsRes.value) ? paymentsRes.value : []);
          if (Array.isArray(pList) && pList.length > 0) setPayments(pList);
        }
      } catch (err) {
        console.warn('Tenant live data fetch fallback:', err.message);
      }
    }

    loadTenantData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active tenant, unit, and property (live only, no fallback to mock tenants/units)
  const currentTenant = {
    ...(user || {}),
    ...(tenantData || {}),
    id: user?._id || user?.id || tenantData?._id || tenantData?.id,
    name: tenantData?.fullName || tenantData?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Resident',
    email: user?.email || tenantData?.email || '',
  };
  const currentUnit = unitData ? {
    ...unitData,
    id: unitData._id || unitData.id,
    label: unitData.label || 'Unit',
  } : null;
  const currentProperty = propertyData ? {
    ...propertyData,
    id: propertyData._id || propertyData.id,
    name: propertyData.name || 'Property',
  } : null;

  const handleTicketSubmitted = async (newTicket) => {
    try {
      const res = await tenantApi.createTicket({
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        priority: newTicket.priority,
      });
      const created = res.data || newTicket;
      setTickets((prev) => [created, ...prev]);
    } catch (err) {
      console.warn('Server ticket submission fallback:', err.message);
      setTickets((prev) => [newTicket, ...prev]);
    }
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
        <header className="sticky top-0 z-30 apple-glass border-b border-slate-200 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Search (⌘K) */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <button
                type="button"
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

              {/* User Avatar + Unit Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-grotesk">
                  {initials}
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{displayName}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{unitLabel}</span>
                </div>
              </div>

            </div>

          </div>
        </header>

        {/* ─── SCROLLABLE MAIN TAB CONTENT ─── */}
        <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          
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
            />
          )}

          {activeTab === 'lease' && (
            <TenantLeaseTab
              tenant={currentTenant}
              unit={currentUnit}
              property={currentProperty}
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

    </div>
  );
};
