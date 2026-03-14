import { ActionDropdown } from '../../../../shared';
import { HiPencilSquare } from 'react-icons/hi2';
import { FaRegTrashAlt } from "react-icons/fa";
import { RiUserMinusLine } from "react-icons/ri";

export default function ResidentTable({ residents = [], onEditResident, onArchiveResident, onDeleteResident }) {
    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-base relative">
                <thead>
                    <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
                        <th className="py-3 px-4 font-semibold">Resident No.</th>
                        <th className="py-3 px-4 font-semibold">Name</th>
                        <th className="py-3 px-4 font-semibold">Address</th>
                        <th className="py-3 px-4 font-semibold">Sex</th>
                        <th className="py-3 px-4 font-semibold">Birthdate</th>
                        <th className="py-3 px-4 font-semibold">Contact No.</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {residents.map((resident, idx) => (
                        <tr
                            key={resident.id ?? idx}
                            className={`border-b border-gray-100 border-l border-r last:border-b-0 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                                } hover:bg-gray-50/80 transition-colors`}
                        >
                            <td className="py-3 px-4 text-gray-800">{resident.residentNo}</td>
                            <td className="py-3 px-4 text-gray-800">{resident.name}</td>
                            <td className="py-3 px-4 text-gray-800">{resident.address}</td>
                            <td className="py-3 px-4 text-gray-800">{resident.gender}</td>
                            <td className="py-3 px-4 text-gray-800">{resident.birthdate}</td>
                            <td className="py-3 px-4 text-gray-800">{resident.contactNo}</td>
                            <td className="py-3 px-4">
                                <span
                                    className={`inline-block px-4 py-1 rounded-lg text-xs font-medium ${resident.status === 'Active'
                                        ? 'bg-emerald-100 px-5 text-emerald-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {resident.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 relative">
                                <ActionDropdown
                                    actions={[
                                        {
                                            icon: HiPencilSquare,
                                            label: 'Edit',
                                            onClick: () => onEditResident?.(resident)
                                        },
                                        {
                                            icon: RiUserMinusLine,
                                            label: 'Archive Resident',
                                            onClick: () => onArchiveResident?.(resident)
                                        },
                                        {
                                            icon: FaRegTrashAlt,
                                            label: 'Delete Resident',
                                            onClick: () => onDeleteResident?.(resident),
                                            className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                        }
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
