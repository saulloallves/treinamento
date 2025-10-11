import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, GraduationCap, User, ClipboardCheck, TrendingUp, Award, FileText, CheckCircle2, Mail, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TurmaEnrollmentsList } from "./TurmaEnrollmentsList";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { toast } from "sonner";

interface TurmaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: any;
  course: any;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'agendada': { label: 'Agendada', variant: 'secondary' as const },
    'inscricoes_abertas': { label: 'Inscrições Abertas', variant: 'default' as const },
    'inscricoes_encerradas': { label: 'Inscrições Encerradas', variant: 'outline' as const },
    'em_andamento': { label: 'Em Andamento', variant: 'destructive' as const },
    'encerrada': { label: 'Encerrada', variant: 'secondary' as const },
    'cancelada': { label: 'Cancelada', variant: 'secondary' as const },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    variant: 'secondary' as const 
  };
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const TurmaDetailsDialog = ({ open, onOpenChange, turma, course }: TurmaDetailsDialogProps) => {
  const { data: enrollments = [], isLoading } = useEnrollments();
  
  // Filter enrollments for this turma
  const turmaEnrollments = enrollments.filter(enrollment => enrollment.turma_id === turma?.id);

  // Fetch attendance data for archived turmas
  const { data: attendanceData } = useQuery({
    queryKey: ['turma-attendance', turma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, users:user_id(name, email)')
        .eq('turma_id', turma.id)
        .order('confirmed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!turma?.id && (turma?.status === 'encerrada' || turma?.status === 'arquivadas')
  });

  // Fetch progress data
  const { data: progressData } = useQuery({
    queryKey: ['turma-progress', turma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          enrollment:enrollment_id(student_name, student_email, user_id),
          lesson:lesson_id(title)
        `)
        .in('enrollment_id', turmaEnrollments.map(e => e.id))
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!turma?.id && turmaEnrollments.length > 0 && (turma?.status === 'encerrada' || turma?.status === 'arquivadas')
  });

  // Calculate progress summary by student
  const progressSummary = useMemo(() => {
    if (!progressData || !turmaEnrollments.length) return [];
    
    // Get total lessons count
    const totalLessons = course?.lessons_count || 0;
    
    // Group progress by enrollment
    const enrollmentProgress = turmaEnrollments.map(enrollment => {
      const completedLessons = progressData.filter(
        p => p.enrollment_id === enrollment.id && p.status === 'completed'
      ).length;
      
      const progressPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      return {
        id: enrollment.id,
        student_name: enrollment.student_name,
        student_email: enrollment.student_email,
        status: enrollment.status,
        progress_percentage: progressPercentage
      };
    });
    
    return enrollmentProgress;
  }, [progressData, turmaEnrollments, course]);

  // Fetch certificates
  const { data: certificates } = useQuery({
    queryKey: ['turma-certificates', turma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, users:user_id(name, email)')
        .eq('turma_id', turma.id)
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!turma?.id && (turma?.status === 'encerrada' || turma?.status === 'arquivadas')
  });

  // Fetch quiz responses
  const { data: quizResponses } = useQuery({
    queryKey: ['turma-quiz-responses', turma?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select(`
          *,
          users:user_id(name, email),
          quiz:quiz_id(question, quiz_name)
        `)
        .eq('course_id', turma.course_id)
        .order('answered_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!turma?.id && (turma?.status === 'encerrada' || turma?.status === 'arquivadas')
  });

  // Fetch test submissions
  const { data: testSubmissions } = useQuery({
    queryKey: ['turma-test-submissions', turma?.id],
    queryFn: async () => {
      // First get test IDs for this turma
      const { data: tests } = await supabase
        .from('tests')
        .select('id')
        .eq('turma_id', turma.id);
      
      const testIds = tests?.map(t => t.id) || [];
      
      if (testIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('test_submissions')
        .select(`
          *,
          tests:test_id(name, passing_percentage)
        `)
        .in('test_id', testIds)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      // Get user names from enrollments
      const enrichedData = await Promise.all((data || []).map(async (submission) => {
        const enrollment = turmaEnrollments.find(e => e.user_id === submission.user_id);
        return {
          ...submission,
          student_name: enrollment?.student_name || 'Não identificado',
          student_email: enrollment?.student_email || 'N/A'
        };
      }));
      
      return enrichedData;
    },
    enabled: open && !!turma?.id && (turma?.status === 'encerrada' || turma?.status === 'arquivadas') && turmaEnrollments.length > 0
  });

  const isArchivedTurma = turma?.status === 'encerrada' || turma?.status === 'arquivadas';

  if (!turma || !course) {
    return null;
  }

  // Export all turma data
  const handleExportData = async () => {
    try {
      toast.loading("Preparando exportação...");
      
      const exportData = {
        turma: {
          nome: turma.name || turma.code,
          codigo: turma.code,
          status: turma.status,
          curso: course?.name,
          responsavel: turma.responsavel_user?.name,
          email_responsavel: turma.responsavel_user?.email,
          capacidade: turma.capacity,
          prazo_conclusao: turma.completion_deadline,
          inicio: turma.start_at,
          fim: turma.end_at,
          abertura_inscricoes: turma.enrollment_open_at,
          fechamento_inscricoes: turma.enrollment_close_at,
        },
        inscricoes: turmaEnrollments.map(e => ({
          aluno: e.student_name,
          email: e.student_email,
          telefone: e.student_phone,
          unidade: e.unit_code,
          status: e.status,
          data_inscricao: e.enrollment_date,
          progresso: e.progress_percentage + '%'
        })),
        presencas: attendanceData?.map(a => ({
          aluno: a.users?.name || 'Não identificado',
          email: a.users?.email,
          data_hora: a.confirmed_at,
          tipo: a.attendance_type,
          palavra_chave: a.typed_keyword
        })) || [],
        progresso: progressSummary.map(p => ({
          aluno: p.student_name,
          email: p.student_email,
          status: p.status,
          progresso: p.progress_percentage + '%'
        })),
        certificados: certificates?.map(c => ({
          aluno: c.users?.name,
          email: c.users?.email,
          data_emissao: c.generated_at,
          status: c.status,
          url: c.certificate_url
        })) || [],
        quiz_respostas: quizResponses?.map(q => ({
          aluno: q.users?.name,
          quiz: q.quiz?.quiz_name || 'Quiz sem nome',
          resposta: q.selected_answer,
          correta: q.is_correct ? 'Sim' : 'Não',
          data: q.answered_at
        })) || [],
        testes: testSubmissions?.map(t => ({
          aluno: t.student_name,
          teste: t.tests?.name,
          pontuacao: t.total_score,
          pontuacao_maxima: t.max_possible_score,
          percentual: t.percentage.toFixed(1) + '%',
          aprovado: t.passed ? 'Sim' : 'Não',
          data_submissao: t.submitted_at,
          tempo_gasto: t.time_taken_minutes ? t.time_taken_minutes + ' min' : 'N/A'
        })) || []
      };

      // Create JSON blob
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      const fileName = `turma_${turma.code || turma.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("Erro ao exportar dados");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle className="text-xl">
                  {turma.name || `Turma ${turma.code || turma.id.slice(0, 8)}`}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {course.name}
                </p>
              </div>
            </div>
            {isArchivedTurma && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Dados
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards com informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Informações da Turma */}
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <Users className="w-4 h-4 text-primary" />
                Informações da Turma
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground block">Status</span>
                  {getStatusBadge(turma.status)}
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Capacidade</span>
                  <span className="text-sm font-medium">{turma.capacity || 'Ilimitada'}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Inscritos</span>
                  <span className="text-sm font-medium text-primary">{turma.enrollments_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Professor Responsável */}
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <User className="w-4 h-4 text-primary" />
                Professor Responsável
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground block">Nome</span>
                  <span className="text-sm font-medium">{turma.responsavel_user?.name || 'Não definido'}</span>
                </div>
                {turma.responsavel_user?.email && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Email</span>
                    <span className="text-sm break-all">{turma.responsavel_user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Datas Importantes */}
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Datas Importantes
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground block">Prazo de Conclusão</span>
                  <span className="text-sm font-medium">
                    {format(new Date(turma.completion_deadline), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                {turma.start_at && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Início</span>
                    <span className="text-sm">
                      {format(new Date(turma.start_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {turma.end_at && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Fim</span>
                    <span className="text-sm">
                      {format(new Date(turma.end_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Janela de Inscrições - Card separado se houver dados */}
          {(turma.enrollment_open_at || turma.enrollment_close_at) && (
            <div className="bg-card p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-card-foreground">
                <Clock className="w-4 h-4 text-primary" />
                Janela de Inscrições
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {turma.enrollment_open_at && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Abertura</span>
                    <span className="text-sm font-medium">
                      {format(new Date(turma.enrollment_open_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {turma.enrollment_close_at && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Fechamento</span>
                    <span className="text-sm font-medium">
                      {format(new Date(turma.enrollment_close_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Historical Data for Archived Turmas */}
        {isArchivedTurma ? (
          <Tabs defaultValue="enrollments" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="enrollments" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Inscrições
              </TabsTrigger>
              <TabsTrigger value="attendance" className="text-xs">
                <ClipboardCheck className="w-3 h-3 mr-1" />
                Presenças
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Progresso
              </TabsTrigger>
              <TabsTrigger value="certificates" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                Certificados
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="tests" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Testes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enrollments" className="mt-4">
              <TurmaEnrollmentsList enrollments={turmaEnrollments} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="attendance" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Histórico de Presenças</h3>
                {attendanceData && attendanceData.length > 0 ? (
                  <div className="space-y-2">
                    {attendanceData.map((attendance: any) => (
                      <div key={attendance.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{attendance.users?.name || 'Não identificado'}</p>
                          <p className="text-sm text-muted-foreground">{attendance.users?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{format(new Date(attendance.confirmed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                          <Badge variant="outline">{attendance.attendance_type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma presença registrada</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Progresso dos Alunos</h3>
                {progressSummary.length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aluno</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progresso</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {progressSummary.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">{student.student_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{student.student_email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.status === 'Ativo' ? 'default' : 'secondary'}>
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <Progress value={student.progress_percentage} className="w-32" />
                                <span className="text-sm text-muted-foreground font-medium">
                                  {student.progress_percentage}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum progresso registrado</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Certificados Emitidos</h3>
                {certificates && certificates.length > 0 ? (
                  <div className="space-y-2">
                    {certificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{cert.users?.name}</p>
                          <p className="text-sm text-muted-foreground">{cert.users?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{format(new Date(cert.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                          <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>{cert.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum certificado emitido</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Respostas de Quiz</h3>
                {quizResponses && quizResponses.length > 0 ? (
                  <div className="space-y-2">
                    {quizResponses.map((response: any) => (
                      <div key={response.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{response.users?.name}</p>
                          <p className="text-sm text-muted-foreground">{response.quiz?.quiz_name || 'Quiz sem nome'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                            {response.is_correct ? 'Correta' : 'Incorreta'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(response.answered_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma resposta de quiz registrada</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tests" className="mt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Submissões de Testes</h3>
                {testSubmissions && testSubmissions.length > 0 ? (
                  <div className="space-y-2">
                    {testSubmissions.map((submission: any) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{submission.student_name}</p>
                          <p className="text-sm text-muted-foreground">{submission.tests?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className="text-sm font-medium">{submission.percentage.toFixed(1)}%</span>
                            <Badge variant={submission.passed ? 'default' : 'destructive'}>
                              {submission.passed ? 'Aprovado' : 'Reprovado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {submission.submitted_at ? format(new Date(submission.submitted_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Em progresso'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma submissão de teste registrada</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Lista de Inscrições para turmas não arquivadas */
          <TurmaEnrollmentsList enrollments={turmaEnrollments} isLoading={isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
};