
import { useState } from "react";
import { Users, Plus, Eye, Trash2, Search, BookOpen, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEnrollments, useDeleteEnrollment, Enrollment } from "@/hooks/useEnrollments";
import { useLessons } from "@/hooks/useLessons";
import CreateEnrollmentDialog from "./CreateEnrollmentDialog";
import StudentProgressDialog from "./StudentProgressDialog";

interface StudentEnrollmentsDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentEnrollmentsDialog = ({ courseId, courseName, open, onOpenChange }: StudentEnrollmentsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Enrollment | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  const { data: enrollments = [], isLoading } = useEnrollments(courseId);
  const { data: lessons = [] } = useLessons();
  const deleteEnrollmentMutation = useDeleteEnrollment();

  const courseLessons = lessons.filter(lesson => lesson.course_id === courseId);

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (window.confirm("Tem certeza que deseja remover este aluno do curso?")) {
      await deleteEnrollmentMutation.mutateAsync(enrollmentId);
    }
  };

  const handleViewProgress = (student: Enrollment) => {
    setSelectedStudent(student);
    setProgressDialogOpen(true);
  };

  const getProgressIcon = (percentage: number) => {
    if (percentage === 0) return <AlertCircle className="w-4 h-4 text-gray-500" />;
    if (percentage < 100) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return "bg-gray-100 text-gray-700";
    if (percentage < 100) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue" />
              Alunos Inscritos - {courseName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header com estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-brand-gray-light rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-blue">{enrollments.length}</div>
                <div className="text-sm text-brand-gray-dark">Total de Alunos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-blue">{courseLessons.length}</div>
                <div className="text-sm text-brand-gray-dark">Aulas Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {enrollments.filter(e => e.progress_percentage === 100).length}
                </div>
                <div className="text-sm text-brand-gray-dark">Concluídos</div>
              </div>
            </div>

            {/* Filtros e ações */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Adicionar Aluno
              </Button>
            </div>

            {/* Lista de alunos */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-brand-gray-dark">Carregando alunos...</div>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto w-12 h-12 text-brand-gray-dark mb-4" />
                  <p className="text-brand-gray-dark">
                    {enrollments.length === 0 
                      ? "Nenhum aluno inscrito ainda. Adicione o primeiro aluno!" 
                      : "Nenhum aluno encontrado com os filtros aplicados."
                    }
                  </p>
                </div>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-brand-black">{enrollment.student_name}</h3>
                          <Badge variant="outline" className={getProgressColor(enrollment.progress_percentage)}>
                            {getProgressIcon(enrollment.progress_percentage)}
                            {enrollment.progress_percentage}% concluído
                          </Badge>
                          <Badge variant="outline">
                            {enrollment.status}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-brand-gray-dark space-y-1">
                          <div>Email: {enrollment.student_email}</div>
                          {enrollment.student_phone && (
                            <div>Telefone: {enrollment.student_phone}</div>
                          )}
                          <div>
                            Inscrito em: {new Date(enrollment.enrollment_date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {enrollment.completed_lessons.length} de {courseLessons.length} aulas concluídas
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewProgress(enrollment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                          disabled={deleteEnrollmentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-brand-gray-dark mb-1">
                        <span>Progresso do curso</span>
                        <span>{enrollment.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateEnrollmentDialog
        courseId={courseId}
        courseName={courseName}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedStudent && (
        <StudentProgressDialog
          student={selectedStudent}
          courseLessons={courseLessons}
          open={progressDialogOpen}
          onOpenChange={setProgressDialogOpen}
        />
      )}
    </>
  );
};

export default StudentEnrollmentsDialog;
