import React, { useState } from 'react';
import { User, Bell, Shield, Phone, Mail, Car, CheckCircle2, Plus, Trash2, ShieldAlert } from 'lucide-react';

const INITIAL_VEHICLES = [
  { id: 'veh-1', make: 'Tesla Model 3', color: 'Midnight Silver', plate: '7XYZ890', decal: 'DEC-8812' },
];

export const TenantSettingsTab = ({
  tenant,
  unit,
}) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [newMake, setNewMake] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [isAddingVeh, setIsAddingVeh] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
          <User className="w-3.5 h-3.5" />
          <span>Resident Profile</span>
        </div>
        <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">Account & Preferences</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage contact details, vehicle registrations, and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Contact Info Card */}
        <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> Resident Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={tenant?.name || 'Sophia Lin'}
                className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue={tenant?.email || 'sophia.lin@example.com'}
                className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue="+1 (555) 234-8901"
                className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Emergency Contact</label>
              <input
                type="text"
                defaultValue="David Lin (+1 555-901-4432) - Brother"
                className="w-full bg-slate-50 dark:bg-[#080B14] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <button
              type="button"
              onClick={() => setIsAddingVeh(true)}
              className="text-xs font-bold font-grotesk text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 btn-press"
            >
              <Plus className="w-3.5 h-3.5" /> Register Vehicle
            </button>
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

        {/* Notification Preferences */}
        <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 space-y-4">
          <h2 className="text-base font-bold font-grotesk text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Notifications & Alerts
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14]">
              <div>
                <strong className="text-slate-900 dark:text-white block">Email Rent Receipts & Maintenance Updates</strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Receive transaction confirmations and technician arrival notices.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#080B14]">
              <div>
                <strong className="text-slate-900 dark:text-white block">SMS Urgent Property Alerts</strong>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Instant SMS for water/power maintenance or package locker deliveries.</span>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 btn-press"
          >
            Save Changes
          </button>
        </div>

      </form>

    </div>
  );
};
