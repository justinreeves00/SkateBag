-- NEW TRICK SUGGESTIONS TABLE
create table if not exists public.new_trick_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  description text,
  status text default 'pending', -- pending, approved, rejected
  created_at timestamptz default now()
);

-- RLS
alter table public.new_trick_suggestions enable row level security;

create policy "Users can insert their own trick suggestions"
  on public.new_trick_suggestions for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all trick suggestions"
  on public.new_trick_suggestions for select
  using (auth.jwt()->>'email' = 'justinreeves00@gmail.com');

create policy "Admins can update trick suggestions"
  on public.new_trick_suggestions for update
  using (auth.jwt()->>'email' = 'justinreeves00@gmail.com');
