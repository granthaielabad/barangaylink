import { useMemo, useState } from 'react';
import { ExportButton, Pagination, SortFilter } from '../../../../shared';
import { PiFileCsvLight } from 'react-icons/pi';

const PAGE_SIZE = 8;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Category' },
  { value: 'senior', label: 'Senior' },
  { value: 'pwd', label: 'PWD' },
  { value: 'children', label: 'Children' },
  { value: 'pregnant', label: 'Pregnant' },
];

const PUROK_OPTIONS = [
  { value: 'all', label: 'Purok/Zone' },
  { value: 'purok-1', label: 'Purok 1' },
  { value: 'purok-2', label: 'Purok 2' },
  { value: 'purok-3', label: 'Purok 3' },
  { value: 'purok-4', label: 'Purok 4' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Status' },
  { value: 'active', label: 'Active' },
  { value: 'verification-needed', label: 'Verification Needed' },
];

const EXPORT_OPTIONS = [{ label: 'CSV', icon: PiFileCsvLight, format: 'csv' }];

const DEFAULT_BENEFICIARIES = [
  { id: 1, name: 'JM Melca C. Nueva', householdId: '0152', category: 'Senior', purok: 'purok-1', programEligible: 'Yes', status: 'Active' },
  { id: 2, name: 'Raine Heart Nacion', householdId: '0973', category: 'PWD', purok: 'purok-2', programEligible: 'Pending', status: 'Verification Needed' },
  { id: 3, name: 'Grant Haeil Abad', householdId: '1157', category: 'Children', purok: 'purok-3', programEligible: 'Yes', status: 'Active' },
  { id: 4, name: 'Ariana Roxanne Malegro', householdId: '0835', category: 'Pregnant', purok: 'purok-1', programEligible: 'Yes', status: 'Active' },
  { id: 5, name: 'Murphy De Guzman', householdId: '0856', category: 'PWD', purok: 'purok-2', programEligible: 'Yes', status: 'Active' },
  { id: 6, name: 'Sophia Nicole Cecillano', householdId: '1240', category: 'Pregnant', purok: 'purok-4', programEligible: 'Pending', status: 'Verification Needed' },
  { id: 7, name: 'Anna Dela Cruz', householdId: '0772', category: 'Senior', purok: 'purok-3', programEligible: 'Pending', status: 'Verification Needed' },
  { id: 8, name: 'Carlo Jeus S. Cacho', householdId: '0106', category: 'Children', purok: 'purok-1', programEligible: 'Yes', status: 'Active' },
  { id: 9, name: 'Nina B. Del Mundo', householdId: '0922', category: 'Senior', purok: 'purok-4', programEligible: 'Yes', status: 'Active' },
  { id: 10, name: 'Felix M. Alcaraz', householdId: '0319', category: 'PWD', purok: 'purok-1', programEligible: 'Pending', status: 'Verification Needed' },
  { id: 11, name: 'Joanna C. Rey', householdId: '0414', category: 'Pregnant', purok: 'purok-2', programEligible: 'Yes', status: 'Active' },
  { id: 12, name: 'Luis P. Hernandez', householdId: '1012', category: 'Children', purok: 'purok-3', programEligible: 'Yes', status: 'Active' },
];

const toStatusValue = (status) => status.toLowerCase().replace(/\s+/g, '-');
const toCategoryValue = (category) => category.toLowerCase();

export default function BeneficiaryTable({ beneficiaries = DEFAULT_BENEFICIARIES }) {
  const [category, setCategory] = useState('all');
  const [purok, setPurok] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const filteredBeneficiaries = useMemo(
    () =>
      beneficiaries.filter((beneficiary) => {
        const categoryMatch = category === 'all' || toCategoryValue(beneficiary.category) === category;
        const purokMatch = purok === 'all' || beneficiary.purok === purok;
        const statusMatch = status === 'all' || toStatusValue(beneficiary.status) === status;
        return categoryMatch && purokMatch && statusMatch;
      }),
    [beneficiaries, category, purok, status]
  );

  const totalEntries = filteredBeneficiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filteredBeneficiaries.slice(start, start + PAGE_SIZE);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <h2 className="mb-5 font-semibold text-[25px]">Eligible Beneficiaries List</h2>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="flex flex-wrap items-center w-full lg:w-auto">
          <div className="w-full sm:w-[140px]">
            <SortFilter
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={handleFilterChange(setCategory)}
            />
          </div>
          <div className="w-full sm:w-[160px]">
            <SortFilter
              value={purok}
              options={PUROK_OPTIONS}
              onChange={handleFilterChange(setPurok)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <SortFilter
              value={status}
              options={STATUS_OPTIONS}
              onChange={handleFilterChange(setStatus)}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto lg:ml-auto">
          <ExportButton label="Export CSV" options={EXPORT_OPTIONS} onExport={() => {}} />
        </div>
      </div>

      <div className="overflow-x-auto w-full rounded-lg border border-gray-200">
        <table className="w-full min-w-[820px] text-base">
          <thead>
            <tr className="text-left text-sm bg-[#F1F7F2] text-gray-700 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Name</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Household ID</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Category</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Program Eligible</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((beneficiary, idx) => (
              <tr
                key={beneficiary.id}
                className={`border-b border-gray-100 last:border-b-0 ${idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <td className="py-3 px-4 text-gray-800 align-middle">{beneficiary.name}</td>
                <td className="py-3 px-4 text-gray-800 align-middle">{beneficiary.householdId}</td>
                <td className="py-3 px-4 text-gray-800 align-middle">{beneficiary.category}</td>
                <td className={`py-3 px-4 font-medium align-middle ${beneficiary.programEligible === 'Yes' ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {beneficiary.programEligible}
                </td>
                <td className={`py-3 px-4 font-medium align-middle ${beneficiary.status === 'Active' ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {beneficiary.status}
                </td>
                <td className="py-3 px-4 align-middle text-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#00880E] text-white hover:bg-[#006f0b] transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalEntries={totalEntries}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
