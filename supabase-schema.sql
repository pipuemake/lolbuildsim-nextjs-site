-- LoL Build Simulator - Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- 公開ビルドテーブル
create table public.published_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  champion_id varchar(30) not null,
  build_name varchar(100) not null,
  level int not null default 1 check (level >= 1 and level <= 18),
  items jsonb not null default '[]',
  runes jsonb not null,
  spells jsonb,
  lane text check (lane is null or lane in ('top','jg','mid','bot','sup')),
  role text check (role is null or role in ('warden','vanguard','juggernaut','diver','skirmisher','assassin','marksman','battlemage','burstmage','artillery','enchanter','catcher','specialist')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ブックマークテーブル
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  build_id uuid references public.published_builds(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, build_id)
);

-- ユーザープロフィール（表示名保存用）
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(50),
  avatar_url text,
  created_at timestamptz default now()
);

-- RLSポリシー
alter table public.published_builds enable row level security;
alter table public.bookmarks enable row level security;
alter table public.profiles enable row level security;

-- 公開ビルド: 誰でも閲覧可能、自分のもののみ作成・削除
create policy "Anyone can view builds" on public.published_builds for select using (true);
create policy "Users can insert own builds" on public.published_builds for insert with check (auth.uid() = user_id);
create policy "Users can delete own builds" on public.published_builds for delete using (auth.uid() = user_id);

-- ブックマーク: 自分のもののみ管理
create policy "Users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- プロフィール: 誰でも閲覧、自分のみ更新
create policy "Anyone can view profiles" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- インデックス
create index idx_builds_champion on public.published_builds(champion_id);
create index idx_builds_lane on public.published_builds(lane);
create index idx_builds_role on public.published_builds(role);
create index idx_builds_user on public.published_builds(user_id);
create index idx_bookmarks_user on public.bookmarks(user_id);
