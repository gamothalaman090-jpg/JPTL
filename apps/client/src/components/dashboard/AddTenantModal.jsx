import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Mail, User, Building2, Key, Copy, Check, AlertCircle, 
  Loader2, Calendar, DollarSign, AlertTriangle, Clock, Users, CheckCircle2, Home, Sparkles 
} from 'lucide-react';
import { landlordApi } from '../../services/api';

export const AddTenantModal = ({
  isOpen,
  onClose,
  properties = [],
  units = [],
  tenants = [],
  initialPropertyId = '',
  initialUnitId = '',
  onTenantAdded = () => {},
  onTenantAssigned = () => {},
}) => {
  // Mode: 'existing' (assign already created/pre-added) vs 'new' (create brand new account)
  const [activeTab, setActiveTab] = useState('existing');

  // Existing / Pre-added Tenant selection
  const [selectedTenantId, setSelectedTenantId] = useState('');

  // New Tenant Form Fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');

  // Unit & Property assignment
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [durationMonths, setDurationMonths] = useState(12);

  const [isPreAdd, setIsPreAdd] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Success modal state for new tenant creation
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Helper to calculate end date from start date and months
  const calculateEndDate = (startDateStr, months) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + Number(months));
    return date.toISOString().split('T')[0];
  };

  // Filter vacant units for selected property
  const vacantUnits = units.filter((u) => {
    const uPropId = u.propertyId || u.property;
    const matchesProp = !selectedPropertyId || uPropId === selectedPropertyId;
    return matchesProp && u.status === 'vacant';
  });

  // Filter pre-added / unassigned accounts from tenants list
  const preAddedTenants = tenants.filter((t) => t.status === 'pre_added' || !t.unitId || t.unitId === 'pre_add_unassigned');
  const otherTenants = tenants.filter((t) => t.status !== 'pre_added' && t.unitId && t.unitId !== 'pre_add_unassigned');

  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setTenantEmail('');
      setTenantPhone('');
      setTouched({});
      setErrors({});
      setErrorMessage(null);
      setSuccessData(null);
      setCopied(false);

      // Default activeTab: if initialUnitId provided and there are pre-added tenants, default to 'existing'
      if (preAddedTenants.length > 0) {
        setActiveTab('existing');
        setSelectedTenantId(preAddedTenants[0].id || preAddedTenants[0]._id || '');
      } else if (tenants.length > 0 && initialUnitId) {
        setActiveTab('existing');
        setSelectedTenantId(tenants[0].id || tenants[0]._id || '');
      } else {
        setActiveTab('new');
        setSelectedTenantId('');
      }

      // Initial property
      if (initialPropertyId) {
        setSelectedPropertyId(initialPropertyId);
      } else if (properties.length > 0) {
        setSelectedPropertyId(properties[0].id || properties[0]._id);
      }

      // Initial unit
      if (initialUnitId) {
        setSelectedUnitId(initialUnitId);
        setIsPreAdd(false);
        const unit = units.find((u) => u.id === initialUnitId || u._id === initialUnitId);
        if (unit && unit.monthlyRent) {
          setMonthlyRent(String(unit.monthlyRent));
        }
      } else {
        setSelectedUnitId('');
        setIsPreAdd(false);
        setMonthlyRent('');
      }

      // Default lease dates
      const today = new Date().toISOString().split('T')[0];
      setLeaseStart(today);
      setDurationMonths(12);
      setLeaseEnd(calculateEndDate(today, 12));
    }
  }, [isOpen, initialPropertyId, initialUnitId, properties, units, tenants]);

  // Handle property change
  const handlePropertyChange = (propId) => {
    setSelectedPropertyId(propId);
    setSelectedUnitId('');
    setMonthlyRent('');
    setErrorMessage(null);
  };

  // Handle unit change
  const handleUnitChange = (uId) => {
    if (uId === 'pre_add_unassigned') {
      setIsPreAdd(true);
      setSelectedUnitId('');
      setMonthlyRent('');
    } else {
      setIsPreAdd(false);
      setSelectedUnitId(uId);
      const unit = units.find((u) => u.id === uId || u._id === uId);
      if (unit && unit.monthlyRent) {
        setMonthlyRent(String(unit.monthlyRent));
      }
    }
    setErrorMessage(null);
  };

  // Handle duration preset
  const handleDurationPreset = (months) => {
    setDurationMonths(months);
    if (leaseStart) {
      setLeaseEnd(calculateEndDate(leaseStart, months));
    }
  };

  // Handle lease start date
  const handleStartDateChange = (dateVal) => {
    setLeaseStart(dateVal);
    if (durationMonths && dateVal) {
      setLeaseEnd(calculateEndDate(dateVal, durationMonths));
    }
  };

  // Handle lease end date
  const handleEndDateChange = (dateVal) => {
    setLeaseEnd(dateVal);
    if (leaseStart && dateVal) {
      const s = new Date(leaseStart);
      const e = new Date(dateVal);
      if (e > s) {
        const months = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.44)));
        setDurationMonths(months);
      }
    }
  };

  // Expiration calculation for live preview badge
  const getExpirationPreview = () => {
    if (!leaseEnd) return null;
    const end = new Date(leaseEnd);
    if (isNaN(end.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const formatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return {
      formatted,
      diffDays,
      isExpired: diffDays < 0,
      isExpiringSoon: diffDays >= 0 && diffDays <= 30,
    };
  };

  const expirationPreview = getExpirationPreview();

  // Validation logic for new tenant form
  const validateField = (name, value) => {
    let err = '';
    if (name === 'firstName') {
      if (!value.trim()) err = 'First name is required';
      else if (value.trim().length < 2 || value.trim().length > 50) err = 'First name must be 2–50 characters';
    }
    if (name === 'middleName') {
      if (value && value.trim().length > 50) err = 'Middle name must be under 50 characters';
    }
    if (name === 'lastName') {
      if (!value.trim()) err = 'Last name is required';
      else if (value.trim().length < 2 || value.trim().length > 50) err = 'Last name must be 2–50 characters';
    }
    if (name === 'tenantEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) err = 'Tenant email is required';
      else if (!emailRegex.test(value.trim())) err = 'Enter a valid email address';
    }
    if (name === 'unit') {
      if (!isPreAdd && !selectedUnitId) err = 'Please select a vacant unit or select Unassigned (Pre-add)';
    }
    if (name === 'leaseStart') {
      if (!isPreAdd && !value) err = 'Lease start date is required for assigned units';
    }
    return err;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = '';
    if (field === 'firstName') val = firstName;
    if (field === 'middleName') val = middleName;
    if (field === 'lastName') val = lastName;
    if (field === 'tenantEmail') val = tenantEmail;
    if (field === 'unit') val = selectedUnitId;
    if (field === 'leaseStart') val = leaseStart;

    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleTextChange = (field, val) => {
    setErrorMessage(null);
    if (field === 'firstName') {
      setFirstName(val);
      if (touched.firstName) setErrors((prev) => ({ ...prev, firstName: validateField('firstName', val) }));
    }
    if (field === 'middleName') {
      setMiddleName(val);
      if (touched.middleName) setErrors((prev) => ({ ...prev, middleName: validateField('middleName', val) }));
    }
    if (field === 'lastName') {
      setLastName(val);
      if (touched.lastName) setErrors((prev) => ({ ...prev, lastName: validateField('lastName', val) }));
    }
    if (field === 'tenantEmail') {
      setTenantEmail(val);
      if (touched.tenantEmail) setErrors((prev) => ({ ...prev, tenantEmail: validateField('tenantEmail', val) }));
    }
  };

  // Selected tenant in existing mode
  const selectedExistingTenant = tenants.find(
    (t) => String(t.id || t._id) === String(selectedTenantId)
  );

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // ─────────────────────────────────────────────────────────
    // TAB 1: ASSIGN EXISTING / PRE-ADDED TENANT ACCOUNT
    // ─────────────────────────────────────────────────────────
    if (activeTab === 'existing') {
      if (!selectedTenantId) {
        setErrorMessage('Please select a tenant account to assign');
        return;
      }
      if (!selectedUnitId) {
        setErrorMessage('Please select a vacant unit to assign to this tenant');
        return;
      }
      if (!leaseStart) {
        setErrorMessage('Lease start date is required');
        return;
      }
      if (!leaseEnd) {
        setErrorMessage('Lease expiration date is required');
        return;
      }

      setIsSubmitting(true);
      try {
        const targetUnit = units.find((u) => u.id === selectedUnitId || u._id === selectedUnitId);
        const targetProp = properties.find((p) => p.id === selectedPropertyId || p._id === selectedPropertyId);

        const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(selectedTenantId));
        let res;

        if (isMongoId) {
          res = await landlordApi.updateTenant(selectedTenantId, {
            email: selectedExistingTenant?.email,
            firstName: selectedExistingTenant?.firstName || selectedExistingTenant?.name?.split(' ')[0],
            lastName: selectedExistingTenant?.lastName || selectedExistingTenant?.name?.split(' ').slice(1).join(' '),
            unitId: selectedUnitId,
            monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
            leaseStart,
            leaseEnd,
            status: 'active',
          });
        } else {
          // Pre-added tenant with synthetic ID: Create in database with credentials!
          res = await landlordApi.createTenant({
            firstName: selectedExistingTenant?.firstName || selectedExistingTenant?.name?.split(' ')[0] || 'Resident',
            middleName: selectedExistingTenant?.middleName || '',
            lastName: selectedExistingTenant?.lastName || selectedExistingTenant?.name?.split(' ').slice(1).join(' ') || 'Tenant',
            email: selectedExistingTenant?.email,
            phone: selectedExistingTenant?.phone || '',
            unitId: selectedUnitId,
            monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
            leaseStart,
            leaseEnd,
            tempPassword: 'jptl2026',
          });

          // Clean up synthetic ID from sessionStorage
          try {
            const rawStored = sessionStorage.getItem('jptl_onboarding_tenants');
            if (rawStored) {
              const parsed = JSON.parse(rawStored);
              const remaining = parsed.filter(
                (t) => String(t.id) !== String(selectedTenantId) && t.email !== selectedExistingTenant?.email
              );
              sessionStorage.setItem('jptl_onboarding_tenants', JSON.stringify(remaining));
            }
          } catch (_) {}
        }

        const updatedTenant = {
          ...(selectedExistingTenant || {}),
          ...(res.data || {}),
          id: res.data?._id || res.data?.id || selectedTenantId,
          propertyId: selectedPropertyId,
          propertyName: targetProp?.name || selectedExistingTenant?.propertyName || 'Property',
          unitId: selectedUnitId,
          unitLabel: targetUnit?.label || 'Unit',
          monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
          leaseStart,
          leaseEnd,
          status: 'active',
        };

        onTenantAssigned(updatedTenant);
        onClose();
      } catch (err) {
        console.error('Assign tenant error:', err);
        setErrorMessage(err.response?.data?.message || err.message || 'Failed to assign tenant to unit');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────
    // TAB 2: CREATE NEW TENANT ACCOUNT
    // ─────────────────────────────────────────────────────────
    const firstErr = validateField('firstName', firstName);
    const middleErr = validateField('middleName', middleName);
    const lastErr = validateField('lastName', lastName);
    const emailErr = validateField('tenantEmail', tenantEmail);
    const unitErr = validateField('unit', selectedUnitId);
    const startErr = validateField('leaseStart', leaseStart);

    setTouched({ firstName: true, middleName: true, lastName: true, tenantEmail: true, unit: true, leaseStart: true });
    setErrors({ firstName: firstErr, middleName: middleErr, lastName: lastErr, tenantEmail: emailErr, unit: unitErr, leaseStart: startErr });

    if (firstErr || middleErr || lastErr || emailErr || (!isPreAdd && (unitErr || startErr))) return;

    setIsSubmitting(true);

    try {
      const tempPassword = 'jptl2026';

      const targetUnit = units.find((u) => u.id === selectedUnitId || u._id === selectedUnitId);
      const targetProperty = properties.find((p) => p.id === selectedPropertyId || p._id === selectedPropertyId);
      const fullName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');

      const payload = {
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: tenantEmail.trim().toLowerCase(),
        phone: tenantPhone.trim(),
        unitId: isPreAdd ? 'pre_add_unassigned' : selectedUnitId,
        monthlyRent: isPreAdd ? 0 : Number(monthlyRent) || targetUnit?.monthlyRent || 0,
        leaseStart: (!isPreAdd && leaseStart) ? leaseStart : undefined,
        leaseEnd: (!isPreAdd && leaseEnd) ? leaseEnd : undefined,
        tempPassword,
      };

      const res = await landlordApi.createTenant(payload);
      const serverTenant = res.data;

      const newTenant = {
        ...serverTenant,
        id: serverTenant._id || serverTenant.id,
        name: serverTenant.name || fullName,
        propertyName: targetProperty?.name || serverTenant.propertyName || 'Property',
        unitLabel: targetUnit?.label || serverTenant.unitLabel || 'Unit',
        tempPassword,
      };

      setSuccessData({
        tenant: newTenant,
        tempPassword,
      });
    } catch (err) {
      console.error('Create tenant error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create tenant account';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    if (successData) {
      onTenantAdded(successData.tenant);
    }
    onClose();
  };

  const handleCopyPassword = () => {
    if (successData?.tempPassword) {
      navigator.clipboard.writeText(successData.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#10131F] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {!successData ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">
                  {activeTab === 'existing' ? 'Assign Tenant to Unit' : 'Create New Tenant'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeTab === 'existing'
                    ? 'Select a created or pre-added account and attach them to a unit.'
                    : 'Issue credentials and send welcome email to a new resident.'}
                </p>
              </div>
            </div>

            {/* Tab Switcher: Existing Accounts vs Create New */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#080B14] rounded-2xl mb-5 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('existing'); setErrorMessage(null); }}
                className={`py-2 px-3 text-xs font-bold font-grotesk rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'existing'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Existing / Pre-added</span>
                {preAddedTenants.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {preAddedTenants.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('new'); setErrorMessage(null); }}
                className={`py-2 px-3 text-xs font-bold font-grotesk rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'new'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700/80'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ Create New</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div role="alert" className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Error</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 1: EXISTING / PRE-ADDED TENANT SELECTION          */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === 'existing' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Choose Created or Pre-added Tenant *
                    </label>
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select an account --</option>
                      {preAddedTenants.length > 0 && (
                        <optgroup label="Pre-added / Unassigned Accounts">
                          {preAddedTenants.map((t) => (
                            <option key={t.id || t._id} value={t.id || t._id}>
                              {t.name} ({t.email}) — Pre-added
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {otherTenants.length > 0 && (
                        <optgroup label="Other Registered Tenants">
                          {otherTenants.map((t) => (
                            <option key={t.id || t._id} value={t.id || t._id}>
                              {t.name} ({t.email}) — Assigned to {t.unitLabel || 'Unit'}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Selected Tenant Summary Card */}
                  {selectedExistingTenant && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {selectedExistingTenant.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white block font-grotesk">{selectedExistingTenant.name}</strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{selectedExistingTenant.email}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        selectedExistingTenant.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {selectedExistingTenant.status === 'active' ? 'Active' : 'Pre-added'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* TAB 2: CREATE BRAND-NEW TENANT ACCOUNT               */}
              {/* ───────────────────────────────────────────────────── */}
              {activeTab === 'new' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label htmlFor="tenant-firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        First name *
                      </label>
                      <input
                        id="tenant-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => handleTextChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="e.g. Alex"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-[11px] text-rose-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="tenant-middleName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Middle <span className="text-slate-400 font-normal">(Opt)</span>
                      </label>
                      <input
                        id="tenant-middleName"
                        type="text"
                        value={middleName}
                        onChange={(e) => handleTextChange('middleName', e.target.value)}
                        placeholder="e.g. M."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tenant-lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Last name *
                      </label>
                      <input
                        id="tenant-lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => handleTextChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="e.g. Vance"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-[11px] text-rose-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tenant-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Tenant Email Address * <span className="text-slate-400 font-normal">(Login & Credentials will be sent here)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="tenant-email"
                        type="email"
                        value={tenantEmail}
                        onChange={(e) => handleTextChange('tenantEmail', e.target.value)}
                        onBlur={() => handleBlur('tenantEmail')}
                        placeholder="e.g. resident@gmail.com"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {touched.tenantEmail && errors.tenantEmail && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.tenantEmail}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────── */}
              {/* PROPERTY & UNIT SELECTION                            */}
              {/* ───────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Property *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {properties.map((p) => {
                        const pId = p.id || p._id;
                        return (
                          <option key={pId} value={pId}>
                            {p.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit Assignment *
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={isPreAdd ? 'pre_add_unassigned' : selectedUnitId}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select vacant unit...</option>
                      {vacantUnits.map((u) => {
                        const uId = u.id || u._id;
                        return (
                          <option key={uId} value={uId}>
                            {u.label} (${u.monthlyRent}/mo)
                          </option>
                        );
                      })}
                      {activeTab === 'new' && (
                        <option value="pre_add_unassigned">— Unassigned (Pre-add tenant) —</option>
                      )}
                    </select>
                  </div>
                  {vacantUnits.length === 0 && !isPreAdd && (
                    <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> No vacant units in this property
                    </p>
                  )}
                </div>
              </div>

              {/* ───────────────────────────────────────────────────── */}
              {/* LEASE TERMS: RENT, DURATION, EXPIRATION               */}
              {/* ───────────────────────────────────────────────────── */}
              {!isPreAdd && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Monthly Rent ($) *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(e.target.value)}
                          placeholder="e.g. 2400"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Lease Start Date *
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="date"
                          value={leaseStart}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lease Duration Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        Lease Duration Presets
                      </label>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {durationMonths} Months ({durationMonths >= 12 ? `${(durationMonths / 12).toFixed(durationMonths % 12 === 0 ? 0 : 1)} Year` : ''})
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { months: 6, label: '6 Months' },
                        { months: 12, label: '1 Year (12 Mo)' },
                        { months: 24, label: '2 Years (24 Mo)' },
                        { months: 36, label: '3 Years (36 Mo)' },
                      ].map((preset) => (
                        <button
                          key={preset.months}
                          type="button"
                          onClick={() => handleDurationPreset(preset.months)}
                          className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                            durationMonths === preset.months
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                              : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expiration Date Input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Lease Expiration Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="date"
                        value={leaseEnd}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Expiration Summary Preview */}
                  {expirationPreview && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                          Term & Expiration
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {durationMonths} Months Lease • Expires {expirationPreview.formatted}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono ${
                        expirationPreview.isExpired
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {expirationPreview.isExpired ? 'Expired' : `${expirationPreview.diffDays}d left`}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (activeTab === 'existing' && (!selectedTenantId || !selectedUnitId))}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{activeTab === 'existing' ? 'Assigning tenant...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{activeTab === 'existing' ? 'Confirm Assignment & Lease' : 'Create & Send Invitation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen for New Tenant Creation */
          <div className="space-y-6 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">Resident Account Created!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                A welcome email with login credentials was sent to <strong className="text-slate-800 dark:text-slate-200">{successData.tenant.email}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Resident Name</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{successData.tenant.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Portal Username / Email</span>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">{successData.tenant.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Temporary Password</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-mono font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                    {successData.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-grotesk text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTenantModal;
