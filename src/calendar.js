// Deadline reminders as downloadable .ics files, built client-side as
// data: URIs — no server, nothing leaves the reader's device. All-day
// events: the exact hour varies by deadline (and by municipality), so
// the detail text carries the specifics.

function icsEscape(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function icsDay(iso) {
  return iso.replace(/-/g, '');
}

// DTEND is exclusive for all-day events: the following calendar day.
function nextDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${next.getFullYear()}${mm}${dd}`;
}

export function deadlineIcs(election, deadline) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wausau Pilot & Review//Voter Guide//EN',
    'BEGIN:VEVENT',
    `UID:${election.id}-${deadline.id}@wpr-voter-guide`,
    // Deterministic stamp: the deadline's own date, midnight UTC.
    `DTSTAMP:${icsDay(deadline.date)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDay(deadline.date)}`,
    `DTEND;VALUE=DATE:${nextDay(deadline.date)}`,
    `SUMMARY:${icsEscape(`${deadline.label} — ${election.name}`)}`,
    `DESCRIPTION:${icsEscape(`${deadline.detail} Details: ${deadline.link}`)}`,
    `URL:${deadline.link}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
