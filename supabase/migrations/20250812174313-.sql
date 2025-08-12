-- Seed/ensure the specified admin user is active admin (idempotent, no ON CONFLICT)

-- Insert if missing
insert into public.admin_users (user_id, email, name, role, active)
select 
  '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid,
  'alison.martins@crescieperdi.com.br',
  'Administrador',
  'admin',
  true
where not exists (
  select 1 from public.admin_users where user_id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid
);

-- Ensure active and role admin
update public.admin_users
set active = true, role = 'admin'
where user_id = '5b0e75b2-aef0-4ae8-a761-577314d607b3'::uuid;