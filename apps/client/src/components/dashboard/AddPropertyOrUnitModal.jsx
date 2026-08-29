import React, { useState, useEffect } from 'react';
import { X, Building2, Layers, DollarSign, Home, Check, AlertCircle, Plus, MapPin, Maximize2 } from 'lucide-react';

export const AddPropertyOrUnitModal = ({
  isOpen,
  onClose,
  initialTab = 'unit', // 'property' | 'unit'
  properties = [],
  targetMemberId = null,
  onPropertyCreated = () => {},
  onUnitCreated = () => {},
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Property Form State
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyCity, setPropertyCity] = useState('');
  const [propertyCategory, setPropertyCategory] = useState('Luxury');

  // Unit Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('2');
  const [sqft, setSqft] = useState('1000');

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrors({});
      setSuccessMessage('');
      
      // Reset forms
      setPropertyName('');
      setPropertyAddress('');
      setPropertyCity('');
      setPropertyCategory('Luxury');

      setUnitLabel('');
      setMonthlyRent('');
      setBedrooms('2');
      setBathrooms('2');
      setSqft('1000');

      if (properties.length > 0) {
        setSelectedPropertyId(properties[0].id);
      }
    }
  }, [isOpen, initialTab, properties]);

  if (!isOpen) return null;

  const handleCreateProperty = (e) => {
    e.preventDefault();
    const errs = {};
    if (!propertyName.trim()) errs.propertyName = 'Property name is required';
    if (!propertyAddress.trim()) errs.propertyAddress = 'Address is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newProp = {
      id: `prop-custom-${Date.now()}`,
      name: propertyName.trim(),
      address: propertyAddress.trim(),
      city: propertyCity.trim() || 'Metro Area',
      image: '/images/property-1.jpg',
      unitsCount: 0,
      occupancyRate: 0,
      landlordName: 'Alexander Vance',
      featured: false,
      category: propertyCategory,
    };

    onPropertyCreated(newProp);
    setSuccessMessage(`Property "${newProp.name}" created successfully!`);
    
    setTimeout(() => {
      setSuccessMessage('');
      // Switch tab to create unit for this new property
      setSelectedPropertyId(newProp.id);
      setActiveTab('unit');
    }, 800);
  };

  const handleCreateUnit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!unitLabel.trim()) errs.unitLabel = 'Unit name/label is required';
    if (!monthlyRent || Number(monthlyRent) <= 0) errs.monthlyRent = 'Valid monthly rent is required';
    if (!selectedPropertyId) errs.selectedPropertyId = 'Please select a property';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const matchedProperty = properties.find((p) => p.id === selectedPropertyId);

    const newUnit = {
      id: `unit-custom-${Date.now()}`,
      propertyId: selectedPropertyId,
      propertyName: matchedProperty?.name || 'Custom Property',
      label: unitLabel.trim(),
      monthlyRent: Number(monthlyRent),
      status: 'vacant',
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      sqft: Number(sqft) || 800,
    };

    onUnitCreated(newUnit, targetMemberId);
    setSuccessMessage(`Unit "${newUnit.label}" created and available!`);

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 800);
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
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Switcher Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            {activeTab === 'property' ? <Building2 className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-bold font-grotesk text-slate-900 dark:text-white">
              {activeTab === 'property' ? 'Add New Property' : 'Add New Unit'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'property'
                ? 'Create a new real estate building or estate'
                : 'Create a vacant unit to assign to a tenant'}
            </p>
          </div>
        </div>

        {/* Tabs Button Group */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#080B14] rounded-xl mb-5 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { setActiveTab('unit'); setErrors({}); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'unit'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Create Unit</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('property'); setErrors({}); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'property'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Create Property</span>
          </button>
        </div>

        {/* Success Feedback Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ──── TAB 1: CREATE PROPERTY ──── */}
        {activeTab === 'property' && (
          <form onSubmit={handleCreateProperty} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Property Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => { setPropertyName(e.target.value); setErrors((prev) => ({ ...prev, propertyName: '' })); }}
                  placeholder="e.g. Grand Horizon Towers"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.propertyName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.propertyName}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => { setPropertyAddress(e.target.value); setErrors((prev) => ({ ...prev, propertyAddress: '' })); }}
                  placeholder="e.g. 500 Ocean Avenue, Suite 100"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.propertyAddress && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.propertyAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={propertyCity}
                  onChange={(e) => setPropertyCity(e.target.value)}
                  placeholder="e.g. Downtown Metro"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Property Category
                </label>
                <select
                  value={propertyCategory}
                  onChange={(e) => setPropertyCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Residential">Residential</option>
                  <option value="Studio">Studio</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Property</span>
              </button>
            </div>
          </form>
        )}

        {/* ──── TAB 2: CREATE UNIT ──── */}
        {activeTab === 'unit' && (
          <form onSubmit={handleCreateUnit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Property *
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('property')}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add new property
                </button>
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <select
                  value={selectedPropertyId}
                  onChange={(e) => { setSelectedPropertyId(e.target.value); setErrors((prev) => ({ ...prev, selectedPropertyId: '' })); }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.selectedPropertyId && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.selectedPropertyId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Unit Label / Name *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={unitLabel}
                    onChange={(e) => { setUnitLabel(e.target.value); setErrors((prev) => ({ ...prev, unitLabel: '' })); }}
                    placeholder="e.g. Unit 24B or Suite 101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.unitLabel && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.unitLabel}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Monthly Rent ($) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => { setMonthlyRent(e.target.value); setErrors((prev) => ({ ...prev, monthlyRent: '' })); }}
                    placeholder="e.g. 2800"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.monthlyRent && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.monthlyRent}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Sq Ft
                </label>
                <div className="relative">
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl pl-8 pr-2 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-grotesk shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Unit</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
