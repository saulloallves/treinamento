import { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCourses } from "@/hooks/useCourses";
import { useUpdateLesson, Lesson } from "@/hooks/useLessons";
import { DEFAULT_ATTENDANCE_KEYWORD } from "@/lib/config";

interface EditLessonDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditLessonDialog = ({ lesson, open, onOpenChange }: EditLessonDialogProps) => {
  const { data: courses = [] } = useCourses();
  const updateLessonMutation = useUpdateLesson();
  const [formData, setFormData] = useState<Lesson | null>(null);

  useEffect(() => {
    if (lesson) {
      const updatedLesson = { 
        ...lesson,
        // Se é aula ativa e não tem palavra-chave, usar a padrão
        attendance_keyword: lesson.attendance_keyword || 
          (lesson.status === 'Ativo' ? DEFAULT_ATTENDANCE_KEYWORD : '')
      };
      setFormData(updatedLesson);
    }
  }, [lesson]);

  if (!formData) return null;

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return;
    }

    // Para aulas ativas, garantir que tenha palavra-chave
    if (formData.status === 'Ativo' && (!formData.attendance_keyword || formData.attendance_keyword.trim().length < 3)) {
      return; // Validação visual já está no disabled do botão
    }

    await updateLessonMutation.mutateAsync(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Editar Aula
          </DialogTitle>
          <DialogDescription>
            Edite as informações da aula abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Nome da Aula</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course_id">Curso</Label>
              <select
                id="course_id"
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="Ativo">Ativo</option>
                <option value="Em revisão">Em revisão</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="order_index">Ordem</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="video_url">Link do Vídeo</Label>
            <Input
              id="video_url"
              value={formData.video_url || ""}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Input
              id="content"
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Campo palavra-chave - sempre visível para aulas ativas ou com palavra já definida */}
          {(formData.status === 'Ativo' || formData.attendance_keyword) && (
            <div className="grid gap-2">
              <Label htmlFor="attendance_keyword">Palavra-chave para Presença</Label>
              <Input
                id="attendance_keyword"
                value={formData.attendance_keyword || ""}
                onChange={(e) => setFormData({ ...formData, attendance_keyword: e.target.value })}
                placeholder="Palavra-chave para confirmar presença"
              />
              <p className="text-sm text-muted-foreground">
                {formData.status === 'Ativo' 
                  ? 'Aulas ativas sempre requerem palavra-chave para presença'
                  : 'Alunos precisarão inserir esta palavra-chave para confirmar presença'
                }
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={
              updateLessonMutation.isPending || 
              !formData.title.trim() ||
              (formData.status === 'Ativo' && (!formData.attendance_keyword || formData.attendance_keyword.trim().length < 3))
            }
          >
            <Save className="w-4 h-4" />
            {updateLessonMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonDialog;