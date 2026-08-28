import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Shield, Wrench, DollarSign, Bell, FileText, 
  Database, Lock, CheckCircle2, Clock, Download, 
  Key, RefreshCw, Zap, Check, AlertCircle, User, Sliders, Camera, Eye, EyeOff, Smartphone, ShieldCheck,
  Search, Filter, Upload, Plus, FileCheck, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../../data/mockData';
import { DocumentInspectionModal } from './DocumentInspectionModal';

const INITIAL_VENDORS = [
  { category: 'Plumbing', vendor: 'Apex Plumbing Services', autoAssign: true, contact: '+1 (555) 991-0022' },
  { category: 'Electrical', vendor: 'VoltTech Electrical Co.', autoAssign: true, contact: '+1 (555) 334-9911' },
  { category: 'HVAC', vendor: 'ClimateAir Solutions', autoAssign: true, contact: '+1 (555) 887-2665' },
  { category: 'General', vendor: 'In-House Contractor', autoAssign: false, contact: '+1 (555) 000-1122' },
];

const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', timestamp: '2026-08-27 09:12:04', user: 'Alexander Vance (Landlord)', action: 'Updated Unit Rent', target: 'Unit 4B ($2,450/mo)', ip: '192.168.1.104' },
  { id: 'log-2', timestamp: '2026-08-26 16:45:22', user: 'Alexander Vance (Landlord)', action: 'Assigned Ticket #102', target: 'Apex Plumbing Services', ip: '192.168.1.112' },
  { id: 'log-3', timestamp: '2026-08-25 11:30:00', user: 'Alexander Vance (Landlord)', action: 'Exported Rent Roll', target: 'August_Rent_Roll_2026.csv', ip: '192.168.1.104' },
  { id: 'log-4', timestamp: '2026-08-24 14:15:10', user: 'System Automated', action: 'Generated Monthly Invoice', target: 'Unit 2A Sept Rent Invoice', ip: '127.0.0.1' },
];

export const LandlordSettingsTab = ({
  properties = [],
  units = [],
  tenants = [],
  documents: documentsProp,
  onUpdateDocumentStatus,
  initialSubTab = 'account',
}) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  const [saved, setSaved] = useState(false);

  // 1. Landlord Account & Profile state
  const [landlordProfile, setLandlordProfile] = useState({
    firstName: 'Alexander',
    middleName: 'J.',
    lastName: 'Vance',
    name: 'Alexander Vance',
    email: 'alexander.vance@horizon.com',
    phone: '+1 (555) 019-2831',
    company: 'Horizon Property Holdings Group',
    officePhone: '+1 (555) 990-1100',
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTimezone, setDefaultTimezone] = useState('EST (UTC-5)');

  // 2. Maintenance & Vendor state
  const [vendors, setVendors] = useState(INITIAL_VENDORS);
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [slaSettings, setSlaSettings] = useState({
    emergencyHours: '1',
    highHours: '4',
    mediumHours: '24',
    lowHours: '48',
  });

  // 3. Payments & Gateway state
  const [paymentRules, setPaymentRules] = useState({
    dueDateDay: '1',
    gracePeriodDays: '5',
    lateFeeType: 'flat',
    lateFeeAmount: '50',
    autoInvoiceDays: '10',
  });
  const [gateways, setGateways] = useState({
    stripe: { active: true, testMode: false, publicKey: 'pk_live_51JPTL8820...' },
    paymongo: { active: true, testMode: true, publicKey: 'pk_test_paymongo_77...' },
    gcash: { active: true, merchantId: 'GCASH-MERCHANT-9901' },
  });

  // 4. Landlord Alerts state
  const [landlordAlerts, setLandlordAlerts] = useState({
    newTicket: true,
    overduePayment: true,
    leaseExpiration: true,
    dailySummaryEmail: true,
  });
  const [escalationHours, setEscalationHours] = useState('48');

  // 5. Document Management Vault state
  const [docExpirationReminderDays, setDocExpirationReminderDays] = useState('30');
  const [documents, setDocuments] = useState(() => {
    if (documentsProp && documentsProp.length > 0) return documentsProp;
    try {
      const savedDocs = sessionStorage.getItem('jptl_documents');
      if (savedDocs) return JSON.parse(savedDocs);
    } catch (e) {
      console.error(e);
    }
    return MOCK_DOCUMENTS;
  });

  // Keep state synced with prop or sessionStorage updates
  useEffect(() => {
    if (documentsProp) {
      setDocuments(documentsProp);
    }
  }, [documentsProp]);

  // Persist local changes to sessionStorage
  const updateDocumentList = (newDocs) => {
    setDocuments(newDocs);
    try {
      sessionStorage.setItem('jptl_documents', JSON.stringify(newDocs));
    } catch (e) {
      console.error(e);
    }
  };

  const [docStatusFilter, setDocStatusFilter] = useState('all'); // 'all' | 'Pending Review' | 'Verified' | 'Rejected'
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedDocForInspection, setSelectedDocForInspection] = useState(null);
  const [isPublishingLandlordDoc, setIsPublishingLandlordDoc] = useState(false);
  const [newLandlordDocTitle, setNewLandlordDocTitle] = useState('');
  const [newLandlordDocType, setNewLandlordDocType] = useState('House Rules');

  // Handle Verification
  const handleVerifyDocument = (docId) => {
    const updated = documents.map(d => 
      d.id === docId ? { 
        ...d, 
        status: 'Verified', 
        verifiedAt: new Date().toISOString(), 
        reviewedBy: 'Alexander Vance (Landlord)',
        rejectionReason: undefined 
      } : d
    );
    updateDocumentList(updated);
    if (onUpdateDocumentStatus) onUpdateDocumentStatus(docId, 'Verified');

    // Append to audit logs
    const targetDoc = documents.find(d => d.id === docId);
    if (targetDoc) {
      setAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: 'Alexander Vance (Landlord)',
          action: 'VERIFIED_DOCUMENT',
          target: `${targetDoc.name} (${targetDoc.tenantName})`,
          ip: '192.168.1.104'
        },
        ...prev
      ]);
    }
  };

  // Handle Rejection
  const handleRejectDocument = (docId, reason) => {
    const updated = documents.map(d => 
      d.id === docId ? { 
        ...d, 
        status: 'Rejected', 
        rejectionReason: reason, 
        reviewedBy: 'Alexander Vance (Landlord)',
        reviewedAt: new Date().toISOString()
      } : d
    );
    updateDocumentList(updated);
    if (onUpdateDocumentStatus) onUpdateDocumentStatus(docId, 'Rejected', reason);

    // Append to audit logs
    const targetDoc = documents.find(d => d.id === docId);
    if (targetDoc) {
      setAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: 'Alexander Vance (Landlord)',
          action: 'REJECTED_DOCUMENT',
          target: `${targetDoc.name} (${targetDoc.tenantName}) - Reason: ${reason}`,
          ip: '192.168.1.104'
        },
        ...prev
      ]);
    }
  };

  // Handle publishing a new landlord template/rules document
  const handlePublishLandlordDoc = (e) => {
    e.preventDefault();
    if (!newLandlordDocTitle.trim()) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      tenantId: 'all',
      tenantName: 'All Residents (Building-wide)',
      unitLabel: 'All Units',
      propertyName: 'Property Portfolio',
      name: `${newLandlordDocTitle.replace(/\s+/g, '_')}.pdf`,
      type: newLandlordDocType,
      category: 'rules',
      size: '1.2 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Verified',
      verifiedAt: new Date().toISOString(),
      reviewedBy: 'Alexander Vance (Landlord)',
      fileUrl: '/docs/published-rules.pdf'
    };

    updateDocumentList([newDoc, ...documents]);
    setNewLandlordDocTitle('');
    setIsPublishingLandlordDoc(false);
  };

  // 6. Reporting & Logs state
  const [logRetentionPeriod, setLogRetentionPeriod] = useState('90');
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // 7. Security state
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('30');
  const [lastBackupTime, setLastBackupTime] = useState('2026-08-27 04:00 AM');
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackupTime(new Date().toLocaleString());
      alert('Property database snapshot saved successfully!');
    }, 1500);
  };

  const subTabs = [
    { key: 'account', label: 'Profile & Account', icon: User },
    { key: 'maintenance', label: 'Maintenance & Vendors', icon: Wrench },
    { key: 'payments', label: 'Payments & Payouts', icon: DollarSign },
    { key: 'notifications', label: 'Landlord Alerts', icon: Bell },
    { key: 'reporting', label: 'Reporting & Logs', icon: Database },
    { key: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      
      {/* ─── HEADER ─── */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <User className="w-3.5 h-3.5" />
            <span>Landlord Control Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">
            Landlord Profile & System Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Manage your owner profile, login security, property portfolio, rent roll rules, vendor dispatch, and payment gateways.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/25 btn-press transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>

      {/* ─── SUB-NAV TABS ─── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-[#10131F] border border-slate-300/60 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-grotesk font-semibold whitespace-nowrap btn-press transition-all
                ${isActive 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-800' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── SUB-TAB 1: PROFILE & ACCOUNT ─── */}
      {activeSubTab === 'account' && (
        <div className="space-y-6">
          
          {/* Avatar & Portfolio Banner */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Photo & Avatar Controls */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-center space-y-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center text-3xl font-extrabold font-grotesk shadow-xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Landlord Profile" className="w-full h-full object-cover" />
                  ) : (
                    ((landlordProfile.firstName?.[0] || '') + (landlordProfile.lastName?.[0] || '')).toUpperCase() || 'AV'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer btn-press">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setAvatarUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">
                  {landlordProfile.name || [landlordProfile.firstName, landlordProfile.middleName, landlordProfile.lastName].filter(Boolean).join(' ')}
                </h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Property Owner & Landlord</span>
              </div>

              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="text-[11px] font-mono text-rose-500 hover:underline"
                >
                  Remove custom photo
                </button>
              )}
            </div>

            {/* Portfolio Overview Summary */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Portfolio Scope & Managed Units
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  Verified Landlord
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Buildings</span>
                  <strong className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">
                    {properties?.length || 3} Properties
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Units</span>
                  <strong className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">
                    {units?.length || 18} Units
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Tenants</span>
                  <strong className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">
                    {tenants?.length || 14} Residents
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Landlord Personal Info */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Personal & Business Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={landlordProfile.firstName || ''}
                  onChange={(e) => {
                    const first = e.target.value;
                    setLandlordProfile((p) => ({
                      ...p,
                      firstName: first,
                      name: [first, p.middleName, p.lastName].filter(Boolean).join(' '),
                    }));
                  }}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Middle Name <span className="text-slate-500 font-normal">(Opt)</span></label>
                <input
                  type="text"
                  value={landlordProfile.middleName || ''}
                  onChange={(e) => {
                    const mid = e.target.value;
                    setLandlordProfile((p) => ({
                      ...p,
                      middleName: mid,
                      name: [p.firstName, mid, p.lastName].filter(Boolean).join(' '),
                    }));
                  }}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={landlordProfile.lastName || ''}
                  onChange={(e) => {
                    const last = e.target.value;
                    setLandlordProfile((p) => ({
                      ...p,
                      lastName: last,
                      name: [p.firstName, p.middleName, last].filter(Boolean).join(' '),
                    }));
                  }}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={landlordProfile.email}
                  onChange={(e) => setLandlordProfile((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Direct Mobile</label>
                <input
                  type="text"
                  value={landlordProfile.phone}
                  onChange={(e) => setLandlordProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Holding Group</label>
                <input
                  type="text"
                  value={landlordProfile.company}
                  onChange={(e) => setLandlordProfile((p) => ({ ...p, company: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Password & 2FA Security Preferences */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" /> Password & Login Preferences
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              {/* Password Form */}
              <div className="space-y-3 font-sans">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Change Landlord Account Password</span>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Current Password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* 2FA Option */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-900 dark:text-white font-grotesk text-sm flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-500" /> Two-Factor Authentication (2FA)
                    </strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Optional
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Protect your property financial ledgers and merchant accounts with TOTP authenticator app verification.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enable 2FA Protection</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEnable2FA(!enable2FA);
                      if (!enable2FA) setShow2FAModal(true);
                    }}
                    className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all btn-press ${
                      enable2FA
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {enable2FA ? '2FA Active' : 'Setup 2FA'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Portfolio Defaults */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Portfolio Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Active Properties</span>
                <strong className="text-xl font-extrabold font-grotesk text-slate-900 dark:text-white">
                  {properties?.length || 3} Buildings
                </strong>
                <span className="text-[11px] text-slate-500 block mt-1">Multi-property routing active</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Default Currency</span>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full mt-1 bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="PHP">PHP (₱ - Philippine Peso)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Primary Timezone</span>
                <select
                  value={defaultTimezone}
                  onChange={(e) => setDefaultTimezone(e.target.value)}
                  className="w-full mt-1 bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
                >
                  <option value="EST (UTC-5)">EST (UTC-5 - Eastern)</option>
                  <option value="PST (UTC-8)">PST (UTC-8 - Pacific)</option>
                  <option value="PHT (UTC+8)">PHT (UTC+8 - Asia/Manila)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2FA Setup Modal */}
          {show2FAModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-500" /> Landlord 2FA Authenticator Setup
                  </h3>
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] text-center space-y-3">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center border border-slate-300">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full border-2 border-dashed border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-800 font-bold">
                      [QR CODE SCAN]
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    Scan with Google Authenticator or 1Password
                  </span>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Enter 6-digit Code</label>
                  <input
                    type="text"
                    placeholder="123456"
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-mono text-base font-bold tracking-widest text-indigo-600 dark:text-indigo-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setEnable2FA(true);
                      setShow2FAModal(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-grotesk font-bold"
                  >
                    Verify & Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── SUB-TAB 2: MAINTENANCE & VENDORS ─── */}
      {activeSubTab === 'maintenance' && (
        <div className="space-y-6">
          
          {/* Vendor Auto-Assignment */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-500" /> Vendor Routing & Dispatch Rules
            </h2>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
              {vendors.map((v, i) => (
                <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold font-grotesk text-sm block">{v.category} Category</span>
                    <span className="text-slate-500 text-[11px]">Assigned Vendor: <strong>{v.vendor}</strong> ({v.contact})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.autoAssign}
                        onChange={() => {
                          setVendors((prev) =>
                            prev.map((item, idx) => (idx === i ? { ...item, autoAssign: !item.autoAssign } : item))
                          );
                        }}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                      <span>Auto-Assign</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority SLA & Approval */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-6">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" /> Maintenance SLA Targets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set acknowledgment time limits per ticket priority level.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-rose-600 font-bold block uppercase text-[10px]">Emergency SLA</span>
                <input
                  type="text"
                  value={slaSettings.emergencyHours}
                  onChange={(e) => setSlaSettings((s) => ({ ...s, emergencyHours: e.target.value }))}
                  className="w-full bg-white dark:bg-[#10131F] border border-rose-300 dark:border-rose-800 rounded-xl px-2.5 py-1 text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Hours to Acknowledge</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-amber-600 font-bold block uppercase text-[10px]">High Priority SLA</span>
                <input
                  type="text"
                  value={slaSettings.highHours}
                  onChange={(e) => setSlaSettings((s) => ({ ...s, highHours: e.target.value }))}
                  className="w-full bg-white dark:bg-[#10131F] border border-amber-300 dark:border-amber-800 rounded-xl px-2.5 py-1 text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Hours to Acknowledge</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <span className="text-indigo-600 font-bold block uppercase text-[10px]">Medium Priority SLA</span>
                <input
                  type="text"
                  value={slaSettings.mediumHours}
                  onChange={(e) => setSlaSettings((s) => ({ ...s, mediumHours: e.target.value }))}
                  className="w-full bg-white dark:bg-[#10131F] border border-indigo-300 dark:border-indigo-800 rounded-xl px-2.5 py-1 text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Hours to Acknowledge</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-500/10 border border-slate-500/20 space-y-1">
                <span className="text-slate-600 dark:text-slate-400 font-bold block uppercase text-[10px]">Low Priority SLA</span>
                <input
                  type="text"
                  value={slaSettings.lowHours}
                  onChange={(e) => setSlaSettings((s) => ({ ...s, lowHours: e.target.value }))}
                  className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1 text-slate-900 dark:text-white font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Hours to Acknowledge</span>
              </div>
            </div>

            {/* Landlord Approval Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 dark:text-white block font-grotesk">Require My Approval Before Vendor Dispatch</strong>
                <span className="text-slate-500 text-[11px]">Vendors cannot start non-emergency jobs without your sign-off.</span>
              </div>
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequired(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
              />
            </div>

          </div>

        </div>
      )}

      {/* ─── SUB-TAB 3: PAYMENTS & PAYOUTS ─── */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          
          {/* Rent & Late Fee Rules */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-500" /> Rent Roll Policy & Late Fee Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-500 mb-1">Default Rent Due Day</label>
                <select
                  value={paymentRules.dueDateDay}
                  onChange={(e) => setPaymentRules((p) => ({ ...p, dueDateDay: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="1">1st of Every Month</option>
                  <option value="5">5th of Every Month</option>
                  <option value="15">15th of Every Month</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Grace Period (Days)</label>
                <input
                  type="number"
                  value={paymentRules.gracePeriodDays}
                  onChange={(e) => setPaymentRules((p) => ({ ...p, gracePeriodDays: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Late Fee Calculation</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={paymentRules.lateFeeAmount}
                    onChange={(e) => setPaymentRules((p) => ({ ...p, lateFeeAmount: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                  <select
                    value={paymentRules.lateFeeType}
                    onChange={(e) => setPaymentRules((p) => ({ ...p, lateFeeType: e.target.value }))}
                    className="bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-2 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="flat">$ Flat</option>
                    <option value="percentage">% Daily</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Cards */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" /> Payment Gateways (Stripe, PayMongo, GCash)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              
              {/* Stripe */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm flex items-center gap-1.5">
                    💳 Stripe Connect
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">Direct card & ACH rent deposit to your bank.</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Test Mode</span>
                  <input
                    type="checkbox"
                    checked={gateways.stripe.testMode}
                    onChange={(e) => setGateways((g) => ({ ...g, stripe: { ...g.stripe, testMode: e.target.checked } }))}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* PayMongo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm flex items-center gap-1.5">
                    🌐 PayMongo
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                    Sandbox
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">Online banking & regional e-wallets.</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Test Mode</span>
                  <input
                    type="checkbox"
                    checked={gateways.paymongo.testMode}
                    onChange={(e) => setGateways((g) => ({ ...g, paymongo: { ...g.paymongo, testMode: e.target.checked } }))}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* GCash */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm flex items-center gap-1.5">
                    📱 GCash QR
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">Instant mobile QR rent deposits.</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Merchant ID</span>
                  <strong className="text-indigo-600 text-[10px]">{gateways.gcash.merchantId}</strong>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ─── SUB-TAB 4: LANDLORD ALERTS ─── */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Notification Triggers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose when you receive alerts regarding your properties, tenant tickets, and rent ledgers.
              </p>
            </div>

            <div className="space-y-3 text-xs font-sans">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">New Maintenance Requests</strong>
                  <span className="text-slate-500 text-[11px]">Instant notification when a tenant logs a repair issue.</span>
                </div>
                <input
                  type="checkbox"
                  checked={landlordAlerts.newTicket}
                  onChange={(e) => setLandlordAlerts((p) => ({ ...p, newTicket: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Overdue Rent Payments</strong>
                  <span className="text-slate-500 text-[11px]">Get notified when rent passes the grace period deadline.</span>
                </div>
                <input
                  type="checkbox"
                  checked={landlordAlerts.overduePayment}
                  onChange={(e) => setLandlordAlerts((p) => ({ ...p, overduePayment: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Lease Expiration Reminders</strong>
                  <span className="text-slate-500 text-[11px]">Advance notice before a tenant's lease is about to expire.</span>
                </div>
                <input
                  type="checkbox"
                  checked={landlordAlerts.leaseExpiration}
                  onChange={(e) => setLandlordAlerts((p) => ({ ...p, leaseExpiration: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Daily Property Summary Email</strong>
                  <span className="text-slate-500 text-[11px]">Morning digest of active leases, open tickets, and incoming rent.</span>
                </div>
                <input
                  type="checkbox"
                  checked={landlordAlerts.dailySummaryEmail}
                  onChange={(e) => setLandlordAlerts((p) => ({ ...p, dailySummaryEmail: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk text-sm">Ticket Escalation Threshold</strong>
                  <span className="text-slate-500 text-[11px]">High-priority alert if a maintenance request remains unresolved.</span>
                </div>
                <select
                  value={escalationHours}
                  onChange={(e) => setEscalationHours(e.target.value)}
                  className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white text-xs font-mono"
                >
                  <option value="12">12 Hours Unresolved</option>
                  <option value="24">24 Hours Unresolved</option>
                  <option value="48">48 Hours Unresolved</option>
                </select>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ─── SUB-TAB 5: REPORTING & LOGS ─── */}
      {activeSubTab === 'reporting' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" /> Activity & Audit Trail
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track changes to rent amounts, vendor assignments, and financial exports.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400">Retention:</span>
                <select
                  value={logRetentionPeriod}
                  onChange={(e) => setLogRetentionPeriod(e.target.value)}
                  className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1 text-slate-900 dark:text-white"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <div>
                    <strong className="text-slate-900 dark:text-white font-grotesk text-xs block">{log.action}: <span className="text-indigo-600 dark:text-indigo-400">{log.target}</span></strong>
                    <span className="text-[10px] text-slate-500">By {log.user} &bull; IP: {log.ip}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ─── SUB-TAB 7: SECURITY ─── */}
      {activeSubTab === 'security' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-6">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" /> Account Security & Data Backups
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your session timeout, two-factor authentication, and property data backups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              
              {/* Session Timeout */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-2">
                <strong className="text-slate-900 dark:text-white font-grotesk text-sm block">Session Inactivity Timeout</strong>
                <span className="text-slate-500 text-[11px] block">Auto-logout after a period of inactivity.</span>
                <select
                  value={sessionTimeoutMins}
                  onChange={(e) => setSessionTimeoutMins(e.target.value)}
                  className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="15">15 Minutes (High Security)</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">1 Hour</option>
                  <option value="480">8 Hours</option>
                </select>
              </div>

              {/* Property Database Backup */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm block">Property Data Backup</strong>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] block">Last backup: <strong>{lastBackupTime}</strong></span>
                
                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs btn-press flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                  {isBackingUp ? 'Creating Snapshot…' : 'Backup Property Data'}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
