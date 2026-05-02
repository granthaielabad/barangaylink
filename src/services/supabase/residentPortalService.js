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
      photo_url, signature_url, status, created_at,
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
    .select('id, type, status, submitted_at, id_number, first_name, last_name, reference_number, valid_id_type, valid_id_url, current_step')
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
  const { _validIdType, _validIdFile, _signature, ...rest } = payload;

  // Generate reference number: first 8 chars of a new UUID in uppercase
  const tempId = crypto.randomUUID();
  const refNo = tempId.split('-')[0].toUpperCase();

  // Upload valid ID photo if present
  let validIdPublicUrl = null;
  if (_validIdFile) {
    const ext  = _validIdFile.name.split('.').pop().toLowerCase();
    const path = `${resident.id}/valid-id-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('valid-id-photos')
      .upload(path, _validIdFile, { upsert: true, contentType: _validIdFile.type });
    
    if (uploadErr) throw new Error(`Failed to upload ID photo: ${uploadErr.message}`);
    const { data: { publicUrl } } = supabase.storage.from('valid-id-photos').getPublicUrl(path);
    validIdPublicUrl = publicUrl;
  }

  // Upload Signature if present (base64 data URL from drawing or file)
  let signaturePublicUrl = null;
  if (_signature) {
    let signatureBlob;
    let mimeType = 'image/png';
    let ext = 'png';
    
    // Check if it's a data URL (from drawing)
    if (typeof _signature === 'string' && _signature.startsWith('data:')) {
      const arr = _signature.split(',');
      const match = arr[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      ext = mimeType.split('/')[1] || 'png';
      
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      signatureBlob = new Blob([u8arr], { type: mimeType });
    } 
    // Handle File object (if user uploaded a file instead of drawing)
    else if (_signature instanceof File) {
      signatureBlob = _signature;
      mimeType = _signature.type;
      ext = _signature.name?.split('.').pop().toLowerCase() || 'png';
    }
    else {
      throw new Error('Invalid signature format. Expected base64 image or File.');
    }

    const path = `${resident.id}/signature-${Date.now()}.${ext}`;
    const { error: signErr } = await supabase.storage
      .from('resident-signatures')
      .upload(path, signatureBlob, { upsert: true, contentType: mimeType });
    
    if (signErr) throw new Error(`Failed to upload signature: ${signErr.message}`);
    const { data: { publicUrl } } = supabase.storage.from('resident-signatures').getPublicUrl(path);
    signaturePublicUrl = publicUrl;
  }

  // Explicitly whitelist only columns that exist in eid_applications
  const safePayload = {
    type:             rest.type             ?? 'new',
    first_name:       rest.first_name       ?? null,
    middle_name:      rest.middle_name      ?? null,
    last_name:        rest.last_name        ?? null,
    suffix:           rest.suffix           ?? null,
    date_of_birth:    rest.date_of_birth    ?? null,
    sex:              rest.sex              ?? null,
    address_line:     rest.address_line     ?? null,
    contact_number:   rest.contact_number   ?? null,
    email:            rest.email            ?? null,
    id_number:        rest.id_number        ?? null,
    photo_url:        rest.photo_url        ?? null,
    resident_id:      resident.id,
    reference_number: refNo,
    valid_id_type:    _validIdType          ?? null,
    valid_id_url:     validIdPublicUrl      ?? null,
    signature_url:    signaturePublicUrl    ?? null,
  };

  const { data, error } = await supabase
    .from('eid_applications')
    .insert(safePayload)
    .select()
    .single();

  if (error) throw error;

  // Update residents table with latest ID info for convenience
  const residentUpdates = {};
  if (_validIdType)      residentUpdates.valid_id_type = _validIdType;
  if (validIdPublicUrl)   residentUpdates.valid_id_url  = validIdPublicUrl;
  if (signaturePublicUrl) residentUpdates.signature_url = signaturePublicUrl;
  if (rest.id_number)     residentUpdates.id_number     = rest.id_number;

  if (Object.keys(residentUpdates).length > 0) {
    await supabase.from('residents').update(residentUpdates).eq('id', resident.id);
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
        photo_url, signature_url, date_of_birth, sex, blood_type, civil_status,
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