-- Remove a política restritiva de insert que impede admins de criar usuários
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Cria nova política que permite admins criarem usuários e usuários criarem seu próprio perfil
CREATE POLICY "Admins can create users and users can create own profile" ON public.users
FOR INSERT 
WITH CHECK (
  -- Admin pode criar qualquer usuário
  is_admin(auth.uid()) 
  OR 
  -- Usuário pode criar apenas seu próprio perfil
  (id = auth.uid())
);

-- Remove a política restritiva de update
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Cria nova política de update que permite admins atualizarem qualquer usuário
CREATE POLICY "Admins can update users and users can update own profile" ON public.users
FOR UPDATE 
USING (
  -- Admin pode atualizar qualquer usuário
  is_admin(auth.uid()) 
  OR 
  -- Usuário pode atualizar apenas seu próprio perfil
  (id = auth.uid())
)
WITH CHECK (
  -- Admin pode atualizar qualquer usuário
  is_admin(auth.uid()) 
  OR 
  -- Usuário pode atualizar apenas seu próprio perfil
  (id = auth.uid())
);