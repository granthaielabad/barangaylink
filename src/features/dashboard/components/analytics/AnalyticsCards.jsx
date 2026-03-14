import { PiUsersThree } from 'react-icons/pi';
import { FiHome } from 'react-icons/fi';
import { FaRegAddressCard } from 'react-icons/fa';
import { IoStatsChartOutline } from 'react-icons/io5';

// ── Real data passed in via `analyticsData` prop ──────────────
// Falls back to '—' while loading. Growth rate has no DB source
// yet so it stays derived from the year filter the same way the
// original code did.
const getCardData = (filters, analyticsData) => {
  const year       = parseInt(filters?.year || new Date().getFullYear(), 10);
  const yearOffset = year - new Date().getFullYear();

  // Use real DB counts when available, otherwise show '—'
  const residents  = analyticsData?.totals.residents  ?? null;
  const households = analyticsData?.totals.households ?? null;
  const ids        = analyticsData?.totals.eids       ?? null;
  const growthRate = yearOffset > 0
    ? `+${(2.3 + yearOffset * 0.2).toFixed(1)}%`
    : `+${Math.max(0, 2.3 + yearOffset * 0.2).toFixed(1)}%`;

  return [
    {
      label: 'Total Residents',
      value: residents !== null ? residents.toLocaleString() : '—',
      icon: PiUsersThree,
    },
    {
      label: 'Total Households',
      value: households !== null ? households.toLocaleString() : '—',
      icon: FiHome,
    },
    {
      label: 'Total Brgy IDs Issued',
      value: ids !== null ? ids.toLocaleString() : '—',
      icon: FaRegAddressCard,
    },
    {
      label: 'Population Growth Rate',
      value: growthRate,
      icon: IoStatsChartOutline,
    },
  ];
};

export default function AnalyticsCards({ filters, analyticsData }) {
  const cards = getCardData(filters, analyticsData);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center text-[#005F02] shrink-0">
                <Icon className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-base font-medium text-gray-600">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{card.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}