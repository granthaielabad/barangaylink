/**
 * Numeric order for sitio/purok labels (e.g. "Sitio 1" … "Sitio 7").
 * Names without a trailing number sort last, then alphabetically.
 */
export function sitioNameSortKey(name) {
  if (name == null || String(name).trim() === '') return Number.MAX_SAFE_INTEGER;
  const nums = String(name).match(/\d+/g);
  if (!nums?.length) return Number.MAX_SAFE_INTEGER;
  const n = Number(nums[nums.length - 1]);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

export function compareSitioNames(aName, bName) {
  const ka = sitioNameSortKey(aName);
  const kb = sitioNameSortKey(bName);
  if (ka !== kb) return ka - kb;
  return String(aName).localeCompare(String(bName), undefined, { numeric: true });
}
