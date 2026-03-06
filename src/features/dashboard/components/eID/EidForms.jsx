import { useState, useRef, useEffect, useCallback } from 'react';
import { FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiSearch, FiCamera } from 'react-icons/fi';
import { MdCheck } from 'react-icons/md';
import { EIdProfile } from '.';
import { useResidentSearch } from '../../../../hooks/queries/residents/useResidentSearch';

// ── Styles ────────────────────────────────────────────────────
const wrapClass =
  'flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white';
const lockedWrapClass =
  'flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50';
const iconClass =
  'bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-[#005F02]';
const lockedIconClass =
  'bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-200 text-gray-400';
const inputClass =
  'flex-1 px-4 py-2.5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none text-base';
const lockedInputClass =
  'flex-1 px-4 py-2.5 bg-gray-50 text-gray-500 text-base cursor-not-allowed select-none';

const FormField = ({ label, children }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    )}
    {children}
  </div>
);

const LockedField = ({ label, icon: Icon, value, placeholder = '—' }) => (
  <FormField label={label}>
    <div className={lockedWrapClass}>
      {Icon && (
        <div className={lockedIconClass}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <span className={lockedInputClass}>{value || placeholder}</span>
    </div>
  </FormField>
);

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function EidForms({ value = {}, onChange, mode = 'create' }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  // ── Photo upload ──────────────────────────────────────────────
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Only PNG and JPG files are supported');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => update('photoUrl', event.target?.result);
    reader.readAsDataURL(file);
  };

  // ── Resident search state ─────────────────────────────────────
  const [searchTerm, setSearchTerm]     = useState(value.residentName ?? '');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debouncedTerm = useDebounce(searchTerm);

  const { data: results = [], isFetching } = useResidentSearch(debouncedTerm);

  // Click-outside closes the dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When editing, populate searchTerm from the pre-filled resident name
  useEffect(() => {
    if (mode === 'edit' && value.residentName && !searchTerm) {
      setSearchTerm(value.residentName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value.residentName]);

  const handleSelectResident = useCallback((resident) => {
    setSearchTerm(resident.label);
    setShowDropdown(false);
    onChange?.({
      ...value,
      residentId:    resident.id,
      residentName:  resident.label,
      firstName:     resident.firstName,
      middleName:    resident.middleName,
      lastName:      resident.lastName,
      suffix:        resident.suffix,
      dateOfBirth:   resident.dateOfBirth,
      sex:           resident.sex,
      address:       resident.address,
      contactNumber: resident.contactNumber,
      email:         resident.email,
      photoUrl:      resident.photoUrl,
      hasEid:        resident.hasEid,
      eidStatus:     resident.eidStatus,
      eidNumber:     resident.eidNumber,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onChange]);

  const isResidentSelected = !!value.residentId;
  const fullName = [value.firstName, value.middleName, value.lastName, value.suffix]
    .filter(Boolean).join(' ');

  // Format birthdate DB value (YYYY-MM-DD) → MM-DD-YYYY for display
  const formatDate = (raw) => {
    if (!raw) return '';
    const [y, m, d] = raw.split('-');
    return d ? `${m}-${d}-${y}` : raw;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Top Section: Photo left, search + locked name fields right */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">

        {/* Left: Photo */}
        <div className="flex flex-col items-center sm:m-5 shrink-0 sm:w-40">
          <div className="relative">
            <EIdProfile
              name={fullName}
              size={190}
              photoUrl={value.photoUrl}
              className="rounded-lg"
            />
            {mode === 'create' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-[#005F02] hover:bg-[#004A01] text-white p-2 rounded-lg shadow-md transition-colors"
                title="Upload photo"
              >
                <FiCamera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400 text-center">
            {mode === 'create'
              ? 'We support PNGs and JPGs under 2MB'
              : 'Photo pulled from resident profile'}
          </p>
        </div>

        {/* Right: Resident search + name fields */}
        <div className="flex-1 space-y-4">

          {/* Resident search — the ONLY editable field */}
          <FormField label="Search Resident:">
            <div className="relative" ref={searchRef}>
              <div className={wrapClass}>
                <div className={iconClass}>
                  <FiSearch className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    // Clear selection if user modifies the search
                    if (value.residentId) {
                      onChange?.({ residentId: '', residentName: '', firstName: '',
                        middleName: '', lastName: '', suffix: '', dateOfBirth: '',
                        sex: '', address: '', contactNumber: '', email: '',
                        photoUrl: null, hasEid: false, eidStatus: null, eidNumber: null });
                    }
                  }}
                  onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                  placeholder="Type a resident's name to search…"
                  className={inputClass}
                  disabled={mode === 'edit'}
                />
                {isResidentSelected && (
                  <MdCheck className="w-5 h-5 text-[#005F02] mr-3 shrink-0" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && searchTerm.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-56 overflow-y-auto">
                  {isFetching ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                  ) : results.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No residents found</div>
                  ) : (
                    results.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectResident(r)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center justify-between gap-2"
                      >
                        <span>{r.label}</span>
                        {r.hasEid && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            r.eidStatus === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            eID {r.eidStatus}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Warning if selected resident already has an active eID */}
            {value.hasEid && value.eidStatus === 'active' && (
              <p className="mt-1.5 text-xs text-amber-600 font-medium">
                ⚠ This resident already has an active eID ({value.eidNumber}). Issuing a new one will be blocked.
              </p>
            )}
          </FormField>

          {/* Last Name + First Name — locked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockedField label="Last Name:" value={value.lastName} />
            <LockedField label="First Name:" value={value.firstName} />
          </div>

          {/* Middle Name + Suffix — locked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockedField label="Middle Name:" value={value.middleName} />
            <LockedField label="Suffix:" value={value.suffix} />
          </div>
        </div>
      </div>

      {/* Bottom Section: locked fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LockedField
            label="Birthdate:"
            icon={FiCalendar}
            value={formatDate(value.dateOfBirth)}
          />
          <LockedField
            label="Sex:"
            icon={FiUser}
            value={value.sex}
          />
        </div>

        <LockedField label="Address:" icon={FiMapPin} value={value.address} />
        <LockedField label="Contact Number:" icon={FiPhone} value={value.contactNumber} />
        <LockedField label="Email Address:" icon={FiMail} value={value.email} />
      </div>
    </div>
  );
}