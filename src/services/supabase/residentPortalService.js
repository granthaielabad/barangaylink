import { supabase } from './client';

// ── Account linking ───────────────────────────────────────────────────────────
export async function linkResidentAccount({ residentNo, lastName, dateOfBirth }) {
  const { data, error } = await supabase
    .rpc('link_resident_account', {
      p_resident_no:    residentNo.trim().toUpperCase(),
      p_last_name:      lastName.trim(),
      p_date_of_birth:  dateOfBirth, // YYYY-MM-DD
    });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Linking failed. Please try again.');
  return data[0];
}

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

// ── My eID Application ───────────────────────────────────────────────────────
export async function getMyEidApplication() {
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (resErr) throw resErr;
  if (!resident) return null;

  const { data, error } = await supabase
    .from('eid_applications')
    .select('id, type, status, submitted_at, id_number, first_name, last_name')
    .eq('resident_id', resident.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function submitEidApplication(payload) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated.');

  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (resErr) throw resErr;
  if (!resident) throw new Error('Resident record not found.');

  // Extract non-DB fields before insert
  const { _validIdType, _validIdFile, ...rest } = payload;

  // Explicitly whitelist only columns that exist in eid_applications
  const safePayload = {
    type:           rest.type           ?? 'new',
    first_name:     rest.first_name     ?? null,
    middle_name:    rest.middle_name    ?? null,
    last_name:      rest.last_name      ?? null,
    suffix:         rest.suffix         ?? null,
    date_of_birth:  rest.date_of_birth  ?? null,
    sex:            rest.sex            ?? null,
    address_line:   rest.address_line   ?? null,
    contact_number: rest.contact_number ?? null,
    email:          rest.email          ?? null,
    id_number:      rest.id_number      ?? null,
    photo_url:      rest.photo_url      ?? null,
    resident_id:    resident.id,
  };

  const { data, error } = await supabase
    .from('eid_applications')
    .insert(safePayload)
    .select()
    .single();

  if (error) throw error;

  // Upload valid ID photo and save type to residents table
  const updates = {};
  if (_validIdType) updates.valid_id_type = _validIdType;

  if (_validIdFile) {
    const ext  = _validIdFile.name.split('.').pop().toLowerCase();
    const path = `${resident.id}/valid-id.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('valid-id-photos')
      .upload(path, _validIdFile, { upsert: true, contentType: _validIdFile.type });
    if (!uploadErr) updates.valid_id_url = path;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('residents').update(updates).eq('id', resident.id);
  }

  return data;
}

export async function submitEidRenewal({ address_line, contact_number }) {
  const { data: resident, error: resErr } = await supabase
    .from('residents')
    .select('id')
    .eq('profile_id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle();

  if (resErr) throw resErr;
  if (!resident) throw new Error('Resident record not found.');

  const { data, error } = await supabase
    .from('eid_applications')
    .insert({ resident_id: resident.id, type: 'renewal', address_line, contact_number })
    .select()
    .single();

  if (error) throw error;
  return data;
}
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
      monthly_income, created_at,
      puroks ( id, name )
    `)
    .eq('id', resident.household_id)
    .maybeSingle();

  if (hhErr) throw hhErr;

  // Fetch all members of this household
  const { data: members, error: memErr } = await supabase
    .from('residents')
    .select('id, first_name, middle_name, last_name, suffix, sex, date_of_birth, photo_url, status')
    .eq('household_id', resident.household_id)
    .order('last_name', { ascending: true });

  if (memErr) throw memErr;

  return { ...household, members: members ?? [] };
}