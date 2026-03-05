-- MNREELS Database Schema
-- Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  phone text,
  bio text default '',
  is_creator boolean default false,
  creator_verified boolean default false,
  bank_name text,
  bank_account text,
  tasalbar_balance integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'Хэрэглэгч')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- SERIES
-- ============================================
create table public.series (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  cover_url text,
  category text not null,
  age_rating text default 'Бүгд' check (age_rating in ('Бүгд', '13+', '16+', '18+')),
  free_episodes integer default 3,
  is_published boolean default true,
  total_views integer default 0,
  rating numeric(2,1) default 0.0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_series_creator on public.series(creator_id);
create index idx_series_category on public.series(category);
create index idx_series_published on public.series(is_published) where is_published = true;

-- ============================================
-- EPISODES
-- ============================================
create table public.episodes (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid not null references public.series(id) on delete cascade,
  episode_number integer not null,
  title text not null,
  duration integer default 0, -- seconds
  video_url text, -- R2 HLS manifest URL
  thumbnail_url text,
  is_free boolean default false,
  tasalbar_cost integer default 2,
  status text default 'processing' check (status in ('processing', 'moderation', 'published', 'rejected')),
  views integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),

  unique(series_id, episode_number)
);

create index idx_episodes_series on public.episodes(series_id, episode_number);
create index idx_episodes_status on public.episodes(status);

-- Auto-publish after 2 hours moderation
-- (handled by Edge Function / cron, not trigger)

-- ============================================
-- FOLLOWS (user follows creator or series)
-- ============================================
create table public.follows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- follow either a creator or a series
  creator_id uuid references public.profiles(id) on delete cascade,
  series_id uuid references public.series(id) on delete cascade,
  created_at timestamptz default now(),

  check (
    (creator_id is not null and series_id is null) or
    (creator_id is null and series_id is not null)
  ),
  unique(user_id, creator_id),
  unique(user_id, series_id)
);

create index idx_follows_user on public.follows(user_id);

-- ============================================
-- WATCH HISTORY
-- ============================================
create table public.watch_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  progress integer default 0, -- seconds watched
  completed boolean default false,
  last_watched_at timestamptz default now(),

  unique(user_id, episode_id)
);

create index idx_watch_user on public.watch_history(user_id, last_watched_at desc);

-- ============================================
-- PURCHASES (episode unlock)
-- ============================================
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  tasalbar_spent integer not null,
  created_at timestamptz default now(),

  unique(user_id, episode_id)
);

-- ============================================
-- TASALBAR TRANSACTIONS
-- ============================================
create table public.tasalbar_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null, -- positive = buy, negative = spend
  type text not null check (type in ('buy', 'spend', 'earn', 'withdraw')),
  description text,
  -- payment reference
  payment_method text, -- 'qpay', 'socialpay'
  payment_ref text,
  -- for earnings: which episode
  episode_id uuid references public.episodes(id),
  created_at timestamptz default now()
);

create index idx_transactions_user on public.tasalbar_transactions(user_id, created_at desc);

-- ============================================
-- CREATOR EARNINGS (85/15 split tracking)
-- ============================================
create table public.creator_earnings (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),
  total_tasalbar integer not null, -- total paid (2)
  creator_share integer not null, -- 85% rounded
  platform_share integer not null, -- 15%
  is_withdrawn boolean default false,
  created_at timestamptz default now()
);

create index idx_earnings_creator on public.creator_earnings(creator_id, is_withdrawn);

-- ============================================
-- WITHDRAWAL REQUESTS
-- ============================================
create table public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  tasalbar_amount integer not null,
  tugrug_amount integer not null, -- tasalbar * 50
  bank_name text not null,
  bank_account text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.follows enable row level security;
alter table public.watch_history enable row level security;
alter table public.purchases enable row level security;
alter table public.tasalbar_transactions enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.withdrawals enable row level security;

-- Profiles: public read, own write
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Series: public read, creator write
create policy "Published series are viewable"
  on public.series for select using (is_published = true);
create policy "Creators can insert own series"
  on public.series for insert with check (auth.uid() = creator_id);
create policy "Creators can update own series"
  on public.series for update using (auth.uid() = creator_id);

-- Episodes: public read published, creator write
create policy "Published episodes are viewable"
  on public.episodes for select using (status = 'published');
create policy "Creators can manage episodes"
  on public.episodes for insert with check (
    exists (select 1 from public.series where id = series_id and creator_id = auth.uid())
  );
create policy "Creators can update own episodes"
  on public.episodes for update using (
    exists (select 1 from public.series where id = series_id and creator_id = auth.uid())
  );

-- Follows: own read/write
create policy "Users can see own follows"
  on public.follows for select using (auth.uid() = user_id);
create policy "Users can follow"
  on public.follows for insert with check (auth.uid() = user_id);
create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = user_id);

-- Watch history: own only
create policy "Users can see own history"
  on public.watch_history for select using (auth.uid() = user_id);
create policy "Users can update own history"
  on public.watch_history for insert with check (auth.uid() = user_id);
create policy "Users can update watch progress"
  on public.watch_history for update using (auth.uid() = user_id);

-- Purchases: own only
create policy "Users can see own purchases"
  on public.purchases for select using (auth.uid() = user_id);
create policy "Users can make purchases"
  on public.purchases for insert with check (auth.uid() = user_id);

-- Transactions: own only
create policy "Users can see own transactions"
  on public.tasalbar_transactions for select using (auth.uid() = user_id);

-- Earnings: creator only
create policy "Creators can see own earnings"
  on public.creator_earnings for select using (auth.uid() = creator_id);

-- Withdrawals: creator only
create policy "Creators can see own withdrawals"
  on public.withdrawals for select using (auth.uid() = creator_id);
create policy "Creators can request withdrawal"
  on public.withdrawals for insert with check (auth.uid() = creator_id);
