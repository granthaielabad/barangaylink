import { FiUser, FiMapPin, FiHome, FiAlertCircle } from 'react-icons/fi';
import { useMyResidentProfile, useMyHousehold } from '../../../hooks/queries/resident/useResidentPortal';
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
function NotLinked({ message }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
      <FiAlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-amber-800">Not yet available</p>
        <p className="text-xs text-amber-700 mt-0.5">{message}</p>
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
    return (
      <NotLinked message="Your account has not been linked to a resident record yet. Please contact the Barangay Office." />
    );
  }

  const fullNameLastFirst = [
    resident.last_name,
    resident.first_name,
    resident.middle_name,
    resident.suffix,
  ].filter(Boolean).join(' ') || '—';

  const statusLabel = resident.status
    ? resident.status.charAt(0).toUpperCase() + resident.status.slice(1)
    : 'Active';

  // Address fields: resident stores address_line; detailed breakdown
  // lives on the household row (house_no, street) and puroks (name).
  const houseNo = household?.house_no ?? resident.households?.house_no;
  const street  = household?.street  ?? resident.households?.street;
  const purok   = resident.puroks?.name ?? household?.puroks?.name;

  return (
    <div className="space-y-5 mx-auto max-w-7xl">

      {/* ── Profile Header Card ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5 border-t-4 border-t-[#005F02] pb-10">
        <div className="w-32 h-32 rounded-sm bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
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
      <SectionCard icon={FiUser} title="Personal Information" className="pb-10">
        <FieldRow
          fields={[
            { label: 'Last Name',      value: val(resident.last_name) },
            { label: 'First Name',     value: val(resident.first_name) },
            { label: 'Middle Name',    value: val(resident.middle_name) || 'N/A' },
            { label: 'Suffix',         value: val(resident.suffix) },
            { label: 'Birthdate',      value: fmt(resident.date_of_birth) },
            { label: 'Sex',            value: val(resident.sex) },
            { label: 'Age',            value: age(resident.date_of_birth) ? `${age(resident.date_of_birth)}` : '—' },
            { label: 'Civil Status',   value: val(resident.civil_status) },
            { label: 'Blood Type',     value: val(resident.blood_type) },
            { label: 'Contact Number', value: val(resident.contact_number) },
          ]}
        />
      </SectionCard>

      {/* ── Address Information ─────────────────────────────── */}
      <SectionCard icon={FiMapPin} title="Address Information" className="pb-10">
        <FieldRow
          fields={[
            { label: 'House No.',    value: val(houseNo) },
            { label: 'Purok / Zone', value: val(purok) },
            { label: 'Street',       value: val(street) },
            { label: 'Barangay',     value: 'San Bartolome' },
          ]}
        />
      </SectionCard >

      {/* ── Household Information ───────────────────────────── */}
      <SectionCard icon={FiHome} title="Household Information" className="border-b-4 border-b-[#005F02] pb-10">
        {loadingHousehold ? (
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ) : !household ? (
          <NotLinked message="Your resident record is not currently linked to a household." />
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