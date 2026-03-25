import { supabase } from './client';

const TABLE = 'households';

const DEFAULT_SELECT = `
  id, household_no, house_no, street, ownership_type, dwelling_type,
  monthly_income, status, created_at, updated_at,
  purok_id, puroks ( id, name ),
  head_resident_id,
  head:residents!fk_head_resident ( id, first_name, middle_name, last_name, suffix ),
  residents!residents_household_id_fkey ( id, first_name, middle_name, last_name, suffix ),
  memberCount:household_member_counts ( member_count )
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

  // Flatten the joined member count onto each row
  const normalised = (data ?? []).map((h) => ({
    ...h,
    _memberCount: h.memberCount?.[0]?.member_count ?? 0,
    _members:     h.residents ?? [],
  }));

  return {
    data: normalised,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getHouseholdById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`*, puroks(*), residents!residents_household_id_fkey(id, first_name, middle_name, last_name, suffix, status, photo_url)`)
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
  return {
    ...data,
    _memberCount: data.memberCount?.[0]?.member_count ?? 0,
    _members:     data.residents ?? [],
  };
}

export async function updateHousehold(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(DEFAULT_SELECT)
    .single();
  if (error) throw error;
  return {
    ...data,
    _memberCount: data.memberCount?.[0]?.member_count ?? 0,
    _members:     data.residents ?? [],
  };
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

/**
 * Assign a resident to a household (set residents.household_id).
 */
export async function assignMemberToHousehold(residentId, householdId) {
  const { error } = await supabase
    .from('residents')
    .update({ household_id: householdId })
    .eq('id', residentId);
  if (error) throw error;
}

/**
 * Remove a resident from a household (clear residents.household_id).
 */
export async function removeMemberFromHousehold(residentId) {
  const { error } = await supabase
    .from('residents')
    .update({ household_id: null })
    .eq('id', residentId);
  if (error) throw error;
}

export async function deleteHousehold(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}