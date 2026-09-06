-- 在 Supabase 控制台 → SQL Editor 里整段执行一次即可
create table if not exists public.user_data (
  sync_code text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- 个人工具：同步码即身份，允许匿名读写（同步码只有你本人知道）
create policy "anon read" on public.user_data for select to anon using (true);
create policy "anon upsert" on public.user_data for insert to anon with check (true);
create policy "anon update" on public.user_data for update to anon using (true) with check (true);
