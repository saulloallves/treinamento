import { useState } from "react";
import { Plus, Edit, Trash2, Video, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditLessonDialog from "./EditLessonDialog";
import CreateLessonDialog from "./CreateLessonDialog";
import { useLessons, useDeleteLesson, Lesson } from "@/hooks/useLessons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LessonsListForCourseProps {
  courseId: string;
}

const LessonsListForCourse = ({ courseId }: LessonsListForCourseProps) => {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: lessons = [], isLoading } = useLessons();
  const deleteLessonMutation = useDeleteLesson();

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      await deleteLessonMutation.mutateAsync(lessonId);
    }
  };

  // Filter lessons by courseId
  const courseLessons = lessons.filter(lesson => lesson.course_id === courseId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-muted-foreground">Carregando aulas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Aulas</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {courseLessons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma aula criada ainda. Clique em "Nova Aula" para começar.
        </div>
      ) : (
        <div className="space-y-2">
          {courseLessons
            .sort((a, b) => a.order_index - b.order_index)
            .map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        #{lesson.order_index}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          lesson.status === "Ativo"
                            ? "bg-green-100 text-green-700"
                            : lesson.status === "Em revisão"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </div>
                    
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {lesson.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration_minutes} min</span>
                      </div>
                      
                      {lesson.zoom_start_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(lesson.zoom_start_time), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      
                      {lesson.video_url && (
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>Vídeo disponível</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {(lesson.zoom_join_url || lesson.video_url) && (
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open((lesson.zoom_join_url || lesson.video_url)!, "_blank", "noopener,noreferrer")
                        }
                      >
                        Acessar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditLesson(lesson)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      disabled={deleteLessonMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateLessonDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <EditLessonDialog
        lesson={editingLesson}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default LessonsListForCourse;