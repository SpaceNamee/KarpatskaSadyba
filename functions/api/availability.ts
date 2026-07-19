/**
 * GET /api/availability?cottage=1|2|3 — зайняті інтервали дат з iCal-експорту Booking.com.
 * Env: ICAL_URL_COTTAGE_1, ICAL_URL_COTTAGE_2, ICAL_URL_COTTAGE_3
 * Відповідь кешується на годину (Cache-Control), щоб не смикати Booking щозапиту.
 */

interface Env {
  ICAL_URL_COTTAGE_1?: string;
  ICAL_URL_COTTAGE_2?: string;
  ICAL_URL_COTTAGE_3?: string;
}

const json = (data: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(cache ? { 'Cache-Control': 'public, max-age=3600' } : {}),
    },
  });

/** '20260721' | '2026-07-21' → '2026-07-21' */
const toIso = (v: string) => {
  const digits = v.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length !== 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
};

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  const cottage = new URL(request.url).searchParams.get('cottage') ?? '';
  if (!['1', '2', '3'].includes(cottage)) {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  const icalUrl = env[`ICAL_URL_COTTAGE_${cottage}` as keyof Env];
  if (!icalUrl) return json({ ok: false, error: 'not_configured' }, 503);

  let ical: string;
  try {
    const res = await fetch(icalUrl, { headers: { 'User-Agent': 'karpatska-sadyba.com.ua' } });
    if (!res.ok) throw new Error(String(res.status));
    ical = await res.text();
  } catch {
    return json({ ok: false, error: 'upstream_failed' }, 502);
  }

  // Мінімальний парсер VEVENT: DTSTART/DTEND (Booking віддає VALUE=DATE).
  // DTEND за iCal — ексклюзивний (день виїзду вільний для нового заїзду).
  const busy: { start: string; end: string }[] = [];
  for (const block of ical.split('BEGIN:VEVENT').slice(1)) {
    const startMatch = block.match(/DTSTART[^:]*:([0-9T]+)/);
    const endMatch = block.match(/DTEND[^:]*:([0-9T]+)/);
    if (!startMatch || !endMatch) continue;
    const start = toIso(startMatch[1]);
    const end = toIso(endMatch[1]);
    if (start && end) busy.push({ start, end });
  }

  busy.sort((a, b) => a.start.localeCompare(b.start));
  return json({ ok: true, busy }, 200, true);
};
