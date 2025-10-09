import BaseLayout from "@/components/BaseLayout";
import WhatsAppDispatch from "@/components/whatsapp/WhatsAppDispatch";
import { MessageSquare } from "lucide-react";

const WhatsAppPage = () => {
  return (
    <BaseLayout title="Disparos WhatsApp">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Disparos WhatsApp</h1>
              <p className="text-xs text-muted-foreground">Envie mensagens para alunos de turmas específicas</p>
            </div>
          </div>
        </div>

        <WhatsAppDispatch />
      </div>
    </BaseLayout>
  );
};

export default WhatsAppPage;
