import { useMemo, useState } from 'react';
import { ExportButton, Pagination, SortFilter } from '../../../../shared';
import { PiFileCsvLight } from 'react-icons/pi';
import { BARANGAY } from '../../../../core/constants';
import { useAllResidents } from '../../../../hooks/queries/residents/useResidents';
import { useSitios } from '../../../../hooks/queries/dashboard/useSitios';

const PAGE_SIZE = 8;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'senior', label: 'Senior Citizen' },
  { value: 'pwd', label: 'PWD' },
  { value: 'children', label: 'Children (0-12)' },
  { value: 'lgbtq', label: 'LGBTQ+' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const EXPORT_OPTIONS = [{ label: 'CSV', icon: PiFileCsvLight, format: 'csv' }];

function calculateAge(dob) {
  if (!dob) return 0;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export default function BeneficiaryTable() {
  const [category, setCategory] = useState('all');
  const [sitio, setSitio] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data: residents = [] } = useAllResidents();
  const { data: sitiosData = [] } = useSitios();

  const SITIO_OPTIONS = useMemo(() => {
    return [{ value: 'all', label: 'All Sitios' }, ...sitiosData.map(s => ({ value: s.label, label: s.label }))];
  }, [sitiosData]);

  // ── Data Processing Logic ──────────────────────────────────────────────────
  const processedBeneficiaries = useMemo(() => {
    return residents.map(r => {
      const age = calculateAge(r.date_of_birth);
      
      let primaryCat = 'N/A';
      if (age >= 60) primaryCat = 'Senior Citizen';
      else if (r.is_pwd) primaryCat = 'PWD';
      else if (age < 13) primaryCat = 'Children (0-12)';
      else if (r.is_indigent) primaryCat = 'LGBTQ+';

      const sitioName = r.puroks?.name ?? (r.address_line?.split(',')[2]?.trim() || 'Unspecified');

      return {
        id: r.id,
        name: `${r.last_name}, ${r.first_name}`,
        householdId: r.households?.household_no ?? 'No Link',
        category: primaryCat,
        categoryKey: primaryCat === 'Senior Citizen' ? 'senior' : 
                    primaryCat === 'PWD' ? 'pwd' : 
                    primaryCat === 'Children (0-12)' ? 'children' : 
                    primaryCat === 'LGBTQ+' ? 'lgbtq' : 'none',
        sitio: sitioName,
        programEligible: r.status === 'active' ? 'Yes' : 'Pending',
        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Active'
      };
    }).filter(b => b.category !== 'N/A');
  }, [residents]);

  const filteredBeneficiaries = useMemo(() => {
    return processedBeneficiaries.filter((b) => {
      const categoryMatch = category === 'all' || b.categoryKey === category;
      const sitioMatch = sitio === 'all' || b.sitio === sitio;
      const statusMatch = status === 'all' || b.status.toLowerCase() === status;
      return categoryMatch && sitioMatch && statusMatch;
    });
  }, [processedBeneficiaries, category, sitio, status]);

  const totalEntries = filteredBeneficiaries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const rows = filteredBeneficiaries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleExport = () => {
    if (filteredBeneficiaries.length === 0) return;
    const headers = ['Resident Name', 'Household ID', 'Sitio', 'Primary Category', 'Program Eligible', 'Status'];
    const csvRows = filteredBeneficiaries.map(b => [
      `"${b.name}"`,
      `"${b.householdId}"`,
      `"${b.sitio}"`,
      `"${b.category}"`,
      `"${b.programEligible}"`,
      `"${b.status}"`
    ]);
    
    const csvContent = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Beneficiary_List_${BARANGAY.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Beneficiary Profiling Engine</h2>
        <p className="text-sm text-gray-500 mt-1">
          Automated eligibility list for Barangay Aid & Health Programs (Seniors, PWDs, Youth).
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SortFilter
            value={category}
            options={CATEGORY_OPTIONS}
            onChange={handleFilterChange(setCategory)}
          />
          <SortFilter
            value={sitio}
            options={SITIO_OPTIONS}
            onChange={handleFilterChange(setSitio)}
          />
          <SortFilter
            value={status}
            options={STATUS_OPTIONS}
            onChange={handleFilterChange(setStatus)}
          />
        </div>
        <ExportButton label="Export Beneficiaries" options={EXPORT_OPTIONS} onExport={handleExport} />
      </div>

      <div className="overflow-x-auto w-full rounded-xl border border-gray-200">
        <table className="w-full text-base">
          <thead>
            <tr className="text-left text-sm bg-gray-50 text-gray-700 border-b border-gray-200">
              <th className="py-4 px-6 font-bold">Resident Name</th>
              <th className="py-4 px-6 font-bold">Household</th>
              <th className="py-4 px-6 font-bold">Sitio</th>
              <th className="py-4 px-6 font-bold">Primary Category</th>
              <th className="py-4 px-6 font-bold">Program Eligible</th>
              <th className="py-4 px-6 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-gray-900 font-medium">{b.name}</td>
                <td className="py-4 px-6 text-gray-500 font-mono text-sm">{b.householdId}</td>
                <td className="py-4 px-6 text-gray-600">{b.sitio}</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 rounded-md bg-[#8C0B1A]/5 text-[#8C0B1A] text-xs font-bold uppercase tracking-wider">
                    {b.category}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${b.programEligible === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                    {b.programEligible}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <button className="text-sm font-bold text-[#8C0B1A] hover:underline">View File</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-12 text-center text-gray-400 italic">No residents meet the criteria for the selected beneficiary filters.</div>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalEntries={totalEntries}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
