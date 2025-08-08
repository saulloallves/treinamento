
import BaseLayout from "@/components/BaseLayout";

const SettingsPage = () => {
  return (
    <BaseLayout title="Configurações do Sistema">
      <div className="bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold text-foreground mb-6">Configurações</h2>
        <p className="text-muted-foreground">
          Aqui você pode configurar o sistema de treinamentos.
        </p>
      </div>
    </BaseLayout>
  );
};

export default SettingsPage;
