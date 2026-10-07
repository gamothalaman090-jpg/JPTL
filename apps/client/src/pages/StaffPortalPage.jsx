import React, { useEffect, useState } from 'react';
import { Building2, Megaphone, DollarSign, Wrench, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { staffApi, landlordApi } from '../services/api';
import { PaymentsTab } from '../components/dashboard/PaymentsTab';
import { TicketsTab } from '../components/dashboard/TicketsTab';
import { AnnouncementsTab } from '../components/dashboard/AnnouncementsTab';
import { NewTicketModal } from '../components/dashboard/NewTicketModal';
import { NewAnnouncementModal } from '../components/dashboard/NewAnnouncementModal';

const STAFF_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'payments', label: 'Rent Roll', Icon: DollarSign },
  { id: 'maintenance', label: 'Maintenance', Icon: Wrench },
  { id: 'announcements', label: 'Announcements', Icon: Megaphone },
];

export const StaffPortalPage = ({ onNavigate = () => {} }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboard, setDashboard] = useState({ payments: [], tickets: [], announcements: [], properties: [], units: [], dashboard: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refresh = async () => {
    const response = await staffApi.getDashboard();
    setDashboard((current) => ({ ...current, ...(response.data || {}) }));
  };

  useEffect(() => {
    let active = true;
    staffApi.getDashboard().then((response) => {
      if (active) setDashboard((current) => ({ ...current, ...(response.data || {}) }));
    }).catch((requestError) => {
      if (active) setError(requestError.message || 'Could not load staff workspace.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const createAnnouncement = async (draft) => {
    try {
      const response = await landlordApi.createAnnouncement({
        title: draft.title,
        content: draft.body || draft.content,
        category: draft.category,
        isPinned: false,
      });
      const created = response.data || response;
      setDashboard((current) => ({ ...current, announcements: [created, ...current.announcements] }));
    } catch (requestError) {
      setError(requestError.message || 'Could not post announcement.');
    }
  };

  const handleTicketCreated = (ticket) => setDashboard((current) => ({ ...current, tickets: [ticket, ...current.tickets] }));
  const updateTicketStatus = async (id, status) => {
    try { await landlordApi.updateTicketStatus(id, status); }
    catch (requestError) { setError(requestError.message || 'Could not update maintenance request.'); }
  };
  const deleteTicket = async (id) => {
    try { await landlordApi.deleteTicket(id); setDashboard((current) => ({ ...current, tickets: current.tickets.filter((ticket) => (ticket.id || ticket._id) !== id) })); }
    catch (requestError) { setError(requestError.message || 'Could not remove maintenance request.'); }
  };
  const assignTechnician = async (id, data) => {
    try { await landlordApi.assignTechnician(id, data); }
    catch (requestError) { setError(requestError.message || 'Could not assign technician.'); }
  };

  const activeItem = STAFF_SECTIONS.find((item) => item.id === activeSection);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050811] dark:text-slate-100 md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0B0E19] md:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5 dark:border-slate-800"><Building2 size={20} className="text-indigo-500" /><strong>JPTL<span className="text-indigo-500">.STAFF</span></strong></div>
        <nav className="flex-1 space-y-1 p-3">{STAFF_SECTIONS.map(({ id, label, Icon }) => <button key={id} onClick={() => setActiveSection(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${activeSection === id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}><Icon size={17} />{label}</button>)}</nav>
        <button onClick={() => { logout(); onNavigate('/login'); }} className="m-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><LogOut size={17} />Log out</button>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#0B0E19] md:px-7">
          <div className="flex items-center gap-3"><button className="md:hidden" aria-label="Open staff menu" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button><div><p className="text-xs text-slate-500">Staff Workspace</p><h1 className="font-bold">{activeItem?.label}</h1></div></div>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-slate-500 sm:inline">{user?.firstName} {user?.lastName}</span><button onClick={() => { logout(); onNavigate('/login'); }} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs dark:border-slate-700"><LogOut size={15} />Log out</button></div>
        </header>
        {mobileMenuOpen && <nav className="space-y-1 border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0B0E19] md:hidden">{STAFF_SECTIONS.map(({ id, label, Icon }) => <button key={id} onClick={() => { setActiveSection(id); setMobileMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm"><Icon size={16} />{label}</button>)}</nav>}
        <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-7">
          {error && <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          {loading ? <div className="rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-800">Loading staff workspace…</div> : <>
            {activeSection === 'dashboard' && <StaffDashboard data={dashboard.dashboard} />}
            {activeSection === 'payments' && <PaymentsTab payments={dashboard.payments} />}
            {activeSection === 'maintenance' && <TicketsTab tickets={dashboard.tickets} onOpenNewTicket={() => setIsTicketOpen(true)} onUpdateStatus={updateTicketStatus} onDeleteTicket={deleteTicket} onAssignTechnician={assignTechnician} />}
            {activeSection === 'announcements' && <AnnouncementsTab announcements={dashboard.announcements} onOpenNewAnnouncement={() => setIsAnnouncementOpen(true)} />}
          </>}
        </div>
      </main>

      <NewTicketModal isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} properties={dashboard.properties} units={dashboard.units} onTicketCreated={handleTicketCreated} />
      <NewAnnouncementModal isOpen={isAnnouncementOpen} onClose={() => setIsAnnouncementOpen(false)} onAnnouncementCreated={createAnnouncement} />
    </div>
  );
};

function StaffDashboard({ data }) {
  const kpi = data?.kpi || {};
  const cards = [
    ['Properties', kpi.totalProperties ?? 0],
    ['Units', kpi.totalUnits ?? 0],
    ['Occupied', kpi.occupiedUnits ?? 0],
    ['Open maintenance', kpi.pendingTickets ?? 0],
  ];
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Portfolio overview</h2>
        <p className="mt-1 text-sm text-slate-500">Property and maintenance activity for your landlord’s portfolio.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0B0E19]"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0B0E19]">
        <h3 className="font-bold">Properties</h3>
        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {(data?.propertyBreakdown || []).map((property) => <div key={property.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{property.name}</p><p className="text-xs text-slate-500">{property.address}{property.city ? ` · ${property.city}` : ''}</p></div><p className="text-slate-500">{property.occupiedUnits}/{property.totalUnits} occupied · {property.occupancyRate}%</p></div>)}
          {!data?.propertyBreakdown?.length && <p className="py-4 text-sm text-slate-500">No properties to show.</p>}
        </div>
      </div>
    </section>
  );
}
