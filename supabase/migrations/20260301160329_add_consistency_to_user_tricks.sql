-- Add consistency column to user_tricks to track successful tries out of 10
alter table public.user_tricks add column if not exists consistency integer check (consistency between 0 and 10);
