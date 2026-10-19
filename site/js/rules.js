// Бизнес-правила доступа. Те же правила продублированы в базе данных
// (supabase/migrations/0001_init.sql), поэтому обход интерфейса ничего не даёт.
export const LIMIT = 3;

export function isFull(user) {
  return !!user && user.role !== 'applicant' && user.verify === 'ok';
}

// Возвращает null, если вступить можно, иначе код причины.
export function joinBlock(user, group, joinedCount) {
  if (!user) return 'auth_required';
  if (isFull(user)) return null;
  if (!group.open) return 'closed_group';
  if (joinedCount >= LIMIT) return 'join_limit';
  return null;
}

export function canCreateEvent(user, joinedIds, groupId) {
  return isFull(user) && joinedIds.indexOf(groupId) > -1;
}

export function rulesError(code) {
  const e = new Error(code);
  e.code = code;
  return e;
}
