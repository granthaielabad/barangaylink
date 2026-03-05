// ─────────────────────────────────────────────────────────────
// Single hook that fetches all analytics data in parallel.
// Each chart component receives only the slice it needs via props.
// Charts with no DB backing (NewResidentsPerYear, ResidentsTransferredOut,
// PopulationGrowth) continue using their existing mock data functions.
// ─────────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';

async function fetchAnalyticsData() {
  const [
    residentsRes,
    householdsRes,
    eidsRes,
    sexRes,
    ageRes,
    purokRes,
    eidStatusRes,
    eidMonthlyRes,
  ] = await Promise.all([
    // ── Totals ───────────────────────────────────────────────
    supabase
      .from('residents')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'archived'),

    supabase
      .from('households')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'archived'),

    supabase
      .from('electronic_ids')
      .select('id', { count: 'exact', head: true }),

    // ── Gender breakdown ──────────────────────────────────────
    supabase
      .from('residents')
      .select('sex')
      .neq('status', 'archived'),

    // ── Age groups ────────────────────────────────────────────
    supabase
      .from('residents')
      .select('date_of_birth')
      .neq('status', 'archived')
      .not('date_of_birth', 'is', null),

    // ── Households per purok ──────────────────────────────────
    supabase
      .from('puroks')
      .select('name, households(id, status)')
      .order('name'),

    // ── eID active vs inactive ────────────────────────────────
    supabase
      .from('electronic_ids')
      .select('status'),

    // ── eID renewals by month (last 6 months) ─────────────────
    supabase
      .from('electronic_ids')
      .select('issued_at')
      .gte('issued_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  // Throw on any error
  for (const res of [residentsRes, householdsRes, eidsRes, sexRes, ageRes, purokRes, eidStatusRes, eidMonthlyRes]) {
    if (res.error) throw res.error;
  }

  // ── Process gender ──────────────────────────────────────────
  const sexTally = { M: 0, F: 0 };
  (sexRes.data ?? []).forEach((r) => {
    if (r.sex === 'M') sexTally.M++;
    else if (r.sex === 'F') sexTally.F++;
  });
  const totalSex = sexTally.M + sexTally.F || 1;
  const gender = {
    male:   parseFloat(((sexTally.M / totalSex) * 100).toFixed(2)),
    female: parseFloat(((sexTally.F / totalSex) * 100).toFixed(2)),
  };

  // ── Process age groups ──────────────────────────────────────
  const now = new Date();
  const ageGroups = { children: 0, youth: 0, adults: 0, seniorCitizens: 0 };
  (ageRes.data ?? []).forEach((r) => {
    const dob  = new Date(r.date_of_birth);
    const age  = now.getFullYear() - dob.getFullYear()
               - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    if      (age < 18)          ageGroups.children++;
    else if (age <= 35)         ageGroups.youth++;
    else if (age <= 59)         ageGroups.adults++;
    else                        ageGroups.seniorCitizens++;
  });

  // ── Process households per purok ────────────────────────────
  const householdsPerPurok = (purokRes.data ?? []).map((p) => ({
    name:  p.name,
    count: (p.households ?? []).filter((h) => h.status !== 'archived').length,
  }));

  // ── Process eID active vs inactive ──────────────────────────
  const eidTally = { active: 0, inactive: 0 };
  (eidStatusRes.data ?? []).forEach((e) => {
    if (e.status === 'active') eidTally.active++;
    else                       eidTally.inactive++;
  });
  const totalEid = eidTally.active + eidTally.inactive || 1;
  const eidStatus = {
    active:   parseFloat(((eidTally.active   / totalEid) * 100).toFixed(2)),
    inactive: parseFloat(((eidTally.inactive / totalEid) * 100).toFixed(2)),
  };

  // ── Process monthly eID issuance (last 6 months) ────────────
  // Build a map of "Mon YYYY" → count from real data
  const monthMap = {};
  (eidMonthlyRes.data ?? []).forEach((e) => {
    const d   = new Date(e.issued_at);
    const key = d.toLocaleDateString('en-US', { month: 'short' }); // "Jan", "Feb" …
    monthMap[key] = (monthMap[key] ?? 0) + 1;
  });
  // Build ordered last-6-months labels
  const last6Labels = [];
  const last6Data   = [];
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const lbl = d.toLocaleDateString('en-US', { month: 'short' });
    last6Labels.push(lbl);
    last6Data.push(monthMap[lbl] ?? 0);
  }

  return {
    totals: {
      residents:  residentsRes.count ?? 0,
      households: householdsRes.count ?? 0,
      eids:       eidsRes.count ?? 0,
    },
    gender,
    ageGroups,
    householdsPerPurok,
    eidStatus,
    eidRenewal: { labels: last6Labels, data: last6Data },
  };
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn:  fetchAnalyticsData,
    staleTime: 1000 * 60 * 5, // 5 min — heavy aggregate, no need to refetch frequently
  });
}