import { supabase } from './client';

const TABLE = 'residents';
const DEFAULT_SELECT = `
  id, resident_no, first_name, middle_name, last_name, suffix,
  date_of_birth, place_of_birth, sex, civil_status,
  nationality, religion, occupation,
  contact_number, email, voter_status,
  address_line, years_of_stay, purok_id,
  philhealth_no, sss_no, tin_no, id_number,
  valid_id_type, valid_id_url,
  age_group, blood_type,
  is_pwd, is_solo_parent, is_indigent,
  status, photo_url, household_id, created_at, updated_at,
  puroks ( id, name ),
  households:households!residents_household_id_fkey ( id, house_no, street )
`;

/**
 * Fetch a paginated, filtered, sorted list of residents.
 *
 * @param {object} params
 * @param {number}  params.page      - 1-based page number
 * @param {number}  params.pageSize  - rows per page (default 8)
 * @param {string}  params.search    - full-text search on name fields
 * @param {string}  params.status    - filter by status ('all' = no filter)
 * @param {string}  params.sortBy    - 'last_name', 'created_at', 'status'
 * @param {string}  params.order     - 'asc' | 'desc'
 * @param {number}  params.purokId   - optional purok filter (staff auto-applied via RLS)
 */
export async function getResidents({
  page = 1,
  pageSize = 8,
  search = '',
  status = 'all',
  sortBy = 'last_name',
  order = 'asc',
  purokId = null,
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select(DEFAULT_SELECT, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (purokId) {
    query = query.eq('purok_id', purokId);
  }

  if (search.trim()) {
    // PostgreSQL full-text OR partial match across name columns
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Fetch a single resident by ID (full detail view).
 */
export async function getResidentById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      *,
      puroks ( id, name ),
      households:households!residents_household_id_fkey ( * ),
      electronic_ids ( id, eid_number, status, issued_at, expires_at ),
      document_requests ( id, document_type, status, requested_at )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Create a new resident record.
 */
export async function createResident(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(DEFAULT_SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a resident record.
 */
export async function updateResident(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(DEFAULT_SELECT)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Soft-delete: set status to 'archived'.
 * Staff cannot hard-delete residents (no RLS DELETE policy).
 */
export async function archiveResident(id) {
  return updateResident(id, { status: 'archived' });
}

/**
 * Set resident status to 'deactivated'.
 */
export async function deactivateResident(id) {
  return updateResident(id, { status: 'deactivated' });
}

/**
 * Reactivate a deactivated or archived resident.
 */
export async function activateResident(id) {
  return updateResident(id, { status: 'active' });
}

/**
 * Hard delete — Superadmin only (enforced by RLS).
 */
export async function deleteResident(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Upload a resident profile photo to Supabase Storage and
 * write the public URL back to residents.photo_url.
 *
 * @param {string} residentId  - UUID of the resident
 * @param {string} dataUrl     - base64 DataURL from FileReader (image/png or image/jpeg)
 * @returns {string}           - public URL of the uploaded photo
 */
export async function uploadResidentPhoto(residentId, dataUrl) {
  // 1. Convert base64 DataURL → Blob
  const [meta, base64] = dataUrl.split(',');
  const mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  // 2. Deterministic path — one file per resident, overwrites on re-upload
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `${residentId}.${ext}`;

  // 3. Upload to storage (upsert so re-upload works)
  const { error: uploadError } = await supabase.storage
    .from('resident-photos')
    .upload(path, blob, { upsert: true, contentType: mimeType });

  if (uploadError) throw uploadError;

  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resident-photos')
    .getPublicUrl(path);

  // 5. Write URL back to the resident record
  const { error: updateError } = await supabase
    .from('residents')
    .update({ photo_url: publicUrl })
    .eq('id', residentId);

  if (updateError) throw updateError;

  return publicUrl;
}

/**
 * Upload a valid ID photo to the valid-id-photos bucket (private).
 * Writes the URL back to residents.valid_id_url.
 * Accepts a File object from an <input type="file">.
 */
export async function uploadValidIdPhoto(residentId, file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${residentId}/valid-id.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('valid-id-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  // Private bucket — use signed URL so only authenticated staff can view
  const { data: signedData, error: signedError } = await supabase.storage
    .from('valid-id-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1-year expiry

  if (signedError) throw signedError;

  // Store the path (not URL) so we can re-generate signed URLs later
  const { error: updateError } = await supabase
    .from('residents')
    .update({ valid_id_url: path })
    .eq('id', residentId);

  if (updateError) throw updateError;

  return signedData.signedUrl;
}