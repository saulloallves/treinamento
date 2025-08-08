
import { useState, useEffect } from "react";
import { BookOpen, Play, CheckCircle, Clock, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Enrollment } from "@/hooks/useEnrollments";
import { Lesson } from "@/hooks/useLessons";

interface StudentProgressDialogProps {
  student: Enrollment;
  courseLessons: Lesson[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LessonProgress {
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  watch_time_minutes: number;
  completed_at?: string;
}

const StudentProgressDialog = ({ student, courseLessons, open, onOpenChange }: StudentProgressDialogProps) => {
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load existing progress when dialog opens
  useEffect(() => {
    if (open && student) {
      loadStudentProgress();
    }
  }, [open, student]);

  const loadStudentProgress = async () => {
    setIsLoading(true);
    try {
      const { data: progress, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('enrollment_id', student.id);

      if (error) {
        console.error('Error loading progress:', error);
        return;
      }

      const progressMap: Record<string, LessonProgress> = {};
      
      // Initialize all lessons with not_started status
      courseLessons.forEach(lesson => {
        progressMap[lesson.id] = {
          lesson_id: lesson.id,
          status: 'not_started',
          watch_time_minutes: 0,
        };
      });

      // Update with actual progress data
      progress?.forEach(p => {
        progressMap[p.lesson_id] = {
          lesson_id: p.lesson_id,
          status: p.status as 'not_started' | 'in_progress' | 'completed',
          watch_time_minutes: p.watch_time_minutes || 0,
          completed_at: p.completed_at,
        };
      });

      setLessonProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLessonStatus = (lessonId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined,
      }
    }));
  };

  const updateWatchTime = (lessonId: string, watchTime: number) => {
    setLessonProgress(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        watch_time_minutes: watchTime,
      }
    }));
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      // Delete existing progress records for this enrollment
      await supabase
        .from('student_progress')
        .delete()
        .eq('enrollment_id', student.id);

      // Insert new progress records
      const progressRecords = Object.values(lessonProgress).map(progress => ({
        enrollment_id: student.id,
        lesson_id: progress.lesson_id,
        status: progress.status,
        watch_time_minutes: progress.watch_time_minutes,
        completed_at: progress.completed_at,
      }));

      const { error: insertError } = await supabase
        .from('student_progress')
        .insert(progressRecords);

      if (insertError) {
        throw insertError;
      }

      // Calculate overall progress percentage
      const completedLessons = Object.values(lessonProgress).filter(p => p.status === 'completed').length;
      const progressPercentage = courseLessons.length > 0 ? Math.round((completedLessons / courseLessons.length) * 100) : 0;

      // Update enrollment progress
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({
          progress_percentage: progressPercentage,
          completed_lessons: Object.values(lessonProgress)
            .filter(p => p.status === 'completed')
            .map(p => p.lesson_id),
        })
        .eq('id', student.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Progresso salvo com sucesso!",
        description: "O progresso do aluno foi atualizado.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving progress:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Concluída</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700">Em Andamento</Badge>;
      default:
        return <Badge variant="outline">Não Iniciada</Badge>;
    }
  };

  const completedCount = Object.values(lessonProgress).filter(p => p.status === 'completed').length;
  const progressPercentage = courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-blue" />
            Progresso do Aluno: {student.student_name}
          </DialogTitle>
          <div className="text-sm text-brand-gray-dark">
            {completedCount} de {courseLessons.length} aulas concluídas ({progressPercentage}%)
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm text-brand-gray-dark mb-2">
              <span>Progresso Geral</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-brand-blue h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-brand-gray-dark">Carregando progresso...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {courseLessons
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson) => {
                  const progress = lessonProgress[lesson.id] || {
                    lesson_id: lesson.id,
                    status: 'not_started',
                    watch_time_minutes: 0,
                  };

                  return (
                    <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(progress.status)}
                            <h3 className="font-medium text-brand-black">{lesson.title}</h3>
                            {getStatusBadge(progress.status)}
                          </div>
                          <p className="text-sm text-brand-gray-dark">{lesson.description}</p>
                          <div className="text-xs text-brand-gray-dark mt-1">
                            Duração: {lesson.duration_minutes} minutos
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-brand-black mb-1">
                            Status da Aula
                          </label>
                          <select
                            value={progress.status}
                            onChange={(e) => updateLessonStatus(lesson.id, e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          >
                            <option value="not_started">Não Iniciada</option>
                            <option value="in_progress">Em Andamento</option>
                            <option value="completed">Concluída</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-brand-black mb-1">
                            Tempo Assistido (minutos)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={lesson.duration_minutes}
                            value={progress.watch_time_minutes}
                            onChange={(e) => updateWatchTime(lesson.id, parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {progress.completed_at && (
                        <div className="mt-2 text-xs text-green-600">
                          Concluída em: {new Date(progress.completed_at).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveProgress}
              disabled={isSaving}
              className="btn-primary flex-1"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : "Salvar Progresso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProgressDialog;
