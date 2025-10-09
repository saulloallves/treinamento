-- Allow authenticated users to create their own profile in public.users
-- and update it later. This will let student signups attach their unit.

-- Enable RLS is already enabled per schema summary. Add policies:
create policy if not exists "Users can insert their own profile"
on public.users
for insert
to authenticated
with check (id = auth.uid());

create policy if not exists "Users can update their own profile"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());