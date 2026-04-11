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

// Used in the StatusForm status dropdown (no 'all', no 'archived', no 'pending', no 'deactivated')
export const RESIDENT_STATUS_FORM_OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Used in the Residents table StatusFilter
export const RESIDENT_STATUS_FILTER_OPTIONS = [
  { value: 'all',         label: 'All Status' },
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'pending',     label: 'Pending' },
  { value: 'deactivated', label: 'Deactivated' },
  { value: 'archived',    label: 'Archived' },
];

// Keep the old name as an alias so nothing else breaks
export const RESIDENT_STATUS_OPTIONS = RESIDENT_STATUS_FILTER_OPTIONS;

export const EID_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

export const EID_STATUS_FILTER_OPTIONS = [
  { value: 'all',       label: 'All Status' },
  { value: 'active',    label: 'Active' },
  { value: 'inactive',  label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'revoked',   label: 'Revoked' },
  { value: 'expired',   label: 'Expired' },
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
    { value: 'resident_no', label: 'Resident No.' },
    { value: 'last_name',   label: 'Last Name' },
    { value: 'created_at',  label: 'Date Added' },
  ],
  HOUSEHOLDS: [
    { value: 'household_no', label: 'Household No.' },
    { value: 'created_at',   label: 'Date Added' },
  ],
  EIDS: [
    { value: 'eid_number', label: 'eID Number' },
    { value: 'issued_at',  label: 'Date Issued' },
  ],
  REQUESTS: [
    { value: 'requested_at',  label: 'Date Requested' },
    { value: 'document_type', label: 'Document Type' },
  ],
  USER_ACCOUNTS: [
    { value: 'created_at', label: 'Date Joined' },
    { value: 'full_name',  label: 'Name' },
    { value: 'role',       label: 'Role' },
  ],
  INQUIRIES: [
    { value: 'created_at', label: 'Date Submitted' },
    { value: 'full_name',  label: 'Sender Name' },
    { value: 'concern',    label: 'Concern' },
  ],
};

export const INQUIRY_STATUS_FILTER_OPTIONS = [
  { value: 'all',      label: 'All Status' },
  { value: 'unread',   label: 'Unread' },
  { value: 'read',     label: 'Read' },
  { value: 'archived', label: 'Archived' },
];

export const REQUEST_STATUS_FILTER_OPTIONS = [
  { value: 'all',        label: 'All Status' },
  { value: 'pending',    label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready',      label: 'Ready' },
  { value: 'released',   label: 'Released' },
  { value: 'rejected',   label: 'Rejected' },
];

export const USER_ACCOUNT_STATUS_OPTIONS = [
  { value: 'all',      label: 'All' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: 'single',    label: 'Single' },
  { value: 'married',   label: 'Married' },
  { value: 'widowed',   label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'annulled',  label: 'Annulled' },
];

export const SEX_OPTIONS = [
  { value: 'Male',   label: 'Male' },
  { value: 'Female', label: 'Female' },
];

export const BARANGAY = 'San Bartolome';

export const NATIONALITIES = [
  'Afghan','Albanian','Algerian','American','Andorran','Angolan','Antiguan',
  'Argentine','Armenian','Australian','Austrian','Azerbaijani','Bahamian',
  'Bahraini','Bangladeshi','Barbadian','Belarusian','Belgian','Belizean',
  'Beninese','Bhutanese','Bolivian','Bosnian','Botswanan','Brazilian',
  'British','Bruneian','Bulgarian','Burkinabe','Burmese','Burundian',
  'Cambodian','Cameroonian','Canadian','Cape Verdean','Central African',
  'Chadian','Chilean','Chinese','Colombian','Comorian','Congolese',
  'Costa Rican','Croatian','Cuban','Cypriot','Czech','Danish','Djiboutian',
  'Dominican','Dutch','East Timorese','Ecuadorian','Egyptian','Emirati',
  'Equatorial Guinean','Eritrean','Estonian','Eswatini','Ethiopian',
  'Fijian','Filipino','Finnish','French','Gabonese','Gambian','Georgian',
  'German','Ghanaian','Greek','Grenadian','Guatemalan','Guinean',
  'Guinea-Bissauan','Guyanese','Haitian','Honduran','Hungarian','Icelandic',
  'Indian','Indonesian','Iranian','Iraqi','Irish','Israeli','Italian',
  'Ivorian','Jamaican','Japanese','Jordanian','Kazakhstani','Kenyan',
  'Kiribati','Kuwaiti','Kyrgyz','Laotian','Latvian','Lebanese','Liberian',
  'Libyan','Liechtensteiner','Lithuanian','Luxembourgish','Malagasy',
  'Malawian','Malaysian','Maldivian','Malian','Maltese','Marshallese',
  'Mauritanian','Mauritian','Mexican','Micronesian','Moldovan','Monégasque',
  'Mongolian','Montenegrin','Moroccan','Mozambican','Namibian','Nauruan',
  'Nepalese','New Zealander','Nicaraguan','Nigerian','Nigerien','North Korean',
  'North Macedonian','Norwegian','Omani','Pakistani','Palauan','Panamanian',
  'Papua New Guinean','Paraguayan','Peruvian','Polish','Portuguese','Qatari',
  'Romanian','Russian','Rwandan','Saint Kitts and Nevis','Saint Lucian',
  'Saint Vincentian','Samoan','San Marinese','São Toméan','Saudi',
  'Senegalese','Serbian','Seychellois','Sierra Leonean','Singaporean',
  'Slovak','Slovenian','Solomon Islander','Somali','South African',
  'South Korean','South Sudanese','Spanish','Sri Lankan','Sudanese',
  'Surinamese','Swedish','Swiss','Syrian','Taiwanese','Tajik','Tanzanian',
  'Thai','Togolese','Tongan','Trinidadian','Tunisian','Turkish','Turkmen',
  'Tuvaluan','Ugandan','Ukrainian','Uruguayan','Uzbek','Vanuatuan',
  'Venezuelan','Vietnamese','Yemeni','Zambian','Zimbabwean',
].map((n) => ({ value: n, label: n }));

export const OWNERSHIP_TYPE_OPTIONS = [
  { value: 'owned',    label: 'Owned' },
  { value: 'rented',   label: 'Rented' },
  { value: 'shared',   label: 'Shared' },
  { value: 'informal', label: 'Informal Settler' },
];

export const DWELLING_TYPE_OPTIONS = [
  { value: 'house',     label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo',     label: 'Condominium' },
  { value: 'informal',  label: 'Informal' },
];

// Used in the HouseholdForm status dropdown
export const HOUSEHOLD_STATUS_FORM_OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Used in the Households table StatusFilter
export const HOUSEHOLD_STATUS_OPTIONS = [
  { value: 'all',      label: 'All Status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

// Age group options — aligned with Population by Age Group analytics
export const AGE_GROUP_OPTIONS = [
  { value: '0-4',   label: '0–4 years' },
  { value: '5-9',   label: '5–9 years' },
  { value: '10-14', label: '10–14 years' },
  { value: '15-19', label: '15–19 years' },
  { value: '20-24', label: '20–24 years' },
  { value: '25-29', label: '25–29 years' },
  { value: '30-34', label: '30–34 years' },
  { value: '35-39', label: '35–39 years' },
  { value: '40-44', label: '40–44 years' },
  { value: '45-49', label: '45–49 years' },
  { value: '50-54', label: '50–54 years' },
  { value: '55-59', label: '55–59 years' },
  { value: '60-64', label: '60–64 years' },
  { value: '65+',   label: '65+ years' },
];

// Blood type options
export const BLOOD_TYPE_OPTIONS = [
  { value: 'A+',  label: 'A+' },
  { value: 'A-',  label: 'A-' },
  { value: 'B+',  label: 'B+' },
  { value: 'B-',  label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+',  label: 'O+' },
  { value: 'O-',  label: 'O-' },
];