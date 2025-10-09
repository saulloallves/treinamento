import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateResult {
  email: string;
  unitCode: string;
  unitName: string;
  success: boolean;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Cliente com service role para operações administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todas as unidades com email
    const { data: unidades, error: unidadesError } = await supabaseAdmin
      .from("unidades")
      .select("id, grupo, codigo_grupo, email")
      .not("email", "is", null)
      .neq("email", "");

    if (unidadesError) {
      throw new Error(`Erro ao buscar unidades: ${unidadesError.message}`);
    }

    if (!unidades || unidades.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma unidade com email encontrada",
          results: [] 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results: CreateResult[] = [];
    const defaultPassword = "Trocar01";

    for (const unidade of unidades) {
      const result: CreateResult = {
        email: unidade.email,
        unitCode: unidade.codigo_grupo?.toString() || "",
        unitName: unidade.grupo || "",
        success: false,
      };

      try {
        // Verificar se já existe usuário com este email
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id, email, role")
          .eq("email", unidade.email)
          .maybeSingle();

        if (existingUser) {
          result.error = `Usuário já existe com este email`;
          results.push(result);
          continue;
        }

        // Criar usuário no auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: unidade.email,
          password: defaultPassword,
          email_confirm: true, // Confirmar email automaticamente
          user_metadata: {
            name: `Franqueado ${unidade.grupo}`,
            unit_code: unidade.codigo_grupo?.toString(),
            role: "Franqueado",
            user_type: "Aluno" // Definir como Aluno
          }
        });

        if (authError) {
          result.error = `Erro ao criar auth: ${authError.message}`;
          results.push(result);
          continue;
        }

        if (!authUser.user) {
          result.error = "Usuário não foi criado corretamente";
          results.push(result);
          continue;
        }

        // Criar registro na tabela users
        const { error: userError } = await supabaseAdmin
          .from("users")
          .insert({
            id: authUser.user.id,
            email: unidade.email,
            name: `Franqueado ${unidade.grupo}`,
            unit_code: unidade.codigo_grupo?.toString(),
            role: "Franqueado",
            user_type: "Aluno", // Tipo de usuário como Aluno
            approval_status: "aprovado",
            visible_password: defaultPassword, // ⚠️ RISCO DE SEGURANÇA: Senha em texto plano
            approved_at: new Date().toISOString()
          });

        if (userError) {
          // Se falhar ao criar na tabela users, remover do auth
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
          result.error = `Erro ao criar perfil: ${userError.message}`;
          results.push(result);
          continue;
        }

        result.success = true;
        results.push(result);

      } catch (error: any) {
        result.error = error.message;
        results.push(result);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Processamento concluído: ${successCount} franqueados criados, ${errorCount} erros`,
        summary: {
          total: results.length,
          success: successCount,
          errors: errorCount
        },
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na função bulk-create-franchisees:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: "Erro interno do servidor"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);