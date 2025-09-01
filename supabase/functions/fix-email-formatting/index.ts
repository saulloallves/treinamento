import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FixResult {
  id: string;
  grupo: string;
  originalEmail: string;
  fixedEmail: string;
  fixed: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todas as unidades com email
    const { data: unidades, error: unidadesError } = await supabaseAdmin
      .from("unidades")
      .select("id, grupo, email")
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

    const results: FixResult[] = [];

    // Função para limpar o email
    const cleanEmail = (email: string): string => {
      if (!email) return email;
      
      // Remove colchetes no início e fim
      let cleaned = email.replace(/^\[|\]$/g, '');
      
      // Remove texto "(mailto:" e tudo depois até o final
      cleaned = cleaned.replace(/\s*\(mailto:.*$/, '');
      
      // Remove espaços extras
      cleaned = cleaned.trim();
      
      return cleaned;
    };

    // Processar cada unidade
    for (const unidade of unidades) {
      const originalEmail = unidade.email;
      const fixedEmail = cleanEmail(originalEmail);
      
      const result: FixResult = {
        id: unidade.id,
        grupo: unidade.grupo || "",
        originalEmail,
        fixedEmail,
        fixed: originalEmail !== fixedEmail
      };

      // Se o email foi modificado, atualizar no banco
      if (result.fixed) {
        const { error: updateError } = await supabaseAdmin
          .from("unidades")
          .update({ email: fixedEmail })
          .eq("id", unidade.id);

        if (updateError) {
          console.error(`Erro ao atualizar email da unidade ${unidade.grupo}:`, updateError);
          result.fixed = false;
        }
      }

      results.push(result);
    }

    const fixedCount = results.filter(r => r.fixed).length;
    const totalCount = results.length;

    return new Response(
      JSON.stringify({
        message: `Processamento concluído: ${fixedCount} emails corrigidos de ${totalCount} unidades`,
        summary: {
          total: totalCount,
          fixed: fixedCount,
          unchanged: totalCount - fixedCount
        },
        results: results.filter(r => r.fixed) // Mostrar apenas os que foram corrigidos
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro na função fix-email-formatting:", error);
    
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