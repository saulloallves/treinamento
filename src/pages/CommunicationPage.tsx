import BaseLayout from "@/components/BaseLayout";
import AutomatedDispatches from "@/components/whatsapp/AutomatedDispatches";

const CommunicationPage = () => {
  return (
    <BaseLayout title="Disparos Automáticos">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Disparos Automáticos</h2>
          <p className="text-lg text-muted-foreground">
            Configure disparos automáticos de WhatsApp para aulas ao vivo
          </p>
        </div>
        
        <AutomatedDispatches />
      </div>
    </BaseLayout>
  );
};

export default CommunicationPage;