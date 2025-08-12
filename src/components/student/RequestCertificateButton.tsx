
import { Button } from '@/components/ui/button';
import { useMyCertificate, useRequestCertificate } from '@/hooks/useStudentPortal';
import { Award } from 'lucide-react';

interface RequestCertificateButtonProps {
  enrollmentId: string;
  courseId: string;
  className?: string;
}

const RequestCertificateButton = ({ enrollmentId, courseId, className }: RequestCertificateButtonProps) => {
  const { data: certificate, isLoading } = useMyCertificate(enrollmentId);
  const request = useRequestCertificate();

  const handleClick = () => {
    request.mutate({ enrollment_id: enrollmentId, course_id: courseId });
  };

  const disabled = isLoading || !!certificate || request.isPending;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={className ?? 'btn-primary'}
    >
      <Award className="w-4 h-4 mr-2" />
      {certificate ? 'Certificado solicitado' : request.isPending ? 'Solicitando...' : 'Solicitar Certificado'}
    </Button>
  );
};

export default RequestCertificateButton;
