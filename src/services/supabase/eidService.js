import { supabase } from './client';

const TABLE = 'electronic_ids';

const DEFAULT_SELECT = `
  id, eid_number, qr_token, qr_image_url,
  issued_at, expires_at, status,
  issued_by, revoked_at,
  resident_id,
  residents (
    id, first_name, middle_name, last_name, suffix,
    photo_url, contact_number, date_of_birth, sex,
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

export async function issueEid(residentId) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke('issue-eid', {
    body: { resident_id: residentId },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  if (res.error) throw res.error;
  if (!res.data?.success) throw new Error(res.data?.error ?? 'Failed to issue EID');
  return res.data.eid;
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
    .select(`id, status, expires_at, residents ( id, first_name, last_name, address_line, contact_number, date_of_birth, sex, photo_url )`)
    .eq('qr_token', token).maybeSingle();
  if (error) throw error;
  if (!eid) return { result: 'invalid', eid: null, resident: null };

  let result = 'valid';
  if (eid.status === 'revoked') result = 'revoked';
  else if (eid.status === 'suspended') result = 'invalid';
  else if (eid.expires_at && new Date(eid.expires_at) < new Date()) result = 'expired';

  await supabase.from('qr_verifications').insert({ eid_id: eid.id, verification_method: method, result });
  return { result, eid, resident: eid.residents };
}