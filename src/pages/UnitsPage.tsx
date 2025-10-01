import BaseLayout from "@/components/BaseLayout";
import UnidadesList from "@/components/units/UnidadesList";
import { PageHeader } from "@/components/layout";
import { Building2 } from "lucide-react";

const UnitsPage = () => {
  return (
    <BaseLayout title="" showBottomNav={false}>
      <PageHeader
        icon={Building2}
        title="Gerenciar Unidades"
        description="Gerencie todas as unidades da rede"
      />
      <UnidadesList />
    </BaseLayout>
  );
};

export default UnitsPage;
