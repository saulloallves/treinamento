
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarkAttendance } from '@/hooks/useStudentPortal';
import { CheckCircle, KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AttendanceKeywordModal from './AttendanceKeywordModal';
import { DEFAULT_ATTENDANCE_KEYWORD } from '@/lib/config';

interface AttendanceButtonProps {
  enrollmentId: string;
  lessonId: string;
  className?: string;
  children?: React.ReactNode;
}

const AttendanceButton = ({ enrollmentId, lessonId, className, children }: AttendanceButtonProps) => {
  const markAttendance = useMarkAttendance();
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [keywordError, setKeywordError] = useState<string | undefined>(undefined);

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
        .select('id, title, attendance_keyword, status')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const confirmed = Boolean(attendance?.id);
  const requiresKeyword = lesson?.status === 'Ativo' || lesson?.attendance_keyword;

  const handleClick = () => {
    if (!confirmed) {
      if (requiresKeyword) {
        setKeywordError(undefined); // Limpar erro anterior
        setShowKeywordModal(true);
      } else {
        markAttendance.mutate({ enrollment_id: enrollmentId, lesson_id: lessonId });
      }
    }
  };

  const handleKeywordSubmit = (keyword: string) => {
    setKeywordError(undefined); // Limpar erro antes de tentar novamente
    markAttendance.mutate(
      { 
        enrollment_id: enrollmentId, 
        lesson_id: lessonId,
        attendance_keyword: keyword 
      },
      {
        onSuccess: () => {
          setShowKeywordModal(false);
          setKeywordError(undefined);
        },
        onError: (error: any) => {
          // Capturar erro e exibir no modal
          const errorMessage = error?.message || 'Erro ao confirmar presença';
          setKeywordError(errorMessage);
          // Modal permanece aberto para nova tentativa
        }
      }
    );
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {requiresKeyword && (
          <Badge variant="secondary" className="w-fit flex items-center gap-1">
            <KeyRound className="w-3 h-3" />
            Requer Palavra-chave
          </Badge>
        )}
        
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
            ? 'Marcar Presença'
            : (children ?? 'Marcar Presença')}
        </Button>
      </div>

      <AttendanceKeywordModal
        open={showKeywordModal}
        onOpenChange={setShowKeywordModal}
        onSubmit={handleKeywordSubmit}
        isSubmitting={markAttendance.isPending}
        lessonTitle={lesson?.title || 'Aula'}
        error={keywordError}
      />
    </>
  );
};

export default AttendanceButton;
