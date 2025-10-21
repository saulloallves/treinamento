import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollaboratorDetails {
  email: string;
  admission_date: string;
  instagram_profile?: string;
  meal_voucher_active: boolean;
  meal_voucher_value?: string;
  transport_voucher_active: boolean;
  transport_voucher_value?: string;
  health_plan: boolean;
  basic_food_basket_active: boolean;
  basic_food_basket_value?: string;
  cost_assistance_active: boolean;
  cost_assistance_value?: string;
  salary?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Autenticação ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
      db: { schema: 'treinamento' }
    });
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    // Cliente para o schema 'public' (operações da Matriz)
    const supabasePublic = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    });

    const details: CollaboratorDetails = await req.json();
    console.log('Recebido para atualizar na Matriz:', details);

    // --- Lógica de Atualização ---
    const { error: updateError } = await supabasePublic
      .from('colaboradores_loja')
      .update({
        admission_date: details.admission_date,
        instagram_profile: details.instagram_profile,
        meal_voucher_active: details.meal_voucher_active,
        meal_voucher_value: details.meal_voucher_value,
        transport_voucher_active: details.transport_voucher_active,
        transport_voucher_value: details.transport_voucher_value,
        health_plan: details.health_plan,
        basic_food_basket_active: details.basic_food_basket_active,
        basic_food_basket_value: details.basic_food_basket_value,
        cost_assistance_active: details.cost_assistance_active,
        cost_assistance_value: details.cost_assistance_value,
        salary: details.salary,
      })
      .eq('email', details.email);

    if (updateError) {
      console.error('Erro ao atualizar colaborador na Matriz:', updateError);
      throw new Error(`Falha ao sincronizar com a Matriz: ${updateError.message}`);
    }

    console.log(`✅ Colaborador ${details.email} atualizado na Matriz com sucesso.`);

    return new Response(
      JSON.stringify({ success: true, message: 'Dados do colaborador atualizados na Matriz.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Erro na função update-collaborator-details:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});