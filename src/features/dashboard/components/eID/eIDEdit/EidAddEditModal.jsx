import { useState, useRef, useEffect, useMemo } from 'react';
import { IoMdAdd } from 'react-icons/io';
import EidForms from '../EidForms';
import ValidIdForm from '../../../Residents/ResidentAddEdit/ValidIdForm';

const initialFormData = {
  idNumber: '',
  lastName: '',
  firstName: '',
  middleName: '',
  suffix: '',
  birthdate: '',
  gender: '',
  address: '',
  contactNumber: '',
  emailAddress: '',
  validIdType:   '',
  validIdNumber: '',
  validIdFile:   null,
};

function parseNameToFormData(name) {
  const parts = name?.split(' ') ?? [];
  let lastName = '',
    firstName = '',
    middleName = '',
    suffix = '';

  if (parts.length >= 2) {
    lastName = parts[parts.length - 1];
    firstName = parts[0];
    middleName = parts.slice(1, -1).join(' ');
  } else if (parts.length === 1) {
    firstName = parts[0];
  }

  const suffixMatch = middleName.match(/(Jr\.|Sr\.|II|III|IV)$/);
  if (suffixMatch) {
    suffix = suffixMatch[1];
    middleName = middleName.replace(/\s+(Jr\.|Sr\.|II|III|IV)$/, '').trim();
  }

  return { lastName, firstName, middleName, suffix };
}

export default function EidAddEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'create',
}) {
  const getInitialFormData = useMemo(() => {
    if (initialData && mode === 'edit') {
      const nameParts = parseNameToFormData(initialData.name);
      return {
        ...initialFormData,
        idNumber: initialData.idNumber ?? '',
        address: initialData.address ?? '',
        ...nameParts,
        birthdate: initialData.birthdate ?? '',
        gender: initialData.gender ?? '',
        contactNumber: initialData.contactNumber ?? '',
        emailAddress: initialData.emailAddress ?? '',
      };
    }
    return initialFormData;
  }, [initialData, mode]);

  const [formData, setFormData] = useState(getInitialFormData);
  const panelRef = useRef(null);

  useEffect(() => {
    setFormData(getInitialFormData);
  }, [getInitialFormData]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const onBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const suffixPart = formData.suffix ? ` ${formData.suffix}` : '';
    const fullName = name + suffixPart;

    const eid = {
      idNumber: formData.idNumber,
      name: fullName || formData.firstName,
      address: formData.address,
      birthdate: formData.birthdate,
      gender: formData.gender,
      contactNumber: formData.contactNumber,
      emailAddress: formData.emailAddress,
      validIdType:   formData.validIdType   || null,
      validIdNumber: formData.validIdNumber || null,
      validIdFile:   formData.validIdFile   ?? null,
    };
    onSubmit?.(eid);
    setFormData(initialFormData);
    onClose?.();
  };

  if (!isOpen) return null;

  const fullName = formData.firstName || formData.lastName
    ? [formData.firstName, formData.middleName, formData.lastName]
        .filter(Boolean)
        .join(' ')
    : '';

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
            <h2
              id="eid-modal-title"
              className="text-xl font-semibold text-gray-900"
            >
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
          {/* Form body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <EidForms value={formData} onChange={setFormData} fullName={fullName} />
            <ValidIdForm
              value={{ validIdType: formData.validIdType, validIdNumber: formData.validIdNumber, validIdFile: formData.validIdFile }}
              onChange={(v) => setFormData((d) => ({ ...d, ...v }))}
            />
          </div>

          {/* Footer */}
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
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add New eID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
