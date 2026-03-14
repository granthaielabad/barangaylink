// ─────────────────────────────────────────────────────────────────────────────
// All queries for the Resident self-service portal.
// RLS automatically scopes every query to auth.uid() — no manual filtering
// needed. Residents can only ever read their own rows.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './client';

// ── My Profile ───────────────────────────────────────────────────────────────
export async function getMyResidentProfile() {
  const { data, error } = await supabase
    .from('residents')
    .select(`
      id, resident_no,
      first_name, middle_name, last_name, suffix,
      date_of_birth, place_of_birth, sex, civil_status,
      nationality, religion, occupation,
      contact_number, email,
      voter_status, philhealth_no, sss_no, tin_no, id_number,
      address_line, years_of_stay,
      photo_url, status, created_at,
      blood_type,
      puroks ( id, name ),
      households:households!residents_household_id_fkey ( id, house_no, street )
    `)
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ── My eID ────────────────────────────────────────────────────────────────────
export async function getMyEid() {
  // Get resident row first (RLS-scoped), then find the linked eID
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (resErr) throw resErr;
  if (!resident) return null;

  const { data, error } = await supabase
    .from('electronic_ids')
    .select(`
      id, eid_number, qr_token,
      issued_at, expires_at, status,
      residents (
        id, first_name, middle_name, last_name, suffix,
        photo_url, date_of_birth, sex, blood_type, civil_status,
        address_line, puroks ( id, name )
      )
    `)
    .eq('resident_id', resident.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ── My Household ─────────────────────────────────────────────────────────────
export async function getMyHousehold() {
  // Get resident's household_id first
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('household_id')
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (resErr) throw resErr;
  if (!resident?.household_id) return null;

  // Fetch household details
  const { data: household, error: hhErr } = await supabase
    .from('households')
    .select(`
      id, household_no, house_no, street, ownership_type,
      monthly_income_range, created_at,
      puroks ( id, name )
    `)
    .eq('id', resident.household_id)
    .maybeSingle();

  if (hhErr) throw hhErr;

  // Fetch all members of this household (residents with same household_id)
  // RLS allows residents to see rows in their own purok — members will show
  // if they share the household
  const { data: members, error: memErr } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name, suffix, sex, date_of_birth, relationship_to_head, photo_url, status')
    .eq('household_id', resident.household_id)
    .order('last_name', { ascending: true });

  if (memErr) throw memErr;

  return { ...household, members: members ?? [] };
}