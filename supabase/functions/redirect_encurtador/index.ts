import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'public' } }
    );

    const url = new URL(req.url);
    const slug = url.pathname.split('/').pop();

    if (!slug) {
      throw new Error('Código de redirecionamento não fornecido.');
    }

    const { data, error } = await supabaseAdmin
      .from('redirects')
      .select('long_url')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new Error('URL não encontrada.');
    }

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': data.long_url,
      },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }
})
