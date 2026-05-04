import { useState } from 'react';
import {
  FiUser, FiMapPin, FiHome, FiAlertCircle, FiLink,
  FiCalendar, FiCheck, FiShield, FiCreditCard,
} from 'react-icons/fi';
import { useMyResidentProfile, useMyHousehold, useLinkResidentAccount } from '../../../hooks/queries/resident/useResidentPortal';
import SectionCard from '../components/ResidentPortal/SectionCard';
import { BARANGAY } from '../../../core/constants';

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
function cap(s) {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Full date label e.g. "May 2, 2026" for signature attestations */
function fmtSignedLong(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Lightweight anti-tamper visual — does not cryptographic verify */
function SignatureSecurityWatermark({ className = '' }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -32deg,
            transparent,
            transparent 32px,
            rgba(140, 11, 26, 0.55) 32px,
            rgba(140, 11, 26, 0.55) 33px
          )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-black uppercase tracking-[0.25em] text-[#8C0B1A] rotate-[-16deg]
            whitespace-nowrap opacity-[0.06] text-lg sm:text-xl"
        >
          BarangayLink
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center translate-y-[30%]">
        <span
          className="font-semibold uppercase tracking-[0.2em] text-[#8C0B1A] rotate-[-16deg]
            whitespace-nowrap opacity-[0.045] text-[9px]"
        >
          Official · Copy prohibited
        </span>
      </div>
    </div>
  );
}

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

  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C0B1A]/30 focus:border-[#8C0B1A] bg-white';

  return (
    <div className="max-w-7xl mx-auto space-y-5">
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#8C0B1A]/10 flex items-center justify-center">
            <FiLink className="w-5 h-5 text-[#8C0B1A]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Link Your Resident Record</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your barangay-issued Resident Number and verification details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 mx-auto">
              Resident Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#8C0B1A]/30 focus-within:border-[#8C0B1A]">
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
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#8C0B1A]/30 focus-within:border-[#8C0B1A]">
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
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-[#8C0B1A] text-white text-sm font-semibold hover:bg-[#7A0915] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {isPending ? 'Verifying…' : 'Link My Account'}
          </button>
        </form>
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

  const parseAddr = (line) => {
    if (!line) return { houseNo: '', street: '', purok: '' };
    const withoutBarangay = line.replace(new RegExp(`,?\\s*${BARANGAY}\\s*$`, 'i'), '').trim();
    const parts = withoutBarangay.split(',').map((s) => s.trim()).filter(Boolean);
    return { houseNo: parts[0] ?? '', street: parts[1] ?? '', purok: parts[2] ?? '' };
  };
  const parsed  = parseAddr(resident.address_line);
  const houseNo = household?.house_no ?? resident.households?.house_no ?? parsed.houseNo;
  const street  = household?.street   ?? resident.households?.street   ?? parsed.street;
  const purok   = resident.puroks?.name ?? parsed.purok;

  return (
    <div className="space-y-5 mx-auto max-w-7xl pb-10">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-5 border-t-4 border-t-[#8C0B1A]">
        <div className="w-24 h-24 rounded-sm bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
          {resident.photo_url ? (
            <img src={resident.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <FiUser className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{fullNameLastFirst}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Resident No.: {resident.resident_no ?? '—'}</p>
          <span className={`inline-flex items-center mt-2 px-5 py-0.5 rounded-lg text-sm font-semibold border ${
            resident.status === 'active'
              ? 'bg-[#BFE8BF] text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Personal Info */}
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

      {/* Address Info */}
      <SectionCard icon={FiMapPin} title="Address Information">
        <FieldRow
          fields={[
            { label: 'House No.',    value: val(houseNo) },
            { label: 'Sitio',        value: val(purok) },
            { label: 'Street',       value: val(street) },
            { label: 'Barangay',     value: BARANGAY },
          ]}
        />
      </SectionCard>

      {/* Household Info */}
      <SectionCard icon={FiHome} title="Household Information">
        {loadingHousehold ? (
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
        ) : !household ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-gray-500">
            <FiAlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <span>Not currently linked to a household record.</span>
          </div>
        ) : (
          <FieldRow
            fields={[
              { label: 'Household No.',      value: val(household.household_no) },
              { label: 'Ownership Type',     value: cap(household.ownership_type) },
              { label: 'Household Status',   value: cap(household.status) },
            ]}
          />
        )}
      </SectionCard>

      {/* Resident Signature — verified registry display + security watermark */}
      <SectionCard
        icon={FiShield}
        title="Verified Resident Signature"
        className="border-b-4 border-b-[#8C0B1A]"
      >
        {resident.signature_url ? (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden max-w-xl mx-auto">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="relative isolate mx-auto sm:mx-0 w-full max-w-[200px] sm:w-[200px] shrink-0 rounded-lg bg-gray-50/80 px-4 py-3 border border-gray-100 overflow-hidden min-h-[92px] flex items-center justify-center">
                  <SignatureSecurityWatermark />
                  <img
                    src={resident.signature_url}
                    alt="Resident signature on file"
                    draggable={false}
                    className="relative z-[2] max-h-[88px] w-full object-contain object-center mix-blend-multiply select-none"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-center gap-2 text-center sm:text-left min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-tight">
                    Resident Signature on File
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 self-center sm:self-start rounded-full border border-emerald-200
                      bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900"
                  >
                    <FiCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} aria-hidden />
                    Verified Digital Signature <span aria-hidden className="text-emerald-700">✓</span>
                  </span>
                  {fmtSignedLong(resident.updated_at) ? (
                    <p className="text-xs text-gray-600">
                      Signed on {fmtSignedLong(resident.updated_at)}.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 italic leading-snug">
                      Sign date unavailable; signature verified on registry.
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 leading-snug sm:max-w-xs">
                    Watermark discourages misuse; not a cryptographic seal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 italic text-sm">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <span>No digital signature has been recorded for this resident yet.</span>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
