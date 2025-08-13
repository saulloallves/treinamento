import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface LinkEnrollmentButtonProps {
  enrollmentId: string;
  studentEmail: string;
}

const LinkEnrollmentButton = ({ enrollmentId, studentEmail }: LinkEnrollmentButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLinkEnrollment = async () => {
    setIsLoading(true);
    try {
      // Buscar usuário com o mesmo email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', studentEmail)
        .limit(1);

      if (userError) throw userError;

      if (!users || users.length === 0) {
        toast({
          title: "Usuário não encontrado",
          description: "Não foi encontrado um usuário cadastrado com este email.",
          variant: "destructive",
        });
        return;
      }

      // Vincular a inscrição ao usuário
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ user_id: users[0].id })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      toast({
        title: "Inscrição vinculada",
        description: "A inscrição foi vinculada ao usuário com sucesso.",
      });

      // Invalidar queries para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });

    } catch (error: any) {
      toast({
        title: "Erro ao vincular",
        description: error.message || "Não foi possível vincular a inscrição.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLinkEnrollment}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      <Link className="w-3 h-3" />
      {isLoading ? "Vinculando..." : "Vincular"}
    </Button>
  );
};

export default LinkEnrollmentButton;