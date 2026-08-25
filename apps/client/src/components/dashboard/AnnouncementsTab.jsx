import React, { useState } from 'react';
import { Megaphone, Plus, Pin, Calendar, Tag, User, Search, Sparkles } from 'lucide-react';

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'anc-101',
    title: 'Property Portal Upgrade & System Enhancements 🚀',
    body: 'We have deployed the new landlord dashboard system featuring real-time technician dispatches, automated rent roll receipts, and instant tenant placement.',
    category: 'System',
    isPinned: true,
    author: 'Alexander Vance',
    date: 'Aug 24, 2026',
  },
  {
    id: 'anc-102',
    title: 'Scheduled HVAC Inspection — Aura Sky Towers',
    body: 'Annual cooling tower freon checks will occur on Friday between 9:00 AM and 2:00 PM. Access to mechanical rooms will be required.',
    category: 'Maintenance',
    isPinned: false,
    author: 'Alexander Vance',
    date: 'Aug 22, 2026',
  },
  {
    id: 'anc-103',
    title: 'Updated Digital Rent Receipt Policy',
    body: 'Starting September 1st, all rent receipts will be automatically issued upon Stripe transaction clearance. PDF statements can be downloaded anytime.',
    category: 'Policy',
    isPinned: false,
    author: 'Alexander Vance',
    date: 'Aug 18, 2026',
  },
];

export const AnnouncementsTab = ({ onOpenNewAnnouncement }) => {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase());
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>Broadcast Center</span>
          </div>
          <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white">Workspace Announcements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Post system broadcasts, maintenance updates, and policy notices for tenants and staff.</p>
        </div>

        <button
          type="button"
          onClick={onOpenNewAnnouncement}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-grotesk font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 btn-press shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          {['all', 'System', 'Maintenance', 'Policy', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-mono text-[11px] capitalize btn-press transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 apple-glass text-slate-500 dark:text-slate-400 text-xs font-mono">
            No announcements match the active filter or search query.
          </div>
        ) : (
          filteredAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`p-6 rounded-3xl apple-glass top-shade border transition-all space-y-3 ${
                a.isPinned
                  ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent'
                  : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned Broadcast
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {a.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> {a.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {a.date}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">
                {a.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {a.body}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
