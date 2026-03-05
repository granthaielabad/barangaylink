// src/core/constants.js
// ─────────────────────────────────────────────────────────────
// Single source of truth for all domain constants.
// Import from here — never hardcode strings in components.
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  SUPERADMIN: 'superadmin',
  STAFF: 'staff',
  RESIDENT: 'resident',
};

export const RESIDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  DEACTIVATED: 'deactivated',
  ARCHIVED: 'archived',
};

export const RESIDENT_STATUS_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'pending',     label: 'Pending' },
  { value: 'deactivated', label: 'Deactivated' },
  { value: 'archived',    label: 'Archived' },
];

export const EID_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

export const DOCUMENT_TYPES = [
  { value: 'barangay_clearance',        label: 'Barangay Clearance' },
  { value: 'certificate_of_residency',  label: 'Certificate of Residency' },
  { value: 'indigency_certificate',     label: 'Indigency Certificate' },
  { value: 'business_clearance',        label: 'Business Clearance' },
  { value: 'other',                     label: 'Other' },
];

export const DOCUMENT_REQUEST_STATUS = {
  PENDING:    'pending',
  PROCESSING: 'processing',
  READY:      'ready',
  RELEASED:   'released',
  REJECTED:   'rejected',
};

export const PAGE_SIZE = 8;

export const SORT_FIELDS = {
  RESIDENTS: [
    { value: 'last_name',   label: 'Last Name' },
    { value: 'created_at',  label: 'Date Added' },
    { value: 'status',      label: 'Status' },
  ],
  HOUSEHOLDS: [
    { value: 'created_at',  label: 'Date Added' },
    { value: 'house_no',    label: 'House No.' },
    { value: 'status',      label: 'Status' },
  ],
};

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single',    label: 'Single' },
  { value: 'married',   label: 'Married' },
  { value: 'widowed',   label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled',  label: 'Annulled' },
];

export const SEX_OPTIONS = [
  { value: 'M',     label: 'Male' },
  { value: 'F',     label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const OWNERSHIP_TYPE_OPTIONS = [
  { value: 'owned',    label: 'Owned' },
  { value: 'rented',   label: 'Rented' },
  { value: 'shared',   label: 'Shared' },
  { value: 'informal', label: 'Informal Settler' },
];