-- Allow the admin user to update trick levels
create policy "Admins can update tricks"
  on public.tricks for update
  using (auth.jwt() ->> 'email' = 'justinreeves00@gmail.com');
