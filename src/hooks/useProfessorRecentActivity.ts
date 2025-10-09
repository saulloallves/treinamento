import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface RecentActivity {
  id: string;
  type: 'attendance' | 'enrollment' | 'progress' | 'certificate';
  studentName: string;
  turmaName: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

export const useProfessorRecentActivity = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professor-recent-activity", user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get professor's turmas
      const { data: turmas, error: turmasError } = await supabase
        .from('turmas')
        .select('id, name, code')
        .eq('responsavel_user_id', user.id);

      if (turmasError) throw turmasError;
      if (!turmas || turmas.length === 0) return [];

      const turmaIds = turmas.map(t => t.id);
      const activities: RecentActivity[] = [];

      // Recent attendance records
      const { data: attendances } = await supabase
        .from('attendance')
        .select(`
          id,
          confirmed_at,
          turma_id,
          users!attendance_user_id_fkey (name)
        `)
        .in('turma_id', turmaIds)
        .order('confirmed_at', { ascending: false })
        .limit(10);

      if (attendances) {
        attendances.forEach(attendance => {
          const turma = turmas.find(t => t.id === attendance.turma_id);
          if (turma && attendance.users) {
            activities.push({
              id: `attendance-${attendance.id}`,
              type: 'attendance',
              studentName: attendance.users.name,
              turmaName: turma.name || turma.code || 'Turma',
              description: 'marcou presença na aula',
              timestamp: attendance.confirmed_at,
              relativeTime: formatDistanceToNow(new Date(attendance.confirmed_at), { 
                addSuffix: true, 
                locale: ptBR 
              })
            });
          }
        });
      }

      // Recent enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrollment_date,
          turma_id,
          student_name
        `)
        .in('turma_id', turmaIds)
        .order('enrollment_date', { ascending: false })
        .limit(10);

      if (enrollments) {
        enrollments.forEach(enrollment => {
          const turma = turmas.find(t => t.id === enrollment.turma_id);
          if (turma) {
            activities.push({
              id: `enrollment-${enrollment.id}`,
              type: 'enrollment',
              studentName: enrollment.student_name,
              turmaName: turma.name || turma.code || 'Turma',
              description: 'se inscreveu na turma',
              timestamp: enrollment.enrollment_date,
              relativeTime: formatDistanceToNow(new Date(enrollment.enrollment_date), { 
                addSuffix: true, 
                locale: ptBR 
              })
            });
          }
        });
      }

      // Recent certificates
      const { data: certificates } = await supabase
        .from('certificates')
        .select(`
          id,
          generated_at,
          turma_id,
          users!certificates_user_id_fkey (name)
        `)
        .in('turma_id', turmaIds)
        .order('generated_at', { ascending: false })
        .limit(5);

      if (certificates) {
        certificates.forEach(certificate => {
          const turma = turmas.find(t => t.id === certificate.turma_id);
          if (turma && certificate.users) {
            activities.push({
              id: `certificate-${certificate.id}`,
              type: 'certificate',
              studentName: certificate.users.name,
              turmaName: turma.name || turma.code || 'Turma',
              description: 'recebeu certificado',
              timestamp: certificate.generated_at,
              relativeTime: formatDistanceToNow(new Date(certificate.generated_at), { 
                addSuffix: true, 
                locale: ptBR 
              })
            });
          }
        });
      }

      // Sort all activities by timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
};