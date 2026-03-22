// ─────────────────────────────────────────────────────────────────────────────
// Service layer for document_requests table.
// RLS enforces: residents see only their own, staff/superadmin see all.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './client';

const SELECT_FIELDS = `
  id, control_number, document_type, purpose, status,
  fee_amount, payment_status, payment_method,
  admin_notes, remarks, document_url,
  requested_at, processed_at, released_at,
  processed_by,
  residents (
    id, resident_no, first_name, middle_name, last_name, suffix,
    date_of_birth, civil_status, address_line, contact_number,
    email, id_number, photo_url,
    puroks ( id, name )
  )
`;

// ── Admin: paginated list with filters ────────────────────────────────────────
export async function getDocumentRequests({
  page = 1, pageSize = 8, search = '',
  status = 'all', sortBy = 'requested_at', order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase
    .from('document_requests')
    .select(SELECT_FIELDS, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status !== 'all') query = query.eq('status', status);
  if (search.trim()) {
    // Search against resident name via PostgREST — filter on resident fields
    query = query.or(
      `control_number.ilike.%${search}%,document_type.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    data: data ?? [],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

// ── Admin: stats counts ───────────────────────────────────────────────────────
export async function getDocumentRequestStats() {
  const { data, error } = await supabase
    .from('document_requests')
    .select('status');
  if (error) throw error;
  const counts = { total: 0, pending: 0, processing: 0, ready: 0, released: 0, rejected: 0 };
  (data ?? []).forEach((r) => {
    counts.total++;
    if (r.status in counts) counts[r.status]++;
  });
  // 'approved' is an alias the frontend uses — map to released for display
  counts.approved = counts.released;
  return counts;
}

// ── Admin: update status (pending→processing→ready→released | rejected) ───────
export async function updateDocumentRequestStatus(id, status, adminNotes = null) {
  const updates = { status };
  if (adminNotes !== null) updates.admin_notes = adminNotes;
  // processed_by / processed_at / released_at stamped by DB trigger

  const { data, error } = await supabase
    .from('document_requests')
    .update(updates)
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

// ── Admin: store generated document URL (after PDF generation) ────────────────
export async function setDocumentUrl(id, documentUrl, orNumber = null) {
  const updates = { document_url: documentUrl, status: 'ready' };
  if (orNumber) updates.or_number = orNumber;
  const { data, error } = await supabase
    .from('document_requests')
    .update(updates)
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

// ── Resident: submit a new document request ───────────────────────────────────
export async function submitDocumentRequest({ document_type, purpose, fee_amount }) {
  // Get resident_id from profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', user?.id)
    .maybeSingle();
  if (resErr) throw resErr;
  if (!resident) throw new Error('Resident record not found. Please contact the Barangay Office.');

  const { data, error } = await supabase
    .from('document_requests')
    .insert({
      resident_id:   resident.id,
      document_type,
      purpose,
      fee_amount:    fee_amount ?? 0,
      // control_number, fee_amount, payment_status auto-set by DB triggers
    })
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

// ── Resident: get own request history ────────────────────────────────────────
export async function getMyDocumentRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', user?.id)
    .maybeSingle();
  if (resErr) throw resErr;
  if (!resident) return [];

  const { data, error } = await supabase
    .from('document_requests')
    .select(SELECT_FIELDS)
    .eq('resident_id', resident.id)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Resident: record payment method selection ─────────────────────────────────
export async function updatePaymentMethod(id, paymentMethod) {
  const { data, error } = await supabase
    .from('document_requests')
    .update({ payment_method: paymentMethod, payment_status: 'paid' })
    .eq('id', id)
    .select('id, payment_status, payment_method')
    .single();
  if (error) throw error;
  return data;
}