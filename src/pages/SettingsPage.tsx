
import BaseLayout from "@/components/BaseLayout";
import SystemSettingsForm from "@/components/settings/SystemSettingsForm";

const SettingsPage = () => {
  return (
    <BaseLayout title="Configurações do Sistema">
      <div className="space-y-6 animate-fade-in-up">
        <div className="card-modern p-6">
          <h2 className="text-2xl font-bold font-heading text-foreground mb-2">Configurações</h2>
          <p className="text-muted-foreground">
            Configure as opções e comportamentos do sistema de treinamentos.
          </p>
        </div>
        
        <div className="card-modern">
          <SystemSettingsForm />
        </div>
      </div>
    </BaseLayout>
  );
};

export default SettingsPage;
