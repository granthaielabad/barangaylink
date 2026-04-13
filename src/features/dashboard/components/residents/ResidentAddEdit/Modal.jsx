import { useState, useRef, useEffect, useMemo } from 'react';
import { PiUserPlus } from 'react-icons/pi';
import PersonalInformationForm from './PersonalInformationForm';
import AddressInformationForm from './AddressInformationForm';
import ValidIdForm from './ValidIdForm';
import SectoralStatusForm from './SectoralStatusForm';
import { BARANGAY } from '../../../../../core/constants';

const emptyForm = {
  personal: {
    lastName: '', firstName: '', middleName: '', suffix: '',
    birthdate: '', gender: '', contactNumber: '', email: '',
    civilStatus: '', placeOfBirth: '', nationality: 'Filipino',
    religion: '', occupation: '', voterStatus: false, bloodType: '',
  },
  address: {
    houseNo: '', street: '', purok: '', purokId: '', barangay: BARANGAY,
  },
  sectoral: {
    isPwd: false, isSoloParent: false, isIndigent: false,
  },
  identification: {
    philhealthNo: '', sssNo: '', tinNo: '', idNumber: '', status: 'active',
  },
  validId: {
    validIdType: '', validIdNumber: '', validIdFile: null,
  },
};

// ── Parse address_line back into components when no household is linked ───────
// address_line format built by buildPayload: "houseNo, street, purok, barangay"
function parseAddressLine(addressLine) {
  if (!addressLine) return { houseNo: '', street: '', purok: '' };
  const withoutBarangay = addressLine.replace(new RegExp(`,?\\s*${BARANGAY}\\s*$`), '').trim();
  const parts = withoutBarangay.split(',').map((s) => s.trim()).filter(Boolean);
  return {
    houseNo: parts[0] ?? '',
    street:  parts[1] ?? '',
    purok:   parts[2] ?? '',
  };
}

// Build pre-fill from the raw DB resident object (r._raw)
function buildEditForm(raw) {
  if (!raw) return emptyForm;
  // Prefer household columns if linked, otherwise parse from address_line
  const parsed = parseAddressLine(raw.address_line);
  return {
    personal: {
      lastName:      raw.last_name     ?? '',
      firstName:     raw.first_name    ?? '',
      middleName:    raw.middle_name   ?? '',
      suffix:        raw.suffix        ?? '',
      birthdate:     raw.date_of_birth ?? '',
      ageGroup:      raw.age_group     ?? '',
      gender:        raw.sex === 'M' ? 'Male' : raw.sex === 'F' ? 'Female' : raw.sex ?? '',
      contactNumber: raw.contact_number ?? '',
      email:         raw.email          ?? '',
      civilStatus:   raw.civil_status   ?? '',
      placeOfBirth:  raw.place_of_birth ?? '',
      nationality:   raw.nationality    ?? 'Filipino',
      religion:      raw.religion       ?? '',
      occupation:    raw.occupation     ?? '',
      voterStatus:   raw.voter_status   ?? false,
      bloodType:     raw.blood_type     ?? '',
    },
    address: {
      houseNo:  raw.households?.house_no ?? parsed.houseNo,
      street:   raw.households?.street   ?? parsed.street,
      purok:    raw.puroks?.name         ?? parsed.purok,
      purokId:  raw.purok_id             ?? '',
      barangay: BARANGAY,
    },
    sectoral: {
      isPwd:        raw.is_pwd          ?? false,
      isSoloParent: raw.is_solo_parent  ?? false,
      isIndigent:   raw.is_indigent     ?? false,
    },
    identification: {
      philhealthNo: raw.philhealth_no ?? '',
      sssNo:        raw.sss_no        ?? '',
      tinNo:        raw.tin_no        ?? '',
      idNumber:     raw.id_number     ?? '',
      status:       raw.status        ?? 'active',
    },
    validId: {
      validIdType:   raw.valid_id_type ?? '',
      validIdNumber: raw.id_number     ?? '',  // id_number stores the valid ID number
      validIdFile:   null,
    },
  };
}

export default function ResidentAddEdit({ isOpen, onClose, onSubmit, initialData = null, mode = 'add' }) {
  const raw = initialData?._raw ?? null;

  const getInitialFormData = useMemo(
    () => (mode === 'edit' && raw ? buildEditForm(raw) : emptyForm),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [raw?.id, mode]
  );

  const [formData, setFormData] = useState(getInitialFormData);
  const panelRef = useRef(null);

  useEffect(() => { setFormData(getInitialFormData); }, [getInitialFormData]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  const handleClear = () => setFormData(emptyForm);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { personal, address, sectoral, identification, validId } = formData;

    onSubmit?.({
      // Personal
      firstName:     personal.firstName,
      middleName:    personal.middleName    || null,
      lastName:      personal.lastName,
      suffix:        personal.suffix        || null,
      birthdate:     personal.birthdate     || null,
      bloodType:     personal.bloodType     || null,
      gender:        personal.gender        || null,
      contactNumber: personal.contactNumber || null,
      email:         personal.email         || null,
      civilStatus:   personal.civilStatus   || null,
      placeOfBirth:  personal.placeOfBirth  || null,
      nationality:   personal.nationality   || 'Filipino',
      religion:      personal.religion      || null,
      occupation:    personal.occupation    || null,
      voterStatus:   personal.voterStatus   ?? false,
      // Address
      houseNo:     address.houseNo    || null,
      street:      address.street     || null,
      purok:       address.purok      || null,
      purokId:     address.purokId    ? Number(address.purokId) : null,
      barangay:    address.barangay   || null,
      yearsOfStay: address.yearsOfStay !== '' ? Number(address.yearsOfStay) : null,
      // Sectoral Status
      isPwd:        sectoral.isPwd,
      isSoloParent: sectoral.isSoloParent,
      isIndigent:   sectoral.isIndigent,
      // Identification
      philhealthNo: identification.philhealthNo || null,
      sssNo:        identification.sssNo        || null,
      tinNo:        identification.tinNo        || null,
      idNumber:     identification.idNumber || validId.validIdNumber || null,
      status:       identification.status       || 'active',
      // Valid ID
      validIdType:   validId.validIdType   || null,
      validIdNumber: validId.validIdNumber || null,
      validIdFile:   validId.validIdFile   ?? null,
    });

    if (mode === 'add') setFormData(emptyForm);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-resident-title"
      onMouseDown={onBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center bg-[#F1F7F2] gap-3 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
            <PiUserPlus className="w-6 h-6" />
          </div>
          <h2 id="add-resident-title" className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Resident' : 'Add New Resident'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <PersonalInformationForm
              value={formData.personal}
              onChange={(v) => setFormData((d) => ({ ...d, personal: v }))}
            />
            <AddressInformationForm
              value={formData.address}
              onChange={(v) => setFormData((d) => ({ ...d, address: v }))}
            />
            <SectoralStatusForm
              value={formData.sectoral}
              onChange={(v) => setFormData((d) => ({ ...d, sectoral: v }))}
            />
            <ValidIdForm
              value={formData.validId}
              status={formData.identification.status}
              onChange={(v) => setFormData((d) => ({ ...d, validId: v }))}
              onStatusChange={(val) =>
                setFormData((d) => ({
                  ...d,
                  identification: { ...d.identification, status: val },
                }))
              }
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-[#F1F7F2] px-6 py-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode === 'add' && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              {mode === 'edit' ? 'Update Resident' : 'Add New Resident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}