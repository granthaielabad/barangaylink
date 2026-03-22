// src/hooks/queries/analytics/useAnalytics.js
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../services/supabase/client';

async function fetchAnalyticsData(year) {
  const targetYear = year ?? new Date().getFullYear();
  const now = new Date(); // ← was missing, caused ReferenceError

  const [
    residentsRes, householdsRes, eidsRes,
    sexRes, ageGroupRes, demographicRes,
    eidStatusRes, eidMonthlyRes,
    growthRes, monthlyRes, archivedMonthlyRes,
  ] = await Promise.all([
    // ── Totals ──────────────────────────────────────────────────
    supabase.from('residents').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('households').select('id', { count: 'exact', head: true }).neq('status', 'archived'),
    supabase.from('electronic_ids').select('id', { count: 'exact', head: true }),

    // ── Demographics ─────────────────────────────────────────────
    supabase.from('residents').select('sex').neq('status', 'archived'),
    supabase.rpc('get_population_by_age_group'),        // 14-bracket detail
    supabase.rpc('get_demographic_summary'),            // Philippine 4-category summary

    // ── eID status breakdown ─────────────────────────────────────
    supabase.from('electronic_ids').select('status'),

    // ── eID issuances by month (last 6 months) ───────────────────
    supabase.from('electronic_ids').select('issued_at')
      .gte('issued_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),

    // ── Population growth: new residents per year (last 5 years) ─
    supabase.rpc('get_population_growth', { p_years: 5 }),

    // ── New residents per month for selected year ─────────────────
    supabase.rpc('get_residents_by_month', { p_year: targetYear }),

    // ── Archived residents per month for selected year ────────────
    supabase.from('residents')
      .select('updated_at')
      .eq('status', 'archived')
      .gte('updated_at', `${targetYear}-01-01`)
      .lt('updated_at', `${targetYear + 1}-01-01`),
  ]);

  // Check all responses for errors
  for (const res of [
    residentsRes, householdsRes, eidsRes, sexRes,
    ageGroupRes, demographicRes,
    eidStatusRes, eidMonthlyRes, growthRes, monthlyRes, archivedMonthlyRes,
  ]) {
    if (res.error) throw res.error;
  }

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

  // ── Age groups — life-stage brackets for bar chart ───────────
  const ageGroupRows = ageGroupRes.data ?? [];
  const ageGroupMap  = Object.fromEntries(ageGroupRows.map((r) => [r.age_group, Number(r.count)]));
  const ALL_BRACKETS = [
    'Toddlers', 'Children', 'Teenagers',
    'Young Adults', 'Middle-aged Adults', 'Senior Citizens',
  ];
  const ageGroups = ALL_BRACKETS.map((bracket) => ({
    bracket,
    count: ageGroupMap[bracket] ?? 0,
  }));

  // ── Demographic summary — 6 life-stage categories ────────────
  const demoMap = Object.fromEntries(
    (demographicRes.data ?? []).map((r) => [r.category, Number(r.count)])
  );
  const demographics = {
    toddlers:         demoMap['Toddlers']           ?? 0,
    children:         demoMap['Children']           ?? 0,
    teenagers:        demoMap['Teenagers']          ?? 0,
    youngAdults:      demoMap['Young Adults']       ?? 0,
    middleAgedAdults: demoMap['Middle-aged Adults'] ?? 0,
    seniorCitizens:   demoMap['Senior Citizens']    ?? 0,
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

  // ── eID issuance by month (last 6) ───────────────────────────
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

  // ── Population growth ────────────────────────────────────────
  const populationGrowth = (growthRes.data ?? []).map((r) => ({
    year:  r.year,
    count: Number(r.count),
  }));

  // ── New residents by month ───────────────────────────────────
  const residentsByMonth = (monthlyRes.data ?? []).map((r) => ({
    month: r.month,
    count: Number(r.count),
  }));

  // ── Archived residents by month ──────────────────────────────
  const archiveMap = {};
  (archivedMonthlyRes.data ?? []).forEach((r) => {
    const m = new Date(r.updated_at).getMonth() + 1;
    archiveMap[m] = (archiveMap[m] ?? 0) + 1;
  });
  const archivedByMonth = Object.entries(archiveMap).map(([month, count]) => ({
    month: Number(month), count,
  }));

  return {
    totals: {
      residents:  residentsRes.count ?? 0,
      households: householdsRes.count ?? 0,
      eids:       eidsRes.count ?? 0,
    },
    gender,
    ageGroups,       // 14-bracket array for detail bar chart
    demographics,    // Philippine 4-category summary for demographic cards
    eidStatus,
    eidRenewal:      { labels: last6Labels, data: last6Data },
    populationGrowth,
    residentsByMonth,
    archivedByMonth,
  };
}

export function useAnalytics(year) {
  return useQuery({
    queryKey:  ['analytics', year],
    queryFn:   () => fetchAnalyticsData(year),
    staleTime: 1000 * 60 * 5,
  });
}