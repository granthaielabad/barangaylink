import { supabase } from './client';

// Use the secure view so email is available alongside profile data.
// The view joins auth.users internally via SECURITY DEFINER.
const VIEW = 'profiles_with_email';

/**
 * Get paginated profiles with email (superadmin only — RLS enforced on profiles).
 */
export async function getProfiles({
  page = 1, pageSize = 8, search = '',
  role = 'all', status = 'all', sortBy = 'created_at', order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  let query = supabase
    .from(VIEW)
    .select('id, role, full_name, email, is_active, created_at, purok_id', { count: 'exact' })
    .range(from, to)
    .order(sortBy, { ascending: order === 'asc' });

  if (role !== 'all')        query = query.eq('role', role);
  if (status === 'active')   query = query.eq('is_active', true);
  if (status === 'inactive') query = query.eq('is_active', false);
  if (search.trim()) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Get full role counts across ALL users (not just current page).
 * Used so RoleTabs always shows accurate totals.
 */
export async function getProfileRoleCounts() {
  const { data, error } = await supabase
    .from(VIEW)
    .select('role');
  if (error) throw error;
  const counts = { all: 0, superadmin: 0, staff: 0, resident: 0 };
  (data ?? []).forEach((p) => {
    counts.all++;
    if (p.role in counts) counts[p.role]++;
  });
  return counts;
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
 * Toggle a user's active status.
 */
export async function toggleProfileActive(id, isActive) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)
    .select('id, is_active')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Deactivate a user account.
 */
export async function deactivateProfile(id) {
  return toggleProfileActive(id, false);
}

/**
 * Hard delete: calls the Supabase Admin API via an Edge Function.
 * Falls back to deactivation if the Edge Function is not deployed.
 */
export async function deleteProfile(id) {
  // Attempt hard delete via Edge Function (requires admin key server-side)
  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { userId: id },
  });

  if (error) {
    // If Edge Function returns an error, throw it so the UI shows failure toast
    throw new Error(error.message || 'Failed to delete user account');
  }

  if (data && !data.success) {
    throw new Error(data.error || 'Failed to delete user account');
  }
}