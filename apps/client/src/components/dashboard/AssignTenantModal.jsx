import React, { useState, useEffect } from 'react';
import { X, Key, Building2, Home, Calendar, DollarSign, Clock, AlertCircle, CheckCircle2, Loader2, Sparkles, Car } from 'lucide-react';
import { landlordApi } from '../../services/api';
import { onlyDecimal, handleNumericKeyDown } from '../../utils/numberSanitizers';
import { useToast } from '../../context/ToastContext';

export const AssignTenantModal = ({
  isOpen,
  onClose,
  tenant = null,
  properties = [],
  units = [],
  onTenantAssigned = () => {},
}) => {
  const toast = useToast();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [leaseType, setLeaseType] = useState('fixed_term');
  const [durationMonths, setDurationMonths] = useState(12);

  // Parking state
  const [hasParking, setHasParking] = useState(false);
  const [parkingSpot, setParkingSpot] = useState('');
  const [parkingFee, setParkingFee] = useState('150');

  // Vehicle state
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper to add months to a date string YYYY-MM-DD
  const calculateEndDate = (startDateStr, months) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';
    date.setMonth(date.getMonth() + Number(months));
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen && tenant) {
      setError('');
      setIsSubmitting(false);

      // 1. Initial property
      const propId = tenant.propertyId || (properties.length > 0 ? (properties[0].id || properties[0]._id) : '');
      setSelectedPropertyId(propId);

      // 2. Initial unit
      setSelectedUnitId(tenant.unitId || '');

      // 3. Initial rent
      setMonthlyRent(tenant.monthlyRent ? String(tenant.monthlyRent) : '');

      // 4. Initial lease start & end
      const today = new Date().toISOString().split('T')[0];
      const start = tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().split('T')[0] : today;
      setLeaseStart(start);
      const initialLeaseType = tenant.leaseType || 'fixed_term';
      setLeaseType(initialLeaseType);

      // 5. Initial parking settings
      setHasParking(Boolean(tenant.hasParking));
      setParkingSpot(tenant.parkingSpot || '');
      setParkingFee(tenant.parkingFee !== undefined && tenant.parkingFee !== null ? String(tenant.parkingFee) : '150');

      // 6. Initial vehicle settings
      setHasVehicle(Boolean(tenant.hasVehicle || (tenant.vehicles && tenant.vehicles.length > 0)));
      setVehicleMake(tenant.vehicles?.[0]?.make || '');
      setVehiclePlate(tenant.vehicles?.[0]?.plate || '');

      if (initialLeaseType === 'indefinite') {
        setLeaseEnd('');
        setDurationMonths(12);
      } else if (tenant.leaseEnd) {
        const end = new Date(tenant.leaseEnd).toISOString().split('T')[0];
        setLeaseEnd(end);
        // Calculate duration
        const s = new Date(start);
        const e = new Date(end);
        const months = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24 * 30.44)));
        setDurationMonths(months);
      } else {
        setDurationMonths(12);
        setLeaseEnd(calculateEndDate(start, 12));
      }
    }
  }, [isOpen, tenant, properties]);

  if (!isOpen || !tenant) return null;

  // Filter vacant units for the selected property, plus currently assigned unit for this tenant
  const availableUnits = units.filter((u) => {
    const uPropId = u.propertyId || u.property;
    const matchesProp = !selectedPropertyId || uPropId === selectedPropertyId;
    const isCurrent = tenant.unitId && (u.id === tenant.unitId || u._id === tenant.unitId);
    return matchesProp && (u.status === 'vacant' || isCurrent);
  });

  const handlePropertyChange = (propId) => {
    setSelectedPropertyId(propId);
    setSelectedUnitId('');
    setError('');
  };

  const handleUnitChange = (uId) => {
    setSelectedUnitId(uId);
    setError('');
    const matchedUnit = units.find((u) => u.id === uId || u._id === uId);
    if (matchedUnit && matchedUnit.monthlyRent) {
      setMonthlyRent(String(matchedUnit.monthlyRent));
    }
  };

  const handleDurationPreset = (months) => {
    setDurationMonths(months);
    if (leaseType === 'fixed_term' && leaseStart) {
      setLeaseEnd(calculateEndDate(leaseStart, months));
    }
  };

  const handleLeaseTypeChange = (type) => {
    setLeaseType(type);
    if (type === 'indefinite') setLeaseEnd('');
    else setLeaseEnd(calculateEndDate(leaseStart, durationMonths));
  };

  const handleStartDateChange = (dateVal) => {
    setLeaseStart(dateVal);
    if (leaseType === 'fixed_term' && durationMonths && dateVal) {
      setLeaseEnd(calculateEndDate(dateVal, durationMonths));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPropertyId) {
      setError('Please select a property');
      return;
    }
    if (!selectedUnitId) {
      setError('Please select a unit to assign');
      return;
    }
    if (!leaseStart) {
      setError('Lease start date is required');
      return;
    }
    if (leaseType === 'fixed_term' && !leaseEnd) {
      setError('Lease expiration date is required');
      return;
    }
    if (leaseType === 'fixed_term' && new Date(leaseEnd) <= new Date(leaseStart)) {
      setError('Lease expiration date must be after the lease start date');
      return;
    }

    setIsSubmitting(true);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(tenant.id || tenant._id));
      const targetUnit = units.find((u) => u.id === selectedUnitId || u._id === selectedUnitId);
      const targetProp = properties.find((p) => p.id === selectedPropertyId || p._id === selectedPropertyId);

      let serverUpdated = null;

      if (isMongoId) {
        const res = await landlordApi.updateTenant(tenant.id || tenant._id, {
          email: tenant.email,
          firstName: tenant.firstName || tenant.name?.split(' ')[0],
          lastName: tenant.lastName || tenant.name?.split(' ').slice(1).join(' '),
          unitId: selectedUnitId,
          monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
          leaseStart,
          leaseType,
          leaseEnd: leaseType === 'indefinite' ? null : leaseEnd,
          hasParking,
          parkingSpot: hasParking ? parkingSpot : null,
          parkingFee: hasParking ? Number(parkingFee) || 0 : 0,
          hasVehicle,
          vehicles: hasVehicle && vehicleMake ? [{ make: vehicleMake.trim(), plate: vehiclePlate.trim(), color: 'Standard' }] : [],
          status: 'active',
        });
        serverUpdated = res.data;
      } else {
        // Fallback: If tenant was only stored in sessionStorage, create them on the server now
        try {
          const res = await landlordApi.createTenant({
            firstName: tenant.firstName || tenant.name?.split(' ')[0] || 'Resident',
            middleName: tenant.middleName || '',
            lastName: tenant.lastName || tenant.name?.split(' ').slice(1).join(' ') || 'Tenant',
            email: tenant.email,
            phone: tenant.phone || '',
            unitId: selectedUnitId,
            monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
            leaseStart,
            leaseType,
            leaseEnd: leaseType === 'indefinite' ? null : leaseEnd,
            hasParking,
            parkingSpot: hasParking ? parkingSpot : null,
            parkingFee: hasParking ? Number(parkingFee) || 0 : 0,
            hasVehicle,
            vehicles: hasVehicle && vehicleMake ? [{ make: vehicleMake.trim(), plate: vehiclePlate.trim(), color: 'Standard' }] : [],
            tempPassword: 'jptl2026',
          });
          serverUpdated = res.data;

          try {
            const rawStored = sessionStorage.getItem('jptl_onboarding_tenants');
            if (rawStored) {
              const parsed = JSON.parse(rawStored);
              const remaining = parsed.filter(
                (t) => String(t.id) !== String(tenant.id || tenant._id) && t.email !== tenant.email
              );
              sessionStorage.setItem('jptl_onboarding_tenants', JSON.stringify(remaining));
            }
          } catch (_) {}
        } catch (createErr) {
          console.warn('Fallback createTenant notice:', createErr.message);
        }
      }

      const finalTenant = {
        ...tenant,
        ...(serverUpdated || {}),
        id: serverUpdated?._id || serverUpdated?.id || tenant.id,
        propertyId: selectedPropertyId,
        propertyName: targetProp?.name || tenant.propertyName || 'Property',
        unitId: selectedUnitId,
        unitLabel: targetUnit?.label || 'Unit',
        monthlyRent: Number(monthlyRent) || targetUnit?.monthlyRent || 0,
        leaseStart,
        leaseType,
        leaseEnd: leaseType === 'indefinite' ? null : leaseEnd,
        hasParking,
        parkingSpot: hasParking ? parkingSpot : null,
        parkingFee: hasParking ? Number(parkingFee) || 0 : 0,
        status: 'active',
      };

      onTenantAssigned(finalTenant);
      toast.success(`Resident "${finalTenant.name || 'Tenant'}" assigned to ${finalTenant.unitLabel || 'Unit'} successfully!`);
      onClose();
    } catch (err) {
      console.error('Failed to assign tenant:', err);
      setError(err.response?.data?.message || err.message || 'Failed to assign tenant to unit');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">
              Assign Unit & Property
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign <strong className="text-slate-700 dark:text-slate-200">{tenant.name}</strong> ({tenant.email}) to a unit and configure the lease term.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Property Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Property *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <select
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {properties.map((p) => {
                  const pId = p.id || p._id;
                  return (
                    <option key={pId} value={pId}>
                      {p.name} {p.city ? `(${p.city})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Unit Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Select Vacant Unit *
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose a unit --</option>
                {availableUnits.map((u) => {
                  const uId = u.id || u._id;
                  const isCurrent = tenant.unitId && (u.id === tenant.unitId || u._id === tenant.unitId);
                  return (
                    <option key={uId} value={uId}>
                      {u.label} — ${u.monthlyRent}/mo {u.bedrooms ? `(${u.bedrooms} Bed, ${u.bathrooms} Bath)` : ''} {isCurrent ? '(Currently Assigned)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            {availableUnits.length === 0 && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> No vacant units available in this property.
              </p>
            )}
          </div>

          {/* Monthly Rent */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Agreed Monthly Rent ($) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                inputMode="decimal"
                value={monthlyRent}
                onKeyDown={(e) => handleNumericKeyDown(e, true)}
                onChange={(e) => setMonthlyRent(onlyDecimal(e.target.value))}
                placeholder="e.g. 2400"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Lease Type */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lease Type *</span>
            <div className="grid grid-cols-2 gap-2">
              {[['fixed_term', 'Fixed term'], ['indefinite', 'Indefinite']].map(([type, label]) => (
                <button key={type} type="button" onClick={() => handleLeaseTypeChange(type)} aria-pressed={leaseType === type} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${leaseType === type ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lease Duration Presets */}
          {leaseType === 'fixed_term' && <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Lease Duration Presets
              </label>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
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
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                    durationMonths === preset.months
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>}

          {/* Lease Dates */}
          <div className={leaseType === 'fixed_term' ? 'grid grid-cols-2 gap-3' : ''}>
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
            {leaseType === 'fixed_term' && <div>
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
            </div>}
          </div>

          {leaseType === 'indefinite' && <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
            <span className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Lease Term</span>
            <span className="mt-1 block font-semibold text-slate-900 dark:text-white">Starts {leaseStart ? new Date(`${leaseStart}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'when assigned'} · No fixed expiration date</span>
          </div>}

          {/* Expiration Summary Card */}
          {expirationPreview && (
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                  Lease Term & Expiration
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Expires on {expirationPreview.formatted} ({durationMonths} Mo Lease)
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                  expirationPreview.isExpired
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : expirationPreview.isExpiringSoon
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {expirationPreview.isExpired
                  ? 'Expired'
                  : `${expirationPreview.diffDays} days left`}
              </span>
            </div>
          )}

          {/* Tenant Vehicle Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasVehicle}
                  onChange={(e) => setHasVehicle(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-indigo-500" />
                  Tenant Has Vehicle
                </span>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                hasVehicle ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
              }`}>
                {hasVehicle ? 'Has Vehicle' : 'No Vehicle Yet'}
              </span>
            </label>
            {hasVehicle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Vehicle Make & Model</label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="e.g. Toyota Corolla (Silver)"
                    className="w-full bg-white dark:bg-[#0D111D] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">License Plate #</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="e.g. 7XYZ890"
                    className="w-full bg-white dark:bg-[#0D111D] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Assigned Parking Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Assign Parking Space (+ Monthly Fee)
                </span>
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                hasParking ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'text-slate-400'
              }`}>
                {hasParking ? 'Included' : 'None ($0/mo)'}
              </span>
            </label>

            {hasParking && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Parking Bay / Slot
                  </label>
                  <input
                    type="text"
                    value={parkingSpot}
                    onChange={(e) => setParkingSpot(e.target.value)}
                    placeholder="e.g. Bay #14B (L2)"
                    className="w-full bg-white dark:bg-[#0D111D] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Monthly Parking Fee ($)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={parkingFee}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => setParkingFee(onlyDecimal(e.target.value))}
                    placeholder="150"
                    className="w-full bg-white dark:bg-[#0D111D] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUnitId}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assigning Unit...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Assignment & Lease</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AssignTenantModal;
