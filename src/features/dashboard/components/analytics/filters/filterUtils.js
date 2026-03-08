export function formatDate(d) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function toYMD(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  const y   = date.getFullYear();
  const m   = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getCalendarDays(year, month) {
  const first      = new Date(year, month, 1);
  const last       = new Date(year, month + 1, 0);
  const startPad   = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return toYMD(a) === toYMD(b);
}

export function isInRange(day, start, end) {
  if (!day || !start || !end) return false;
  const t = day.getTime();
  return t > start.getTime() && t < end.getTime();
}

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];