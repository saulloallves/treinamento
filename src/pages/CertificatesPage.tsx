import { Award } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import CertificatesList from "@/components/certificates/CertificatesList";

const CertificatesPage = () => {
  return (
    <BaseLayout title="Gerenciar Certificados">
      <div className="space-y-6">
        {/* Header Section - Compacto */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Gestão de Certificados</h2>
              <p className="text-sm text-muted-foreground">Gerencie solicitações e emita certificados de conclusão</p>
            </div>
          </div>
        </div>

        <CertificatesList />
      </div>
    </BaseLayout>
  );
};

export default CertificatesPage;
