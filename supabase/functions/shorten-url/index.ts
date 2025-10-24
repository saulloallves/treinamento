import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { longUrl } = await req.json();
    if (!longUrl) {
      throw new Error('A URL para encurtar é obrigatória.');
    }

    // 1. Enviar a requisição para a API, exatamente como no seu exemplo
    const response = await fetch('https://api.encurtador.dev/encurtamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longUrl }),
    });

    // 2. Verificar se a requisição foi bem-sucedida
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Erro retornado pela API encurtador.dev:", errorBody);
      throw new Error(`A API de encurtamento retornou um erro: ${response.status}`);
    }

    // 3. Recuperar o JSON e a URL encurtada
    const data = await response.json();
    const shortUrl = `https://${data.urlEncurtada}`;

    // 4. Retornar a URL encurtada com sucesso
    return new Response(
      JSON.stringify({ success: true, shortUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error("Erro fatal na função shorten-url:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
