// ─────────────────────────────────────────────────────────────
// Debounced resident search used by the eID form.
// Returns active residents matching the search term, along with
// whether they already have an eID so the UI can warn the user.
// ─────────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';

async function searchResidents(term) {
  if (!term || term.trim().length < 2) return [];

  const { data, error } = await supabase
    .from('residents')
    .select(`
      id, first_name, middle_name, last_name, suffix,
      date_of_birth, sex, address_line, contact_number, email, photo_url,
      puroks ( id, name ),
      electronic_ids ( id, eid_number, status )
    `)
    .eq('status', 'active')
    .or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%`
    )
    .order('last_name')
    .limit(15);

  if (error) throw error;

  return (data ?? []).map((r) => {
    const existingEid = r.electronic_ids?.[0] ?? null;
    return {
      id: r.id,
      firstName:     r.first_name,
      middleName:    r.middle_name,
      lastName:      r.last_name,
      suffix:        r.suffix,
      dateOfBirth:   r.date_of_birth,
      sex:           r.sex === 'M' ? 'Male' : r.sex === 'F' ? 'Female' : r.sex ?? '—',
      address:       r.address_line ?? r.puroks?.name ?? '—',
      contactNumber: r.contact_number ?? '',
      email:         r.email ?? '',
      photoUrl:      r.photo_url ?? null,
      // eID state
      hasEid:        !!existingEid,
      eidStatus:     existingEid?.status ?? null,
      eidNumber:     existingEid?.eid_number ?? null,
      // Display label for the dropdown
      label: [r.last_name, r.first_name, r.middle_name, r.suffix]
        .filter(Boolean).join(' '),
    };
  });
}

export function useResidentSearch(term) {
  return useQuery({
    queryKey: ['residents', 'search', term],
    queryFn:  () => searchResidents(term),
    enabled:  !!term && term.trim().length >= 2,
    staleTime: 1000 * 30,
    placeholderData: [],
  });
}