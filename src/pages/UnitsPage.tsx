
import BaseLayout from "@/components/BaseLayout";

const UnitsPage = () => {
  return (
    <BaseLayout title="Gerenciar Unidades">
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Unidades</h2>
        <p className="text-muted-foreground">
          Aqui você pode gerenciar as unidades franqueadas.
        </p>
      </div>
    </BaseLayout>
  );
};

export default UnitsPage;
