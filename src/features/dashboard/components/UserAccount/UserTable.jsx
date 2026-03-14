import { useState } from 'react';
import { ActionDropdown } from '../../../../shared';
import { FaRegTrashAlt } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";

const ROLE_OPTIONS = [
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Staff',       label: 'Staff' },
  { value: 'Resident',    label: 'Resident' },
];

export default function UserTable({
  users = [],
  onDeleteUser,
  onRoleChange,
  onToggleActive,
  canChangeRole = true,   // superadmin only — passed from UserAccount.jsx
  canDelete     = true,   // superadmin only — passed from UserAccount.jsx
}) {
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[650px] text-base relative">
        <thead>
          <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Email</th>
            <th className="py-3 px-4 font-semibold">Role</th>
            <th className="py-3 px-4 font-semibold">Access</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id ?? idx}
              className={`border-b border-gray-100 border-l border-r last:border-b-0 ${
                idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              } hover:bg-gray-50/80 transition-colors`}
            >
              <td className="py-3 px-4 text-gray-800">{user.name}</td>
              <td className="py-3 px-4 text-gray-800">{user.email}</td>

              {/* ── Role cell ── */}
              <td className="py-3 px-4 relative">
                {canChangeRole ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenRoleDropdown(openRoleDropdown === user.id ? null : user.id)
                      }
                      className="px-3 py-1.5 text-base flex items-start"
                    >
                      <span>{user.role}</span>
                      <RiArrowDropDownLine
                        className={`w-7 h-7 text-gray-500 transition-transform ${
                          openRoleDropdown === user.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openRoleDropdown === user.id && (
                      <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {ROLE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onRoleChange?.(user.id, option.value);
                              setOpenRoleDropdown(null);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
                              user.role === option.value
                                ? 'bg-green-50 text-green-700 font-medium'
                                : ''
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Staff view: role is read-only plain text
                  <span className="px-3 py-1.5 text-base text-gray-800 select-none">
                    {user.role}
                  </span>
                )}
              </td>

              <td className="py-3 px-4 text-gray-800">{user.access}</td>

              {/* ── Status cell ── */}
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-4 py-1 rounded-lg text-xs font-medium ${
                    user.status === 'Enabled'
                      ? 'bg-emerald-100 px-5 text-emerald-800'
                      : 'bg-gray-100 px-5 text-gray-800'
                  }`}
                >
                  {user.status}
                </span>
              </td>

              {/* ── Actions cell ── */}
              <td className="py-3 px-4 relative">
                {canDelete ? (
                  <ActionDropdown
                    actions={[
                      {
                        icon: FaRegTrashAlt,
                        label: 'Delete',
                        onClick: () => onDeleteUser?.(user),
                        className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                      },
                    ]}
                  />
                ) : (
                  // Staff view: no destructive actions available
                  <span className="text-xs text-gray-400 px-3">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}