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
    const { cep } = await req.json()
    const cleanedCep = cep?.replace(/\D/g, '')

    if (!cleanedCep) {
      return new Response(JSON.stringify({ error: 'CEP é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ===== MUDANÇA DA API =====
    // Trocamos ViaCEP pela BrasilAPI, que é mais estável em ambientes de nuvem.
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanedCep}`)

    if (!response.ok) {
      // A BrasilAPI retorna 404 para CEP não encontrado, o que é tratado aqui.
      if (response.status === 404) {
        return new Response(JSON.stringify({ error: 'CEP não encontrado.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Outros erros de servidor da BrasilAPI
      throw new Error('Falha ao consultar a API de CEP.')
    }

    const data = await response.json()

    // ===== MAPEAMENTO DA RESPOSTA =====
    // Mapeamos a resposta da BrasilAPI para o formato do ViaCEP,
    // assim o frontend não precisa de nenhuma alteração.
    const mappedData = {
      cep: data.cep,
      logradouro: data.street,
      complemento: data.complement,
      bairro: data.neighborhood,
      localidade: data.city,
      uf: data.state,
    }

    return new Response(JSON.stringify(mappedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('CEP Lookup Error:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})