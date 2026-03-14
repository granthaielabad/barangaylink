// src/features/dashboard/components/residents/ResidentAddEdit/PersonalInformationForm.jsx
import { FiUser } from 'react-icons/fi';
import { FormSelect } from '../../../../../shared';
import {
  SEX_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  NATIONALITIES,
  BLOOD_TYPE_OPTIONS,
} from '../../../../../core/constants';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005F02]/30 focus:border-[#005F02]';

// Age group is auto-computed by a DB trigger (fn_compute_age_group)
// from date_of_birth on INSERT/UPDATE — no client-side logic needed.

export default function PersonalInformationForm({ value = {}, onChange }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiUser className="w-5 h-5 text-[#005F02]" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Personal Information
        </h3>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={value.lastName ?? ''} onChange={(e) => update('lastName', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={value.firstName ?? ''} onChange={(e) => update('firstName', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Middle Name</label>
          <input type="text" value={value.middleName ?? ''} onChange={(e) => update('middleName', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Suffix</label>
          <input type="text" value={value.suffix ?? ''} onChange={(e) => update('suffix', e.target.value)} placeholder="e.g. Jr., Sr." className={inputClass} />
        </div>
      </div>

      {/* Birthdate + Sex + Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Birthdate <span className="text-red-500">*</span>
          </label>
          <input type="date" value={value.birthdate ?? ''} onChange={(e) => update('birthdate', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sex <span className="text-red-500">*</span>
          </label>
          <FormSelect placeholder="Sex" value={value.gender ?? ''} onChange={(val) => update('gender', val)} options={SEX_OPTIONS} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
          <input type="text" value={value.contactNumber ?? ''} onChange={(e) => update('contactNumber', e.target.value)} placeholder="09XXXXXXXXX" className={inputClass} />
        </div>
      </div>

      {/* Civil status + Place of birth + Nationality + Blood Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Civil Status</label>
          <FormSelect placeholder="Civil Status" value={value.civilStatus ?? ''} onChange={(val) => update('civilStatus', val)} options={CIVIL_STATUS_OPTIONS} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Place of Birth <span className="text-red-500">*</span>
          </label>
          <input type="text" value={value.placeOfBirth ?? ''} onChange={(e) => update('placeOfBirth', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nationality <span className="text-red-500">*</span>
          </label>
          <FormSelect placeholder="Nationality" value={value.nationality ?? 'Filipino'} onChange={(val) => update('nationality', val)} options={NATIONALITIES} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Type</label>
          <FormSelect placeholder="Blood Type" value={value.bloodType ?? ''} onChange={(val) => update('bloodType', val)} options={BLOOD_TYPE_OPTIONS} />
        </div>
      </div>

      {/* Religion + Occupation + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Religion</label>
          <input type="text" value={value.religion ?? ''} onChange={(e) => update('religion', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupation</label>
          <input type="text" value={value.occupation ?? ''} onChange={(e) => update('occupation', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={value.email ?? ''} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" className={inputClass} />
        </div>
      </div>

      {/* Voter status */}
      <div className="flex items-center gap-3 pt-1">
        <input id="voter-status" type="checkbox" checked={value.voterStatus ?? false} onChange={(e) => update('voterStatus', e.target.checked)} className="w-4 h-4 accent-[#005F02] cursor-pointer" />
        <label htmlFor="voter-status" className="text-sm font-medium text-gray-700 cursor-pointer">Registered Voter</label>
      </div>
    </div>
  );
}