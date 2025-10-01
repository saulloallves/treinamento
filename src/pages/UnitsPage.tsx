import BaseLayout from "@/components/BaseLayout";
import UnidadesList from "@/components/units/UnidadesList";

const UnitsPage = () => {
  return (
    <BaseLayout title="Gerenciar Unidades">
      <UnidadesList />
    </BaseLayout>
  );
};

export default UnitsPage;
