import { useState } from 'react';
import { FiUser, FiMapPin, FiHome, FiAlertCircle, FiLink, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { useMyResidentProfile, useMyHousehold, useLinkResidentAccount } from '../../../hooks/queries/resident/useResidentPortal';
import SectionCard from '../components/ResidentPortal/SectionCard';

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

function age(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function val(v) { return v || '—'; }

// ─── Field Row ───────────────────────────────────────────────────────────────
function FieldRow({ fields }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <p className="text-sm text-gray-400 mb-0.5">{label}</p>
          <p className="font-semibold text-gray-900 text-[16px]">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-2.5 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Not Linked Notice ───────────────────────────────────────────────────────
// ─── Link Account Form ────────────────────────────────────────────────────────
function LinkAccountForm() {
  const [residentNo,   setResidentNo]   = useState('');
  const [lastName,     setLastName]     = useState('');
  const [dateOfBirth,  setDateOfBirth]  = useState('');

  const { mutate: linkAccount, isPending } = useLinkResidentAccount();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!residentNo || !lastName || !dateOfBirth) return;
    linkAccount({ residentNo, lastName, dateOfBirth });
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02] bg-white';

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-5 rounded-xl bg-amber-50 border border-amber-200">
        <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Not yet available</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Your account has not been linked to a resident record yet. If you are a registered
            resident of the barangay, enter your details below to link your account.
          </p>
        </div>
      </div>

      {/* Linking form card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#005F02]/10 flex items-center justify-center">
            <FiLink className="w-5 h-5 text-[#005F02]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Link Your Resident Record</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your barangay-issued Resident Number and verification details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {/* Resident Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Resident Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#005F02]/30 focus-within:border-[#005F02]">
              <div className="bg-gray-50 px-3 py-2.5 border-r border-gray-300 text-gray-400">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={residentNo}
                onChange={(e) => setResidentNo(e.target.value.toUpperCase())}
                placeholder="RES-2026-0000001"
                className="flex-1 px-4 py-2.5 text-sm bg-white focus:outline-none font-mono"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Found on your barangay documents or physical ID.
            </p>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              className={inputCls}
              required
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#005F02]/30 focus-within:border-[#005F02]">
              <div className="bg-gray-50 px-3 py-2.5 border-r border-gray-300 text-gray-400">
                <FiCalendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || !residentNo || !lastName || !dateOfBirth}
            className="w-full py-2.5 rounded-lg bg-[#005F02] text-white text-sm font-semibold hover:bg-[#004A01] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {isPending ? 'Verifying…' : 'Link My Account'}
          </button>
        </form>

        {/* Help note */}
        <p className="text-xs text-gray-400 mt-6 pt-5 border-t border-gray-100">
          Can't find your Resident Number? Visit the Barangay Office and present a valid ID.
          Staff can look up your record and provide your number.
        </p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ResidentProfilePage() {
  const { data: resident, isLoading: loadingProfile } = useMyResidentProfile();
  const { data: household, isLoading: loadingHousehold } = useMyHousehold();

  if (loadingProfile) return <Skeleton />;

  if (!resident) {
    return <LinkAccountForm />;
  }

  const restOfName = [resident.first_name, resident.middle_name, resident.suffix]
    .filter(Boolean).join(' ');
  const fullNameLastFirst = resident.last_name
    ? `${resident.last_name}, ${restOfName}`.trim().replace(/,\s*$/, '')
    : restOfName || '—';

  const statusLabel = resident.status
    ? resident.status.charAt(0).toUpperCase() + resident.status.slice(1)
    : 'Active';

  // Address fields: prefer household columns if linked,
  // otherwise parse back from the concatenated address_line string.
  const parseAddr = (line) => {
    if (!line) return { houseNo: '', street: '', purok: '' };
    const withoutBarangay = line.replace(/,?\s*San Bartolome\s*$/i, '').trim();
    const parts = withoutBarangay.split(',').map((s) => s.trim()).filter(Boolean);
    return { houseNo: parts[0] ?? '', street: parts[1] ?? '', purok: parts[2] ?? '' };
  };
  const parsed  = parseAddr(resident.address_line);
  const houseNo = household?.house_no ?? resident.households?.house_no ?? parsed.houseNo;
  const street  = household?.street   ?? resident.households?.street   ?? parsed.street;
  const purok   = resident.puroks?.name ?? parsed.purok;

  return (
    <div className="space-y-5 mx-auto max-w-7xl">

      {/* ── Profile Header Card ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5 border-t-4 border-t-[#005F02]">
        <div className="w-24 h-24 rounded-sm bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
          {resident.photo_url ? (
            <img src={resident.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <FiUser className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{fullNameLastFirst}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Resident No.: {resident.resident_no ?? '—'}
          </p>
          <span className={`inline-flex items-center mt-2 px-5 py-0.5 rounded-lg text-sm font-semibold border ${
            resident.status === 'active'
              ? 'bg-[#BFE8BF] text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* ── Personal Information ────────────────────────────── */}
      <SectionCard icon={FiUser} title="Personal Information">
        <FieldRow
          fields={[
            { label: 'Last Name',      value: val(resident.last_name) },
            { label: 'First Name',     value: val(resident.first_name) },
            { label: 'Middle Name',    value: val(resident.middle_name) || 'N/A' },
            { label: 'Suffix',         value: val(resident.suffix) },
            { label: 'Birthdate',      value: fmt(resident.date_of_birth) },
            { label: 'Sex',            value: resident.sex === 'M' ? 'Male' : resident.sex === 'F' ? 'Female' : val(resident.sex) },
            { label: 'Age',            value: age(resident.date_of_birth) ? `${age(resident.date_of_birth)}` : '—' },
            { label: 'Civil Status',   value: resident.civil_status ? resident.civil_status.charAt(0).toUpperCase() + resident.civil_status.slice(1) : '—' },
            { label: 'Blood Type',     value: val(resident.blood_type) },
            { label: 'Contact Number', value: val(resident.contact_number) },
          ]}
        />
      </SectionCard>

      {/* ── Address Information ─────────────────────────────── */}
      <SectionCard icon={FiMapPin} title="Address Information">
        <FieldRow
          fields={[
            { label: 'House No.',    value: val(houseNo) },
            { label: 'Purok / Zone', value: val(purok) },
            { label: 'Street',       value: val(street) },
            { label: 'Barangay',     value: 'San Bartolome' },
          ]}
        />
      </SectionCard>

      {/* ── Household Information ───────────────────────────── */}
      <SectionCard icon={FiHome} title="Household Information" className="border-b-4 border-b-[#005F02]">
        {loadingHousehold ? (
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ) : !household ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Not yet available</p>
              <p className="text-xs text-amber-700 mt-0.5">Your resident record is not currently linked to a household.</p>
            </div>
          </div>
        ) : (
          <FieldRow
            fields={[
              { label: 'Household No.',      value: val(household.household_no) },
              { label: 'Ownership Type',     value: val(household.ownership_type) },
              { label: 'Household Members',  value: household.members?.length ? `${household.members.length}` : '—' },
              { label: 'Household Status',   value: household.status
                  ? household.status.charAt(0).toUpperCase() + household.status.slice(1)
                  : 'Active' },
            ]}
          />
        )}
      </SectionCard>

    </div>
  );
}