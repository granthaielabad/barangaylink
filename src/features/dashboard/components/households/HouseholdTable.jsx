import { ActionDropdown } from '../../../../shared';
import { HiPencilSquare } from 'react-icons/hi2';
import { FaRegTrashAlt } from 'react-icons/fa';
import { RiUserMinusLine } from 'react-icons/ri';

export default function HouseholdTable({ households = [], onEditHousehold, onArchiveHousehold, onDeleteHousehold }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[600px] text-base relative">
        <thead>
          <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold">Household No.</th>
            <th className="py-3 px-4 font-semibold">Head Member Name</th>
            <th className="py-3 px-4 font-semibold">Address</th>
            <th className="py-3 px-4 font-semibold">Members</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {households.map((household, idx) => (
            <tr
              key={household.id ?? idx}
              className={`border-b border-gray-100 border-l border-r last:border-b-0 ${
                idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-50/80 transition-colors`}
            >
              <td className="py-3 px-4 text-gray-800">{household.householdNo}</td>
              <td className="py-3 px-4 text-gray-800">{household.headMemberName}</td>
              <td className="py-3 px-4 text-gray-800">{household.address}</td>
              <td className="py-3 px-4 text-gray-800">{household.members}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-4 py-1 rounded-lg text-xs font-medium ${
                    household.status === 'Active'
                      ? 'bg-emerald-100 px-5 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {household.status}
                </span>
              </td>
              <td className="py-3 px-4 relative">
                <ActionDropdown
                  actions={[
                    {
                      icon: HiPencilSquare,
                      label: 'Edit',
                      onClick: () => onEditHousehold?.(household),
                    },
                    {
                      icon: RiUserMinusLine,
                      label: 'Archive Household',
                      onClick: () => onArchiveHousehold?.(household),
                    },
                    {
                      icon: FaRegTrashAlt,
                      label: 'Delete',
                      onClick: () => onDeleteHousehold?.(household),
                      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}