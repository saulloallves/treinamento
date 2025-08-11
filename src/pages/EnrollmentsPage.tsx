import { useState } from "react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateManualEnrollmentDialog from "@/components/enrollments/CreateManualEnrollmentDialog";

const EnrollmentsPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <BaseLayout title="Gerenciar Inscrições">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inscrições</h2>
          <p className="text-muted-foreground">Aqui você pode gerenciar as inscrições dos usuários nos cursos.</p>
        </div>
        <Button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Nova Inscrição
        </Button>
      </div>

      {/* Conteúdo da página */}
      <div className="bg-card p-8 rounded-lg border">
        {/* Aqui vai a tabela/lista de inscrições futura */}
        <p className="text-muted-foreground">Use o botão acima para adicionar uma inscrição manualmente.</p>
      </div>

      <CreateManualEnrollmentDialog open={open} onOpenChange={setOpen} />
    </BaseLayout>
  );
};

export default EnrollmentsPage;
