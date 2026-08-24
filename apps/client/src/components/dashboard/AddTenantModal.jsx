import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, User, Building2, Key, Copy, Check, AlertCircle, Loader2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

export const AddTenantModal = ({
  isOpen,
  onClose,
  properties = [],
  units = [],
  initialPropertyId = '',
  initialUnitId = '',
  onTenantAdded = () => {},
}) => {
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);
  const [selectedUnitId, setSelectedUnitId] = useState(initialUnitId);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');

  const [isPreAdd, setIsPreAdd] = useState(false);
  const [simulateConflict, setSimulateConflict] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // Success state modal data
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter vacant units for selected property
  const vacantUnits = units.filter(
    (u) => u.status === 'vacant' && (!selectedPropertyId || u.propertyId === selectedPropertyId)
  );

  // Synchronize initial pre-filled parameters when modal opens
  useEffect(() => {
    if (isOpen) {
      setTenantName('');
      setTenantEmail('');
      setTouched({});
      setErrors({});
      setConflictError(null);
      setSuccessData(null);
      setCopied(false);
      setSimulateConflict(false);

      if (initialPropertyId) {
        setSelectedPropertyId(initialPropertyId);
      } else if (properties.length > 0) {
        setSelectedPropertyId(properties[0].id);
      }

      if (initialUnitId) {
        setSelectedUnitId(initialUnitId);
        setIsPreAdd(false);
        const unit = units.find((u) => u.id === initialUnitId);
        if (unit) {
          setMonthlyRent(unit.monthlyRent || '');
        }
      } else {
        setSelectedUnitId('');
        setIsPreAdd(false);
        setMonthlyRent('');
      }

      // Default lease start to today's date YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setLeaseStart(today);
      setLeaseEnd('');
    }
  }, [isOpen, initialPropertyId, initialUnitId, properties, units]);

  // Handle property dropdown change
  const handlePropertyChange = (propId) => {
    setSelectedPropertyId(propId);
    setSelectedUnitId('');
    setMonthlyRent('');
    setConflictError(null);
  };

  // Handle unit dropdown change
  const handleUnitChange = (uId) => {
    if (uId === 'pre_add_unassigned') {
      setIsPreAdd(true);
      setSelectedUnitId('');
      setMonthlyRent('');
    } else {
      setIsPreAdd(false);
      setSelectedUnitId(uId);
      const unit = units.find((u) => u.id === uId);
      if (unit) {
        setMonthlyRent(unit.monthlyRent ? String(unit.monthlyRent) : '');
      }
    }
    setConflictError(null);
  };

  // Validation logic
  const validateField = (name, value) => {
    let err = '';
    if (name === 'tenantName') {
      if (!value.trim()) err = 'Tenant full name is required';
      else if (value.trim().length < 2 || value.trim().length > 100) err = 'Name must be between 2 and 100 characters';
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
    if (field === 'tenantName') val = tenantName;
    if (field === 'tenantEmail') val = tenantEmail;
    if (field === 'unit') val = selectedUnitId;
    if (field === 'leaseStart') val = leaseStart;

    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleTextChange = (field, val) => {
    setConflictError(null);
    if (field === 'tenantName') {
      setTenantName(val);
      if (touched.tenantName) setErrors((prev) => ({ ...prev, tenantName: validateField('tenantName', val) }));
    }
    if (field === 'tenantEmail') {
      setTenantEmail(val);
      if (touched.tenantEmail) setErrors((prev) => ({ ...prev, tenantEmail: validateField('tenantEmail', val) }));
    }
  };

  const isFormValid =
    tenantName.trim().length >= 2 &&
    tenantName.trim().length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantEmail.trim()) &&
    (isPreAdd || (selectedUnitId && leaseStart));

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflictError(null);

    const nameErr = validateField('tenantName', tenantName);
    const emailErr = validateField('tenantEmail', tenantEmail);
    const unitErr = validateField('unit', selectedUnitId);
    const startErr = validateField('leaseStart', leaseStart);

    setTouched({ tenantName: true, tenantEmail: true, unit: true, leaseStart: true });
    setErrors({ tenantName: nameErr, tenantEmail: emailErr, unit: unitErr, leaseStart: startErr });

    if (nameErr || emailErr || (!isPreAdd && (unitErr || startErr))) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (simulateConflict && !isPreAdd) {
        setConflictError('This unit is no longer vacant. Another landlord session may have assigned it.');
        return;
      }

      // Generate random temporary password
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const tempPassword = `JPTL-${randomCode}`;

      const targetUnit = units.find((u) => u.id === selectedUnitId);
      const targetProperty = properties.find((p) => p.id === selectedPropertyId);

      const newTenant = {
        id: `usr-tenant-${Date.now()}`,
        name: tenantName.trim(),
        email: tenantEmail.trim(),
        propertyId: isPreAdd ? undefined : selectedPropertyId,
        propertyName: isPreAdd ? 'Unassigned' : targetProperty?.name || 'Property',
        unitId: isPreAdd ? undefined : selectedUnitId,
        unitLabel: isPreAdd ? 'Unassigned' : targetUnit?.label || 'Unit',
        monthlyRent: isPreAdd ? 0 : Number(monthlyRent) || targetUnit?.monthlyRent || 0,
        leaseStart: isPreAdd ? undefined : leaseStart,
        leaseEnd: isPreAdd ? undefined : leaseEnd || undefined,
        status: isPreAdd ? 'pre_added' : 'active',
        tempPassword,
      };

      setSuccessData({
        tenant: newTenant,
        tempPassword,
      });
    }, 1200);
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative w-full max-w-lg bg-[#0F0F1A] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Close add tenant dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        {!successData ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-grotesk text-white">Add Tenant Account</h2>
                <p className="text-xs text-slate-400">Fill out tenant information and assign unit lease details.</p>
              </div>
            </div>

            {/* Mock Conflict Banner */}
            {conflictError && (
              <div role="alert" className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-amber-200">Unit conflict alert</strong>
                  <span>{conflictError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Tenant Full Name */}
              <div>
                <label htmlFor="tenant-name" className="text-xs font-semibold text-slate-300 mb-1 block">
                  Tenant full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="tenant-name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={tenantName}
                    onChange={(e) => handleTextChange('tenantName', e.target.value)}
                    onBlur={() => handleBlur('tenantName')}
                    placeholder="e.g. Sophia Lin"
                    className={`w-full bg-slate-900 border ${
                      touched.tenantName && errors.tenantName
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500'
                    } rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {touched.tenantName && errors.tenantName && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.tenantName}</span>
                  </p>
                )}
              </div>

              {/* Tenant Email */}
              <div>
                <label htmlFor="tenant-email" className="text-xs font-semibold text-slate-300 mb-1 block">
                  Tenant email address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="tenant-email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={tenantEmail}
                    onChange={(e) => handleTextChange('tenantEmail', e.target.value)}
                    onBlur={() => handleBlur('tenantEmail')}
                    placeholder="tenant@example.com"
                    className={`w-full bg-slate-900 border ${
                      touched.tenantEmail && errors.tenantEmail
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500'
                    } rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all`}
                  />
                </div>
                {touched.tenantEmail && errors.tenantEmail && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.tenantEmail}</span>
                  </p>
                )}
              </div>

              {/* Dependent Dropdown: Property -> Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Property Dropdown */}
                <div>
                  <label htmlFor="tenant-property" className="text-xs font-semibold text-slate-300 mb-1 block">
                    Property
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <select
                      id="tenant-property"
                      value={selectedPropertyId}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                      disabled={isSubmitting || Boolean(initialPropertyId)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none disabled:opacity-60"
                    >
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vacant Unit Dropdown with Pre-Add Option */}
                <div>
                  <label htmlFor="tenant-unit" className="text-xs font-semibold text-slate-300 mb-1 block">
                    Unit assignment
                  </label>
                  <select
                    id="tenant-unit"
                    value={isPreAdd ? 'pre_add_unassigned' : selectedUnitId}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    onBlur={() => handleBlur('unit')}
                    disabled={isSubmitting || Boolean(initialUnitId)}
                    className={`w-full bg-slate-900 border ${
                      touched.unit && errors.unit ? 'border-rose-500' : 'border-slate-700/80'
                    } rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60`}
                  >
                    <option value="">Select vacant unit...</option>
                    {vacantUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label} (${u.monthlyRent}/mo)
                      </option>
                    ))}
                    <option value="pre_add_unassigned">&mdash; Unassigned (Pre-add tenant) &mdash;</option>
                  </select>
                  {touched.unit && errors.unit && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.unit}</p>
                  )}
                </div>

              </div>

              {/* Pre-Add Notice */}
              {isPreAdd && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Pre-adding tenant without immediate unit assignment. You can assign a unit later.</span>
                </div>
              )}

              {/* Monthly Rent & Lease Start Date */}
              {!isPreAdd && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Monthly Rent (Editable, pre-filled) */}
                    <div>
                      <label htmlFor="tenant-rent" className="text-xs font-semibold text-slate-300 mb-1 block">
                        Monthly rent ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          id="tenant-rent"
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(e.target.value)}
                          placeholder="e.g. 2400"
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Lease Start Date */}
                    <div>
                      <label htmlFor="tenant-start" className="text-xs font-semibold text-slate-300 mb-1 block">
                        Lease start date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          id="tenant-start"
                          type="date"
                          required
                          value={leaseStart}
                          onChange={(e) => setLeaseStart(e.target.value)}
                          onBlur={() => handleBlur('leaseStart')}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      {touched.leaseStart && errors.leaseStart && (
                        <p className="text-[11px] text-rose-400 mt-1">{errors.leaseStart}</p>
                      )}
                    </div>

                  </div>

                  {/* Lease End Date (Optional) */}
                  <div>
                    <label htmlFor="tenant-end" className="text-xs font-semibold text-slate-300 mb-1 block">
                      Lease end date <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        id="tenant-end"
                        type="date"
                        value={leaseEnd}
                        onChange={(e) => setLeaseEnd(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}



              {/* Form Action */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold font-grotesk shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating tenant account...</span>
                    </>
                  ) : (
                    <span>Add tenant account</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* SUCCESS MODAL: Temp Password Generator Feedback */
          <div className="text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold font-grotesk text-white">Tenant Account Created!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Account created for <strong className="text-white">{successData.tenant.name}</strong> ({successData.tenant.email}).
            </p>

            {/* Generated Temporary Password Display */}
            <div className="my-6 p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-left relative">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Generated Temporary Password
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-lg font-bold">
                  <Key className="w-4 h-4 text-indigo-400" />
                  <span>{successData.tempPassword}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-amber-400 mt-3 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Share this with your tenant &mdash; it won't be shown again.</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:scale-98 transition-all"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
