// Панель проверяющего: одобрить или отклонить заявки на подтверждение студенческого.
// Работает только с сервером. Права проверяет база: без записи в admins списки придут пустыми, а решения будут отклонены.
import { createApi } from './api.js';

const { sb } = await createApi();
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3000); }

if (!sb) {
  app.innerHTML = '<div class="empty"><b>Сервер не подключён</b>Панель работает с базой Supabase. Заполни SUPABASE_URL и SUPABASE_ANON_KEY в настройках репозитория.</div>';
} else {
  const { data } = await sb.auth.getSession();
  data.session ? await showList() : showLogin();
}

function showLogin() {
  app.innerHTML = '<div class="card pcard"><div class="fld"><label for="em">Почта проверяющего</label><input id="em" type="email" autocomplete="email"></div>' +
    '<div class="err" id="er"></div><button class="btn btn-primary" id="send" style="margin-top:12px">Получить код</button></div>';
  $('#send').onclick = async () => {
    const email = $('#em').value.trim();
    const r = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (r.error) { $('#er').textContent = 'Не получилось отправить код. Проверь почту.'; return; }
    app.innerHTML = '<div class="card pcard"><p>Код отправлен на ' + esc(email) + '.</p><div class="fld"><label for="cd">Код из письма</label><input id="cd" inputmode="numeric" autocomplete="one-time-code"></div>' +
      '<div class="err" id="er"></div><button class="btn btn-primary" id="ok" style="margin-top:12px">Войти</button></div>';
    $('#ok').onclick = async () => {
      const v = await sb.auth.verifyOtp({ email, token: $('#cd').value.trim(), type: 'email' });
      if (v.error) { $('#er').textContent = 'Код не подошёл.'; return; }
      showList();
    };
  };
}

async function showList() {
  const r = await sb.rpc('admin_pending');
  if (r.error) {
    app.innerHTML = '<div class="empty"><b>Нет доступа</b>Эта почта не входит в список проверяющих.<div style="margin-top:14px"><button class="btn btn-ghost btn-sm" id="out">Выйти</button></div></div>';
    $('#out').onclick = async () => { await sb.auth.signOut(); showLogin(); };
    return;
  }
  const rows = r.data || [];
  if (!rows.length) { app.innerHTML = '<div class="empty"><b>Заявок нет</b>Новые появятся здесь.</div>'; return; }
  app.innerHTML = rows.map(x => '<article class="card admin-row" data-id="' + esc(x.id) + '"><div class="row"><b>' + esc(x.name || 'Без имени') + '</b><span class="pill pill-warn">' + esc(x.role) + '</span></div>' +
    '<p class="hint">' + esc(x.email || 'почта не указана') + ' · номер: ' + esc(x.ticket || 'не указан') + '</p>' +
    (x.file_path ? '<p><a class="link" data-file="' + esc(x.file_path) + '" href="#">Открыть файл</a></p>' : '') +
    '<div class="row" style="justify-content:flex-start"><button class="btn btn-primary btn-sm" data-ok="1">Подтвердить</button><button class="btn btn-ghost btn-sm" data-ok="0">Отклонить</button></div></article>').join('');
  app.querySelectorAll('[data-file]').forEach(a => a.onclick = async e => {
    e.preventDefault();
    const s = await sb.storage.from('verification').createSignedUrl(a.dataset.file, 300);
    if (s.error) return toast('Файл недоступен');
    window.open(s.data.signedUrl, '_blank', 'noopener');
  });
  app.querySelectorAll('[data-ok]').forEach(b => b.onclick = async () => {
    const id = b.closest('[data-id]').dataset.id;
    const res = await sb.rpc('review_verification', { p_id: id, p_approve: b.dataset.ok === '1' });
    if (res.error) return toast('Не получилось сохранить решение');
    toast('Решение сохранено'); showList();
  });
}
