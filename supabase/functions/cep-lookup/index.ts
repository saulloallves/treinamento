import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cep } = await req.json();
    const cleanedCep = (cep || '').replace(/\D/g, '');

    if (cleanedCep.length !== 8) {
      return new Response(JSON.stringify({ error: 'CEP inválido. Deve conter 8 dígitos.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    if (!response.ok) {
      throw new Error('Falha ao consultar o serviço de CEP.');
    }

    const data = await response.json();
    if (data.erro) {
      return new Response(JSON.stringify({ error: 'CEP não encontrado.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});