import { useState, useRef, useEffect, useMemo } from 'react';
import { IoMdAdd } from 'react-icons/io';
import HouseholdForm from './HouseholdForm';

const emptyForm = {
  houseNo:       '',
  street:        '',
  headResidentId: '',
  ownershipType: '',
  dwellingType:  '',
  monthlyIncome: '',
  status:        'active',
  members:       [], // [{ id, name }]
};

function buildEditForm(raw) {
  if (!raw) return emptyForm;
  return {
    houseNo:        raw.house_no        ?? '',
    street:         raw.street          ?? '',
    headResidentId: raw.head_resident_id ?? '',
    ownershipType:  raw.ownership_type   ?? '',
    dwellingType:   raw.dwelling_type    ?? '',
    monthlyIncome:  raw.monthly_income   ?? '',
    status:         raw.status           ?? 'active',
    // Members are residents linked via household_id — loaded separately in HouseholdForm
    // We pass the pre-fetched member list from the table row's _raw if available
    members: (raw._members ?? []).map((m) => ({
      id:   m.id,
      name: `${m.last_name ?? ''} ${m.first_name ?? ''}`.trim(),
    })),
  };
}

export default function HouseholdAddEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = 'add',
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
    onSubmit?.(formData);
    if (mode === 'add') setFormData(emptyForm);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="household-title"
      onMouseDown={onBackdropClick}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        className="relative bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-3 bg-[#F1F7F2]">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg text-[#005F02]">
            <IoMdAdd className="w-6 h-6" />
          </div>
          <h2 id="household-title" className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Household' : 'Create New Household'}
          </h2>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <HouseholdForm
              value={formData}
              onChange={setFormData}
              householdId={raw?.id ?? null}
            />
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 bg-[#F1F7F2]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode === 'add' && (
              <button
                type="button"
                onClick={() => setFormData(emptyForm)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#005F02] text-white hover:bg-[#004A01]"
            >
              {mode === 'edit' ? 'Update Household' : 'Add New Household'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}