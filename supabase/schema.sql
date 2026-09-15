-- 新表不自动迁移旧同步码数据。不删除旧数据，但停止旧表匿名读取与写入。
do $$ begin
  if to_regclass('public.user_data') is not null then
    execute 'drop policy if exists "anon read" on public.user_data';
    execute 'drop policy if exists "anon upsert" on public.user_data';
    execute 'drop policy if exists "anon update" on public.user_data';
    execute 'revoke all on public.user_data from anon, authenticated';
  end if;
end $$;

create table if not exists public.career_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.career_profiles enable row level security;
drop policy if exists "own career profile" on public.career_profiles;
create policy "own career profile" on public.career_profiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.career_profiles from anon;
grant select, insert, update, delete on public.career_profiles to authenticated;

create table if not exists public.career_catalog (
  id text primary key check (id = 'main'), payload jsonb not null,
  published_at timestamptz not null default now()
);
alter table public.career_catalog enable row level security;
drop policy if exists "read public career catalog" on public.career_catalog;
create policy "read public career catalog" on public.career_catalog for select to anon, authenticated using (true);
revoke all on public.career_catalog from anon, authenticated;
grant select on public.career_catalog to anon, authenticated;

create table if not exists public.career_research_cache (
  key text primary key, payload jsonb not null, expires_at timestamptz not null
);
alter table public.career_research_cache enable row level security;
-- 检索只存专业、企业与主题，不存简历、姓名、邮箱或私人档案。
drop policy if exists "read public research cache" on public.career_research_cache;
create policy "read public research cache" on public.career_research_cache for select to anon, authenticated using (true);
revoke all on public.career_research_cache from anon, authenticated;
grant select on public.career_research_cache to anon, authenticated;

create table if not exists public.career_research_budget (
  budget_key text not null, day date not null, used integer not null default 0 check (used >= 0),
  primary key (budget_key, day)
);
alter table public.career_research_budget enable row level security;
revoke all on public.career_research_budget from anon, authenticated;

-- 原子额度：全站每天最多50次新查询，单账号最多5次；失败请求也占额度。
-- 客户端不能调用此RPC伪造用户ID。定时任务的p_user_id为空，但仍占全站额度。
create or replace function public.claim_career_research_budget(p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'Asia/Shanghai')::date; total integer; personal integer;
begin
  perform pg_advisory_xact_lock(hashtext('career-budget-' || today::text));
  select used into total from public.career_research_budget where budget_key = 'global' and day = today;
  if coalesce(total, 0) >= 50 then return false; end if;
  if p_user_id is not null then
    select used into personal from public.career_research_budget where budget_key = p_user_id::text and day = today;
    if coalesce(personal, 0) >= 5 then return false; end if;
    insert into public.career_research_budget values (p_user_id::text, today, 1)
      on conflict (budget_key, day) do update set used = career_research_budget.used + 1;
  end if;
  insert into public.career_research_budget values ('global', today, 1)
    on conflict (budget_key, day) do update set used = career_research_budget.used + 1;
  return true;
end $$;
revoke all on function public.claim_career_research_budget(uuid) from public, anon, authenticated;
grant execute on function public.claim_career_research_budget(uuid) to service_role;
grant all on public.career_catalog, public.career_research_cache, public.career_research_budget, public.career_profiles to service_role;
