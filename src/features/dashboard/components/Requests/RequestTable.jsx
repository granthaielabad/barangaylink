import { ActionDropdown } from '../../../../shared';
import { FiEye } from 'react-icons/fi';

export default function RequestTable({ requests = [], onViewRequest }) {
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':    return 'bg-[#F4E2B8] text-[#C2410C] border-[#F4E2B8]';
      case 'processing': return 'bg-[#DDF3DD] text-[#1838B8] border-[#DDF3DD]';
      case 'approved':   return 'bg-[#BFE8BF] text-[#005F02] border-[#BBF7D0]';
      case 'rejected':   return 'bg-[#FEE2E2] text-[#DC2626] border-[#FEE2E2]';
      default:           return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[1000px] text-base relative border-separate border-spacing-0">
        <thead>
          <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
            <th className="py-4 px-4 font-semibold first:rounded-tl-lg">Request No.</th>
            <th className="py-4 px-4 font-semibold">Resident Name</th>
            <th className="py-4 px-4 font-semibold">Certificate Type</th>
            <th className="py-4 px-4 font-semibold">Date Requested</th>
            <th className="py-4 px-4 font-semibold text-center">Status</th>
            <th className="py-4 px-4 font-semibold">Fee</th>
            <th className="py-4 px-4 font-semibold text-center last:rounded-tr-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr
              key={req.id ?? idx}
              className={`border-b border-gray-100 border-l border-r last:border-b last:rounded-b-lg ${
                idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-50/80 transition-colors`}
            >
              <td className="py-4 px-4 text-gray-800 text-sm">{req.id}</td>
              <td className="py-4 px-4 text-gray-800 font-medium text-sm">{req.name}</td>
              <td className="py-4 px-4 text-gray-800 text-sm">{req.type}</td>
              <td className="py-4 px-4 text-gray-800 text-sm">{req.date}</td>
              <td className="py-4 px-4 text-center">
                <span className={`inline-block px-4 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(req.status)}`}>
                  {req.status}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-800 font-semibold text-sm">{req.fee}</td>
              <td className="py-4 px-4 text-center relative">
                <button
                  type="button"
                  onClick={() => onViewRequest?.(req)}
                  className="px-4 py-1.5 text-sm font-semibold text-[#005F02] border border-[#005F02] rounded-lg hover:bg-[#F0FDF4] transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
