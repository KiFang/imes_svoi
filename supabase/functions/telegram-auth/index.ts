// Вход через Telegram Login Widget.
// Проверяет подпись данных (HMAC-SHA-256 по токену бота, как описано в документации Telegram),
// находит или создаёт пользователя и возвращает одноразовый токен для входа в Supabase.
// Секреты: TELEGRAM_BOT_TOKEN (задаётся командой supabase secrets set). SUPABASE_URL и
// SUPABASE_SERVICE_ROLE_KEY Supabase подставляет в функции сам.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: cors });
const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

async function signatureValid(tg: Record<string, string | number>, botToken: string): Promise<boolean> {
  const { hash, ...rest } = tg;
  if (typeof hash !== 'string') return false;
  const dataCheckString = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('\n');
  const secret = await crypto.subtle.digest('SHA-256', enc.encode(botToken));
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const calc = hex(await crypto.subtle.sign('HMAC', key, enc.encode(dataCheckString)));
  if (calc.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < calc.length; i++) diff |= calc.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return reply(405, { error: 'method' });

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) return reply(500, { error: 'not_configured' });

  let payload: { tg?: Record<string, string | number>; role?: string };
  try { payload = await req.json(); } catch { return reply(400, { error: 'bad_json' }); }
  const tg = payload.tg;
  if (!tg || !(await signatureValid(tg, botToken))) return reply(401, { error: 'bad_signature' });

  // Данные старше 10 минут не принимаем: защита от повторной отправки перехваченного ответа.
  const age = Math.floor(Date.now() / 1000) - Number(tg.auth_date);
  if (!Number.isFinite(age) || age > 600 || age < -60) return reply(401, { error: 'expired' });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const tgId = Number(tg.id);
  const role = ['student', 'alumni', 'applicant'].includes(String(payload.role)) ? String(payload.role) : 'applicant';
  const name = [tg.first_name, tg.last_name].filter(Boolean).join(' ').slice(0, 80);

  let email: string | null = null;
  const { data: prof } = await admin.from('profiles').select('id').eq('tg_id', tgId).maybeSingle();
  if (prof) {
    const { data: u } = await admin.auth.admin.getUserById(prof.id);
    email = u?.user?.email ?? null;
  } else {
    email = `tg${tgId}@telegram.invalid`;
    const { error } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      app_metadata: { tg_id: tgId },
      user_metadata: { name, role }
    });
    if (error && !/already/i.test(error.message)) return reply(500, { error: 'create_failed' });
  }
  if (!email) return reply(500, { error: 'no_email' });

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (linkErr || !link?.properties?.hashed_token) return reply(500, { error: 'link_failed' });
  return reply(200, { token_hash: link.properties.hashed_token });
});
