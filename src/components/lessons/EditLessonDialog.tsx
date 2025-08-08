
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

interface Lesson {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  type: string;
  link: string;
  order: number;
  duration: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface EditLessonDialogProps {
  lesson: Lesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lesson: Lesson) => void;
}

const EditLessonDialog = ({ lesson, open, onOpenChange, onSave }: EditLessonDialogProps) => {
  const [formData, setFormData] = useState<Lesson | null>(null);

  const courses = [
    { id: 1, name: "Segurança no Trabalho" },
    { id: 2, name: "Atendimento ao Cliente" },
    { id: 3, name: "Gestão Franqueado" }
  ];

  useEffect(() => {
    if (lesson) {
      setFormData({ ...lesson });
    }
  }, [lesson]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
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
            <Label htmlFor="name">Nome da Aula</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="courseId">Curso</Label>
              <select
                id="courseId"
                value={formData.courseId}
                onChange={(e) => {
                  const selectedCourse = courses.find(c => c.id === parseInt(e.target.value));
                  setFormData({ 
                    ...formData, 
                    courseId: parseInt(e.target.value),
                    courseName: selectedCourse?.name || ""
                  });
                }}
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
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="gravada">Gravada</option>
                <option value="ao_vivo">Ao Vivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duração</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
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
                <option value="Agendada">Agendada</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="link">Link</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>

          {formData.type === "ao_vivo" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Data Agendada</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate || ""}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="scheduledTime">Horário</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime || ""}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLessonDialog;
