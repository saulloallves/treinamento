
import BaseLayout from "@/components/BaseLayout";
import CertificatesList from "@/components/certificates/CertificatesList";

const CertificatesPage = () => {
  return (
    <BaseLayout title="Gerenciar Certificados">
      <CertificatesList />
    </BaseLayout>
  );
};

export default CertificatesPage;
