
import { Button } from '@/components/ui/button';
import { useMarkAttendance } from '@/hooks/useStudentPortal';
import { CheckCircle } from 'lucide-react';

interface AttendanceButtonProps {
  enrollmentId: string;
  lessonId: string;
  className?: string;
  children?: React.ReactNode;
}

const AttendanceButton = ({ enrollmentId, lessonId, className, children }: AttendanceButtonProps) => {
  const markAttendance = useMarkAttendance();

  const handleClick = () => {
    markAttendance.mutate({ enrollment_id: enrollmentId, lesson_id: lessonId });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={markAttendance.isPending}
      className={className ?? 'btn-primary'}
      variant={children ? 'default' : 'outline'}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {markAttendance.isPending ? 'Confirmando...' : (children ?? 'Marcar Presença')}
    </Button>
  );
};

export default AttendanceButton;
