
import BaseLayout from "@/components/BaseLayout";
import SystemSettingsForm from "@/components/settings/SystemSettingsForm";

const SettingsPage = () => {
  return (
    <BaseLayout title="Configurações do Sistema">
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-bold text-foreground mb-2">Configurações</h2>
          <p className="text-muted-foreground">
            Configure as opções e comportamentos do sistema de treinamentos.
          </p>
        </div>
        
        <SystemSettingsForm />
      </div>
    </BaseLayout>
  );
};

export default SettingsPage;
