import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateFranchiseeData {
  email: string;
  name: string;
  phone?: string;
  unitCode: string;
  unitName: string;
}

export const useCreateFranchisee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFranchiseeData) => {
      // Verificar se já existe um usuário com este email
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", data.email)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Erro ao verificar usuário existente: ${checkError.message}`);
      }

      if (existingUser) {
        if (existingUser.role === "Franqueado") {
          throw new Error("Já existe um franqueado cadastrado com este email");
        } else {
          throw new Error("Já existe um usuário cadastrado com este email");
        }
      }

      // Criar usuário na tabela users
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email: data.email,
          name: data.name,
          phone: data.phone,
          unit_code: data.unitCode,
          role: "Franqueado",
          user_type: "Franqueado",
          approval_status: "aprovado",
          approved_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Erro ao criar franqueado: ${createError.message}`);
      }

      return newUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["unidade-colaborators"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};