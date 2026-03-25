import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LuHouse } from 'react-icons/lu';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdCheck } from 'react-icons/md';
import { CiUser } from 'react-icons/ci';
import { FormSelect } from '../../../../../shared';
import { useActiveResidents } from '../../../../../hooks/queries/residents/useActiveResidents';
import {
  OWNERSHIP_TYPE_OPTIONS,
  DWELLING_TYPE_OPTIONS,
  HOUSEHOLD_STATUS_FORM_OPTIONS,
  BARANGAY,
} from '../../../../../core/constants';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

const addonInputClass =
  'flex-1 px-4 py-2.5 bg-white focus:outline-none text-gray-900 text-base placeholder-gray-400';

export default function HouseholdForm({ value = {}, onChange, householdNo = '' }) {
  // Single atomic update — merges multiple field changes into one onChange call
  // to avoid the stale-closure bug where sequential update() calls each spread
  // the original `value` and the last one wins.
  const updateMany = (fields) => onChange?.({ ...value, ...fields });
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const { data: residentOptions = [], isLoading: residentsLoading } = useActiveResidents();

  const members = value.members ?? [];

  // ── Head of Household — searchable text input ────────────────
  const [headSearch, setHeadSearch] = useState('');
  const [showHeadDropdown, setShowHeadDropdown] = useState(false);
  const [headMenuStyles, setHeadMenuStyles] = useState(null);
  const headRef = useRef(null);
  const headInputContainerRef = useRef(null);

  const updateHeadPosition = useCallback(() => {
    if (!headInputContainerRef.current) return;
    const rect = headInputContainerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;

    setHeadMenuStyles({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    });
  }, []);

  // Keep headSearch label in sync when residentOptions load or headResidentId is set
  // (especially important in Edit mode where headResidentId comes from initialData)
  useEffect(() => {
    if (value.headResidentId && residentOptions.length > 0) {
      const match = residentOptions.find((r) => r.value === value.headResidentId);
      if (match && headSearch !== match.label) {
        setHeadSearch(match.label);
      }
    }
    // If headResidentId was cleared externally, clear the search text too
    if (!value.headResidentId && headSearch) {
      setHeadSearch('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.headResidentId, residentOptions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (headRef.current && !headRef.current.contains(e.target)) {
        setShowHeadDropdown(false);
        // Restore display text to the currently selected head on blur
        if (value.headResidentId && residentOptions.length > 0) {
          const currentMatch = residentOptions.find((r) => r.value === value.headResidentId);
          if (currentMatch) setHeadSearch(currentMatch.label);
        } else if (!value.headResidentId) {
          setHeadSearch('');
        }
      }
    }

    if (showHeadDropdown) {
      updateHeadPosition();
      window.addEventListener('scroll', updateHeadPosition, true);
      window.addEventListener('resize', updateHeadPosition);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('scroll', updateHeadPosition, true);
      window.removeEventListener('resize', updateHeadPosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [headSearch, residentOptions, showHeadDropdown, updateHeadPosition, value.headResidentId]);

  // Enhanced search: match name OR resident_no
  const headCandidates = residentOptions.filter((r) =>
    r.label.toLowerCase().includes(headSearch.toLowerCase()) ||
    (r.residentNo && r.residentNo.toLowerCase().includes(headSearch.toLowerCase()))
  );

  const handleSelectHead = (r) => {
    // Build the updated members list atomically alongside the new headResidentId.
    // We must not call update() twice — each call spreads the original `value`
    // object so the second call would overwrite the first change.
    const currentMembers = value.members ?? [];
    let updatedMembers = currentMembers;
    if (!updatedMembers.some((m) => m.id === r.value)) {
      updatedMembers = [...updatedMembers, { id: r.value, name: r.label }];
    }

    // Single atomic onChange with both fields merged
    updateMany({ headResidentId: r.value, members: updatedMembers });
    setHeadSearch(r.label);
    setShowHeadDropdown(false);
  };

  // ── Members — searchable input, head excluded ────────────────
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [memberMenuStyles, setMemberMenuStyles] = useState(null);
  const memberRef = useRef(null);
  const memberInputContainerRef = useRef(null);

  const updateMemberPosition = useCallback(() => {
    if (!memberInputContainerRef.current) return;
    const rect = memberInputContainerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;

    setMemberMenuStyles({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (memberRef.current && !memberRef.current.contains(e.target)) {
        setShowMemberDropdown(false);
      }
    }

    if (showMemberDropdown) {
      updateMemberPosition();
      window.addEventListener('scroll', updateMemberPosition, true);
      window.addEventListener('resize', updateMemberPosition);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('scroll', updateMemberPosition, true);
      window.removeEventListener('resize', updateMemberPosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemberDropdown, updateMemberPosition]);

  // Exclude residents already added as members from the search candidates
  const memberCandidates = residentOptions.filter(
    (r) =>
      !members.some((m) => m.id === r.value) &&
      (r.label.toLowerCase().includes(memberSearch.toLowerCase()) ||
       (r.residentNo && r.residentNo.toLowerCase().includes(memberSearch.toLowerCase())))
  );

  const handleAddMember = (resident) => {
    update('members', [...members, { id: resident.value, name: resident.label }]);
    setMemberSearch('');
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (residentId) => {
    // The Head of Household cannot be removed from the members list
    if (residentId === value.headResidentId) return;
    update('members', members.filter((m) => m.id !== residentId));
  };

  return (
    <div className="space-y-6">

      {/* Household No. (auto-generated, locked) + Head of Household */}
      <div className="flex flex-col md:flex-row gap-4">

        {/* Household No. — read-only, auto-generated */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Household No.</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-3 border-r border-gray-200 flex items-center justify-center text-gray-400">
              <LuHouse className="w-6 h-6" />
            </div>
            <span className="flex-1 px-4 py-2.5 text-gray-500 text-base select-none">
              {householdNo || 'Auto-generated'}
            </span>
          </div>
        </div>

        {/* Head of Household — searchable input, simple design matching other fields */}
        <div className="flex-1" ref={headRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Head of Household <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={headInputContainerRef}>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-gray-400">
                <CiUser className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={headSearch}
                onChange={(e) => {
                  setHeadSearch(e.target.value);
                  setShowHeadDropdown(true);
                }}
                onFocus={() => setShowHeadDropdown(true)}
                placeholder={residentsLoading ? 'Loading…' : 'Search by Name or Resident No.…'}
                className={addonInputClass}
              />
            </div>

            {showHeadDropdown && headSearch && headMenuStyles && createPortal(
              <div
                style={headMenuStyles}
                onMouseDown={(e) => e.stopPropagation()}
                className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-75"
              >
                {headCandidates.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No matching residents</div>
                ) : (
                  headCandidates.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectHead(r)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{r.label}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{r.residentNo || 'No ID'}</span>
                      </div>
                      {value.headResidentId === r.value && (
                        <MdCheck className="w-5 h-5 text-[#005F02] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>,
              document.body
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
              className={addonInputClass}
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

      {/* Ownership + Dwelling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            options={HOUSEHOLD_STATUS_FORM_OPTIONS}
          />
        </div>
      </div>

      {/* Members */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Members</label>
          <span className="bg-[#005F02]/10 text-[#005F02] text-xs font-black px-2.5 py-1 rounded-full">{members.length}</span>
        </div>

        <div className="space-y-2 mb-6">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-100 rounded-lg">No members added yet.</p>
          )}
          {members.map((member) => {
            const isHead = member.id === value.headResidentId;
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 rounded-lg border transition-all ${isHead ? 'bg-emerald-50/30 border-emerald-100 shadow-sm' : 'border-gray-200 bg-white'}`}
              >
                <div className={`bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 ${isHead ? 'text-[#005F02]' : 'text-gray-400'}`}>
                  <CiUser className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 truncate">{member.name}</span>
                  {isHead && <span className="text-[10px] text-[#005F02] font-black uppercase tracking-widest">Head of Household</span>}
                </div>
                {/* Head of Household cannot be removed — only non-head members show the delete button */}
                {isHead ? (
                  <div className="p-3 text-emerald-600 opacity-50 mr-1" title="Head of Household cannot be removed">
                    <MdCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors mr-1"
                    aria-label="Remove member"
                  >
                    <FaRegTrashCan className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add member search */}
        <div className="relative" ref={memberRef}>
          <div className="relative" ref={memberInputContainerRef}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
               <CiUser className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setShowMemberDropdown(true);
              }}
              onFocus={() => setShowMemberDropdown(true)}
              placeholder="Search by Name or Resident No. to add…"
              className={`${inputClass} pl-11`}
            />
          </div>
          {showMemberDropdown && memberSearch && memberMenuStyles && createPortal(
            <div
              style={memberMenuStyles}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-75"
            >
              {memberCandidates.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No matching residents found</div>
              ) : (
                memberCandidates.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAddMember(r)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex flex-col border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{r.label}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{r.residentNo || 'No ID'}</span>
                  </button>
                ))
              )}
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}