// Режим без сервера: всё хранится в localStorage браузера.
// Нужен, чтобы сайт работал на любом бесплатном хостинге сразу после загрузки файлов.
import { TAGS, GROUPS, EVENTS } from './seed-data.js';
import { joinBlock, canCreateEvent, rulesError } from './rules.js';

export function createMockApi(storage) {
  const KEY = 'svoi-imes-mock-v1';
  let st = { user: null, joined: [], going: [], custom: [] };
  let pending = null;
  let code = '';

  try { const raw = storage.get(KEY); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* пустое состояние */ }
  const save = () => { try { storage.set(KEY, JSON.stringify(st)); } catch (e) { /* хранилище недоступно */ } };
  const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

  return {
    mode: 'mock',
    telegramBot: '',

    async init() {
      return {
        tags: TAGS,
        // Счётчики сразу учитывают текущего пользователя, как и ответ сервера.
        groups: GROUPS.map(g => Object.assign({}, g, { m: g.m + (st.joined.indexOf(g.id) > -1 ? 1 : 0) })),
        events: EVENTS.concat(st.custom).map(e => Object.assign({}, e, { go: e.go + (st.going.indexOf(e.id) > -1 ? 1 : 0) })),
        user: st.user,
        joined: st.joined.slice(),
        going: st.going.slice()
      };
    },

    async requestCode({ email, name, role }) {
      pending = { email, name, role };
      code = newCode();
      return { demoCode: code };
    },

    async verifyCode({ email, code: input }) {
      if (!pending || pending.email !== email || String(input) !== code) throw rulesError('bad_code');
      st.user = { name: pending.name, email, role: pending.role, tg: false, interests: [], verify: 'none' };
      pending = null;
      save();
      return st.user;
    },

    async telegramLogin(tg, role) {
      st.user = { name: [tg.first_name, tg.last_name].filter(Boolean).join(' ') || 'Пользователь Telegram', email: '', role, tg: true, interests: [], verify: 'none' };
      save();
      return st.user;
    },

    async submitVerification({ ticket, file }) {
      if (!st.user) throw rulesError('auth_required');
      if (st.user.role === 'applicant') throw rulesError('not_required');
      if (!(ticket && ticket.trim()) && !file) throw rulesError('empty_request');
      st.user.verify = 'pending';
      save();
      return st.user;
    },

    async saveProfile({ interests }) {
      if (!st.user) throw rulesError('auth_required');
      st.user.interests = interests.slice(0, 8);
      save();
      return st.user;
    },

    async join(id) {
      const g = GROUPS.filter(x => x.id === id)[0];
      const why = joinBlock(st.user, g, st.joined.length);
      if (why) throw rulesError(why);
      if (st.joined.indexOf(id) < 0) st.joined.push(id);
      save();
    },

    async leave(id) {
      st.joined = st.joined.filter(x => x !== id);
      save();
    },

    async setGoing(id, on) {
      if (!st.user) throw rulesError('auth_required');
      st.going = st.going.filter(x => x !== id);
      if (on) st.going.push(id);
      save();
    },

    async createEvent({ title, groupId, date, time, place }) {
      if (!canCreateEvent(st.user, st.joined, groupId)) throw rulesError('forbidden');
      const ev = { id: 'u' + Date.now(), t: title, src: 'stu', date, time: time || '18:00', place: place || 'Место уточняется', g: groupId, go: 0 };
      st.custom.push(ev);
      save();
      return ev;
    },

    async signOut() {
      st = { user: null, joined: [], going: [], custom: [] };
      save();
    },

    // Только для демонстрации: имитация решения проверяющего.
    async demoApprove() {
      if (st.user) { st.user.verify = 'ok'; save(); }
      return st.user;
    }
  };
}
