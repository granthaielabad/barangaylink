import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-application-name",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // verify_jwt is FALSE — we authenticate the user JWT ourselves here.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate the user JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // Check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Profile not found");
    if (!["staff", "superadmin"].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient role");
    }

    // Parse body
    const body = await req.json();
    const resident_id: string = body?.resident_id;
    if (!resident_id) throw new Error("resident_id is required");

    // Verify resident exists
    const { data: resident, error: residentError } = await supabase
      .from("residents")
      .select("id, first_name, last_name")
      .eq("id", resident_id)
      .single();

    if (residentError || !resident) throw new Error("Resident not found");

    // Guard: no duplicate active EID
    const { data: existingEid } = await supabase
      .from("electronic_ids")
      .select("id")
      .eq("resident_id", resident_id)
      .eq("status", "active")
      .maybeSingle();

    if (existingEid) throw new Error("Resident already has an active EID");

    // Generate EID number: BRY-YYYY-XXXXX
    const year = new Date().getFullYear();
    const sequence = Math.floor(10000 + Math.random() * 90000);
    const eidNumber = `BRY-${year}-${sequence}`;

    // Generate QR token
    const qrPayload = {
      eid: eidNumber,
      rid: resident_id,
      iat: Math.floor(Date.now() / 1000),
    };
    const qrToken = btoa(JSON.stringify(qrPayload));

    // Expiry: 3 years
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 3);

    // Insert
    const { data: eid, error: insertError } = await supabase
      .from("electronic_ids")
      .insert({
        resident_id,
        eid_number: eidNumber,
        qr_token: qrToken,
        expires_at: expiresAt.toISOString(),
        issued_by: user.id,
        status: "active",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, eid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = ["Unauthorized", "Forbidden: Insufficient role"].includes(message)
      ? 403
      : 400;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
    );
  }
});