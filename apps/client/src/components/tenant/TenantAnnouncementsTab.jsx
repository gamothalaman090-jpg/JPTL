import React, { useState } from 'react';
import { Megaphone, Pin, Calendar, User, Search } from 'lucide-react';

export const TenantAnnouncementsTab = ({
  announcements = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = (announcements || []).filter((a) => {
    const title = (a.title || '').toLowerCase();
    const content = (a.body || a.content || '').toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      content.includes(searchQuery.toLowerCase());
    if (categoryFilter !== 'all' && a.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Resident Broadcasts</span>
        </div>
        <h1 className="text-2xl font-extrabold font-grotesk text-slate-900 dark:text-white mt-1">Community Notices & Alerts</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Official property updates, amenity schedules, and maintenance notices from property management.</p>
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
            placeholder="Search notices..."
            className="w-full bg-white dark:bg-[#10131F] border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl apple-glass top-shade border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono">
            No notices match the search criteria.
          </div>
        ) : (
          filtered.map((a) => (
            <div
              key={a.id}
              className={`p-6 rounded-3xl apple-glass top-shade border transition-all space-y-3 ${
                a.isPinned
                  ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent'
                  : 'border-slate-200 dark:border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {a.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> {
                      typeof a.author === 'object' && a.author !== null
                        ? ([a.author.firstName, a.author.lastName].filter(Boolean).join(' ') || a.author.name || 'Management')
                        : (a.author || 'Management')
                    }
                  </span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent')}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold font-grotesk text-slate-900 dark:text-white">{a.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">{a.body}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
