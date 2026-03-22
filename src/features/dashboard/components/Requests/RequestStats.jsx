import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';
import { TbFileCertificate } from "react-icons/tb";

export default function RequestStats({ stats = {} }) {
  const items = [
    {
      label: 'Total Request',
      value: stats.total ?? 0,
      icon: TbFileCertificate,
      color: 'bg-white text-gray-900 border-gray-200',
      iconColor: 'bg-white text-gray-400',
    },
    {
      label: 'Pending',
      value: stats.pending ?? 0,
      icon: FiClock,
      color: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      iconColor: 'text-[#F59E0B]',
    },
    {
      label: 'Processing',
      value: stats.processing ?? 0,
      icon: FiClock,
      color: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
      iconColor: 'text-[#3B82F6]',
    },
    {
      label: 'Approved',
      value: stats.approved ?? 0,
      icon: FiCheckCircle,
      color: 'bg-[#F0FDF4] text-[#16A34A] border-[#4ADE80]',
      iconColor: 'text-[#22C55E]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 mb-8">
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex items-center justify-between p-8 rounded-xl border shadow-sm ${item.color}`}
        >
          <div className="space-y-2">
            <p className="text-[16px] font-semibold uppercase tracking-wider opacity-60">
              {item.label}
            </p>
            <p className="text-3gxl font-bold tracking-tight">{item.value}</p>
          </div>
          <div className="shrink-0">
            <item.icon className={`w-10 h-10 ${item.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
