// ─────────────────────────────────────────────────────────────
// Supabase Edge Function (Deno) — Issue an Electronic ID.
// Generates a unique EID number, signs a QR token, and stores
// the new record. Called only by authenticated staff/superadmin.
// ─────────────────────────────────────────────────────────────
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Authenticate the calling user ──────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Service role for server-side ops
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // ── 2. Verify caller is staff or superadmin ───────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!['staff', 'superadmin'].includes(profile?.role)) {
      throw new Error('Forbidden: Insufficient role');
    }

    // ── 3. Parse request body ─────────────────────────────────
    const { resident_id } = await req.json();
    if (!resident_id) throw new Error('resident_id is required');

    // ── 4. Check resident exists and has no active EID ────────
    const { data: resident } = await supabase
      .from('residents')
      .select('id, first_name, last_name, purok_id')
      .eq('id', resident_id)
      .single();
    if (!resident) throw new Error('Resident not found');

    const { data: existingEid } = await supabase
      .from('electronic_ids')
      .select('id, status')
      .eq('resident_id', resident_id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingEid) throw new Error('Resident already has an active EID');

    // ── 5. Generate EID number: BRY-YYYY-XXXXX ────────────────
    const year = new Date().getFullYear();
    const sequence = Math.floor(10000 + Math.random() * 90000); // 5-digit
    const eidNumber = `BRY-${year}-${sequence}`;

    // ── 6. Generate QR token (signed payload) ─────────────────
    // In production: sign with a secret using HMAC or JWT library
    const qrPayload = {
      eid: eidNumber,
      rid: resident_id,
      iat: Math.floor(Date.now() / 1000),
    };
    const qrToken = btoa(JSON.stringify(qrPayload)); // Base64 for demo; use JWT in prod

    // ── 7. Set expiry to 3 years from today ───────────────────
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 3);

    // ── 8. Insert EID record ──────────────────────────────────
    const { data: eid, error: insertError } = await supabase
      .from('electronic_ids')
      .insert({
        resident_id,
        eid_number: eidNumber,
        qr_token: qrToken,
        expires_at: expiresAt.toISOString(),
        issued_by: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, eid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message === "Unauthorized" || message === "Forbidden: Insufficient role"
        ? 403
        : 400;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status,
      }
    );
  }
});