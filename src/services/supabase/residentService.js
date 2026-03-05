// ─────────────────────────────────────────────────────────────
// All Supabase queries for the `residents` table.
// Server-side filtering, sorting, and pagination —
// never manipulate arrays client-side.
// ─────────────────────────────────────────────────────────────
import { supabase } from './client';

const TABLE = 'residents';
const DEFAULT_SELECT = `
  id, first_name, middle_name, last_name, suffix,
  date_of_birth, sex, civil_status, contact_number, email,
  address_line, status, photo_url, voter_status, purok_id,
  household_id, created_at, updated_at,
  puroks ( id, name ),
  households ( id, house_no, street )
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
      households ( * ),
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