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

export const BARANGAY = 'Sta. Lucia';

export const STA_LUCIA_STREETS = [
  'J.P. Rizal St.', 'Paguio St.', 'Galvez St.', 'Sta. Marcela St.', 'Castro St.', 
  'Pamana St.', 'Rivera St.', 'Cursilista St.', 'Marco Polo St.', 'Diego Silang St.', 
  'J. Luna St.', 'E. Jacinto St.', 'Gen. Malvar St.', 'F. Balagtas St.', 'Dela Cruz St.', 
  'M. Aquino St.', 'M.H. Del Pilar St.', 'Panganiban St.', 'P. Bukaneg St.', 
  'E. Aguinaldo St.', 'Lopez Jaena St.', 'J. Abad Santos St.', 'Humabon St.', 
  'A. Bonifacio St.', 'Gomez St.', 'Burgos St.', 'Zamora St.', 'Naning Ponce St.', 
  'J. Basa St.', 'A. Mabini St.', 'T. Alonzo St.', 'P. Paterno St.', 'Rajah Soliman St.', 
  'F. Agoncillo St.', 'F. Calderon St.', 'J. Palma St.', 'Lapu Lapu St.',
  'Plain Ville', 'Dona Field', 'Villa Hermano 4', 'Francisco Park', 'Lower Visayas Ave.',
  'Upper Visayas', 'Valbuena Compd.', 'Natividad Subd.', 'Tarha Ville'
];

export const SITIO_STREET_MAP = {
  'Sitio 1': ['J.P. Rizal St.', 'Paguio St.', 'Galvez St.', 'Sta. Marcela St.', 'Castro St.', 'Pamana St.', 'Rivera St.', 'Cursilista St.', 'Plain Ville', 'Dona Field'],
  'Sitio 2': ['Marco Polo St.', 'J.P. Rizal St.', 'Diego Silang St.', 'J. Luna St.', 'E. Jacinto St.', 'Gen. Malvar St.', 'F. Balagtas St.', 'Dela Cruz St.', 'M. Aquino St.', 'M.H. Del Pilar St.', 'Panganiban St.', 'Villa Hermano 4'],
  'Sitio 3': ['M. Aquino St.', 'J.P. Rizal St.', 'P. Bukaneg St.', 'E. Aguinaldo St.', 'Lopez Jaena St.', 'Francisco Park', 'Lower Visayas Ave.', 'Upper Visayas', 'Valbuena Compd.'],
  'Sitio 4': ['J. Abad Santos St.', 'Humabon St.', 'A. Bonifacio St.', 'Gomez St.', 'Burgos St.', 'Zamora St.', 'Naning Ponce St.', 'J. Basa St.', 'J.P. Rizal St.', 'A. Mabini St.', 'Upper Visayas'],
  'Sitio 5': ['J. Abad Santos St.', 'T. Alonzo St.', 'A. Bonifacio St.', 'Sta. Lucia Ave.', 'P. Paterno St.', 'Natividad Subd.', 'Rajah Soliman St.', 'A. Mabini St.'],
  'Sitio 6': ['J. Abad Santos St.', 'P. Paterno St.', 'F. Agoncillo St.', 'T. Alonzo St.'],
  'Sitio 7': ['F. Calderon St.', 'J. Palma St.', 'Lapu Lapu St.', 'Tarha Ville']
};

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

// Valid ID Configuration for Validation & Placeholders
export const VALID_ID_CONFIG = {
  'national_id': {
    label: 'PhilSys (National ID)',
    placeholder: '1234-5678-9012-3456',
    pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$|^\d{16}$/,
    error: 'Format: 1234-5678-9012-3456 (16 digits)',
    maxLength: 19
  },
  'voters_id': {
    label: "Voter's ID",
    placeholder: '1234-5678A-B1234CDE56789',
    pattern: /^[A-Z0-9-]{10,30}$/i,
    error: 'Invalid Voter\'s ID format',
    maxLength: 30
  },
  'drivers_license': {
    label: "Driver's License",
    placeholder: 'L12-34-567890',
    pattern: /^[A-Z]\d{2}-\d{2}-\d{6}$/i,
    error: 'Format: LNN-NN-NNNNNN',
    maxLength: 13
  },
  'passport': {
    label: 'Passport',
    placeholder: 'P1234567A',
    pattern: /^[A-Z][0-9]{7}[A-Z]$|^[A-Z][0-9]{8}$/i,
    error: 'Invalid Passport format',
    maxLength: 12
  },
  'sss': {
    label: 'SSS ID',
    placeholder: '12-3456789-0',
    pattern: /^\d{2}-\d{7}-\d{1}$|^\d{10}$/,
    error: 'Format: 12-3456789-0',
    maxLength: 12
  },
  'philhealth': {
    label: 'PhilHealth ID',
    placeholder: '12-345678901-2',
    pattern: /^\d{2}-\d{9}-\d{1}$|^\d{12}$/,
    error: 'Format: 12-345678901-2',
    maxLength: 14
  },
  'umid': {
    label: 'UMID',
    placeholder: '1234-5678901-2',
    pattern: /^\d{4}-\d{7}-\d{1}$|^\d{12}$/,
    error: 'Format: 1234-5678901-2',
    maxLength: 14
  },
  'tin_id': {
    label: 'TIN ID',
    placeholder: '123-456-789-000',
    pattern: /^\d{3}-\d{3}-\d{3}-\d{3}$|^\d{9,12}$/,
    error: 'Format: 123-456-789-000',
    maxLength: 15
  },
  'postal_id': {
    label: 'Postal ID',
    placeholder: '123456789012',
    pattern: /^\d{12}$/,
    error: 'Format: 12 digits',
    maxLength: 12
  },
  'prc_id': {
    label: 'PRC ID',
    placeholder: '1234567',
    pattern: /^\d{7}$/,
    error: 'Format: 7 digits',
    maxLength: 7
  },
  'senior_citizen': {
    label: 'Senior Citizen ID',
    placeholder: '12345',
    pattern: /^[A-Z0-9-]{3,20}$/i,
    error: 'Invalid format',
    maxLength: 20
  },
  'pwd_id': {
    label: 'PWD ID',
    placeholder: '12-3456-789-0123456',
    pattern: /^[A-Z0-9-]{3,25}$/i,
    error: 'Invalid format',
    maxLength: 25
  },
  'barangay_id': {
    label: 'Barangay ID',
    placeholder: '12345678',
    pattern: /^[A-Z0-9-]{3,20}$/i,
    error: 'Invalid format',
    maxLength: 20
  },
  'other': {
    label: 'Other',
    placeholder: 'Enter ID number',
    pattern: /^.{3,50}$/,
    error: 'Min 3 characters',
    maxLength: 50
  }
};