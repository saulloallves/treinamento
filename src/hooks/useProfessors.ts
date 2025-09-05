import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Professor {
  id: string;
  name: string;
  email: string;
  active: boolean;
  user_type: string;
  approval_status: string;
  created_at: string;
  phone?: string;
  position?: string;
}

export interface ProfessorPermission {
  id: string;
  professor_id: string;
  module_name: string;
  can_view: boolean;
  can_edit: boolean;
  enabled_fields: Record<string, boolean>;
}

export const useProfessors = () => {
  return useQuery({
    queryKey: ["professors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'Professor')
        .order('name');

      if (error) {
        console.error('Error fetching professors:', error);
        throw error;
      }

      return data as Professor[];
    }
  });
};

export const useCreateProfessor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (professorData: {
      name: string;
      email: string;
      phone?: string;
      position?: string;
    }) => {
      // First create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: professorData.email,
        password: 'TrocaEstaSenh@123', // Senha temporária
        email_confirm: true,
        user_metadata: {
          full_name: professorData.name,
          user_type: 'Professor',
          phone: professorData.phone,
          position: professorData.position,
        }
      });

      if (authError) {
        throw authError;
      }

      // Then create the user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: professorData.name,
          email: professorData.email,
          phone: professorData.phone,
          position: professorData.position,
          user_type: 'Professor',
          active: true,
          approval_status: 'aprovado'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professor criado com sucesso!", {
        description: "Senha temporária: TrocaEstaSenh@123"
      });
    },
    onError: (error: Error) => {
      toast.error("Erro ao criar professor", {
        description: error.message
      });
    },
  });
};

export const useUpdateProfessorStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ professorId, active }: { professorId: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', professorId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success(
        `Professor ${variables.active ? 'ativado' : 'desativado'} com sucesso!`
      );
    },
    onError: (error: Error) => {
      toast.error("Erro ao alterar status do professor", {
        description: error.message
      });
    },
  });
};

export const useDeleteProfessor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (professorId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', professorId);

      if (error) {
        throw error;
      }
      
      return professorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professor excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao excluir professor", {
        description: error.message
      });
    },
  });
};