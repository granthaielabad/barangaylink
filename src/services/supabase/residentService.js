import { supabase } from './client';

const TABLE = 'residents';
const DEFAULT_SELECT = `
  id, resident_no, first_name, middle_name, last_name, suffix,
  date_of_birth, place_of_birth, sex, civil_status,
  nationality, religion, occupation,
  contact_number, email, voter_status,
  address_line, years_of_stay, purok_id,
  philhealth_no, sss_no, tin_no, id_number,
  valid_id_type, valid_id_url, signature_url,
  age_group, blood_type,
  is_pwd, is_solo_parent, is_indigent,
  status, photo_url, household_id, created_at, updated_at,
  puroks ( id, name ),
  households:households!residents_household_id_fkey ( id, house_no, street )
`;

/**
 * Fetch a paginated, filtered, sorted list of residents.
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
 * Fetch all unpaginated residents (useful for beneficiary profiling and bulk exports).
 */
export async function getAllResidents() {
  const { data, error } = await supabase
    .from(TABLE)
    .select(DEFAULT_SELECT)
    .neq('status', 'archived')
    .order('last_name', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single resident by ID.
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

export async function archiveResident(id) {
  return updateResident(id, { status: 'archived' });
}

export async function deactivateResident(id) {
  return updateResident(id, { status: 'deactivated' });
}

export async function activateResident(id) {
  return updateResident(id, { status: 'active' });
}

export async function deleteResident(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Upload a resident profile photo.
 */
export async function uploadResidentPhoto(residentId, dataUrl) {
  const [meta, base64] = dataUrl.split(',');
  const mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const path = `${residentId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('resident-photos')
    .upload(path, blob, { upsert: true, contentType: mimeType });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resident-photos')
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('residents')
    .update({ photo_url: publicUrl })
    .eq('id', residentId);

  if (updateError) throw updateError;

  return publicUrl;
}

/**
 * Upload a valid ID photo.
 */
export async function uploadValidIdPhoto(residentId, file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${residentId}/valid-id.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('valid-id-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data: signedData, error: signedError } = await supabase.storage
    .from('valid-id-photos')
    .createSignedUrl(path, 60 * 60 * 24 * 365); 

  if (signedError) throw signedError;

  const { error: updateError } = await supabase
    .from('residents')
    .update({ valid_id_url: path })
    .eq('id', residentId);

  if (updateError) throw updateError;

  return signedData.signedUrl;
}

/**
 * Upload a handwritten signature image.
 */
export async function uploadResidentSignature(residentId, fileOrBase64) {
  let blob = fileOrBase64;
  let mimeType = 'image/png';

  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
    const [meta, base64] = fileOrBase64.split(',');
    mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    blob = new Blob([bytes], { type: mimeType });
  } else {
    mimeType = fileOrBase64.type;
  }

  const ext = mimeType.split('/')[1] || 'png';
  const path = `${residentId}/signature.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('resident-signatures')
    .upload(path, blob, { upsert: true, contentType: mimeType });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('resident-signatures')
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from('residents')
    .update({ signature_url: publicUrl })
    .eq('id', residentId);

  if (updateError) throw updateError;

  return publicUrl;
}