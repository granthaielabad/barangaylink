import { useCommunityAnnouncements } from '../../../../hooks/queries/announcements/useAnnouncements';
import { FiAlertCircle, FiInfo, FiMessageSquare } from 'react-icons/fi';

export default function AnnouncementsWidget() {
  const { data: announcements = [], isLoading, error } = useCommunityAnnouncements();
  const formatDate = (value) =>
    new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 border-r-6 border-r-[#8C0B1A] shadow-sm animate-pulse h-full min-h-[360px]">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 border-r-6 border-r-[#8C0B1A] shadow-sm h-full min-h-[360px]">
        <p className="text-sm text-red-500">Failed to load community announcements.</p>
      </div>
    );
  }

  // Only show latest 5 for officials or null audience
  const officialAnnouncements = announcements.filter(
    a => a.audience === 'officials' || !a.audience
  );
  const latestAnnouncements = officialAnnouncements;

  return (
    <div className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#8C0B1A] shadow-sm flex flex-col h-full min-h-[360px] overflow-hidden p-6">
      <div className="px-0 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
      </div>

      <div className="pt-4">
        {latestAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FiInfo className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No active announcements.</p>
          </div>
        ) : (
          <div className="space-y-2 min-h-[400px] max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {latestAnnouncements.map((ann) => (
              <div 
                key={ann.id} 
                className={`rounded-lg border bg-white px-3 py-2.5 transition-colors ${
                  ann.priority === 'urgent'
                    ? 'border-red-100 hover:bg-red-50/40'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="pt-0.5">
                    {ann.priority === 'urgent' ? (
                      <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <FiMessageSquare className="w-4 h-4 text-[#8C0B1A] shrink-0" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {ann.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatDate(ann.created_at)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-1 mt-1 leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                        {ann.category || 'General'}
                      </span>
                      {ann.audience && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded capitalize">
                          {ann.audience}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {latestAnnouncements.length > 4 && (
        <div className="pt-3 border-t border-gray-50 bg-gray-50/50 text-center">
          <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View All Announcements
          </button>
        </div>
      )}
    </div>
  );
}


