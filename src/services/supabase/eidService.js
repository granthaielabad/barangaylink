import { supabase } from './client';

const EID_TABLE = 'electronic_ids';
const APP_TABLE = 'eid_applications';

// ── Issued eIDs ───────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered, sorted list of issued eIDs.
 */
export async function getEids({
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
  sortBy = 'issued_at',
  order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(EID_TABLE)
    .select(`
      *,
      residents (
        id, resident_no, first_name, middle_name, last_name, suffix,
        photo_url, date_of_birth, sex, blood_type, civil_status,
        address_line, puroks ( id, name )
      )
    `, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search.trim()) {
    // Search across resident name fields and eID number
    query = query.or(
      `eid_number.ilike.%${search}%,residents.first_name.ilike.%${search}%,residents.last_name.ilike.%${search}%`
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

export async function getEidById(id) {
  const { data, error } = await supabase
    .from(EID_TABLE)
    .select(`
      *,
      residents (*)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Trigger the `issue-eid` Edge Function.
 */
export async function issueEid(residentId, photoUrl = null) {
  const { data, error } = await supabase.functions.invoke('issue-eid', {
    body: { resident_id: residentId, photo_url: photoUrl },
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? 'Failed to issue eID.');
  return data.eid;
}

export async function revokeEid(id) {
  const { data, error } = await supabase
    .from(EID_TABLE)
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function suspendEid(id) {
  const { data, error } = await supabase
    .from(EID_TABLE)
    .update({ status: 'suspended' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function reactivateEid(id) {
  const { data, error } = await supabase
    .from(EID_TABLE)
    .update({ status: 'active' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEid(id) {
  const { error } = await supabase.from(EID_TABLE).delete().eq('id', id);
  if (error) throw error;
}

/**
 * Aggregate counts for the eID dashboard cards.
 */
export async function getEidStats() {
  const { data, error } = await supabase.from(EID_TABLE).select('status');
  if (error) throw error;

  const stats = {
    total: data.length,
    active: data.filter((e) => e.status === 'active').length,
    suspended: data.filter((e) => e.status === 'suspended').length,
    revoked: data.filter((e) => e.status === 'revoked').length,
    expired: data.filter((e) => e.status === 'expired').length,
  };

  return stats;
}

// ── eID Applications ──────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of eID applications.
 */
export async function getEidApplications({
  page = 1,
  pageSize = 10,
  status = 'all',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(APP_TABLE)
    .select(`
      *,
      residents ( id, resident_no )
    `, { count: 'exact' })
    .range(from, to)
    .order('submitted_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
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

export async function getEidApplicationStats() {
  const { data, error } = await supabase.from(APP_TABLE).select('status');
  if (error) throw error;

  const stats = {
    total:        data.length,
    pending:      data.filter((a) => a.status === 'pending').length,
    under_review: data.filter((a) => a.status === 'under_review').length,
    approved:     data.filter((a) => a.status === 'approved').length,
    rejected:     data.filter((a) => a.status === 'rejected').length,
  };

  return stats;
}

export async function updateEidApplicationStatus(id, status, remarks = null) {
  const { data, error } = await supabase
    .from(APP_TABLE)
    .update({ status, remarks, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Approve an application and issue the eID in one step (via Edge Function).
 */
export async function approveEidApplication(applicationId, residentId, photoUrl = null) {
  // 1. Update application status
  const { error: appErr } = await supabase
    .from(APP_TABLE)
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (appErr) throw appErr;

  // 2. Issue the eID (calls the same logic as manual issuance)
  return issueEid(residentId, photoUrl);
}

/**
 * Verify a QR token and record the verification attempt.
 * Returns { result: 'valid'|'expired'|'revoked'|'invalid', eid, resident }
 */
export async function verifyQrToken({ token, method = 'manual_entry' }) {
  // 1. Find the eID by token
  const { data: eid, error } = await supabase
    .from(EID_TABLE)
    .select(`
      *,
      residents (
        id, resident_no, first_name, middle_name, last_name, suffix,
        photo_url, date_of_birth, sex, blood_type, civil_status,
        address_line, contact_number, puroks ( id, name )
      )
    `)
    .eq('qr_token', token)
    .maybeSingle();

  if (error) throw error;

  let result = 'invalid';
  if (eid) {
    const now = new Date();
    const expiry = new Date(eid.expires_at);

    if (eid.status === 'revoked' || eid.status === 'suspended') {
      result = 'revoked';
    } else if (expiry < now) {
      result = 'expired';
    } else {
      result = 'valid';
    }
  }

  // 2. Log the verification attempt
  const { data: { user } } = await supabase.auth.getUser();
  if (eid) {
    await supabase.from('qr_verifications').insert({
      eid_id:              eid.id,
      verifier_id:         user?.id,
      result,
      verification_method: method,
    });
  }

  return {
    result,
    eid:      eid ? { id: eid.id, eid_number: eid.eid_number, status: eid.status } : null,
    resident: eid?.residents ?? null,
  };
}
