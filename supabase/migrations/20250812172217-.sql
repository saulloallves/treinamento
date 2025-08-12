-- Seed admin user to fix admin routing immediately
-- Inserts the specified user into public.admin_users if not present
insert into public.admin_users (user_id, email, name, role, active)
select 
  '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid,
  'alison.martins@crescieperdi.com.br',
  coalesce((select raw_user_meta_data->>'full_name' from auth.users where id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid), 'Administrador'),
  'admin',
  true
where not exists (
  select 1 from public.admin_users where user_id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid
);
