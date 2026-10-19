// Режим с сервером: Supabase (Postgres + Auth + Storage).
// Права доступа проверяет сама база (RLS и триггеры), браузеру можно доверять только отображение.
import { rulesError } from './rules.js';

function mapError(err) {
  const msg = String((err && (err.message || err.error_description)) || err || '');
  const known = ['closed_group', 'join_limit', 'forbidden', 'not_required', 'empty_request', 'auth_required'];
  for (let i = 0; i < known.length; i++) if (msg.indexOf(known[i]) > -1) return rulesError(known[i]);
  if (/token|expired|invalid/i.test(msg)) return rulesError('bad_code');
  if (/rate limit|too many/i.test(msg)) return rulesError('rate_limit');
  const e = new Error(msg); e.code = 'server'; return e;
}
async function ok(promise) {
  const r = await promise;
  if (r.error) throw mapError(r.error);
  return r.data;
}

export function createSupabaseApi(cfg, sb) {
  let uid = null;

  const mapGroup = g => ({ id: g.id, n: g.name, type: g.kind, tags: g.tags || [], m: g.member_count || 0, open: g.is_open, h: g.hue, d: g.description || '' });
  const mapEvent = e => {
    const d = new Date(e.starts_at);
    const p = n => String(n).padStart(2, '0');
    return {
      id: e.id, t: e.title, src: e.source === 'imes' ? 'imes' : 'stu',
      date: d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()),
      time: p(d.getHours()) + ':' + p(d.getMinutes()), place: e.place || '', g: e.group_id, go: e.going_count || 0
    };
  };
  const mapProfile = (p, email) => ({ name: p.name, email: email || '', role: p.role, tg: !!p.tg_id, interests: p.interests || [], verify: p.verify_status });

  async function loadProfile() {
    const { data: s } = await sb.auth.getSession();
    const session = s && s.session;
    if (!session) { uid = null; return null; }
    uid = session.user.id;
    const rows = await ok(sb.from('profiles').select('*').eq('id', uid).limit(1));
    return rows[0] ? mapProfile(rows[0], session.user.email) : null;
  }

  return {
    mode: 'supabase',
    telegramBot: cfg.TELEGRAM_BOT || '',

    async init() {
      const [tags, groups, events] = await Promise.all([
        ok(sb.from('tags').select('id,name').order('name')),
        ok(sb.from('groups_public').select('*').order('id')),
        ok(sb.from('events_public').select('*').order('starts_at'))
      ]);
      const user = await loadProfile();
      let joined = [], going = [];
      if (user) {
        joined = (await ok(sb.from('group_members').select('group_id'))).map(r => r.group_id);
        going = (await ok(sb.from('event_going').select('event_id'))).map(r => r.event_id);
      }
      return { tags: tags.map(t => ({ id: t.id, n: t.name })), groups: groups.map(mapGroup), events: events.map(mapEvent), user, joined, going };
    },

    async requestCode({ email, name, role }) {
      await ok(sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, data: { name, role } } }));
      return {};
    },

    async verifyCode({ email, code }) {
      await ok(sb.auth.verifyOtp({ email, token: String(code), type: 'email' }));
      return loadProfile();
    },

    // Данные виджета Telegram проверяет серверная функция telegram-auth (подпись HMAC).
    async telegramLogin(tg, role) {
      const r = await fetch(cfg.SUPABASE_URL + '/functions/v1/telegram-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY },
        body: JSON.stringify({ tg, role })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token_hash) throw mapError(j.error || 'telegram_failed');
      await ok(sb.auth.verifyOtp({ token_hash: j.token_hash, type: 'magiclink' }));
      return loadProfile();
    },

    async submitVerification({ ticket, file }) {
      let path = null;
      if (file) {
        const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-60);
        path = uid + '/' + Date.now() + '_' + safe;
        await ok(sb.storage.from('verification').upload(path, file, { contentType: file.type, upsert: false }));
      }
      await ok(sb.rpc('submit_verification', { p_ticket: ticket || null, p_path: path }));
      return loadProfile();
    },

    async saveProfile({ interests }) {
      await ok(sb.from('profiles').update({ interests: interests.slice(0, 8) }).eq('id', uid));
      return loadProfile();
    },

    async join(id) { await ok(sb.from('group_members').insert({ group_id: id, user_id: uid })); },
    async leave(id) { await ok(sb.from('group_members').delete().eq('group_id', id).eq('user_id', uid)); },

    async setGoing(id, on) {
      if (on) await ok(sb.from('event_going').insert({ event_id: id, user_id: uid }));
      else await ok(sb.from('event_going').delete().eq('event_id', id).eq('user_id', uid));
    },

    async createEvent({ title, groupId, date, time, place }) {
      const rows = await ok(sb.from('events').insert({
        title, source: 'student', group_id: groupId, place: place || '',
        starts_at: new Date(date + 'T' + (time || '18:00') + ':00').toISOString(), created_by: uid
      }).select('*'));
      return mapEvent(Object.assign({ going_count: 0 }, rows[0]));
    },

    async signOut() { await sb.auth.signOut(); uid = null; }
  };
}
