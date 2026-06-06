-- Coleção de figurinhas do jogador
create table if not exists collections (
  user_id uuid references auth.users(id) on delete cascade primary key,
  unlocked_players text[] default '{}',
  unlocked_boosts text[] default '{}',
  stats jsonb default '{"runs": 0, "wins": 0, "bestScore": 0}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table collections enable row level security;

create policy "Users read own collection"
  on collections for select using (auth.uid() = user_id);

create policy "Users insert own collection"
  on collections for insert with check (auth.uid() = user_id);

create policy "Users update own collection"
  on collections for update using (auth.uid() = user_id);
