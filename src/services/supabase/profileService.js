import { supabase } from './client';

/**
 * Get all profiles (superadmin only — RLS enforced).
 */
export async function getProfiles({
  page = 1, pageSize = 8, search = '',
  role = 'all', sortBy = 'created_at', order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('profiles')
    .select('id, role, full_name, is_active, created_at, puroks(id, name)', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (role !== 'all') query = query.eq('role', role);
  if (search.trim()) query = query.ilike('full_name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };
}

/**
 * Update a user's role (superadmin only).
 */
export async function updateProfileRole(id, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select('id, role, full_name, is_active')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Deactivate a user account (superadmin only).
 */
export async function deactivateProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id)
    .select('id, is_active')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Hard delete a user from auth.users (cascades to profiles via FK).
 * Superadmin only — enforced by RLS.
 */
export async function deleteProfile(id) {
  // Deleting from auth.users requires the admin API — we soft-delete here.
  // Full deletion should be done server-side via an Edge Function.
  return deactivateProfile(id);
}