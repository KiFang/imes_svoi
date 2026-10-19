import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockApi } from '../site/js/api-mock.js';

function memoryStorage() { const m = new Map(); return { get: k => m.get(k) || null, set: (k, v) => m.set(k, v) }; }
async function register(api, role) {
  const { demoCode } = await api.requestCode({ email: 'a@example.com', name: 'Анна Иванова', role });
  return api.verifyCode({ email: 'a@example.com', code: demoCode });
}

test('неверный код отклоняется, верный создаёт профиль', async () => {
  const api = createMockApi(memoryStorage());
  await api.requestCode({ email: 'a@example.com', name: 'Анна', role: 'student' });
  await assert.rejects(api.verifyCode({ email: 'a@example.com', code: '000000' }), { code: 'bad_code' });
  const u = await register(api, 'student');
  assert.equal(u.verify, 'none');
  assert.equal(u.role, 'student');
});

test('абитуриент: до 3 открытых групп, закрытые недоступны', async () => {
  const api = createMockApi(memoryStorage());
  await register(api, 'applicant');
  await assert.rejects(api.join(10), { code: 'closed_group' });
  await api.join(1); await api.join(2); await api.join(3);
  await assert.rejects(api.join(4), { code: 'join_limit' });
});

test('студент: после проверки лимитов нет и можно создать событие', async () => {
  const api = createMockApi(memoryStorage());
  await register(api, 'student');
  await assert.rejects(api.submitVerification({ ticket: '', file: null }), { code: 'empty_request' });
  await api.submitVerification({ ticket: '1234567', file: null });
  await assert.rejects(api.join(10), { code: 'closed_group' });
  await api.demoApprove();
  await api.join(10); await api.join(11); await api.join(13); await api.join(1);
  const ev = await api.createEvent({ title: 'Вечер дебатов', groupId: 10, date: '2026-11-10', time: '18:00', place: 'Ауд. 1' });
  assert.equal(ev.g, 10);
  await assert.rejects(api.createEvent({ title: 'Чужая группа', groupId: 2, date: '2026-11-10' }), { code: 'forbidden' });
});

test('счётчики учитывают текущего пользователя и сохраняются между сессиями', async () => {
  const store = memoryStorage();
  const api = createMockApi(store);
  await register(api, 'applicant');
  const before = (await api.init()).groups.find(g => g.id === 1).m;
  await api.join(1);
  const after = await api.init();
  assert.equal(after.groups.find(g => g.id === 1).m, before + 1);
  const again = await createMockApi(store).init();
  assert.deepEqual(again.joined, [1]);
  assert.equal(again.user.name, 'Анна Иванова');
});

test('выход очищает данные', async () => {
  const api = createMockApi(memoryStorage());
  await register(api, 'applicant'); await api.join(1);
  await api.signOut();
  const d = await api.init();
  assert.equal(d.user, null); assert.deepEqual(d.joined, []);
});
