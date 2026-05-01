import { IoLocationOutline } from 'react-icons/io5';
import { BARANGAY, STA_LUCIA_STREETS } from '../../../../../core/constants';
import { FormSelect } from '../../../../../shared';
import { useSitios } from '../../../../../hooks/queries/dashboard/useSitios';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A]';

const lockedInputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-base cursor-not-allowed select-none';

export default function AddressInformationForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });
  const { data: sitioOptions = [], isLoading: sitiosLoading } = useSitios();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <IoLocationOutline className="w-5 h-5 text-[#8C0B1A]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Address Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1.5 sm:min-h-[40px] flex items-end">
            <span>House No., block, lot, apt, suite, unit, building, floor, etc: <span className="text-red-500">*</span></span>
          </label>
          <input type="text" value={value.houseNo ?? ''} onChange={(e) => update('houseNo', e.target.value)} className={inputClass} placeholder="e.g. Blk 1 Lot 2, Phase 3" required />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1.5 sm:min-h-[40px] flex items-end">
            <span>Street, village, etc. <span className="text-red-500">*</span></span>
          </label>
          <input type="text" list="sta-lucia-streets" value={value.street ?? ''} onChange={(e) => update('street', e.target.value)} className={inputClass} placeholder="e.g. J.P. Rizal St." required />
          <datalist id="sta-lucia-streets">
            {STA_LUCIA_STREETS.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sitio <span className="text-red-500">*</span></label>
          <FormSelect
            placeholder={sitiosLoading ? 'Loading Sitios…' : 'Select Sitio'}
            value={value.purokId ?? ''}
            onChange={(val) => {
              const selectedOpt = sitioOptions.find(opt => opt.value === val);
              onChange?.({
                ...value,
                purokId: val,
                purok: selectedOpt ? selectedOpt.label : ''
              });
            }}
            options={sitioOptions}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Barangay</label>
          <input type="text" value={BARANGAY} readOnly className={lockedInputClass} />
        </div>
      </div>
    </div>
  );
}
