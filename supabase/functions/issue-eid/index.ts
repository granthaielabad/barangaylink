import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-application-name",
};

function decodeBase64Image(dataUrl: string): { bytes: Uint8Array; mimeType: string } {
  if (dataUrl.startsWith("data:")) {
    const [header, base64] = dataUrl.split(",");
    const mimeType = header.split(":")[1].split(";")[0];
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    return { bytes, mimeType };
  }
  const binaryStr = atob(dataUrl);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return { bytes, mimeType: "image/jpeg" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Profile not found");
    if (!["staff", "superadmin"].includes(profile.role)) {
      throw new Error("Forbidden: Insufficient role");
    }

    const body = await req.json();
    const resident_id: string = body?.resident_id;
    const photo_url: string | null = body?.photo_url ?? null;
    if (!resident_id) throw new Error("resident_id is required");

    const { data: resident, error: residentError } = await supabase
      .from("residents")
      .select("id, first_name, last_name")
      .eq("id", resident_id)
      .single();
    if (residentError || !resident) throw new Error("Resident not found");

    const { data: existingEid } = await supabase
      .from("electronic_ids")
      .select("id")
      .eq("resident_id", resident_id)
      .eq("status", "active")
      .maybeSingle();
    if (existingEid) throw new Error("Resident already has an active eID");

    // ── Upload photo if provided ──────────────────────────────────────────────
    let uploadedPhotoUrl: string | null = null;
    if (photo_url) {
      try {
        const { bytes, mimeType } = decodeBase64Image(photo_url);
        const ext  = mimeType === "image/png" ? "png" : "jpg";
        const path = `${resident_id}/profile.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("resident-photos")
          .upload(path, bytes, { upsert: true, contentType: mimeType });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("resident-photos")
            .getPublicUrl(path);
          uploadedPhotoUrl = publicUrl;
          await supabase.from("residents").update({ photo_url: publicUrl }).eq("id", resident_id);
        } else {
          console.error("Storage upload error:", uploadError.message);
        }
      } catch (photoErr) {
        console.error("Photo upload failed:", photoErr);
      }
    }

    // ── Generate eID ──────────────────────────────────────────────────────────
    const year      = new Date().getFullYear();
    const sequence  = Math.floor(10000 + Math.random() * 90000);
    const eidNumber = `BRY-${year}-${sequence}`;
    const qrToken   = btoa(JSON.stringify({ eid: eidNumber, rid: resident_id, iat: Math.floor(Date.now() / 1000) }));
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 3);

    const { data: eid, error: insertError } = await supabase
      .from("electronic_ids")
      .insert({ resident_id, eid_number: eidNumber, qr_token: qrToken, expires_at: expiresAt.toISOString(), issued_by: user.id, status: "active" })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, eid, photo_url: uploadedPhotoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status  = ["Unauthorized", "Forbidden: Insufficient role"].includes(message) ? 403 : 400;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status },
    );
  }
});