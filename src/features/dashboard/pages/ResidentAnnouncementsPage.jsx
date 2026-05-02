import { useState } from 'react';
import { useCommunityAnnouncements } from '../../../hooks/queries/announcements/useAnnouncements';
import { SearchBox, SortFilter, OrderFilter, StatusFilter } from '../../../shared';
import { FiMessageSquare, FiCalendar, FiUser, FiAlertCircle } from 'react-icons/fi';

export default function ResidentAnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  
  const { data: announcements = [], isLoading, error } = useCommunityAnnouncements();

  // ── Role-based Filter: Residents only see 'residents' or null (general) audience ──
  const residentViewAnnouncements = announcements.filter(
    a => a.audience === 'residents' || !a.audience
  );

  // ── Categories for Filter ──
  const categories = ['all', ...new Set(residentViewAnnouncements.map(a => a.category).filter(Boolean))];
  const categoryOptions = categories.map(c => ({
    label: c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1),
    value: c
  }));

  // ── Filtering Logic ──
  const filtered = residentViewAnnouncements.filter(a => {
    const matchesSearch = 
      a.title?.toLowerCase().includes(search.toLowerCase()) || 
      a.content?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || a.category === category;
    return matchesSearch && matchesCategory;
  });

  // ── Sorting Logic ──
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'created_at') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else {
      valA = String(valA ?? '').toLowerCase();
      valB = String(valB ?? '').toLowerCase();
    }

    if (order === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
        <p className="text-red-500">Failed to load community announcements.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 w-full max-w-8xl mx-auto min-w-0">
      <h1 className="mb-6 sm:mb-10 font-semibold text-xl sm:text-[25px] text-gray-900">Announcements</h1>

      {/* ── Search & Filters (Matching Admin Style) ── */}
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 w-full min-w-0">
        <div className="w-full min-w-0">
          <SearchBox
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search announcements..."
          />
        </div>
        <div className="flex flex-wrap items-stretch gap-2 w-full">
          <div className="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:flex-initial sm:basis-auto sm:min-w-[10rem] [&>div]:block [&>div]:w-full [&_button]:w-full sm:[&_button]:w-auto">
            <StatusFilter 
              value={category} 
              onChange={setCategory} 
              options={categoryOptions} 
            />
          </div>
          <div className="min-w-0 flex-1 basis-[calc(50%-0.25rem)] sm:flex-initial sm:basis-auto sm:min-w-[8rem] [&>div]:block [&>div]:w-full [&_button]:w-full sm:[&_button]:w-auto">
            <SortFilter 
              value={sortBy} 
              onChange={setSortBy} 
              options={[
                { label: 'Date', value: 'created_at' },
                { label: 'Title', value: 'title' },
                { label: 'Category', value: 'category' }
              ]} 
            />
          </div>
          <div className="min-w-0 flex-1 basis-full sm:flex-initial sm:basis-auto sm:min-w-[9rem] [&>div]:block [&>div]:w-full">
            <OrderFilter 
              value={order} 
              onChange={setOrder} 
            />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse h-40"></div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiMessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No announcements found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sorted.map((ann) => (
            <div key={ann.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow min-w-0">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-md border border-emerald-100">
                      {ann.category}
                    </span>
                    {ann.priority === 'urgent' && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-md border border-red-100">
                        <FiAlertCircle className="w-3 h-3 shrink-0" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-4 sm:gap-y-1 text-[11px] sm:text-[12px] text-gray-400 sm:items-center sm:justify-end sm:text-right shrink-0 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-snug">{new Date(ann.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </span>
                    {ann.announcer_name ? (
                      <span className="flex items-start sm:justify-end gap-1.5 min-w-0">
                        <FiUser className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-snug break-words">{ann.announcer_name}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
                
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 break-words">{ann.title}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm sm:text-base break-words">
                  {ann.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


