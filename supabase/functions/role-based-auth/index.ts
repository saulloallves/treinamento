import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  email: string;
  password: string;
  selectedRole: 'admin' | 'teacher' | 'student';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, password, selectedRole }: AuthRequest = await req.json();

    console.log('🔐 Role-based auth request:', { email, selectedRole });

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const userId = authData.user.id;
    console.log('✅ User authenticated:', userId);

    // Check if user has the requested role
    let hasRole = false;
    let actualRoles: string[] = [];

    // Check admin role
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    if (adminData) {
      actualRoles.push('admin');
      if (selectedRole === 'admin') hasRole = true;
    }

    // Check professor role using the existing is_professor function
    const { data: isProfessor, error: professorError } = await supabase
      .rpc('is_professor', { _user: userId });

    if (professorError) {
      console.error('❌ Error checking professor status:', professorError);
    } else if (isProfessor === true) {
      actualRoles.push('teacher');
      if (selectedRole === 'teacher') hasRole = true;
    }

    // Check student role (has enrollments)
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (enrollmentData) {
      actualRoles.push('student');
      if (selectedRole === 'student') hasRole = true;
    }

    console.log('👤 User roles found:', actualRoles);
    console.log('🎯 Requested role:', selectedRole);
    console.log('✓ Has requested role:', hasRole);

    if (!hasRole) {
      console.error('❌ Role not granted:', { selectedRole, actualRoles });
      return new Response(
        JSON.stringify({ 
          error: 'ROLE_NOT_GRANTED',
          message: `Usuário não tem permissão para acessar como ${selectedRole}`,
          availableRoles: actualRoles
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Success - user has the requested role
    const response = {
      success: true,
      user: authData.user,
      session: authData.session,
      actAs: selectedRole,
      availableRoles: actualRoles
    };

    console.log('🎉 Role-based auth successful:', { userId, actAs: selectedRole });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});