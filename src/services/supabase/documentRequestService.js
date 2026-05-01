// ─────────────────────────────────────────────────────────────────────────────
// Service layer for external document_requests via external_requests_view.
// Read-only monitoring of the other group's feature.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './client';

// The view public.external_requests_view flattens request_tbl + residents
const SELECT_FIELDS = `
  id,
  document_type,
  purpose,
  status,
  admin_notes,
  requested_at,
  updated_at,
  requester_id,
  resident_id,
  resident_no,
  first_name,
  middle_name,
  last_name,
  suffix,
  date_of_birth,
  civil_status,
  address_line,
  contact_number,
  email,
  id_number,
  photo_url,
  purok_name
`;

/**
 * Adapter to map flat view fields back to our expected nested residents shape
 */
function mapResident(req) {
  if (!req) return null;
  return {
    ...req,
    residents: {
      id:             req.resident_id,
      resident_no:    req.resident_no,
      first_name:     req.first_name,
      middle_name:    req.middle_name,
      last_name:      req.last_name,
      suffix:         req.suffix,
      date_of_birth:  req.date_of_birth,
      civil_status:   req.civil_status,
      address_line:   req.address_line,
      contact_number: req.contact_number,
      email:          req.email,
      id_number:      req.id_number,
      photo_url:      req.photo_url,
      puroks:         { name: req.purok_name }
    }
  };
}

// ── Admin: paginated list with filters ────────────────────────────────────────
export async function getDocumentRequests({
  page = 1, pageSize = 8, search = '',
  status = 'all', sortBy = 'requested_at', order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase.schema('public')
    .from('external_requests_view')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status !== 'all') {
    // Map our filter status to their DB enum if different
    const statusMap = { 
      'released': 'completed',
      'approved': 'approved',
      'processing': 'processing',
      'ready': 'ready for pickup'
    };
    query = query.eq('status', statusMap[status] || status);
  }

  if (search.trim()) {
    query = query.or(
      `document_type.ilike.%${search}%,purpose.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  
  if (error) {
    console.warn('Could not fetch external document requests:', error.message);
    return { data: [], total: 0, totalPages: 0 };
  }

  return {
    data: (data ?? []).map(mapResident),
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

// ── Admin: stats counts ───────────────────────────────────────────────────────
export async function getDocumentRequestStats() {
  const { data, error } = await supabase.schema('public')
    .from('external_requests_view')
    .select('status');
  
  if (error) {
    console.warn('Could not fetch external document request stats:', error.message);
    return { total: 0, pending: 0, processing: 0, ready: 0, released: 0, rejected: 0, approved: 0 };
  }

  const counts = { total: 0, pending: 0, processing: 0, ready: 0, released: 0, rejected: 0 };
  (data ?? []).forEach((r) => {
    counts.total++;
    const s = r.status?.toLowerCase();
    if (s === 'pending') counts.pending++;
    else if (s === 'processing') counts.processing++;
    else if (s === 'ready for pickup') counts.ready++;
    else if (s === 'approved' || s === 'completed') counts.released++;
    else if (s === 'rejected') counts.rejected++;
  });
  counts.approved = counts.released;
  return counts;
}

// ── Resident: get own request history ────────────────────────────────────────
export async function getMyDocumentRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.schema('public')
    .from('external_requests_view')
    .select('*')
    .eq('requester_id', user.id)
    .order('requested_at', { ascending: false });
  
  if (error) {
    console.warn('Could not fetch user\'s document requests from external view:', error.message);
    return [];
  }
  return (data ?? []).map(mapResident);
}

// ── REMOVED ACTIONS (READ-ONLY) ──────────────────────────────────────────────
export async function updateDocumentRequestStatus() {
  throw new Error('Our system is currently in read-only mode for Document Requests.');
}
export async function submitDocumentRequest() {
  throw new Error('Please use the external Document Portal to submit new requests.');
}
export async function setDocumentUrl() {
  throw new Error('Document management is handled by the external Document System.');
}
