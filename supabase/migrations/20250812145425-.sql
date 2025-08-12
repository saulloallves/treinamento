-- Add RLS policies to allow users to manage their own profile

create policy "Users can insert their own profile"
on public.users
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());