-- Allow public read-only access to the users table
alter table public.users enable row level security;

create policy "Allow public read access to users"
on public.users for select
using ( true );
