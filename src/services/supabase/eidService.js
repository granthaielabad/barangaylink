import { supabase } from './client';

const TABLE = 'electronic_ids';

const DEFAULT_SELECT = `
  id, eid_number, qr_token, qr_image_url,
  issued_at, expires_at, status,
  issued_by, revoked_at,
  resident_id,
  residents (
    id, first_name, middle_name, last_name, suffix,
    photo_url, contact_number, date_of_birth, sex, blood_type, civil_status,
    address_line,
    puroks ( id, name )
  )
`;

export async function getEids({
  page = 1, pageSize = 8, search = '',
  status = 'all', sortBy = 'issued_at', order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select(DEFAULT_SELECT, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status !== 'all') query = query.eq('status', status);
  if (search.trim()) query = query.ilike('eid_number', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
}

export async function getEidById(id) {
  const { data, error } = await supabase.from(TABLE).select(DEFAULT_SELECT).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getEidByResidentId(residentId) {
  const { data, error } = await supabase.from(TABLE).select(DEFAULT_SELECT).eq('resident_id', residentId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function issueEid(residentId, photoUrl = null) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/issue-eid`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey':        supabaseAnon,
    },
    body: JSON.stringify({ resident_id: residentId, photo_url: photoUrl ?? null }),
  });

  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.error ?? 'Failed to issue eID');
  return data.eid;
}

export async function revokeEid(id) {
  const { data, error } = await supabase.from(TABLE)
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', id).select(DEFAULT_SELECT).single();
  if (error) throw error;
  return data;
}

export async function suspendEid(id) {
  const { data, error } = await supabase.from(TABLE)
    .update({ status: 'suspended' }).eq('id', id).select(DEFAULT_SELECT).single();
  if (error) throw error;
  return data;
}

export async function reactivateEid(id) {
  const { data, error } = await supabase.from(TABLE)
    .update({ status: 'active' }).eq('id', id).select(DEFAULT_SELECT).single();
  if (error) throw error;
  return data;
}

export async function deleteEid(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function getEidStats() {
  const { data, error } = await supabase.from(TABLE).select('status');
  if (error) throw error;
  const stats = { total: 0, active: 0, suspended: 0, revoked: 0, expired: 0 };
  for (const row of data ?? []) { stats.total++; if (row.status in stats) stats[row.status]++; }
  return stats;
}

export async function verifyQrToken({ token, method = 'qr_scan' }) {
  const { data: eid, error } = await supabase.from(TABLE)
    .select(`id, eid_number, status, expires_at,
      residents ( id, resident_no, first_name, last_name, address_line, contact_number, date_of_birth, sex, photo_url )`)
    .eq('qr_token', token).maybeSingle();
  if (error) throw error;
  if (!eid) return { result: 'invalid', eid: null, resident: null };

  let result = 'valid';
  if (eid.status === 'revoked') result = 'revoked';
  else if (eid.status === 'suspended') result = 'invalid';
  else if (eid.expires_at && new Date(eid.expires_at) < new Date()) result = 'expired';

  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('qr_verifications').insert({
    eid_id: eid.id,
    verification_method: method,
    result,
    verified_by: user?.id ?? null,
  });

  return { result, eid, resident: eid.residents };
}

// ── eID Applications (admin side) ────────────────────────────────────────────

export async function getEidApplications({ page = 1, pageSize = 10, status = 'all', sortOrder = 'desc' } = {}) {
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase
    .from('eid_applications')
    .select(`
      id, resident_id, type, status, submitted_at, reviewed_at, remarks, current_step,
      reference_number, valid_id_type, valid_id_url,
      first_name, last_name, middle_name, suffix,
      date_of_birth, sex, address_line, contact_number, email,
      photo_url, id_number,
      residents (
        id, resident_no, photo_url,
        valid_id_type, valid_id_url,
        address_line, civil_status,
        puroks(name)
      ),
      reviewed_by_profile:profiles!eid_applications_reviewed_by_fkey ( full_name )
    `, { count: 'exact' })
    .range(from, to)
    .order('submitted_at', { ascending: sortOrder === 'asc' });

  if (status !== 'all') query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) };
}

export async function getEidApplicationStats() {
  const { data, error } = await supabase
    .from('eid_applications')
    .select('status');
  if (error) throw error;
  const counts = { all: 0, pending: 0, under_review: 0, approved: 0, rejected: 0 };
  (data ?? []).forEach((r) => {
    counts.all++;
    if (r.status in counts) counts[r.status]++;
  });
  return counts;
}

export async function updateEidApplicationStatus(id, status, remarks = null, currentStep = null) {
  const updatePayload = {
    status,
    remarks,
    reviewed_at: new Date().toISOString(),
    reviewed_by: (await supabase.auth.getUser()).data.user?.id,
  };
  if (currentStep !== null) updatePayload.current_step = currentStep;

  const { data, error } = await supabase
    .from('eid_applications')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Approve an application: mark status approved then call the issue-eid Edge Function.
 * residentId comes from the application's resident_id field (now always fetched).
 */
export async function approveEidApplication(applicationId, residentId, photoUrl) {
  if (!residentId) throw new Error('resident_id is required to issue an eID');
  // 1. Mark application approved
  await updateEidApplicationStatus(applicationId, 'approved');
  // 2. Issue the eID via Edge Function
  return issueEid(residentId, photoUrl ?? null);
}