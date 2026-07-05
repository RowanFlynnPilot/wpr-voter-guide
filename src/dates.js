// Date helpers. All election dates are ISO yyyy-mm-dd strings compared as
// local calendar days — a deadline is "past" only after its day has ended.

export function todayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ISO strings compare correctly as strings.
export function isPast(isoDate) {
  return isoDate < todayIso();
}

// The first deadline on or after today, or null once all have passed.
export function nextDeadline(deadlines) {
  const today = todayIso();
  return deadlines.find((d) => d.date >= today) ?? null;
}

export function daysUntil(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const [ty, tm, td] = todayIso().split('-').map(Number);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((new Date(y, m - 1, d) - new Date(ty, tm - 1, td)) / msPerDay);
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHour(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function formatDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
