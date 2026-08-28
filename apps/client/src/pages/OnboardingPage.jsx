import React, { useState } from 'react';
import { Building2, Layers, Users, Megaphone, Rocket, Check, ArrowRight, ArrowLeft, Plus, Trash2, Sun, Moon, Key, DollarSign } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { MOCK_PROPERTIES, MOCK_UNITS } from '../data/mockData';
import { AddPropertyOrUnitModal } from '../components/dashboard/AddPropertyOrUnitModal';

export const OnboardingPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  // Read URL query parameter for current step (1 to 4)
  const queryParams = new URLSearchParams(window.location.search);
  const initialStep = parseInt(queryParams.get('step') || '1', 10);
  const [step, setStep] = useState(initialStep);

  // Step 1: Default selected tier to 'pro' (the RECOMMENDED tier)
  const [selectedTier, setSelectedTier] = useState('pro');

  // Properties & Units State (with custom created items stored in sessionStorage)
  const [propertiesList, setPropertiesList] = useState(() => {
    try {
      const savedProps = sessionStorage.getItem('jptl_custom_properties');
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed) && parsed.length > 0) return [...MOCK_PROPERTIES, ...parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_PROPERTIES;
  });

  const [unitsList, setUnitsList] = useState(() => {
    try {
      const savedUnits = sessionStorage.getItem('jptl_custom_units');
      if (savedUnits) {
        const parsed = JSON.parse(savedUnits);
        if (Array.isArray(parsed) && parsed.length > 0) return [...MOCK_UNITS, ...parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_UNITS;
  });

  // Modal State for Property / Unit Creation
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState('unit'); // 'unit' | 'property'
  const [activeMemberRowId, setActiveMemberRowId] = useState(null);

  // Step 2: Tenant list state
  const [tenantMembers, setTenantMembers] = useState([
    { id: '1', firstName: 'Sophia', middleName: '', lastName: 'Lin', name: 'Sophia Lin', email: 'sophia.lin@example.com', unitId: 'unit-102' },
    { id: '2', firstName: 'Liam', middleName: '', lastName: 'Carter', name: 'Liam Carter', email: 'liam.carter@example.com', unitId: 'pre_add_unassigned' },
  ]);

  // Step 3: Announcement draft
  const [announcementSubject, setAnnouncementSubject] = useState('Welcome to our new Property Portal! 🚀');
  const [announcementBody, setAnnouncementBody] = useState(
    'We are thrilled to launch our new tenant and property management system. Please explore your dashboard and let us know if you have any questions.'
  );

  // Open modal handlers
  const handleOpenAddProperty = (memberId = null) => {
    setActiveMemberRowId(memberId);
    setAddModalTab('property');
    setIsAddModalOpen(true);
  };

  const handleOpenAddUnit = (memberId = null) => {
    setActiveMemberRowId(memberId);
    setAddModalTab('unit');
    setIsAddModalOpen(true);
  };

  // Callback when a new property is created
  const handlePropertyCreated = (newProp) => {
    setPropertiesList((prev) => {
      const updated = [...prev, newProp];
      try {
        const customOnly = updated.filter((p) => p.id.startsWith('prop-custom-'));
        sessionStorage.setItem('jptl_custom_properties', JSON.stringify(customOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Callback when a new unit is created
  const handleUnitCreated = (newUnit, targetMemberId) => {
    setUnitsList((prev) => {
      const updated = [...prev, newUnit];
      try {
        const customOnly = updated.filter((u) => u.id.startsWith('unit-custom-'));
        sessionStorage.setItem('jptl_custom_units', JSON.stringify(customOnly));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (targetMemberId) {
      handleUpdateMember(targetMemberId, 'unitId', newUnit.id);
    }
  };

  // Add new tenant row in Step 2
  const handleAddMember = () => {
    setTenantMembers((prev) => [
      ...prev,
      { id: String(Date.now()), firstName: '', middleName: '', lastName: '', name: '', email: '', unitId: 'pre_add_unassigned' },
    ]);
  };

  const handleUpdateMember = (id, field, value) => {
    setTenantMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };
        if (['firstName', 'middleName', 'lastName'].includes(field)) {
          const first = field === 'firstName' ? value : updated.firstName || '';
          const middle = field === 'middleName' ? value : updated.middleName || '';
          const last = field === 'lastName' ? value : updated.lastName || '';
          updated.name = [first.trim(), middle.trim(), last.trim()].filter(Boolean).join(' ');
        }
        return updated;
      })
    );
  };

  const handleSelectUnitChange = (memberId, value) => {
    if (value === 'CREATE_NEW_UNIT') {
      handleOpenAddUnit(memberId);
    } else if (value === 'CREATE_NEW_PROPERTY') {
      handleOpenAddProperty(memberId);
    } else {
      handleUpdateMember(memberId, 'unitId', value);
    }
  };

  const handleRemoveMember = (id) => {
    if (tenantMembers.length === 1) return;
    setTenantMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Progress to next step or complete onboarding
  const handleNextStep = () => {
    if (step < 4) {
      const nextStep = step + 1;
      setStep(nextStep);
      window.history.pushState({}, '', `/onboarding?step=${nextStep}`);
    } else {
      // Complete onboarding & store new tenants in sessionStorage for Dashboard
      const validNewTenants = tenantMembers
        .filter((m) => (m.firstName?.trim() || m.name?.trim()) && m.email.trim())
        .map((m) => {
          const matchedUnit = unitsList.find((u) => u.id === m.unitId);
          const computedName = m.name?.trim() || [m.firstName?.trim(), m.middleName?.trim(), m.lastName?.trim()].filter(Boolean).join(' ');
          return {
            id: `usr-tenant-${Date.now()}-${m.id}`,
            firstName: m.firstName?.trim() || '',
            middleName: m.middleName?.trim() || '',
            lastName: m.lastName?.trim() || '',
            name: computedName,
            email: m.email.trim(),
            propertyId: matchedUnit?.propertyId,
            propertyName: matchedUnit?.propertyName || 'Unassigned',
            unitId: matchedUnit ? m.unitId : undefined,
            unitLabel: matchedUnit?.label || 'Unassigned',
            monthlyRent: matchedUnit?.monthlyRent || 0,
            status: matchedUnit ? 'active' : 'pre_added',
          };
        });

      sessionStorage.setItem('jptl_onboarding_tenants', JSON.stringify(validNewTenants));
      sessionStorage.setItem(
        'jptl_announcement',
        JSON.stringify({ subject: announcementSubject, body: announcementBody })
      );

      onNavigate('/dashboard');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      const prevStep = step - 1;
      setStep(prevStep);
      window.history.pushState({}, '', `/onboarding?step=${prevStep}`);
    }
  };

  // Vacant unit dropdown options
  const vacantUnits = unitsList.filter((u) => u.status === 'vacant');

  const stepBreadcrumbs = [
    { num: 1, label: 'Portfolio Plan' },
    { num: 2, label: 'Tenants & Leases' },
    { num: 3, label: 'Broadcast' },
    { num: 4, label: 'Setup Summary' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-600/30 selection:text-indigo-300">
      
      {/* LEFT PANEL: Split Screen Hero & Live Preview (~45% width) */}
      <div className="w-full md:w-[45%] lg:w-[42%] min-h-[360px] md:min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 dark:from-[#0B0D1E] dark:via-[#0E1328] dark:to-[#060810] p-6 sm:p-10 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80">
        
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo & Theme Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-grotesk font-extrabold text-xl tracking-tight text-white">
              JPTL<span className="text-indigo-400">.SYSTEM</span>
            </span>
          </a>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-200" />}
          </button>
        </div>

        {/* Dynamic Left Panel Content & Live Previews */}
        <div className="relative z-10 my-6 md:my-auto space-y-6">
          
          {/* Header Icon & Title */}
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center backdrop-blur-md shadow-xl mb-4">
              {step === 1 && <Layers className="w-6 h-6" />}
              {step === 2 && <Users className="w-6 h-6" />}
              {step === 3 && <Megaphone className="w-6 h-6" />}
              {step === 4 && <Rocket className="w-6 h-6" />}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-grotesk text-white leading-tight tracking-tight mb-2">
              {step === 1 && 'Select Portfolio Plan'}
              {step === 2 && 'Tenant & Lease Directory'}
              {step === 3 && 'Property Announcement'}
              {step === 4 && 'Portal Setup Complete'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed font-sans">
              {step === 1 && 'Choose the plan that fits your property count and operational needs.'}
              {step === 2 && 'Pre-register occupants and assign vacant units to populate your live tenant roster.'}
              {step === 3 && 'Draft a welcome message pinned to your landlord & tenant dashboard.'}
              {step === 4 && 'Review your configured workspace summary before launching into your portal.'}
            </p>
          </div>

          {/* LIVE CONTEXT CARDS ON LEFT PANEL */}
          {step === 1 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 block">Plan Capability Summary</span>
              <div className="flex items-center justify-between text-white font-semibold">
                <span>Selected Plan:</span>
                <span className="text-indigo-400 capitalize">{selectedTier} Tier</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedTier === 'pro' && 'Includes up to 25 properties, automated rent collection, & real-time analytics.'}
                {selectedTier === 'starter' && 'Includes up to 3 properties & tenant self-service portal.'}
                {selectedTier === 'enterprise' && 'Includes unlimited properties, custom API integrations, & SLA onboarding.'}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">Live Roster Preview</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {tenantMembers.filter((m) => m.name.trim()).length} Members
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {tenantMembers.map((m, idx) => (
                  <div key={m.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 text-[11px]">
                    <div className="truncate pr-2">
                      <strong className="text-white block truncate">{m.name || 'Unnamed Tenant'}</strong>
                      <span className="text-slate-400 truncate block text-[10px]">{m.email || 'No email entered'}</span>
                    </div>
                    <span className="text-indigo-300 font-mono text-[10px] shrink-0">
                      {m.unitId === 'pre_add_unassigned' ? 'Unassigned' : 'Assigned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 block">Live Broadcast Preview</span>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <strong className="text-white block font-bold mb-1">{announcementSubject || 'Announcement Subject'}</strong>
                <p className="text-slate-300 text-[11px] line-clamp-3 leading-relaxed">{announcementBody || 'Message content preview...'}</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                <span>Portal Ready for Liftoff</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Your landlord account, initial tenant directory, and welcome broadcast are configured.
              </p>
            </div>
          )}

        </div>

        {/* High-Contrast Labeled Step Breadcrumbs */}
        <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
          <div className="grid grid-cols-4 gap-2">
            {stepBreadcrumbs.map((b) => (
              <div
                key={b.num}
                className={`flex flex-col gap-1 transition-all ${
                  b.num === step
                    ? 'text-white'
                    : b.num < step
                    ? 'text-indigo-300'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`h-1.5 rounded-full ${
                    b.num === step
                      ? 'bg-indigo-400'
                      : b.num < step
                      ? 'bg-indigo-500/70'
                      : 'bg-white/20'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold tracking-tight truncate hidden sm:inline">
                  {b.num}. {b.label}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
            Step {step} of 4 &bull; {stepBreadcrumbs[step - 1].label}
          </span>
        </div>

      </div>

      {/* RIGHT PANEL: Step Form Content (~55% width) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-16 max-w-3xl mx-auto w-full">
        
        {/* STEP 1: Select Your Tier (Matching Landing Page Pricing) */}
        {step === 1 && (
          <div className="space-y-6 my-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Starter Tier ($0/mo) */}
              <div
                onClick={() => setSelectedTier('starter')}
                className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedTier === 'starter'
                    ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                    : 'bg-white dark:bg-[#111625] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                      STARTER
                    </span>
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold font-grotesk mb-0.5">Starter</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mb-3">For independent landlords</p>
                  <div className="text-3xl font-extrabold font-grotesk mb-3">$0 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/mo</span></div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Start managing your first properties with up to 3 properties & tenant portal.</p>
                </div>
                <div className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${selectedTier === 'starter' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'}`}>
                  {selectedTier === 'starter' ? '✓ Selected' : 'Select Starter'}
                </div>
              </div>

              {/* Professional Tier ($29/mo) */}
              <div
                onClick={() => setSelectedTier('pro')}
                className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                  selectedTier === 'pro'
                    ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl'
                    : 'bg-white dark:bg-[#111625] text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-orange-400">
                      RECOMMENDED
                    </span>
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold font-grotesk mb-0.5">Professional</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans mb-3">For growing portfolios</p>
                  <div className="text-3xl font-extrabold font-grotesk mb-3">$29 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/mo</span></div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">The operational backbone for landlords scaling past a handful of units.</p>
                </div>
                <div className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${selectedTier === 'pro' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'}`}>
                  {selectedTier === 'pro' ? '✓ Selected' : 'Select Pro'}
                </div>
              </div>

              {/* Enterprise Tier (Coming Soon) */}
              <div
                className="p-6 rounded-3xl border opacity-75 bg-slate-50/50 dark:bg-[#0E121E] text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 cursor-not-allowed flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-emerald-500 dark:text-emerald-400">
                      COMING SOON
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold font-grotesk text-slate-500 dark:text-slate-300 mb-0.5">Enterprise</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mb-3">For property management firms</p>
                  <div className="text-2xl font-extrabold font-grotesk mb-3 text-slate-400 dark:text-slate-400">Coming soon</div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-6">Multi-team administration, custom API integrations, & SLA onboarding.</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-center bg-slate-200/80 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/50 dark:border-white/5"
                >
                  Coming Soon
                </button>
              </div>

            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 text-center">
              You can upgrade to a premium tier at any time from your billing settings.
            </p>
          </div>
        )}

        {/* STEP 2: Bring Them Aboard — Add Members/Tenants */}
        {step === 2 && (
          <div className="space-y-4 my-auto">
            
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-[#101424] border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Portfolio Setup & Roster
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddProperty()}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 text-xs font-semibold hover:border-indigo-400 flex items-center gap-1 transition-all shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5" /> + Add Property
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddUnit()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Unit
                </button>
              </div>
            </div>

            {/* Column Headers */}
            <div className="hidden lg:grid grid-cols-[1.1fr_0.9fr_1.1fr_1.4fr_1.4fr_auto] gap-2.5 px-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <span>First Name</span>
              <span>Middle Name</span>
              <span>Last Name</span>
              <span>Email Address</span>
              <span>Property / Unit</span>
              <span className="w-8"></span>
            </div>

            {/* Dynamic Member Rows */}
            <div className="space-y-3">
              {tenantMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1.1fr_0.9fr_1.1fr_1.4fr_1.4fr_auto] items-center gap-2.5 w-full overflow-hidden shadow-sm"
                >
                  <input
                    type="text"
                    value={member.firstName || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'firstName', e.target.value)}
                    placeholder="First Name"
                    className="w-full min-w-0 bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={member.middleName || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'middleName', e.target.value)}
                    placeholder="Middle Name (Opt)"
                    className="w-full min-w-0 bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={member.lastName || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    className="w-full min-w-0 bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleUpdateMember(member.id, 'email', e.target.value)}
                    placeholder="Email Address"
                    className="w-full min-w-0 bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:col-span-3 lg:col-span-1"
                  />
                  
                  {/* Select Dropdown with Vacant Units + Quick Creation */}
                  <select
                    value={member.unitId}
                    onChange={(e) => handleSelectUnitChange(member.id, e.target.value)}
                    className="w-full min-w-0 bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate font-sans sm:col-span-2 lg:col-span-1"
                  >
                    <option value="pre_add_unassigned">Unassigned (Pre-add)</option>
                    <optgroup label="Available Vacant Units">
                      {vacantUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          ${u.monthlyRent}/mo &mdash; {u.label} ({u.propertyName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Quick Create">
                      <option value="CREATE_NEW_UNIT">+ Create New Unit...</option>
                      <option value="CREATE_NEW_PROPERTY">+ Create New Property...</option>
                    </optgroup>
                  </select>

                  {tenantMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg shrink-0 flex items-center justify-center justify-self-center sm:col-span-1 lg:col-span-1"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* + Add Another Member Button */}
            <button
              type="button"
              onClick={handleAddMember}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:border-indigo-500 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add another member</span>
            </button>

          </div>
        )}

        {/* STEP 3: Property Announcement */}
        {step === 3 && (
          <div className="space-y-4 my-auto">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Announcement Subject
                </label>
                <input
                  type="text"
                  value={announcementSubject}
                  onChange={(e) => setAnnouncementSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090C16] border border-slate-300 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-medium">
                <span>📣 Will be pinned to your workspace announcement feed immediately.</span>
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Setup Complete — Full Actionable Workspace Summary */}
        {step === 4 && (
          <div className="space-y-6 my-auto">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Check className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-grotesk text-slate-900 dark:text-white">Workspace Setup Complete</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Your landlord account and portal roster are configured and ready for dashboard launch.</p>
                </div>
              </div>

              {/* Actionable Summary Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090C16] border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Plan</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="capitalize">{selectedTier} Tier ({selectedTier === 'pro' ? '$29/mo' : selectedTier === 'starter' ? '$0/mo' : '$149/mo'})</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090C16] border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tenants Configured</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{tenantMembers.filter((m) => m.name.trim()).length} Members Added</span>
                  </div>
                </div>

              </div>

              {/* Added Tenant Roster Summary */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Configured Roster</span>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#090C16]">
                  {tenantMembers.filter((m) => m.name.trim()).map((m) => {
                    const unit = MOCK_UNITS.find((u) => u.id === m.unitId);
                    return (
                      <div key={m.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-bold">{m.name}</strong>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{m.email}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                          {unit ? `${unit.label} ($${unit.monthlyRent}/mo)` : 'Pre-added (Unassigned)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Temporary Passwords Auto-Generated Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
                <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Auto-generated temporary credentials are ready for tenant dispatch in your dashboard.</span>
              </div>

            </div>
          </div>
        )}

        {/* STEP CONTROLS (Back / Continue Buttons) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ml-auto"
          >
            <span>{step === 4 ? 'Launch Landlord Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* CREATE PROPERTY / UNIT MODAL */}
      <AddPropertyOrUnitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialTab={addModalTab}
        properties={propertiesList}
        targetMemberId={activeMemberRowId}
        onPropertyCreated={handlePropertyCreated}
        onUnitCreated={handleUnitCreated}
      />

    </div>
  );
};
