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

    console.log('Buscando CEP:', cleanedCep)

    // Primeiro tenta BrasilAPI
    let response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanedCep}`)
    let data = null
    let mappedData = null

    if (response.ok) {
      data = await response.json()
      console.log('BrasilAPI response:', data)
      
      // Mapeamento da resposta da BrasilAPI
      mappedData = {
        cep: data.cep,
        logradouro: data.street,
        complemento: data.complement || '',
        bairro: data.neighborhood,
        localidade: data.city,
        uf: data.state,
      }
    } else {
      console.log('BrasilAPI falhou, tentando ViaCEP. Status:', response.status)
      
      // Fallback para ViaCEP
      response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`)
      
      if (!response.ok) {
        console.error('ViaCEP também falhou. Status:', response.status)
        throw new Error('Falha ao consultar APIs de CEP.')
      }
      
      data = await response.json()
      console.log('ViaCEP response:', data)
      
      // Verifica se o CEP foi encontrado (ViaCEP retorna erro dentro do JSON)
      if (data.erro) {
        return new Response(JSON.stringify({ error: 'CEP não encontrado.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      // ViaCEP já está no formato correto
      mappedData = data
    }

    return new Response(JSON.stringify(mappedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('CEP Lookup Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})