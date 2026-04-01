
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    '[BarangayLink] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env'
  );
}

/**
 * Primary client — scoped to the `barangaylink` schema.
 * All supabase.from('table_name') calls route here automatically.
 *
 * Usage (no changes needed in service files):
 *   import { supabase } from '@/services/supabase/client';
 *   const { data } = await supabase.from('residents').select('*');
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  db: {
    schema: 'barangaylink',   // ← key change vs. old 'public' default
  },
  auth: {
    autoRefreshToken : true,
    persistSession   : true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
