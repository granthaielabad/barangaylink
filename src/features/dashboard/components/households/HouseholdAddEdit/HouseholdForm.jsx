import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { LuHouse } from 'react-icons/lu';
import { FaRegTrashCan } from 'react-icons/fa6';
import { MdCheck } from 'react-icons/md';
import { CiUser } from 'react-icons/ci';
import { FormSelect } from '../../../../../shared';
import { useActiveResidents } from '../../../../../hooks/queries/residents/useActiveResidents';
import { useSitios } from '../../../../../hooks/queries/dashboard/useSitios';
import {
  OWNERSHIP_TYPE_OPTIONS,
  DWELLING_TYPE_OPTIONS,
  HOUSEHOLD_STATUS_FORM_OPTIONS,
  BARANGAY,
  STA_LUCIA_STREETS,
  SITIO_STREET_MAP,
} from '../../../../../core/constants';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A]';

const addonInputClass =
  'flex-1 px-4 py-2.5 bg-white focus:outline-none text-gray-900 text-base placeholder-gray-400';

export default function HouseholdForm({ value = {}, onChange, householdNo = '' }) {
  const updateMany = (fields) => onChange?.({ ...value, ...fields });
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const { data: residentOptions = [], isLoading: residentsLoading } = useActiveResidents();
  const { data: sitioOptions = [], isLoading: sitiosLoading } = useSitios();
  const members = value.members ?? [];

  // ── Linked Address Logic ──────────────────────────────────────────────────
  const filteredStreets = useMemo(() => {
    if (!value.purok || !SITIO_STREET_MAP[value.purok]) return STA_LUCIA_STREETS;
    return SITIO_STREET_MAP[value.purok];
  }, [value.purok]);

  const handleStreetChange = (streetVal) => {
    const newFields = { street: streetVal };
    
    // Auto-select Sitio if street belongs to specific Sitio(s)
    const possibleSitioNames = Object.entries(SITIO_STREET_MAP)
      .filter(([_, streets]) => streets.includes(streetVal))
      .map(([name]) => name);

    if (possibleSitioNames.length > 0) {
      if (!value.purok || !possibleSitioNames.includes(value.purok)) {
        const targetName = possibleSitioNames[0];
        const targetOpt = sitioOptions.find(opt => opt.label === targetName);
        if (targetOpt) {
          newFields.purokId = targetOpt.value;
          newFields.purok = targetOpt.label;
        }
      }
    }
    updateMany(newFields);
  };

  // ── Head Search Logic ─────────────────────────────────────────────────────
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
      position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, width: `${rect.width}px`, zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (value.headResidentId && residentOptions.length > 0) {
      const match = residentOptions.find((r) => r.value === value.headResidentId);
      if (match) setHeadSearch(match.label);
    } else {
      setHeadSearch('');
    }
    // Only sync when the ID or options change, NOT on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.headResidentId, residentOptions]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (headRef.current && !headRef.current.contains(e.target)) {
        setShowHeadDropdown(false);
        if (value.headResidentId && residentOptions.length > 0) {
          const currentMatch = residentOptions.find((r) => r.value === value.headResidentId);
          if (currentMatch) setHeadSearch(currentMatch.label);
        } else if (!value.headResidentId) setHeadSearch('');
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

  const headCandidates = residentOptions.filter((r) =>
    r.label.toLowerCase().includes(headSearch.toLowerCase()) ||
    (r.residentNo && r.residentNo.toLowerCase().includes(headSearch.toLowerCase()))
  );

  const handleSelectHead = (r) => {
    const currentMembers = value.members ?? [];
    let updatedMembers = currentMembers;
    if (!updatedMembers.some((m) => m.id === r.value)) {
      updatedMembers = [...updatedMembers, { id: r.value, name: r.label }];
    }
    updateMany({ headResidentId: r.value, members: updatedMembers });
    setHeadSearch(r.label);
    setShowHeadDropdown(false);
  };

  // ── Member Search Logic ───────────────────────────────────────────────────
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
      position: 'fixed', top: `${rect.bottom + 4}px`, left: `${rect.left}px`, width: `${rect.width}px`, zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (memberRef.current && !memberRef.current.contains(e.target)) setShowMemberDropdown(false);
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
    if (residentId === value.headResidentId) return;
    update('members', members.filter((m) => m.id !== residentId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Household No.</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-3 border-r border-gray-200 flex items-center justify-center text-gray-400">
              <LuHouse className="w-6 h-6" />
            </div>
            <span className="flex-1 px-4 py-2.5 text-gray-500 text-base select-none">{householdNo || 'Auto-generated'}</span>
          </div>
        </div>
        <div className="flex-1" ref={headRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Head of Household <span className="text-red-500">*</span></label>
          <div className="relative" ref={headInputContainerRef}>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-gray-400"><CiUser className="w-6 h-6" /></div>
              <input type="text" value={headSearch} onChange={(e) => { setHeadSearch(e.target.value); setShowHeadDropdown(true); }} onFocus={() => setShowHeadDropdown(true)} placeholder={residentsLoading ? 'Loading…' : 'Search by Name or Resident No.…'} className={addonInputClass} />
            </div>
            {showHeadDropdown && headSearch && headMenuStyles && createPortal(
              <div style={headMenuStyles} onMouseDown={(e) => e.stopPropagation()} className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-75">
                {headCandidates.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No matching residents</div>
                ) : (
                  headCandidates.map((r) => (
                    <button key={r.value} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleSelectHead(r)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center justify-between group">
                      <div className="flex flex-col"><span className="font-medium text-gray-900">{r.label}</span><span className="text-[10px] text-gray-400 font-mono">{r.residentNo || 'No ID'}</span></div>
                      {value.headResidentId === r.value && <MdCheck className="w-5 h-5 text-[#8C0B1A] shrink-0" />}
                    </button>
                  ))
                )}
              </div>, document.body
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street <span className="text-red-500">*</span></label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-100 px-4 py-3 flex items-center justify-center border-r text-[#8C0B1A] border-gray-300"><LuHouse className="w-6 h-6" /></div>
            <input 
              type="text" 
              list="sta-lucia-streets-hh" 
              value={value.street ?? ''} 
              onChange={(e) => handleStreetChange(e.target.value)} 
              placeholder="e.g. J.P. Rizal St." 
              className={addonInputClass} 
              required 
            />
            <datalist id="sta-lucia-streets-hh">
              {filteredStreets.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sitio <span className="text-red-500">*</span></label>
          <FormSelect
            placeholder={sitiosLoading ? 'Loading Sitios…' : 'Select Sitio'}
            value={value.purokId ?? ''}
            onChange={(val) => {
              const selectedOpt = sitioOptions.find(opt => opt.value === val);
              updateMany({
                purokId: val,
                purok: selectedOpt ? selectedOpt.label : '',
              });
            }}
            options={sitioOptions}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
          <input type="text" value={BARANGAY} readOnly className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-base cursor-not-allowed" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label><FormSelect placeholder="Status" value={value.status ?? 'active'} onChange={(val) => update('status', val)} options={HOUSEHOLD_STATUS_FORM_OPTIONS} /></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Ownership Type</label><FormSelect placeholder="Ownership" value={value.ownershipType ?? ''} onChange={(val) => update('ownershipType', val)} options={OWNERSHIP_TYPE_OPTIONS} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Dwelling Type</label><FormSelect placeholder="Dwelling" value={value.dwellingType ?? ''} onChange={(val) => update('dwellingType', val)} options={DWELLING_TYPE_OPTIONS} /></div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4"><label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">Members</label><span className="bg-[#8C0B1A]/10 text-[#8C0B1A] text-xs font-black px-2.5 py-1 rounded-full">{members.length}</span></div>
        <div className="space-y-2 mb-6">
          {members.length === 0 && <p className="text-sm text-gray-400 py-4 text-center border-2 border-dashed border-gray-100 rounded-lg">No members added yet.</p>}
          {members.map((member) => {
            const isHead = member.id === value.headResidentId;
            return (
              <div key={member.id} className={`flex items-center gap-3 rounded-lg border transition-all ${isHead ? 'bg-emerald-50/30 border-emerald-100 shadow-sm' : 'border-gray-200 bg-white'}`}>
                <div className={`bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 ${isHead ? 'text-[#8C0B1A]' : 'text-gray-400'}`}><CiUser className="w-6 h-6" /></div>
                <div className="flex-1 min-w-0 flex flex-col"><span className="text-sm font-semibold text-gray-900 truncate">{member.name}</span>{isHead && <span className="text-[10px] text-[#8C0B1A] font-black uppercase tracking-widest">Head of Household</span>}</div>
                {isHead ? <div className="p-3 text-emerald-600 opacity-50 mr-1"><MdCheck className="w-6 h-6" /></div> : <button type="button" onClick={() => handleRemoveMember(member.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors mr-1"><FaRegTrashCan className="w-5 h-5" /></button>}
              </div>
            );
          })}
        </div>
        <div className="relative" ref={memberRef}>
          <div className="relative" ref={memberInputContainerRef}><div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><CiUser className="w-5 h-5" /></div><input type="text" value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value); setShowMemberDropdown(true); }} onFocus={() => setShowMemberDropdown(true)} placeholder="Search by Name or Resident No. to add…" className={`${inputClass} pl-11`} /></div>
          {showMemberDropdown && memberSearch && memberMenuStyles && createPortal(
            <div style={memberMenuStyles} onMouseDown={(e) => e.stopPropagation()} className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-75">
              {memberCandidates.length === 0 ? <div className="px-4 py-3 text-sm text-gray-500">No matching residents found</div> : memberCandidates.map((r) => (
                  <button key={r.value} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => handleAddMember(r)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex flex-col border-b border-gray-50 last:border-0"><span className="font-medium text-gray-900">{r.label}</span><span className="text-[10px] text-gray-400 font-mono">{r.residentNo || 'No ID'}</span></button>
              ))}
            </div>, document.body
          )}
        </div>
      </div>
    </div>
  );
}
