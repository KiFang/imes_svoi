// Пока значения пустые, сайт работает в демо-режиме (данные в браузере).
// В GitHub Actions этот файл перезаписывается из переменных репозитория
// SUPABASE_URL, SUPABASE_ANON_KEY и TELEGRAM_BOT (см. .github/workflows/pages.yml).
// Ключ anon публичный по замыслу Supabase: доступ ограничивают политики RLS в базе.
window.SVOI_CONFIG = {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  TELEGRAM_BOT: ''
};
