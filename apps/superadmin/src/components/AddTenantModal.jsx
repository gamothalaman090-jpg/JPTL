import React, { useState, useEffect } from 'react';
import { X, UserCheck, Mail, Phone, Home, DollarSign, Calendar, Plus } from 'lucide-react';

export const AddTenantModal = ({ isOpen, onClose, targetLandlord, landlords = [], onAddTenant }) => {
  const [selectedLandlordId, setSelectedLandlordId] = useState(targetLandlord?.id || '');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyName: '',
    unitLabel: '',
    monthlyRent: '',
    leaseStart: new Date().toISOString().split('T')[0],
    leaseEnd: '',
  });

  useEffect(() => {
    if (targetLandlord) {
      setSelectedLandlordId(targetLandlord.id);
      if (targetLandlord.properties && targetLandlord.properties.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertyName: targetLandlord.properties[0].name,
        }));
      }
    } else if (landlords.length > 0) {
      setSelectedLandlordId(landlords[0].id);
      if (landlords[0].properties && landlords[0].properties.length > 0) {
        setFormData((prev) => ({
          ...prev,
          propertyName: landlords[0].properties[0].name,
        }));
      }
    }
  }, [targetLandlord, landlords, isOpen]);

  if (!isOpen) return null;

  const currentLandlord = landlords.find((l) => l.id === selectedLandlordId) || targetLandlord;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !selectedLandlordId) return;

    const newTenant = {
      id: `tnt-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+1 (555) 000-0000',
      propertyId: 'prop-custom',
      propertyName: formData.propertyName || 'Assigned Residence',
      unitLabel: formData.unitLabel || 'Unit 101',
      monthlyRent: Number(formData.monthlyRent) || 1800,
      leaseStart: formData.leaseStart,
      leaseEnd: formData.leaseEnd || '2027-08-31',
      status: 'active',
      paymentStatus: 'Paid (Current)',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    };

    onAddTenant(selectedLandlordId, newTenant);
    setFormData({
      name: '',
      email: '',
      phone: '',
      propertyName: '',
      unitLabel: '',
      monthlyRent: '',
      leaseStart: new Date().toISOString().split('T')[0],
      leaseEnd: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D111D] border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold font-grotesk text-white">Add Tenant under Landlord</h3>
              <p className="text-xs text-slate-400 font-mono">
                Assigned Landlord: <span className="text-emerald-400 font-bold">{currentLandlord?.name || 'Select Landlord'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Select Landlord dropdown if not target Landlord */}
          {!targetLandlord && (
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Target Landlord *</label>
              <select
                value={selectedLandlordId}
                onChange={(e) => setSelectedLandlordId(e.target.value)}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {landlords.map((lnd) => (
                  <option key={lnd.id} value={lnd.id}>
                    {lnd.name} ({lnd.company})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Tenant Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sophia Lin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Tenant Email *</label>
              <input
                type="email"
                required
                placeholder="sophia@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 901-2345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Property Name</label>
              <input
                type="text"
                placeholder="e.g. Aura Sky Towers"
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Unit Designation</label>
              <input
                type="text"
                placeholder="e.g. Unit 14B"
                value={formData.unitLabel}
                onChange={(e) => setFormData({ ...formData, unitLabel: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Monthly Rent ($ USD)</label>
              <input
                type="number"
                placeholder="2400"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Lease Start Date</label>
              <input
                type="date"
                value={formData.leaseStart}
                onChange={(e) => setFormData({ ...formData, leaseStart: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-bold">Lease End Date</label>
              <input
                type="date"
                value={formData.leaseEnd}
                onChange={(e) => setFormData({ ...formData, leaseEnd: e.target.value })}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 font-grotesk font-bold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
