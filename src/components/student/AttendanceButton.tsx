
import { Button } from '@/components/ui/button';
import { useMarkAttendance } from '@/hooks/useStudentPortal';
import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AttendanceButtonProps {
  enrollmentId: string;
  lessonId: string;
  className?: string;
  children?: React.ReactNode;
}

const AttendanceButton = ({ enrollmentId, lessonId, className, children }: AttendanceButtonProps) => {
  const markAttendance = useMarkAttendance();

  // Check if attendance already exists for this lesson/enrollment
  const { data: attendance } = useQuery({
    queryKey: ['attendance', enrollmentId, lessonId],
    enabled: Boolean(enrollmentId && lessonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id')
        .eq('enrollment_id', enrollmentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const confirmed = Boolean(attendance?.id);

  const handleClick = () => {
    if (!confirmed) {
      markAttendance.mutate({ enrollment_id: enrollmentId, lesson_id: lessonId });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={markAttendance.isPending}
      className={className}
      variant={confirmed ? 'success' : (children ? 'default' : 'outline')}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {markAttendance.isPending
        ? 'Confirmando...'
        : confirmed
        ? 'Presença confirmada'
        : (children ?? 'Marcar Presença')}
    </Button>
  );
};

export default AttendanceButton;
