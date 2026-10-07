import React, { useState } from 'react';
import { PaymentsTab } from './PaymentsTab';
import { PaymentOptionsTab } from './PaymentOptionsTab';

export const LandlordPaymentsPage = ({ payments, searchQuery }) => {
  const [view, setView] = useState('rent');
  return <div className="space-y-5"><div className="flex gap-2"><button onClick={() => setView('rent')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${view === 'rent' ? 'bg-indigo-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}>Rent roll & review</button><button onClick={() => setView('options')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${view === 'options' ? 'bg-indigo-600 text-white' : 'border border-slate-200 dark:border-slate-800'}`}>Payment options</button></div>{view === 'rent' ? <PaymentsTab payments={payments} searchQuery={searchQuery} /> : <PaymentOptionsTab />}</div>;
};
