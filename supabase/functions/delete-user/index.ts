import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-application-name",
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    // Initialize Supabase Client with Service Role Key (to perform admin actions)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { db: { schema: 'barangaylink' } }
    );

    // 1. Verify that the caller is a Superadmin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "superadmin") {
      throw new Error("Forbidden: Only superadmins can delete users");
    }

    // 2. Get the userId to delete from request body
    const body = await req.json();
    const userIdToDelete = body?.userId;
    if (!userIdToDelete) throw new Error("userId is required");

    // Prevent self-deletion via API
    if (userIdToDelete === user.id) throw new Error("You cannot delete your own account");

    // 3. Delete from auth.users (this triggers cascading deletes if configured, 
    // or we might need to cleanup profiles manually if no FK cascade exists)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ success: true, message: `User ${userIdToDelete} deleted` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: err.message.includes("Forbidden") ? 403 : 400 
      },
    );
  }
});
