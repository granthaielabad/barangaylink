import { useState, useRef, useEffect, useMemo } from 'react';
import { IoMdAdd } from 'react-icons/io';
import EidForms from './EidForms';
import ValidIdForm from '../Residents/ResidentAddEdit/ValidIdForm';

const emptyForm = {
  residentId:    '',
  residentName:  '',
  firstName:     '',
  middleName:    '',
  lastName:      '',
  suffix:        '',
  dateOfBirth:   '',
  sex:           '',
  address:       '',
  contactNumber: '',
  email:         '',
  photoUrl:      null,
  hasEid:        false,
  eidStatus:     null,
  eidNumber:     null,
  validIdType:   '',
  validIdNumber: '',
  validIdFile:   null,
};

function buildEditForm(raw) {
  if (!raw) return emptyForm;
  const r = raw.residents ?? {};
  const fullName = [r.last_name, r.first_name, r.middle_name, r.suffix]
    .filter(Boolean).join(' ');
  return {
    residentId:    r.id             ?? '',
    residentName:  fullName,
    firstName:     r.first_name     ?? '',
    middleName:    r.middle_name    ?? '',
    lastName:      r.last_name      ?? '',
    suffix:        r.suffix         ?? '',
    dateOfBirth:   r.date_of_birth  ?? '',
    sex:           r.sex === 'M' ? 'Male' : r.sex === 'F' ? 'Female' : r.sex ?? '',
    address:       r.address_line   ?? r.puroks?.name ?? '',
    contactNumber: r.contact_number ?? '',
    email:         r.email          ?? '',
    photoUrl:      r.photo_url      ?? null,
    hasEid:        true,
    eidStatus:     raw.status       ?? null,
    eidNumber:     raw.eid_number   ?? null,
    validIdType:   r.valid_id_type   ?? '',
    validIdNumber: r.valid_id_number ?? '',
    validIdFile:   null,
  };
}

export default function EidModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.residentId) return;
    onSubmit?.({
      residentId:    formData.residentId,
      hasEid:        formData.hasEid,
      eidStatus:     formData.eidStatus,
      photoUrl:      formData.photoUrl      ?? null,
      validIdType:   formData.validIdType   || null,
      validIdNumber: formData.validIdNumber || null,
      validIdFile:   formData.validIdFile   ?? null,
    });
    setFormData(emptyForm);
    onClose?.();
  };

  if (!isOpen) return null;

  const canSubmit = !!formData.residentId && !(formData.hasEid && formData.eidStatus === 'active');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eid-modal-title"
      onMouseDown={onBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#F1F7F2] border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
              <IoMdAdd className="w-6 h-6" />
            </div>
            <h2 id="eid-modal-title" className="text-xl font-semibold text-gray-900">
              {mode === 'edit' ? 'Edit eID' : 'Create New eID'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <EidForms value={formData} onChange={setFormData} mode={mode} />
            <ValidIdForm
              value={{ validIdType: formData.validIdType, validIdNumber: formData.validIdNumber, validIdFile: formData.validIdFile }}
              onChange={(v) => setFormData((d) => ({ ...d, ...v }))}
            />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-[#F1F7F2] border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {mode === 'edit' ? 'Save Changes' : 'Issue eID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}