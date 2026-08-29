import React, { useState } from 'react';
import {
  User, Bell, Shield, Phone, Mail, Car, CheckCircle2, Plus, Trash2, ShieldAlert,
  Lock, Key, Smartphone, Camera, Building2, Clock, Wrench, CreditCard, FileText,
  Upload, Eye, EyeOff, Check, AlertCircle, Download, ExternalLink, HelpCircle,
  FileCheck, ShieldCheck
} from 'lucide-react';

const INITIAL_VEHICLES = [
  { id: 'veh-1', make: 'Tesla Model 3', color: 'Midnight Silver', plate: '7XYZ890', decal: 'DEC-8812' },
];

const INITIAL_SAVED_PAYMENTS = [
  { id: 'pm-1', type: 'ach', label: 'Chase Checking (•••• 4821)', isDefault: true, icon: 'bank' },
  { id: 'pm-2', type: 'card', label: 'Visa ending in 9012', isDefault: false, icon: 'card' },
  { id: 'pm-3', type: 'ewallet', label: 'GCash / PayMongo (+63 917 *** 4821)', isDefault: false, icon: 'wallet' },
];

const INITIAL_DOCUMENTS = [
  { id: 'doc-1', name: 'Lease_Agreement_Unit_4B_2026.pdf', type: 'Lease Agreement', size: '2.4 MB', date: 'Jan 15, 2026', status: 'Verified', category: 'lease' },
  { id: 'doc-2', name: 'Building_House_Rules_v3.pdf', type: 'House Rules', size: '1.1 MB', date: 'Jan 15, 2026', status: 'Active', category: 'rules' },
  { id: 'doc-3', name: 'Rent_Receipt_Aug_2026.pdf', type: 'Receipt', size: '340 KB', date: 'Aug 01, 2026', status: 'Verified', category: 'receipt' },
  { id: 'doc-4', name: 'State_ID_Sophia_Lin.pdf', type: 'Government ID', size: '1.8 MB', date: 'Aug 10, 2026', status: 'Verified', category: 'upload' },
  { id: 'doc-5', name: 'Renters_Insurance_Policy_2026.pdf', type: 'Proof of Insurance', size: '890 KB', date: 'Aug 12, 2026', status: 'Pending Review', category: 'upload' },
];

export const TenantSettingsTab = ({
  tenant,
  unit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('profile'); // 'profile' | 'notifications' | 'maintenance' | 'payments' | 'documents' | 'privacy'
  const [saved, setSaved] = useState(false);

  // 1. Profile & Account state
  const [firstName, setFirstName] = useState(tenant?.firstName || 'Sophia');
  const [middleName, setMiddleName] = useState(tenant?.middleName || '');
  const [lastName, setLastName] = useState(tenant?.lastName || 'Lin');
  const [email, setEmail] = useState(tenant?.email || 'sophia.lin@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-8901');
  const [emergencyContact, setEmergencyContact] = useState('David Lin (+1 555-901-4432) - Brother');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [enable2FA, setEnable2FA] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  // 2. Notifications state
  const [notifChannels, setNotifChannels] = useState({
    maintenance: { push: true, email: true },
    payments: { push: true, email: true },
    lease: { push: true, email: true },
    announcements: { push: true, email: true },
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  // 3. Maintenance Requests preferences state
  const [defaultContactMethod, setDefaultContactMethod] = useState('in_app'); // 'in_app' | 'email'
  const [accessInstructions, setAccessInstructions] = useState('ok_if_not_home'); // 'ok_if_not_home' | 'must_be_present' | 'custom'
  const [customAccessNote, setCustomAccessNote] = useState('Please call 15 minutes before arrival so I can restrain my pet dog.');
  const [uploadMediaPermission, setUploadMediaPermission] = useState(true);

  // 4. Payments preferences state
  const [savedPayments, setSavedPayments] = useState(INITIAL_SAVED_PAYMENTS);
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [reminderLeadDays, setReminderLeadDays] = useState('3'); // '1' | '3' | '5' | '7'
  const [billingHistoryVisibility, setBillingHistoryVisibility] = useState('full'); // 'full' | 'summary'
  const [autoTaxReceipts, setAutoTaxReceipts] = useState(true);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [newPayMethod, setNewPayMethod] = useState({ type: 'ach', label: '' });

  // Vehicles state
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [newMake, setNewMake] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [isAddingVeh, setIsAddingVeh] = useState(false);

  // 5. Documents & Uploads state
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
    return INITIAL_DOCUMENTS;
  });
  const [uploadDocType, setUploadDocType] = useState('Proof of Insurance');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // 6. Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    showPhoneToLandlord: true,
    showEmergencyContactToLandlord: true,
    showVehiclesToLandlord: true,
    vendorDataSharing: true, // share phone with dispatched technicians
    anonymousAnnouncements: false,
  });

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleChannel = (category, channel) => {
    setNotifChannels((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newMake || !newPlate) return;
    setVehicles((prev) => [
      ...prev,
      {
        id: `veh-${Date.now()}`,
        make: newMake,
        color: 'Standard',
        plate: newPlate,
        decal: `DEC-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ]);
    setNewMake('');
    setNewPlate('');
    setIsAddingVeh(false);
  };

  const handleRemoveVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    if (!newPayMethod.label) return;
    setSavedPayments((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        type: newPayMethod.type,
        label: newPayMethod.label,
        isDefault: false,
        icon: newPayMethod.type === 'ach' ? 'bank' : newPayMethod.type === 'card' ? 'card' : 'wallet',
      },
    ]);
    setNewPayMethod({ type: 'ach', label: '' });
    setIsAddingPaymentMethod(false);
  };

  const handleRemovePaymentMethod = (id) => {
    setSavedPayments((prev) => prev.filter((pm) => pm.id !== id));
  };

  const handleSetDefaultPayment = (id) => {
    setSavedPayments((prev) =>
      prev.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
  };

  const handleSimulateDocUpload = (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.docFile;
    const fileName = fileInput?.files?.[0]?.name || `${uploadDocType.replace(/\s+/g, '_')}_Uploaded.pdf`;

    const newDoc = {
      id: `doc-${Date.now()}`,
      tenantId: tenant?.id || 'usr-tenant-1',
      tenantName: fullName || tenant?.name || 'Sophia Lin',
      unitLabel: unit?.label || 'Unit 14B',
      propertyName: unit?.propertyName || 'Aura Sky Towers & Residences',
      name: fileName,
      type: uploadDocType,
      size: '1.2 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending Review',
      category: 'upload',
      fileUrl: `/docs/${fileName}`
    };

    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      try {
        sessionStorage.setItem('jptl_documents', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    setIsUploadingDoc(false);
  };

  const subTabs = [
    { key: 'profile', label: 'Profile & Account', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'maintenance', label: 'Maintenance Requests', icon: Wrench },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'privacy', label: 'Privacy & Permissions', icon: Shield },
  ];

  return (
    <div className="space-y-6">

      {/* ─── HEADER ─── */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <User className="w-3.5 h-3.5" />
            <span>Resident Settings & Controls</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">
            Tenant Preferences & Portal Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Manage your personal profile, notification matrix, payment methods, lease documents, and privacy consents.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3 shrink-0">
          {saved && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/25 btn-press transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save All Preferences
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

      {/* ─── TAB 1: PROFILE & ACCOUNT ─── */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">

          {/* Avatar & Assigned Unit Banner */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Photo & Avatar Controls */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 text-center space-y-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-extrabold font-grotesk shadow-xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'SL'
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
                <h3 className="text-sm font-bold font-grotesk text-slate-900 dark:text-white">{fullName}</h3>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Resident Account</span>
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

            {/* Assigned Property & Unit Summary */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Assigned Property & Unit
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  Active Occupant
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Property</span>
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm block truncate">
                    {unit?.propertyName || 'Grand Horizon Towers'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Assigned Unit</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-grotesk text-sm block">
                    {unit?.label || 'Unit 4B (2BR)'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Lease Expiry</span>
                  <strong className="text-slate-900 dark:text-white font-grotesk text-sm block">
                    Sept 30, 2027
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">Assigned Landlord/Manager: <strong>Alexander Vance</strong></span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">pm-contact@horizon.com</span>
              </div>
            </div>

          </div>

          {/* Personal Info Form */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Personal & Emergency Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Middle Name <span className="text-slate-500 font-normal">(Opt)</span></label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Info</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Registered Vehicles Manager */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-500" /> Registered Vehicles & Parking Permits
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const guestPlate = prompt("Enter Visitor Vehicle License Plate #:", "GUEST-8891");
                    if (guestPlate) {
                      alert(`Guest Parking Pass Issued!\nPass Code: GUEST-PASS-#${Math.floor(1000 + Math.random() * 9000)}\nBay: Level 2 Guest Bay G-04\nValid For: 48 Hours (Expires Aug 31, 2026)`);
                    }
                  }}
                  className="text-xs font-bold font-grotesk text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 btn-press mr-2"
                >
                  <Car className="w-3.5 h-3.5" /> + Visitor Pass
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingVeh(true)}
                  className="text-xs font-bold font-grotesk text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Vehicle
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 dark:text-white block font-grotesk text-sm">{v.make} ({v.color})</strong>
                    <span className="text-slate-500">Plate: <strong className="text-indigo-500">{v.plate}</strong> &bull; Decal: {v.decal}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVehicle(v.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 btn-press"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {isAddingVeh && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3 text-xs">
                <span className="font-bold text-slate-900 dark:text-white font-grotesk block">Add Vehicle Details</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Make & Model (e.g. Honda Civic)"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="bg-white dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="License Plate #"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="bg-white dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingVeh(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVehicle}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold font-grotesk"
                  >
                    Save Vehicle
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password & Security Preferences */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" /> Password & Login Preferences (2FA)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

              {/* Change Password */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800">
                <h3 className="font-grotesk font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                <div>
                  <label className="block text-slate-500 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-grotesk font-bold btn-press"
                >
                  Update Password
                </button>
              </div>

              {/* 2FA Toggle */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-grotesk font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-500" /> Two-Factor Authentication (2FA)
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${enable2FA ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400'}`}>
                      {enable2FA ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Protect your resident portal account with an authenticator app (Google Authenticator, Authy, or Passkey).
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Enable 2FA Protection</span>
                  <input
                    type="checkbox"
                    checked={enable2FA}
                    onChange={(e) => {
                      setEnable2FA(e.target.checked);
                      if (e.target.checked) setShow2FAModal(true);
                    }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Active Device Sessions & Identity Audit */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-grotesk block">
                Active Security Sessions & Identity Telemetry
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white block">Current Device Session</strong>
                    <span className="text-[11px] text-slate-500">Chrome on Windows 11 &bull; IP: 192.168.1.104</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">Active Now</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white block">Last Login Timestamp</strong>
                    <span className="text-[11px] text-slate-500">Today at 08:42 AM (Authenticated)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 font-bold border border-indigo-500/20">Verified</span>
                </div>
              </div>
            </div>

            {/* GDPR / CCPA Data Subject Rights & Portability */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white font-grotesk block">
                  Data Subject Rights & Privacy Governance (GDPR / CCPA)
                </span>
                <span className="text-[10px] font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">
                  Compliance Ready
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                <p className="text-slate-500 text-[11px] leading-relaxed font-sans">
                  Under GDPR and CCPA regulations, you hold full ownership of your personal resident records, payment ledgers, and uploaded documents.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                        resident: "Sophia Lin",
                        unit: "Unit 14B",
                        exportDate: new Date().toISOString(),
                        leaseStatus: "Active",
                        paymentLedger: "Cleared",
                      }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", "Sophia_Lin_JPTL_Personal_Data_Archive.json");
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs flex items-center gap-1.5 btn-press shadow-xs"
                  >
                    <span>Download Personal Data Archive (.JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Data Erasure Request Logged: Following lease termination on Jan 14, 2027, your records will be purged per CCPA §1798.105 standard.")}
                    className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] btn-press"
                  >
                    Request Data Deletion Post-Lease
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── TAB 2: NOTIFICATIONS ─── */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">

          {/* Channel Matrix Card */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Multi-Channel Notification Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how you receive alerts for each category (Push Notifications, Email Digests).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-normal">Notification Type</th>
                    <th className="py-3 px-4 text-center font-normal">Push Notification</th>
                    <th className="py-3 px-4 text-center font-normal">Email Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">

                  {/* Maintenance */}
                  <tr>
                    <td className="py-4 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      Maintenance Request Updates
                      <span className="block text-[11px] font-mono text-slate-500 font-normal">Technician assigned, arrival times, ticket status changes</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.maintenance.push}
                        onChange={() => handleToggleChannel('maintenance', 'push')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.maintenance.email}
                        onChange={() => handleToggleChannel('maintenance', 'email')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                  </tr>

                  {/* Payments */}
                  <tr>
                    <td className="py-4 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      Payment & Billing Reminders
                      <span className="block text-[11px] font-mono text-slate-500 font-normal">Upcoming rent due dates, payment receipts, auto-pay notices</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.payments.push}
                        onChange={() => handleToggleChannel('payments', 'push')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.payments.email}
                        onChange={() => handleToggleChannel('payments', 'email')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                  </tr>

                  {/* Lease Renewals */}
                  <tr>
                    <td className="py-4 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      Lease Renewal Alerts
                      <span className="block text-[11px] font-mono text-slate-500 font-normal">90-day renewal windows, rate updates, contract signatures</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.lease.push}
                        onChange={() => handleToggleChannel('lease', 'push')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.lease.email}
                        onChange={() => handleToggleChannel('lease', 'email')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                  </tr>

                  {/* Landlord Announcements */}
                  <tr>
                    <td className="py-4 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      Landlord Announcements
                      <span className="block text-[11px] font-mono text-slate-500 font-normal">Building maintenance notices, amenity updates, community rules</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.announcements.push}
                        onChange={() => handleToggleChannel('announcements', 'push')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={notifChannels.announcements.email}
                        onChange={() => handleToggleChannel('announcements', 'email')}
                        className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                      />
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* Quiet Hours Settings */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" /> Quiet Hours Configuration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Silence non-emergency push and email alerts during your rest hours.
                </p>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
              />
            </div>

            {quietHoursEnabled && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Quiet Hours (No alerts after)</label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Quiet Hours (Resume alerts at)</label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── TAB 3: MAINTENANCE REQUEST PREFERENCES ─── */}
      {activeSubTab === 'maintenance' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-6">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-500" /> Maintenance Request Follow-Up Defaults
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify your default communication and entry permissions when submitting repair tickets.
              </p>
            </div>

            {/* Default Contact Method */}
            <div className="space-y-2">
              <label className="block text-xs font-bold font-grotesk text-slate-900 dark:text-white uppercase tracking-wider">
                Default Follow-Up Contact Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'in_app', label: 'In-App Portal Chat', desc: 'Real-time in-portal messages & ticket status updates' },
                  { key: 'email', label: 'Email Notifications', desc: 'Automated email updates sent to your registered address' },
                ].map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setDefaultContactMethod(m.key)}
                    className={`
                      p-3.5 rounded-2xl border text-left btn-press transition-all
                      ${defaultContactMethod === m.key
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'bg-slate-50 dark:bg-[#080B14] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    <strong className="block font-grotesk">{m.label}</strong>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Access Instructions */}
            <div className="space-y-2">
              <label className="block text-xs font-bold font-grotesk text-slate-900 dark:text-white uppercase tracking-wider">
                Preferred Access Instructions
              </label>
              <div className="space-y-2 text-xs font-sans">
                <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="accessInstructions"
                    checked={accessInstructions === 'ok_if_not_home'}
                    onChange={() => setAccessInstructions('ok_if_not_home')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-grotesk">OK to enter if not home</strong>
                    <span className="text-slate-500 text-[11px]">Technicians may use master key / smart lock code during standard work hours (8 AM - 5 PM).</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="accessInstructions"
                    checked={accessInstructions === 'must_be_present'}
                    onChange={() => setAccessInstructions('must_be_present')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-grotesk">Tenant MUST be present</strong>
                    <span className="text-slate-500 text-[11px]">Requires scheduled appointment time window confirmation before entry.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="accessInstructions"
                    checked={accessInstructions === 'custom'}
                    onChange={() => setAccessInstructions('custom')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="w-full">
                    <strong className="text-slate-900 dark:text-white block font-grotesk">Custom entry instructions</strong>
                    <span className="text-slate-500 text-[11px] block mb-2">Specify pet safety notes, gate codes, or specific timing requirements.</span>
                    {accessInstructions === 'custom' && (
                      <textarea
                        rows={2}
                        value={customAccessNote}
                        onChange={(e) => setCustomAccessNote(e.target.value)}
                        className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Photo/Video Permission */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 dark:text-white block font-grotesk">Photo & Video Upload Permission</strong>
                <span className="text-slate-500 text-[11px]">Allow camera access when submitting issues so technicians can diagnose plumbing/electrical items faster.</span>
              </div>
              <input
                type="checkbox"
                checked={uploadMediaPermission}
                onChange={(e) => setUploadMediaPermission(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>

          </div>

        </div>
      )}

      {/* ─── TAB 4: PAYMENTS ─── */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">

          {/* Saved Payment Methods */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" /> Saved Payment Methods
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage linked bank accounts, cards, and regional e-wallets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPaymentMethod(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs flex items-center gap-1.5 btn-press"
              >
                <Plus className="w-3.5 h-3.5" /> Add Payment Method
              </button>
            </div>

            <div className="space-y-2.5">
              {savedPayments.map((pm) => (
                <div
                  key={pm.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      {pm.type === 'ach' ? '🏛️' : pm.type === 'card' ? '💳' : '📱'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white font-grotesk text-sm">{pm.label}</strong>
                        {pm.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px] uppercase tracking-wider">{pm.type} Payment</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultPayment(pm.id)}
                        className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-500/10 text-[11px] font-sans btn-press"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemovePaymentMethod(pm.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 btn-press"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAddingPaymentMethod && (
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3 text-xs">
                <span className="font-bold text-slate-900 dark:text-white font-grotesk block">Add New Payment Method</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newPayMethod.type}
                    onChange={(e) => setNewPayMethod((p) => ({ ...p, type: e.target.value }))}
                    className="bg-white dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  >
                    <option value="ach">ACH Direct Bank Transfer</option>
                    <option value="card">Credit / Debit Card</option>
                    <option value="ewallet">GCash / PayMongo E-Wallet</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Account Name or Account Number"
                    value={newPayMethod.label}
                    onChange={(e) => setNewPayMethod((p) => ({ ...p, label: e.target.value }))}
                    className="bg-white dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPaymentMethod(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold font-grotesk"
                  >
                    Link Payment Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Pay & Billing Lead Time */}
          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Auto-Pay & Due Date Reminders
            </h2>

            <div className="space-y-4 text-xs font-sans">

              {/* Auto-pay toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk text-sm">Automatic Rent Payment (Auto-Pay)</strong>
                  <span className="text-slate-500 text-[11px]">Automatically deduct full monthly rent balance on the 1st of every month using default payment method.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPayEnabled}
                  onChange={(e) => setAutoPayEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              {/* Reminder Lead Time */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk text-sm">Payment Reminder Lead Time</strong>
                  <span className="text-slate-500 text-[11px]">Receive advance alert notification before rent due date.</span>
                </div>
                <select
                  value={reminderLeadDays}
                  onChange={(e) => setReminderLeadDays(e.target.value)}
                  className="bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs font-mono"
                >
                  <option value="1">1 Day Before Due Date</option>
                  <option value="3">3 Days Before Due Date</option>
                  <option value="5">5 Days Before Due Date</option>
                  <option value="7">7 Days Before Due Date</option>
                </select>
              </div>

              {/* Tax Receipts */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Auto-Generate Annual Rent Tax Receipts</strong>
                  <span className="text-slate-500 text-[11px]">Automatically generate official tax deductible receipts upon every successful payment.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoTaxReceipts}
                  onChange={(e) => setAutoTaxReceipts(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

            </div>
          </div>

        </div>
      )}


      {/* ─── TAB 5: PRIVACY & PERMISSIONS ─── */}
      {activeSubTab === 'privacy' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
            <div>
              <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" /> Privacy & Landlord Data Visibility
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control what personal details are shared with your landlord and dispatched vendor personnel.
              </p>
            </div>

            <div className="space-y-3 text-xs font-sans">

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Phone Number Visible to Landlord</strong>
                  <span className="text-slate-500 text-[11px]">Allow your landlord to view your direct mobile phone in the tenant directory.</span>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showPhoneToLandlord}
                  onChange={(e) => setPrivacySettings((p) => ({ ...p, showPhoneToLandlord: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Third-Party Vendor Contact Sharing Consent</strong>
                  <span className="text-slate-500 text-[11px]">Allow sharing your contact number with assigned external vendors (plumbing, electrician) during active maintenance jobs.</span>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.vendorDataSharing}
                  onChange={(e) => setPrivacySettings((p) => ({ ...p, vendorDataSharing: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#080B14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-grotesk">Vehicle Registration Details Sharing</strong>
                  <span className="text-slate-500 text-[11px]">Share vehicle license plate with security desk & parking enforcement staff.</span>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showVehiclesToLandlord}
                  onChange={(e) => setPrivacySettings((p) => ({ ...p, showVehiclesToLandlord: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 2FA Modal Simulator */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold font-grotesk text-slate-900 dark:text-white">Setup 2-Factor Authenticator</h3>
              <p className="text-xs text-slate-500 font-mono">Scan this QR code with Google Authenticator or Authy app.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <div className="w-32 h-32 bg-slate-900 flex items-center justify-center text-white text-[10px] font-mono p-2 text-center rounded-xl">
                [QR CODE SIMULATOR]
              </div>
              <span className="text-[10px] font-mono text-slate-500">Secret: JPTL-8820-AUTH-2FA</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-grotesk font-bold text-xs btn-press"
              >
                I Have Scanned Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
