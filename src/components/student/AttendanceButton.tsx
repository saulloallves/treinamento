
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMarkAttendance } from '@/hooks/useStudentPortal';
import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AttendanceKeywordModal from './AttendanceKeywordModal';

interface AttendanceButtonProps {
  enrollmentId: string;
  lessonId: string;
  className?: string;
  children?: React.ReactNode;
}

const AttendanceButton = ({ enrollmentId, lessonId, className, children }: AttendanceButtonProps) => {
  const markAttendance = useMarkAttendance();
  const [showKeywordModal, setShowKeywordModal] = useState(false);

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

  // Get lesson details to check if it requires a keyword
  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    enabled: Boolean(lessonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, attendance_keyword, zoom_meeting_id')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const confirmed = Boolean(attendance?.id);
  const requiresKeyword = Boolean(lesson?.zoom_meeting_id); // Toda aula ao vivo requer palavra-chave

  const handleClick = () => {
    if (!confirmed) {
      if (requiresKeyword) {
        setShowKeywordModal(true);
      } else {
        markAttendance.mutate({ enrollment_id: enrollmentId, lesson_id: lessonId });
      }
    }
  };

  const handleKeywordSubmit = (keyword: string) => {
    markAttendance.mutate(
      { 
        enrollment_id: enrollmentId, 
        lesson_id: lessonId,
        attendance_keyword: keyword 
      },
      {
        onSuccess: () => {
          setShowKeywordModal(false);
        },
        onError: () => {
          // Modal permanece aberto para nova tentativa
        }
      }
    );
  };

  return (
    <>
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
          : requiresKeyword
          ? 'Marcar Presença (Aula ao Vivo)'
          : (children ?? 'Marcar Presença')}
      </Button>

      <AttendanceKeywordModal
        open={showKeywordModal}
        onOpenChange={setShowKeywordModal}
        onSubmit={handleKeywordSubmit}
        isSubmitting={markAttendance.isPending}
        lessonTitle={lesson?.title || 'Aula'}
      />
    </>
  );
};

export default AttendanceButton;
