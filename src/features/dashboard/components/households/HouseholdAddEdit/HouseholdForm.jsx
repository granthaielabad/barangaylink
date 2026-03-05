import { useState, useRef, useEffect } from 'react';
import { LuHouse } from 'react-icons/lu';
import { FaRegTrashCan } from 'react-icons/fa6';
import { RiArrowDropDownLine } from 'react-icons/ri';
import { MdCheck } from 'react-icons/md';
import { CiUser } from 'react-icons/ci';
import { FormSelect } from '../../../../../shared';
import { useActiveResidents } from '../../../../../hooks/queries/residents/useActiveResidents';
import {
  OWNERSHIP_TYPE_OPTIONS,
  DWELLING_TYPE_OPTIONS,
  HOUSEHOLD_STATUS_OPTIONS,
  BARANGAY,
} from '../../../../../core/constants';

const inputClass =
  'flex-1 px-4 py-2.5 bg-white focus:outline-none text-gray-900 text-base placeholder-gray-400';

const fieldClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

export default function HouseholdForm({ value = {}, onChange, householdId = null }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  // ── Head of Household dropdown ──────────────────────────────
  const { data: residentOptions = [], isLoading: residentsLoading } = useActiveResidents();
  const [showHeadDropdown, setShowHeadDropdown] = useState(false);
  const headDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (headDropdownRef.current && !headDropdownRef.current.contains(e.target)) {
        setShowHeadDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedHead = residentOptions.find((r) => r.value === value.headResidentId);

  // ── Member search ────────────────────────────────────────────
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const memberDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target)) {
        setShowMemberDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const members = value.members ?? [];

  // Filter: active residents not already in the member list and not the head
  const memberCandidates = residentOptions.filter(
    (r) =>
      !members.some((m) => m.id === r.value) &&
      r.value !== value.headResidentId &&
      r.label.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleAddMember = (resident) => {
    update('members', [...members, { id: resident.value, name: resident.label }]);
    setMemberSearch('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (residentId) => {
    update('members', members.filter((m) => m.id !== residentId));
  };

  return (
    <div className="space-y-6">

      {/* Household No. and Head Name */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Household No. */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Household No. <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 border-r border-gray-300 flex items-center justify-center text-[#005F02]">
              <LuHouse className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={value.houseNo ?? ''}
              onChange={(e) => update('houseNo', e.target.value)}
              placeholder="e.g. 12"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Head of Household */}
        <div className="flex-1" ref={headDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Head of Household <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeadDropdown((o) => !o)}
              className="w-full flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white"
            >
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300">
                <CiUser className="w-6 h-6" />
              </div>
              <span className="flex-1 text-left px-4 py-2.5 text-gray-700 truncate">
                {residentsLoading
                  ? 'Loading…'
                  : selectedHead?.label ?? 'Select Registered Resident'}
              </span>
              <RiArrowDropDownLine
                className={`w-7 h-7 text-gray-400 mr-2 transition-transform ${showHeadDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showHeadDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto">
                {residentOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No active residents found</div>
                ) : (
                  residentOptions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        update('headResidentId', r.value);
                        setShowHeadDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center justify-between"
                    >
                      {r.label}
                      {value.headResidentId === r.value && (
                        <MdCheck className="w-5 h-5 text-[#005F02] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Street + Barangay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r text-[#005F02] border-gray-300">
              <LuHouse className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={value.street ?? ''}
              onChange={(e) => update('street', e.target.value)}
              placeholder="e.g. Dahlia Avenue"
              className={inputClass}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
          <input
            type="text"
            value={BARANGAY}
            readOnly
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-base cursor-not-allowed"
          />
        </div>
      </div>

      {/* Ownership + Dwelling + Monthly Income */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Type</label>
          <FormSelect
            placeholder="Ownership"
            value={value.ownershipType ?? ''}
            onChange={(val) => update('ownershipType', val)}
            options={OWNERSHIP_TYPE_OPTIONS}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dwelling Type</label>
          <FormSelect
            placeholder="Dwelling"
            value={value.dwellingType ?? ''}
            onChange={(val) => update('dwellingType', val)}
            options={DWELLING_TYPE_OPTIONS}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₱)</label>
          <input
            type="number"
            min="0"
            value={value.monthlyIncome ?? ''}
            onChange={(e) => update('monthlyIncome', e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 15000"
            className={fieldClass}
          />
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <FormSelect
            placeholder="Status"
            value={value.status ?? 'active'}
            onChange={(val) => update('status', val)}
            options={HOUSEHOLD_STATUS_OPTIONS}
          />
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Members</label>
          <span className="text-sm font-medium text-gray-600">{members.length}</span>
        </div>

        {/* Existing members list */}
        <div className="space-y-2 mb-4">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No members added yet.</p>
          )}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200"
            >
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r text-[#005F02] border-gray-300">
                <CiUser className="w-6 h-6" />
              </div>
              <span className="flex-1 text-sm text-gray-700">{member.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                className="p-1.5 text-gray-500 rounded-lg transition-colors"
                aria-label="Remove member"
              >
                <FaRegTrashCan className="w-5 h-5 hover:text-red-500 transition-colors" />
              </button>
            </div>
          ))}
        </div>

        {/* Add member search */}
        <div className="relative" ref={memberDropdownRef}>
          <div className="flex gap-2">
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setShowMemberDropdown(true);
              }}
              onFocus={() => setShowMemberDropdown(true)}
              placeholder="Search registered resident…"
              className={`${fieldClass} flex-1`}
            />
          </div>
          {showMemberDropdown && memberSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
              {memberCandidates.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No matching residents found</div>
              ) : (
                memberCandidates.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleAddMember(r)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100"
                  >
                    {r.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}