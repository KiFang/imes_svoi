import test from 'node:test';
import assert from 'node:assert/strict';
import { joinBlock, isFull, canCreateEvent, LIMIT } from '../site/js/rules.js';

const open = { id: 1, open: true };
const closed = { id: 2, open: false };
const applicant = { role: 'applicant', verify: 'none' };
const pendingStudent = { role: 'student', verify: 'pending' };
const student = { role: 'student', verify: 'ok' };
const alumni = { role: 'alumni', verify: 'ok' };

test('гость не может вступить', () => assert.equal(joinBlock(null, open, 0), 'auth_required'));
test('абитуриент вступает в открытую группу', () => assert.equal(joinBlock(applicant, open, 0), null));
test('абитуриент не вступает в закрытую группу', () => assert.equal(joinBlock(applicant, closed, 0), 'closed_group'));
test('лимит групп для абитуриента', () => {
  assert.equal(joinBlock(applicant, open, LIMIT - 1), null);
  assert.equal(joinBlock(applicant, open, LIMIT), 'join_limit');
});
test('студент до проверки ограничен как абитуриент', () => {
  assert.equal(isFull(pendingStudent), false);
  assert.equal(joinBlock(pendingStudent, closed, 0), 'closed_group');
});
test('подтверждённые студент и выпускник без ограничений', () => {
  for (const u of [student, alumni]) {
    assert.equal(isFull(u), true);
    assert.equal(joinBlock(u, closed, 10), null);
  }
});
test('событие создаёт только полный пользователь в своей группе', () => {
  assert.equal(canCreateEvent(student, [1], 1), true);
  assert.equal(canCreateEvent(student, [1], 2), false);
  assert.equal(canCreateEvent(pendingStudent, [1], 1), false);
  assert.equal(canCreateEvent(null, [1], 1), false);
});
