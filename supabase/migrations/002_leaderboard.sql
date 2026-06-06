-- Leaderboard para daily challenge
create table if not exists leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  seed integer not null,
  score integer not null,
  fase integer not null default 0,
  combos integer not null default 0,
  created_at timestamptz default now()
);

create index idx_leaderboard_seed on leaderboard(seed);
create index idx_leaderboard_score on leaderboard(seed, score desc);

-- Um entry por user por seed
create unique index idx_leaderboard_user_seed on leaderboard(user_id, seed);

alter table leaderboard enable row level security;

create policy "Anyone can read leaderboard"
  on leaderboard for select using (true);

create policy "Users insert own scores"
  on leaderboard for insert with check (auth.uid() = user_id);

create policy "Users update own scores"
  on leaderboard for update using (auth.uid() = user_id);
