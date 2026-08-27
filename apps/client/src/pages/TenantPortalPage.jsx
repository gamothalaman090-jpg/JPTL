import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, Sun, Moon, LogOut, Search, Sparkles, User, ShieldCheck, 
  ChevronDown, CreditCard, Wrench, FileText, Megaphone, ArrowRight 
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
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

  // Active Tab & Resident selection
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payments' | 'maintenance' | 'lease' | 'announcements' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('usr-tenant-1'); // Default: Sophia Lin

  // Live state for tickets & announcements
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(MOCK_RESIDENT_ANNOUNCEMENTS);

  // Modals & Drawers
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Find active tenant, unit, and property
  const currentTenant = MOCK_TENANTS.find((t) => t.id === selectedTenantId) || MOCK_TENANTS[0];
  const currentUnit = MOCK_UNITS.find((u) => u.id === currentTenant.unitId) || MOCK_UNITS[0];
  const currentProperty = MOCK_PROPERTIES.find((p) => p.id === currentTenant.propertyId) || MOCK_PROPERTIES[0];

  const handleTicketSubmitted = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handlePaymentSuccess = (receipt) => {
    const newPaymentRecord = {
      id: receipt.transactionId,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      propertyId: currentProperty.id,
      propertyName: currentProperty.name,
      unitId: currentUnit.id,
      unitLabel: currentUnit.label,
      amount: receipt.amount,
      dueDate: '2026-09-01',
      paidAt: receipt.paidAt,
      status: 'paid',
      method: receipt.method,
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans flex selection:bg-indigo-600/30 selection:text-indigo-300 transition-colors duration-300">
      
      {/* ─── LEFT SIDEBAR NAV ─── */}
      <TenantSidebar
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onLogout={() => onNavigate('/')}
        tenant={{ ...currentTenant, unitLabel: currentUnit.label, propertyName: currentProperty.name }}
      />

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* ─── TOP BAR ─── */}
        <header className="sticky top-0 z-30 apple-glass border-b border-slate-200 dark:border-slate-800 px-6 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Resident Unit Badge */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentProperty.name} &bull; <strong className="text-slate-900 dark:text-white">{currentUnit.label}</strong></span>
              </div>
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
                  {currentTenant.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">{currentTenant.name}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{currentUnit.label}</span>
                </div>
              </div>

            </div>

          </div>
        </header>

        {/* ─── SCROLLABLE MAIN TAB CONTENT ─── */}
        <main className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          
          {activeTab === 'overview' && (
            <TenantOverviewTab
              tenant={{ ...currentTenant, unitLabel: currentUnit.label, propertyName: currentProperty.name }}
              unit={currentUnit}
              property={currentProperty}
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
