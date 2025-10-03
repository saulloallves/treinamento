import BaseLayout from "@/components/BaseLayout";
import UnidadesList from "@/components/units/UnidadesList";
import { Building2 } from "lucide-react";

const UnitsPage = () => {
  return (
    <BaseLayout title="Gerenciar Unidades">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Gestão de Unidades</h1>
              <p className="text-xs text-muted-foreground">Gerencie as unidades da rede</p>
            </div>
          </div>
        </div>

        <UnidadesList />
      </div>
    </BaseLayout>
  );
};

export default UnitsPage;
