// Единая точка входа для данных. Интерфейс (app.js) не знает, откуда они приходят.
import { createMockApi } from './api-mock.js';
import { createSupabaseApi } from './api-supabase.js';

const SB_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('Не удалось загрузить ' + src));
    document.head.appendChild(s);
  });
}

const browserStorage = {
  get: k => localStorage.getItem(k),
  set: (k, v) => localStorage.setItem(k, v)
};

// Возвращает слой данных и первые данные для отрисовки.
// Если сервер настроен, но не отвечает, сайт не ломается: включается демо-режим и ставится флаг fallback.
export async function createApi() {
  const cfg = window.SVOI_CONFIG || {};
  const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  if (configured) {
    try {
      if (!window.supabase) await loadScript(SB_CDN);
      const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
      const api = createSupabaseApi(cfg, sb);
      return { api, sb, cfg, data: await api.init(), fallback: false };
    } catch (e) {
      console.warn('Сервер недоступен, включён демо-режим', e);
    }
  }
  const api = createMockApi(browserStorage);
  return { api, sb: null, cfg, data: await api.init(), fallback: configured };
}
