-- Create trick_suggestions table
create table if not exists public.trick_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  trick_id uuid references public.tricks(id) on delete cascade not null,
  suggested_level integer not null check (suggested_level between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- RLS
alter table public.trick_suggestions enable row level security;

-- Users can view their own suggestions
create policy "Users can view own suggestions"
  on public.trick_suggestions for select
  using (auth.uid() = user_id);

-- Users can insert suggestions
create policy "Users can insert own suggestions"
  on public.trick_suggestions for insert
  with check (auth.uid() = user_id);

-- Admin can view all suggestions
create policy "Admins can view all suggestions"
  on public.trick_suggestions for select
  using (auth.jwt() ->> 'email' = 'justinreeves00@gmail.com');

-- Admin can update suggestions
create policy "Admins can update suggestions"
  on public.trick_suggestions for update
  using (auth.jwt() ->> 'email' = 'justinreeves00@gmail.com');
