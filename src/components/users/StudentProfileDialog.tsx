import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  FileQuestion
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useStudentEvaluationData } from "@/hooks/useEvaluationReports";

interface StudentProfileDialogProps {
  student: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentProfileDialog = ({ student, open, onOpenChange }: StudentProfileDialogProps) => {
  if (!student) return null;

  const {
    studentDetails,
    enrollments,
    attendances,
    certificates,
    quizResponses,
    completedCourses,
    totalCourses,
    totalAttendances,
    totalCertificates,
    quizAccuracy,
    isLoading,
    error
  } = useStudentProfile(student.id, open);

  const {
    data: evaluationData,
    isLoading: evaluationLoading,
    error: evaluationError
  } = useStudentEvaluationData(student.id, open);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'aprovado':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inativo':
      case 'rejeitado':
        return 'bg-red-100 text-red-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando ficha do aluno...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erro ao carregar ficha</DialogTitle>
          </DialogHeader>
          <div className="text-center p-8 text-red-600">
            Erro ao carregar os dados do aluno. Tente novamente.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(studentDetails?.name || student.name || "??")}
              </AvatarFallback>
            </Avatar>
            Ficha do Aluno: {studentDetails?.name || student.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal" className="text-xs sm:text-sm">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm">Cursos ({totalCourses})</TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs sm:text-sm">Presenças ({totalAttendances})</TabsTrigger>
            <TabsTrigger value="certificates" className="text-xs sm:text-sm">Certificados ({totalCertificates})</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Quiz</TabsTrigger>
            <TabsTrigger value="evaluations" className="text-xs sm:text-sm">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{totalCourses}</div>
                  <div className="text-sm text-muted-foreground">Cursos Inscritos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-foreground">{completedCourses.length}</div>
                  <div className="text-sm text-muted-foreground">Cursos Concluídos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-foreground">{totalCertificates}</div>
                  <div className="text-sm text-muted-foreground">Certificados</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-foreground">{quizAccuracy}%</div>
                  <div className="text-sm text-muted-foreground">Precisão Quiz</div>
                </CardContent>
              </Card>
            </div>

            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p className="text-foreground font-medium">{studentDetails?.name || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="text-foreground">{studentDetails?.cpf || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                    <Badge variant="outline">{studentDetails?.user_type || "—"}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(studentDetails?.approval_status || "ativo")}>
                      {studentDetails?.approval_status === 'aprovado' ? 'Aprovado' : 
                       studentDetails?.approval_status === 'pendente' ? 'Pendente' : 
                       studentDetails?.approval_status === 'rejeitado' ? 'Rejeitado' : 'Ativo'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{studentDetails?.email || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">{studentDetails?.phone || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Posição/Cargo</label>
                    <p className="text-foreground">{studentDetails?.position || "—"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unidade</label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-foreground">
                        {studentDetails?.unit?.name || "Código: " + (studentDetails?.unit_code || "—")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Cursos</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments && enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">
                            {enrollment.course?.name || "Curso sem nome"}
                          </h4>
                          <Badge className={getStatusColor(enrollment.status)}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {enrollment.course?.description || "Sem descrição"}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Tipo:</span>
                            <p>{enrollment.course?.tipo === 'ao_vivo' ? 'Ao Vivo' : 'Gravado'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Progresso:</span>
                            <p>{enrollment.progress_percentage}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Turma:</span>
                            <p>{enrollment.turma?.name || enrollment.turma?.code || "—"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Inscrição:</span>
                            <p>{format(new Date(enrollment.enrollment_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum curso encontrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Presenças</CardTitle>
              </CardHeader>
              <CardContent>
                {attendances && attendances.length > 0 ? (
                  <div className="space-y-3">
                    {attendances.map((attendance) => (
                      <div key={attendance.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {attendance.lesson?.title || "Aula sem título"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Curso: {attendance.enrollment?.course?.name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(attendance.confirmed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Presente
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma presença registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificados Emitidos</CardTitle>
              </CardHeader>
              <CardContent>
                {certificates && certificates.length > 0 ? (
                  <div className="space-y-4">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">
                            {certificate.course?.name || "Curso sem nome"}
                          </h4>
                          <Badge className={getStatusColor(certificate.status)}>
                            {certificate.status === 'active' ? 'Ativo' : certificate.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Turma:</span>
                            <p>{certificate.turma?.name || certificate.turma?.code || "—"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Emissão:</span>
                            <p>{format(new Date(certificate.generated_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                          <div>
                            <span className="font-medium">Válido até:</span>
                            <p>
                              {certificate.valid_until 
                                ? format(new Date(certificate.valid_until), 'dd/MM/yyyy', { locale: ptBR })
                                : "Indeterminado"
                              }
                            </p>
                          </div>
                        </div>
                        {certificate.certificate_url && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="h-4 w-4" />
                              Download Certificado
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum certificado emitido
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance em Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Precisão Geral</span>
                    <span className="text-2xl font-bold text-primary">{quizAccuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${quizAccuracy}%` }}
                    />
                  </div>
                </div>

                {quizResponses && quizResponses.length > 0 ? (
                  <div className="space-y-3">
                    {quizResponses.slice(0, 10).map((response) => (
                      <div key={response.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {response.quiz?.quiz_name || "Quiz sem nome"}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Curso: {response.quiz?.course?.name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(response.answered_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {response.is_correct ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correto
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorreto
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {quizResponses.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        ... e mais {quizResponses.length - 10} respostas
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma resposta de quiz encontrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Avaliações Completo</CardTitle>
              </CardHeader>
              <CardContent>
                {evaluationLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : evaluationError ? (
                  <div className="text-center p-8 text-red-600">
                    Erro ao carregar dados de avaliações
                  </div>
                ) : evaluationData ? (
                  <div className="space-y-6">
                    {/* Resumo das Avaliações */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold text-foreground">{evaluationData.quizResponses.length}</div>
                          <div className="text-sm text-muted-foreground">Quiz Respondidos</div>
                          <div className="text-sm font-medium text-green-600 mt-1">
                            {evaluationData.quizAccuracy}% de precisão
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <FileQuestion className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                          <div className="text-2xl font-bold text-foreground">{evaluationData.testSubmissions.length}</div>
                          <div className="text-sm text-muted-foreground">Testes Realizados</div>
                          <div className="text-sm font-medium text-purple-600 mt-1">
                            {evaluationData.testAverage}% de média
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-foreground">{evaluationData.totalAttempts}</div>
                          <div className="text-sm text-muted-foreground">Total de Tentativas</div>
                          <div className="text-sm font-medium text-blue-600 mt-1">
                            {Math.round((evaluationData.quizAccuracy + evaluationData.testAverage) / 2)}% geral
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Histórico de Testes */}
                    {evaluationData.testSubmissions && evaluationData.testSubmissions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium mb-4">Testes Avaliativos</h4>
                        <div className="space-y-3">
                          {evaluationData.testSubmissions.map((submission) => (
                            <div key={submission.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-foreground">
                                  {submission.test?.name || "Teste sem nome"}
                                </h5>
                                <div className="flex items-center gap-2">
                                  <Badge className={
                                    submission.passed 
                                      ? 'bg-green-100 text-green-700' 
                                      : submission.status === 'completed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                  }>
                                    {submission.passed ? 'Aprovado' : 
                                     submission.status === 'completed' ? 'Reprovado' : 
                                     submission.status === 'in_progress' ? 'Em Andamento' : 
                                     'Não Iniciado'}
                                  </Badge>
                                  <div className="text-lg font-bold text-foreground">
                                    {Math.round(submission.percentage)}%
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Curso:</span>
                                  <p>{submission.test?.course?.name || "—"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Turma:</span>
                                  <p>{submission.test?.turma?.name || submission.test?.turma?.code || "—"}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Pontuação:</span>
                                  <p>{submission.total_score} / {submission.max_possible_score}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Tentativa:</span>
                                  <p>{submission.attempt_number}ª tentativa</p>
                                </div>
                              </div>
                              
                              {submission.submitted_at && (
                                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>
                                      Finalizado em: {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </span>
                                    {submission.time_taken_minutes && (
                                      <span>
                                        Tempo: {submission.time_taken_minutes} minutos
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Quiz - Mais Compacto */}
                    {evaluationData.quizResponses && evaluationData.quizResponses.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium mb-4">Quiz Recentes</h4>
                        <div className="space-y-2">
                          {evaluationData.quizResponses.slice(0, 10).map((response) => (
                            <div key={response.id} className="flex justify-between items-center p-3 border rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-foreground text-sm">
                                  {response.quiz?.quiz_name || "Quiz sem nome"}
                                </h5>
                                <p className="text-xs text-muted-foreground">
                                  {response.quiz?.course?.name || "—"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={response.is_correct ? "default" : "destructive"}>
                                  {response.is_correct ? "Correto" : "Incorreto"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(response.answered_at), 'dd/MM', { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          ))}
                          {evaluationData.quizResponses.length > 10 && (
                            <p className="text-center text-sm text-muted-foreground py-2">
                              ... e mais {evaluationData.quizResponses.length - 10} respostas
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {evaluationData.totalAttempts === 0 && (
                      <div className="text-center py-8">
                        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma avaliação encontrada</h3>
                        <p className="text-muted-foreground">
                          Este aluno ainda não realizou nenhuma avaliação.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum dado de avaliação disponível
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};