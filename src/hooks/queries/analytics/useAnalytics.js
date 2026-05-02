import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';
import { compareSitioNames } from '../../../utils/sitioOrder';

async function fetchAnalyticsData(year) {
  const targetYear = year ?? new Date().getFullYear();
  const now = new Date();

  const [
    residentsRes, householdsRes, eidsRes,
    sexRes, ageGroupRes, demographicRes,
    eidStatusRes, eidMonthlyRes,
    growthRes, monthlyRes, archivedMonthlyRes,
    sectoralRes, requestsRes,
    householdsBySitioRes
  ] = await Promise.all([
    // ── Totals ──────────────────────────────────────────────────
    supabase.from('residents').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('households').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('electronic_ids').select('id', { count: 'exact', head: true }),

    // ── Demographics ─────────────────────────────────────────────
    supabase.from('residents').select('sex').neq('status', 'archived'),
    supabase.rpc('get_population_by_age_group'),
    supabase.rpc('get_demographic_summary'),

    // ── eID breakdown ─────────────────────────────────────
    supabase.from('electronic_ids').select('status'),

    // ── eID issuances (last 6 months) ───────────────────
    supabase.from('electronic_ids').select('issued_at')
      .gte('issued_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),

    // ── Growth ──────────────────────────────────────────
    supabase.rpc('get_population_growth', { p_years: 5 }),

    // ── Monthly ──────────────────────────────────────────
    supabase.rpc('get_residents_by_month', { p_year: targetYear }),

    // ── Archived ──────────────────────────────────────────
    supabase.from('residents')
      .select('updated_at')
      .eq('status', 'archived')
      .gte('updated_at', `${targetYear}-01-01`)
      .lt('updated_at', `${targetYear + 1}-01-01`),

    // ── Sectoral / Insights ──────────────────────────────
    supabase.from('residents')
      .select('is_pwd, is_solo_parent, is_indigent, date_of_birth')
      .neq('status', 'archived'),

    // ── External Requests ─────────────────────────────────
    supabase.schema('public').from('request_tbl').select('id', { count: 'exact', head: true }),

    // ── Households by Sitio & Ownership ──────────────────────────────
    supabase.from('households')
      .select('purok_id, puroks(name), ownership_type')
      .neq('status', 'archived'),
  ]);

  const allRes = [
    residentsRes, householdsRes, eidsRes, sexRes,
    ageGroupRes, demographicRes,
    eidStatusRes, eidMonthlyRes, growthRes, monthlyRes, archivedMonthlyRes,
    sectoralRes, requestsRes, householdsBySitioRes
  ];
  for (const res of allRes) {
    if (res.error) throw res.error;
  }

  // ── Households Processing ──────────────────────────
  const sitioCounts = {};
  const ownershipCounts = { owned: 0, rented: 0, shared: 0, informal: 0 };
  
  (householdsBySitioRes.data ?? []).forEach(h => {
    const name = h.puroks?.name || 'Unknown';
    sitioCounts[name] = (sitioCounts[name] ?? 0) + 1;
    
    if (h.ownership_type && h.ownership_type in ownershipCounts) {
      ownershipCounts[h.ownership_type]++;
    }
  });

  const householdsPerPurok = Object.entries(sitioCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => compareSitioNames(a.name, b.name));

  const householdOwnership = {
    labels: ['Owned', 'Rented', 'Shared', 'Informal Settler'],
    data: [
      ownershipCounts.owned,
      ownershipCounts.rented,
      ownershipCounts.shared,
      ownershipCounts.informal
    ]
  };

  // ── Sectoral / Insights Processing ──────────────────────────
  const sectoral = { soloParent: 0, pwd: 0, lgbtq: 0 };
  const insights = { seniors: 0, pwds: 0, children: 0, pregnant: 0 };
  
  (sectoralRes.data ?? []).forEach(r => {
    if (r.is_solo_parent) sectoral.soloParent++;
    if (r.is_pwd) sectoral.pwd++;
    if (r.is_indigent) sectoral.lgbtq++; // Maps to LGBTQ+ in UI
    
    // Calculate Age for insights
    const age = Math.floor((Date.now() - new Date(r.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    if (age >= 60) insights.seniors++;
    if (r.is_pwd) insights.pwds++;
    if (age < 13) insights.children++;
  });

  // ── Gender ────────────────────────────────────────────────────
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

  // ── Age groups ───────────────────────────────────────────────
  const ageGroupRows = ageGroupRes.data ?? [];
  const ageGroupMap  = Object.fromEntries(ageGroupRows.map((r) => [r.age_group, Number(r.count)]));
  const ALL_BRACKETS = ['Toddlers', 'Children', 'Teenagers', 'Young Adults', 'Middle-aged Adults', 'Senior Citizens'];
  const ageGroups = ALL_BRACKETS.map((bracket) => ({
    bracket,
    count: ageGroupMap[bracket] ?? 0,
  }));

  // ── Demographic summary ─────────────────────────────────────
  const demoMap = Object.fromEntries((demographicRes.data ?? []).map((r) => [r.category, Number(r.count)]));
  const demographics = {
    toddlers: demoMap['Toddlers'] ?? 0,
    children: demoMap['Children'] ?? 0,
    teenagers: demoMap['Teenagers'] ?? 0,
    youngAdults: demoMap['Young Adults'] ?? 0,
    middleAgedAdults: demoMap['Middle-aged Adults'] ?? 0,
    seniorCitizens: demoMap['Senior Citizens'] ?? 0,
  };

  // ── eID status ────────────────────────────────────────────────
  const eidTally = { active: 0, inactive: 0 };
  (eidStatusRes.data ?? []).forEach((e) => {
    if (e.status === 'active') eidTally.active++;
    else eidTally.inactive++;
  });
  const totalEid = eidTally.active + eidTally.inactive || 1;
  const eidStatus = {
    active:   parseFloat(((eidTally.active   / totalEid) * 100).toFixed(2)),
    inactive: parseFloat(((eidTally.inactive / totalEid) * 100).toFixed(2)),
  };

  // ── eID issuance by month ────────────────────────────────────
  const monthMap = {};
  (eidMonthlyRes.data ?? []).forEach((e) => {
    const key = new Date(e.issued_at).toLocaleDateString('en-US', { month: 'short' });
    monthMap[key] = (monthMap[key] ?? 0) + 1;
  });
  const last6Labels = [];
  const last6Data   = [];
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const lbl = d.toLocaleDateString('en-US', { month: 'short' });
    last6Labels.push(lbl);
    last6Data.push(monthMap[lbl] ?? 0);
  }

  // ── Archived residents by month ──────────────────────────────
  const archivedMonthMap = {};
  for (let i = 1; i <= 12; i++) archivedMonthMap[i] = 0;
  (archivedMonthlyRes.data ?? []).forEach((r) => {
    const d = new Date(r.updated_at);
    const month = d.getMonth() + 1;
    archivedMonthMap[month]++;
  });
  const archivedByMonth = Object.entries(archivedMonthMap).map(([month, count]) => ({ month: Number(month), count }));

  return {
    totals: {
      residents:  residentsRes.count ?? 0,
      households: householdsRes.count ?? 0,
      eids:       eidsRes.count ?? 0,
      requests:   requestsRes.count ?? 0,
    },
    gender,
    ageGroups,
    demographics,
    eidStatus,
    eidRenewal: { labels: last6Labels, data: last6Data },
    populationGrowth: (growthRes.data ?? []).map(r => ({ year: r.year, count: Number(r.count) })),
    residentsByMonth: (monthlyRes.data ?? []).map(r => ({ month: r.month, count: Number(r.count) })),
    archivedByMonth,
    sectoral,
    insights,
    householdsPerPurok,
    householdOwnership
  };
}

export function useAnalytics(year) {
  return useQuery({
    queryKey:  ['analytics', year],
    queryFn:   () => fetchAnalyticsData(year),
    staleTime: 1000 * 60 * 5,
  });
}
