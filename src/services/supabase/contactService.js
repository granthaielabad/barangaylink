import { supabase } from './client';

const TABLE = 'barangaylink.contact_messages';

/**
 * Submit a contact form message.
 * Anyone can submit (public).
 *
 * @param {object} payload
 */
export async function submitContactMessage(payload) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(payload);

  if (error) throw error;
  return data;
}

/**
 * Fetch contact messages (Staff/Superadmin only).
 */
export async function getContactMessages({
  page = 1,
  pageSize = 10,
  status = 'all',
  search = '',
  sortBy = 'created_at',
  order = 'desc',
} = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' });

  // Status Filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Search
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  // Sort & Order
  query = query.order(sortBy, { ascending: order === 'asc' });

  // Pagination
  query = query.range(from, to);

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
 * Update message status (e.g., mark as read).
 */
export async function updateMessageStatus(id, status) {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
