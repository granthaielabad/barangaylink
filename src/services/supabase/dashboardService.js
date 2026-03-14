// ─────────────────────────────────────────────────────────────
// Aggregate queries for the Dashboard overview page.
// Uses Promise.all for parallel fetches.
// ─────────────────────────────────────────────────────────────
import { supabase } from './client';

/**
 * Fetch all three stat card counts in parallel.
 * Returns { totalResidents, totalHouseholds, activeEids }
 */
export async function getDashboardStats() {
  const [residentsRes, householdsRes, eidsRes] = await Promise.all([
    supabase
      .from('residents')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'archived'),

    supabase
      .from('households')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'archived'),

    supabase
      .from('electronic_ids')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  if (residentsRes.error) throw residentsRes.error;
  if (householdsRes.error) throw householdsRes.error;
  if (eidsRes.error) throw eidsRes.error;

  return {
    totalResidents: residentsRes.count ?? 0,
    totalHouseholds: householdsRes.count ?? 0,
    activeEids: eidsRes.count ?? 0,
  };
}

/**
 * Fetch the 5 most recently added residents.
 */
export async function getRecentResidents(limit = 5) {
  const { data, error } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name, sex, created_at, address_line, puroks(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch the 5 most recent audit log entries for the activity feed.
 */
export async function getRecentActivity(limit = 10) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, table_name, operation, new_data, old_data, changed_by, changed_at, profiles!audit_logs_changed_by_fkey(full_name)')
    .order('changed_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}