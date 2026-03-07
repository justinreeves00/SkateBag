-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  updated_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Policy: Profiles are publicly readable
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' and policyname = 'Profiles are publicly readable'
  ) then
    create policy "Profiles are publicly readable" on public.profiles for select using (true);
  end if;
end
$$;

-- Policy: Users can update own profile
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end
$$;

-- Policy: Users can insert own profile
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
end
$$;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger creation (drop if exists to ensure recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
