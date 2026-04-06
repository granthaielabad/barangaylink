import { useCommunityAnnouncements } from '../../../../hooks/queries/announcements/useAnnouncements';
import { FiMessageSquare, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function AnnouncementsWidget() {
  const { data: announcements = [], isLoading, error } = useCommunityAnnouncements();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
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
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-sm text-red-500">Failed to load community announcements.</p>
      </div>
    );
  }

  // Only show latest 5 for officials or null audience
  const officialAnnouncements = announcements.filter(
    a => a.audience === 'officials' || !a.audience
  );
  const latestAnnouncements = officialAnnouncements.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 border-r-6 border-r-[#005F02] shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-5 py-1 border-b border-gray-100">
        <h2 className="text-[21px] font-semibold text-gray-900">Announcements</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {latestAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FiInfo className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No active announcements.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestAnnouncements.map((ann) => (
              <div 
                key={ann.id} 
                className="p-3 rounded-lg border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-emerald-700">
                    {ann.title}
                  </h4>
                  {ann.priority === 'urgent' && (
                    <FiAlertCircle className="text-red-500 w-3.5 h-3.5 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                  {ann.content}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {announcements.length > 5 && (
        <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
          <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View All Announcements
          </button>
        </div>
      )}
    </div>
  );
}
