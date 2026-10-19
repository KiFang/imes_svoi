-- Свои в ИМЭС: схема базы данных.
-- Правила доступа реализованы в самой базе (RLS и триггеры), поэтому их нельзя обойти через браузер.

-- ===== Таблицы =====
create table public.tags (
  id   text primary key,
  name text not null
);

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '' check (char_length(name) <= 80),
  role          text not null default 'applicant' check (role in ('student', 'alumni', 'applicant')),
  verify_status text not null default 'none' check (verify_status in ('none', 'pending', 'ok', 'rejected')),
  tg_id         bigint unique,
  interests     text[] not null default '{}' check (cardinality(interests) <= 8),
  created_at    timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.groups (
  id          bigint generated always as identity primary key,
  name        text not null,
  kind        text not null default 'student' check (kind in ('student', 'teacher')),
  description text not null default '',
  tags        text[] not null default '{}',
  is_open     boolean not null default true,
  hue         int not null default 20 check (hue between 0 and 360),
  created_at  timestamptz not null default now()
);

create table public.group_members (
  group_id  bigint not null references public.groups(id) on delete cascade,
  user_id   uuid   not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index on public.group_members (user_id);

create table public.events (
  id         bigint generated always as identity primary key,
  title      text not null check (char_length(title) between 4 and 120),
  source     text not null check (source in ('imes', 'student')),
  group_id   bigint references public.groups(id) on delete set null,
  starts_at  timestamptz not null,
  place      text not null default '' check (char_length(place) <= 80),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.events (starts_at);

create table public.event_going (
  event_id bigint not null references public.events(id) on delete cascade,
  user_id  uuid   not null references auth.users(id) on delete cascade,
  primary key (event_id, user_id)
);

create table public.verification_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  ticket      text check (char_length(ticket) <= 60),
  file_path   text,
  status      text not null default 'pending' check (status in ('pending', 'ok', 'rejected')),
  created_at  timestamptz not null default now(),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);
create index on public.verification_requests (status, created_at);

-- ===== Вспомогательные функции =====
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- «Полный» доступ: студент или выпускник с подтверждённым студенческим.
create or replace function public.is_full(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role <> 'applicant' and p.verify_status = 'ok'
  );
$$;

-- Профиль создаётся автоматически при регистрации. Роль берётся из формы, но сама по себе
-- ничего не даёт: права открывает только verify_status = 'ok', который ставит проверяющий.
-- tg_id читается из app_metadata: клиент не может его подделать.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data ->> 'role', 'applicant');
begin
  if r not in ('student', 'alumni', 'applicant') then r := 'applicant'; end if;
  insert into public.profiles (id, name, role, tg_id)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 80),
    r,
    nullif(new.raw_app_meta_data ->> 'tg_id', '')::bigint
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Правила вступления =====
-- Не полный пользователь: только открытые группы и не больше трёх.
create or replace function public.enforce_join_rules() returns trigger
language plpgsql security definer set search_path = public as $$
declare g public.groups; cnt int;
begin
  select * into g from public.groups where id = new.group_id;
  if g.id is null then raise exception 'forbidden'; end if;
  if not public.is_full(new.user_id) then
    if not g.is_open then raise exception 'closed_group'; end if;
    select count(*) into cnt from public.group_members where user_id = new.user_id;
    if cnt >= 3 then raise exception 'join_limit'; end if;
  end if;
  return new;
end $$;

create trigger group_members_rules
  before insert on public.group_members
  for each row execute function public.enforce_join_rules();

-- ===== Публичные представления со счётчиками =====
-- Работают с правами владельца, чтобы считать всех участников, а не только строки текущего пользователя.
create view public.groups_public as
  select g.*, (select count(*) from public.group_members m where m.group_id = g.id)::int as member_count
  from public.groups g;

create view public.events_public as
  select e.*, (select count(*) from public.event_going x where x.event_id = e.id)::int as going_count
  from public.events e;

-- ===== Права доступа (RLS) =====
alter table public.tags                  enable row level security;
alter table public.profiles              enable row level security;
alter table public.admins                enable row level security;
alter table public.groups                enable row level security;
alter table public.group_members         enable row level security;
alter table public.events                enable row level security;
alter table public.event_going           enable row level security;
alter table public.verification_requests enable row level security;

create policy tags_read on public.tags for select to anon, authenticated using (true);
create policy groups_read on public.groups for select to anon, authenticated using (true);
create policy groups_admin_write on public.groups for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy members_read_own on public.group_members for select to authenticated using (user_id = auth.uid());
create policy members_join on public.group_members for insert to authenticated with check (user_id = auth.uid());
create policy members_leave on public.group_members for delete to authenticated using (user_id = auth.uid());

create policy events_read on public.events for select to anon, authenticated using (true);
create policy events_insert_student on public.events for insert to authenticated with check (
  created_by = auth.uid() and source = 'student' and public.is_full(auth.uid())
  and exists (select 1 from public.group_members m where m.group_id = events.group_id and m.user_id = auth.uid())
);
create policy events_admin_all on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy events_delete_own on public.events for delete to authenticated using (created_by = auth.uid());

create policy going_own_read on public.event_going for select to authenticated using (user_id = auth.uid());
create policy going_own_add on public.event_going for insert to authenticated with check (user_id = auth.uid());
create policy going_own_del on public.event_going for delete to authenticated using (user_id = auth.uid());

create policy vr_read_own on public.verification_requests for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- Запросы на проверку создаёт только функция submit_verification ниже. Таблица admins недоступна клиенту целиком.

-- Supabase по умолчанию выдаёт ролям широкие права на новые объекты. Сначала всё забираем, потом выдаём точечно.
-- Особенно важно для представлений: они работают с правами владельца и иначе позволили бы писать в таблицы мимо RLS.
revoke all on all tables in schema public from anon, authenticated;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_full(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_full(uuid) to authenticated;

grant select on public.tags, public.groups, public.events, public.groups_public, public.events_public to anon, authenticated;
grant select on public.profiles, public.group_members, public.event_going, public.verification_requests to authenticated;
grant insert, delete on public.group_members, public.event_going to authenticated;
grant insert, delete on public.events to authenticated;
grant update on public.events to authenticated;                -- строки ограничивает политика events_admin_all
grant insert, update, delete on public.groups to authenticated; -- то же: только проверяющие, политика groups_admin_write
-- Менять роль и статус проверки напрямую нельзя: разрешены только эти два столбца.
grant update (name, interests) on public.profiles to authenticated;

-- ===== Проверка студенческого =====
create or replace function public.submit_verification(p_ticket text, p_path text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); r text;
begin
  if uid is null then raise exception 'auth_required'; end if;
  select role into r from public.profiles where id = uid;
  if r = 'applicant' then raise exception 'not_required'; end if;
  if coalesce(trim(p_ticket), '') = '' and p_path is null then raise exception 'empty_request'; end if;
  if p_path is not null and split_part(p_path, '/', 1) <> uid::text then raise exception 'forbidden'; end if;
  insert into public.verification_requests (user_id, ticket, file_path) values (uid, nullif(trim(p_ticket), ''), p_path);
  update public.profiles set verify_status = 'pending' where id = uid and verify_status <> 'ok';
end $$;

create or replace function public.admin_pending()
returns table (id uuid, user_id uuid, name text, email text, role text, ticket text, file_path text, created_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select v.id, v.user_id, p.name, u.email::text, p.role, v.ticket, v.file_path, v.created_at
    from public.verification_requests v
    join public.profiles p on p.id = v.user_id
    join auth.users u on u.id = v.user_id
    where v.status = 'pending'
    order by v.created_at;
end $$;

create or replace function public.review_verification(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.verification_requests
     set status = case when p_approve then 'ok' else 'rejected' end, reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_id and status = 'pending'
   returning user_id into uid;
  if uid is null then raise exception 'forbidden'; end if;
  update public.profiles set verify_status = case when p_approve then 'ok' else 'rejected' end where id = uid;
end $$;

revoke all on function public.submit_verification(text, text) from public, anon;
revoke all on function public.admin_pending() from public, anon;
revoke all on function public.review_verification(uuid, boolean) from public, anon;
grant execute on function public.submit_verification(text, text) to authenticated;
grant execute on function public.admin_pending() to authenticated;
grant execute on function public.review_verification(uuid, boolean) to authenticated;

-- ===== Хранилище файлов (фото студенческих), закрытое =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification', 'verification', false, 5242880, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

create policy verification_upload_own on storage.objects for insert to authenticated
  with check (bucket_id = 'verification' and (storage.foldername(name))[1] = auth.uid()::text);
create policy verification_read on storage.objects for select to authenticated
  using (bucket_id = 'verification' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
