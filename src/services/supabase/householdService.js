import { supabase } from './client';

const TABLE = 'households';

const DEFAULT_SELECT = `
  id, house_no, street, ownership_type, dwelling_type,
  monthly_income, no_of_members, status, created_at, updated_at,
  purok_id, puroks ( id, name ),
  head_resident_id,
  head:residents!head_resident_id ( id, first_name, last_name )
`;

export async function getHouseholds({
  page = 1,
  pageSize = 8,
  search = '',
  status = 'all',
  sortBy = 'created_at',
  order = 'desc',
  purokId = null,
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select(DEFAULT_SELECT, { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (status !== 'all') query = query.eq('status', status);
  if (purokId) query = query.eq('purok_id', purokId);
  if (search.trim()) {
    query = query.or(`house_no.ilike.%${search}%,street.ilike.%${search}%`);
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

export async function getHouseholdById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`*, puroks(*), residents(id, first_name, last_name, status, photo_url)`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createHousehold(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(DEFAULT_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateHousehold(id, payload) {
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
 * When a head of household is deactivated or moved,
 * clear the head_resident_id to prevent stale FK references.
 */
export async function clearHouseholdHead(householdId) {
  const { error } = await supabase
    .from(TABLE)
    .update({ head_resident_id: null })
    .eq('id', householdId);
  if (error) throw error;
}

export async function archiveHousehold(id) {
  return updateHousehold(id, { status: 'archived' });
}

export async function deleteHousehold(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}