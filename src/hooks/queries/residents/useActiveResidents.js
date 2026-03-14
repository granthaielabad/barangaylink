// ─────────────────────────────────────────────────────────────
// Fetches active residents for use in the Household Head dropdown.
// Only id + name fields — lightweight, not paginated.
// ─────────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';

async function fetchActiveResidents() {
  const { data, error } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name, suffix')
    .eq('status', 'active')
    .order('last_name')
    .order('first_name');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    value: r.id,
    label: [
      r.last_name,
      r.first_name,
      r.middle_name,
      r.suffix,
    ].filter(Boolean).join(' '),
  }));
}

export function useActiveResidents() {
  return useQuery({
    queryKey: ['residents', 'active-list'],
    queryFn:  fetchActiveResidents,
    staleTime: 1000 * 60 * 2, // 2 min — refresh after resident edits settle
  });
}