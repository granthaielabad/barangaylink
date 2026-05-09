import { useState, useRef, useEffect, useCallback } from 'react';
import { FiCalendar, FiUser, FiMapPin, FiPhone, FiMail, FiSearch, FiCamera } from 'react-icons/fi';
import { MdCheck } from 'react-icons/md';
import { HiOutlineArrowUpTray } from 'react-icons/hi2';
import { EIdProfile } from '.';
import { useResidentSearch } from '../../../../hooks/queries/residents/useResidentSearch';

// ── Styles ────────────────────────────────────────────────────
const wrapClass =
  'flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white';
const lockedWrapClass =
  'flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50';
const iconClass =
  'bg-gray-100 px-4 py-3 flex items-center justify-center border-r border-gray-300 text-[#8C0B1A]';
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
  const signatureInputRef = useRef(null);

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

  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureError, setSignatureError] = useState('');
  const [duplicateEidWarning, setDuplicateEidWarning] = useState(null);

  const handleSelectResident = useCallback((resident) => {
    setSearchTerm(resident.label);
    setShowDropdown(false);
    
    setSignaturePreview(null);
    setSignatureError('');

    // Block auto-fill if resident already has an existing eID
    if (mode === 'create' && resident.hasEid) {
      setDuplicateEidWarning({
        name: resident.label,
        eidNumber: resident.eidNumber,
        eidStatus: resident.eidStatus,
      });
      // Clear the form — do NOT populate fields
      onChange?.({
        residentId: '', residentName: '', firstName: '',
        middleName: '', lastName: '', suffix: '', dateOfBirth: '',
        sex: '', address: '', contactNumber: '', email: '',
        photoUrl: null, hasEid: false, eidStatus: null, eidNumber: null,
        signatureFile: null,
      });
      return;
    }

    setDuplicateEidWarning(null);
    
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
      signatureFile: null,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onChange, mode]);

  const validateSignatureImage = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 150 || img.height < 50) {
        resolve({ ok: false, message: 'Signature is too small. Minimum size is 150x50 pixels.' });
        return;
      }
      if (img.width < img.height) {
        resolve({ ok: false, message: 'Signature must be wider than it is tall (horizontal orientation).' });
        return;
      }
      const ratio = img.width / img.height;
      if (ratio > 10 || ratio < 1.0) {
        resolve({ ok: false, message: 'Image looks like a full photo. Please upload only your signature.' });
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let darkPixels = 0;
      let lightPixels = 0;
      let totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 50) continue;
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        if (luminance < 100) darkPixels++;
        if (luminance > 200) lightPixels++;
      }

      const darkRatio = darkPixels / totalPixels;
      const lightRatio = lightPixels / totalPixels;

      if (darkRatio < 0.005) {
        resolve({ ok: false, message: 'Signature is too faint. Please upload a clearer one.' });
        return;
      }
      if (lightRatio < 0.2) {
        resolve({ ok: false, message: 'Please upload a handwritten signature on a plain light background.' });
        return;
      }
      resolve({ ok: true });
    };
    img.onerror = () => resolve({ ok: false, message: 'Unable to read the signature image.' });
    img.src = dataUrl;
  });

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setSignatureError('File must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const validation = await validateSignatureImage(dataUrl);
      if (!validation.ok) {
        setSignatureError(validation.message || 'Please upload a valid signature image.');
        setSignaturePreview(null);
        update('signatureFile', null);
      } else {
        setSignaturePreview(dataUrl);
        setSignatureError('');
        update('signatureFile', file);
      }
    };
    reader.readAsDataURL(file);
    if (signatureInputRef.current) signatureInputRef.current.value = '';
  };

  const currentPreview = mode === 'edit' ? value.signatureUrl : signaturePreview;

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
          <div className={`relative rounded-lg ${mode === 'create' && value.residentId && !value.photoUrl ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
            <EIdProfile
              name={fullName}
              size={190}
              photoUrl={value.photoUrl}
              className="rounded-lg"
            />
            <button
              type="button"
              disabled={!value.residentId}
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-2 right-2 p-2 rounded-lg shadow-md transition-colors ${
                !value.residentId 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#8C0B1A] hover:bg-[#7A0915] text-white'
              }`}
              title={!value.residentId ? 'Select a resident first' : 'Upload photo'}
            >
              <FiCamera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          {mode === 'create' && value.residentId && !value.photoUrl ? (
            <p className="mt-2 text-xs text-red-500 font-medium text-center">
              Profile photo is required.
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400 text-center">
              We support PNGs and JPGs under 2MB
            </p>
          )}
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
                    setDuplicateEidWarning(null);
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
                  <MdCheck className="w-5 h-5 text-[#8C0B1A] mr-3 shrink-0" />
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

            {/* Warning if selected resident already has an existing eID */}
            {duplicateEidWarning && (
              <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-medium">
                  ⚠ {duplicateEidWarning.name} already has an existing eID ({duplicateEidWarning.eidNumber || 'N/A'}).
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please search for another resident or manage this resident's existing eID from the records page.
                </p>
              </div>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mode === 'edit' ? (
            <FormField label="Contact Number:">
              <div className={`${wrapClass} ${value.contactNumber && value.contactNumber.length > 0 && value.contactNumber.length < 11 ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                <div className={iconClass}>
                  <FiPhone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={value.contactNumber ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 11) update('contactNumber', val);
                  }}
                  placeholder="09123456789"
                  className={inputClass}
                />
              </div>
              {value.contactNumber && value.contactNumber.length > 0 && value.contactNumber.length < 11 && (
                <p className="mt-1.5 text-[11px] text-red-500 font-medium">Contact number must be 11 digits.</p>
              )}
            </FormField>
          ) : (
            <LockedField
              label="Contact Number:"
              icon={FiPhone}
              value={value.contactNumber}
            />
          )}

          <LockedField
            label="Email Address:"
            icon={FiMail}
            value={value.email}
          />
        </div>
      </div>

      {/* Signature Row */}
      {mode === 'create' && (
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Resident's Signature
          </label>
          
          <div className={`relative w-full h-48 sm:h-56 border-2 border-solid rounded-xl overflow-hidden mb-4 ${
            !value.residentId
              ? 'bg-gray-100 border-gray-200 opacity-60'
              : mode === 'create' && value.residentId && !currentPreview
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
          }`}>
            {currentPreview ? (
              <img src={currentPreview} alt="Signature" className="w-full h-full object-contain bg-white" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                <HiOutlineArrowUpTray className={`w-8 h-8 mb-2 ${mode === 'create' && value.residentId && !currentPreview ? 'text-red-400' : 'text-gray-300'}`} />
                <p className={`text-sm ${mode === 'create' && value.residentId && !currentPreview ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                  {mode === 'create' && value.residentId && !currentPreview ? 'Signature is required.' : 'No signature uploaded'}
                </p>
              </div>
            )}
          </div>

          {signatureError && (
            <p className="mt-1 text-sm text-red-600 font-medium mb-3">{signatureError}</p>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!value.residentId}
              onClick={() => signatureInputRef.current?.click()}
              className={`w-full px-4 py-2 rounded-md border text-sm font-medium transition-colors shadow-sm ${
                !value.residentId
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upload Signature
            </button>
            <p className="text-xs text-gray-500 italic text-center">
              Clear handwritten signature on a plain white background
            </p>
          </div>

          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSignatureUpload}
          />
        </div>
      )}
    </div>
  );
}

