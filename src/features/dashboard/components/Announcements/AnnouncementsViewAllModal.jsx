import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX, FiMessageSquare, FiAlertCircle, FiCalendar, FiUser,
} from 'react-icons/fi';
import { SearchBox } from '../../../../shared';

const PREVIEW_LIMIT = 4;

export { PREVIEW_LIMIT };

/**
 * Full-screen-style overlay listing community announcements for staff dashboard.
 * Search + category chips; full body text (no line-clamp).
 */
export default function AnnouncementsViewAllModal({ isOpen, onClose, announcements = [] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categoryOptions = useMemo(() => {
    const cats = [...new Set(announcements.map((a) => a.category).filter(Boolean))];
    return ['all', ...cats];
  }, [announcements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter((a) => {
      const matchCat = category === 'all' || a.category === category;
      const matchQ =
        !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [announcements, search, category]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setCategory('all');
    }
  }, [isOpen]);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close announcements"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcements-modal-title"
        className="relative flex h-[min(680px,88vh)] w-full max-w-2xl max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#F1F7F2] to-white px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8C0B1A]/10 text-[#8C0B1A]">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="announcements-modal-title" className="text-lg font-bold text-gray-900 truncate">
                All announcements
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {announcements.length} {announcements.length === 1 ? 'item' : 'items'} · Community feed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex min-h-[6.75rem] shrink-0 flex-col justify-center space-y-3 border-b border-gray-100 bg-white px-6 pt-4 pb-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search title or body…" />
          <div className="min-h-[2.375rem]">
            {categoryOptions.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((c) => {
                  const label = c === 'all' ? 'All' : String(c).charAt(0).toUpperCase() + String(c).slice(1);
                  const active = category === c;
                  return (
                    <button
                      key={c || 'uncat'}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={
                        `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ` +
                        (active
                          ? 'bg-[#8C0B1A] text-white border-[#8C0B1A]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100')
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div aria-hidden="true" className="pointer-events-none" />
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#FAFAFA]">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
              <FiMessageSquare className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-600">No announcements match</p>
              <p className="text-xs text-gray-400 mt-1">Try another search or category.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((ann) => (
                <li
                  key={ann.id}
                  className={
                    `rounded-xl border bg-white p-4 shadow-sm ` +
                    (ann.priority === 'urgent' ? 'border-red-100' : 'border-gray-100')
                  }
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {ann.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                        <FiAlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                    <span className="inline-flex rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                      {ann.category || 'General'}
                    </span>
                    {ann.audience && (
                      <span className="inline-flex rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600">
                        {ann.audience}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatDate(ann.created_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{ann.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                  {ann.announcer_name && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                      <FiUser className="w-3.5 h-3.5 shrink-0" />
                      <span>{ann.announcer_name}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-white px-6 py-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
