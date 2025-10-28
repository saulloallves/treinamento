import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MigrationResult {
  email: string;
  status: 'success' | 'skipped' | 'error';
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Setup dos Clientes Supabase ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Cliente com Service Role para o schema 'public'
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'public' }
    });

    // Cliente com Service Role para o schema 'treinamento' e operações de auth
    const supabaseTreinamento = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'treinamento' }
    });

    // --- Etapa 1: Segurança - A função agora depende apenas da Service Role Key ---

    // --- Etapa 2: Lógica Principal - Buscar Usuários Existentes ---
    const { data: { users: existingUsers }, error: usersError } = await supabaseTreinamento.auth.admin.listUsers({ page: 1, perPage: 10000 });
    if (usersError) throw usersError;
    const existingEmails = new Set(existingUsers.map(u => u.email));

    // --- Etapa 3: Buscar TODOS os Franqueados Ativos ---
    const { data: allFranchisees, error: franqueadosError } = await supabasePublic
      .from('franqueados')
      .select('*')
      .is('is_active_system', true);

    if (franqueadosError) throw franqueadosError;

    // --- Etapa 4: Filtrar em memória para encontrar quem ainda não foi migrado ---
    const franchiseesToMigrate = allFranchisees.filter(f => f.email && !existingEmails.has(f.email));

    if (franchiseesToMigrate.length === 0) {
      return new Response(
        JSON.stringify({ message: "Migração concluída. Nenhum franqueado novo para migrar.", results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // --- Etapa 5: Processar o próximo lote ---
    const BATCH_SIZE = 100;
    const batch = franchiseesToMigrate.slice(0, BATCH_SIZE);
    const results: MigrationResult[] = [];

    for (const franchisee of batch) {
      // A verificação de e-mail e senha agora é feita no início
      if (!franchisee.email || !franchisee.systems_password) {
        results.push({ email: franchisee.email || 'N/A', status: 'skipped', message: 'E-mail ou senha do sistema não definidos.' });
        continue;
      }
      
      try {
        // ... (o restante da lógica de busca de vínculos e criação de usuário permanece a mesma)
        const { data: vinculos, error: vinculosError } = await supabasePublic
          .from('franqueados_unidades')
          .select('unidade:unidades!franqueados_unidades_unidade_id_fkey(group_code, group_name)')
          .eq('franqueado_id', franchisee.id)
          .order('created_at', { ascending: false });

        if (vinculosError) throw new Error(`Erro ao buscar unidades para o franqueado ${franchisee.email}: ${vinculosError.message}`);
        if (!vinculos || vinculos.length === 0) {
          results.push({ email: franchisee.email, status: 'error', message: 'Nenhuma unidade vinculada encontrada.' });
          continue;
        }

        const unitCodes = vinculos.map(v => v.unidade.group_code.toString());
        const unitNames = vinculos.map(v => v.unidade.group_name).join(', ');
        const latestUnitCode = vinculos[0].unidade.group_code.toString();

        const { error: createError } = await supabaseTreinamento.auth.admin.createUser({
          email: franchisee.email,
          password: franchisee.systems_password,
          email_confirm: true,
          user_metadata: {
            full_name: franchisee.full_name,
            cpf: franchisee.cpf_rnm,
            phone: franchisee.contact,
            password: franchisee.systems_password,
            user_type: 'Aluno',
            role: 'Franqueado',
            unit_code: latestUnitCode,
            unit_codes: unitCodes,
            nomes_unidades: unitNames,
          }
        });
        
        if (createError) throw createError;

        results.push({ email: franchisee.email, status: 'success', message: 'Usuário franqueado migrado com sucesso.' });

      } catch (error) {
        results.push({ email: franchisee.email, status: 'error', message: error.message });
      }
    }

    // --- Etapa 5: Retornar Relatório Final ---
    return new Response(
      JSON.stringify({
        message: `Migração concluída. ${results.filter(r => r.status === 'success').length} sucesso(s), ${results.filter(r => r.status === 'error').length} erro(s), ${results.filter(r => r.status === 'skipped').length} ignorado(s).`,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
