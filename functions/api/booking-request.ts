/**
 * POST /api/booking-request — заявка на бронювання → повідомлення в Telegram.
 * Env (Cloudflare Pages → Settings → Environment variables):
 *   TELEGRAM_BOT_TOKEN — токен бота від @BotFather
 *   TELEGRAM_CHAT_ID   — id чату/групи, куди слати заявки
 */

interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

interface BookingPayload {
  cottage?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  name?: string;
  phone?: string;
  comment?: string;
  /** honeypot: справжні користувачі його не заповнюють */
  website?: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: 'service_unavailable' }, 503);
  }

  let body: BookingPayload;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Анти-спам: honeypot заповнений — тихо "приймаємо" і викидаємо
  if (body.website) return json({ ok: true });

  const name = (body.name ?? '').trim().slice(0, 100);
  const phone = (body.phone ?? '').trim().slice(0, 30);
  const cottage = (body.cottage ?? '').trim().slice(0, 60);
  const checkIn = (body.checkIn ?? '').trim().slice(0, 10);
  const checkOut = (body.checkOut ?? '').trim().slice(0, 10);
  const guests = (body.guests ?? '').trim().slice(0, 10);
  const comment = (body.comment ?? '').trim().slice(0, 500);

  if (!name || !phone.match(/[\d+()\-\s]{7,}/)) {
    return json({ ok: false, error: 'validation' }, 422);
  }

  // Серверна перевірка дат (захист, окрім клієнтської): виїзд має бути після заїзду
  if (checkIn && checkOut && checkOut <= checkIn) {
    return json({ ok: false, error: 'validation' }, 422);
  }

  const lines = [
    '🏠 <b>Нова заявка з сайту</b>',
    cottage && `Котедж: <b>${esc(cottage)}</b>`,
    checkIn && checkOut && `Дати: <b>${esc(checkIn)} → ${esc(checkOut)}</b>`,
    guests && `Гостей: <b>${esc(guests)}</b>`,
    `Ім'я: <b>${esc(name)}</b>`,
    `Телефон: <b>${esc(phone)}</b>`,
    comment && `Коментар: ${esc(comment)}`,
  ].filter(Boolean);

  const tg = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lines.join('\n'),
        parse_mode: 'HTML',
      }),
    }
  );

  if (!tg.ok) return json({ ok: false, error: 'telegram_failed' }, 502);
  return json({ ok: true });
};
