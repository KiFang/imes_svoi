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

export async function createApi() {
  const cfg = window.SVOI_CONFIG || {};
  if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
    try {
      if (!window.supabase) await loadScript(SB_CDN);
      const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
      return { api: createSupabaseApi(cfg, sb), sb, cfg };
    } catch (e) {
      console.warn('Supabase недоступен, включён демо-режим', e);
    }
  }
  return { api: createMockApi(browserStorage), sb: null, cfg };
}
