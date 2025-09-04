
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useCourses } from "@/hooks/useCourses";
import { useCreateLesson, LessonInput } from "@/hooks/useLessons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_ATTENDANCE_KEYWORD } from "@/lib/config";

interface CreateLessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateLessonDialog = ({ open, onOpenChange }: CreateLessonDialogProps) => {
  const { data: courses = [] } = useCourses();
  const createLessonMutation = useCreateLesson();
  
const [formData, setFormData] = useState<LessonInput>({
  course_id: "",
  title: "",
  description: "",
  video_url: "",
  content: "",
  duration_minutes: 0,
  order_index: 1,
  status: "Ativo",
  attendance_keyword: DEFAULT_ATTENDANCE_KEYWORD
});

const [isLiveZoom, setIsLiveZoom] = useState(false);
const [liveDate, setLiveDate] = useState<string>("");
const [liveTime, setLiveTime] = useState<string>("");
const [isCreatingLive, setIsCreatingLive] = useState(false);
const queryClient = useQueryClient();
const { toast } = useToast();

const handleSave = async () => {
  if (!formData.title.trim() || !formData.course_id) {
    return;
  }

  if (isLiveZoom) {
    if (!liveDate || !liveTime || !formData.duration_minutes || formData.duration_minutes <= 0) {
      toast({
        title: "Dados incompletos",
        description: "Informe data, hora e duração para criar a aula ao vivo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.attendance_keyword || formData.attendance_keyword.trim().length < 3) {
      toast({
        title: "Palavra-chave obrigatória",
        description: "Informe uma palavra-chave com pelo menos 3 caracteres para aulas ao vivo.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsCreatingLive(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const res = await fetch(
        `https://tctkacgbhqvkqovctrzf.functions.supabase.co/api/zoom/aulas/criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            curso_id: formData.course_id,
            titulo: formData.title,
            data: liveDate,
            hora: liveTime,
            duracao: formData.duration_minutes,
            descricao: formData.description || "",
            ordem: formData.order_index ?? 1,
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Falha ao criar reunião no Zoom");
      }

      const json = await res.json().catch(() => null);
      if (json?.join_url) {
        setFormData((prev) => ({ ...prev, video_url: json.join_url }));
      }

      // Persist the lesson with the Zoom link
      await createLessonMutation.mutateAsync({
        ...formData,
        video_url: json?.join_url || formData.video_url,
      });

      await queryClient.invalidateQueries({ queryKey: ["lessons"] });
      await queryClient.invalidateQueries({ queryKey: ["courses"] });

      toast({
        title: "Aula ao vivo criada!",
        description: "Link do Zoom gerado e salvo automaticamente.",
      });


      setFormData({
        course_id: "",
        title: "",
        description: "",
        video_url: "",
        content: "",
        duration_minutes: 0,
        order_index: 1,
        status: "Ativo",
        attendance_keyword: DEFAULT_ATTENDANCE_KEYWORD
      });
      setIsLiveZoom(false);
      setLiveDate("");
      setLiveTime("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao criar aula ao vivo",
        description: error.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLive(false);
    }
    return;
  }

  await createLessonMutation.mutateAsync(formData);

  setFormData({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    content: "",
    duration_minutes: 0,
    order_index: 1,
    status: "Ativo",
    attendance_keyword: DEFAULT_ATTENDANCE_KEYWORD
  });
  setIsLiveZoom(false);
  setLiveDate("");
  setLiveTime("");
  onOpenChange(false);
};

const handleClose = () => {
  setFormData({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    content: "",
    duration_minutes: 0,
    order_index: 1,
    status: "Ativo",
    attendance_keyword: DEFAULT_ATTENDANCE_KEYWORD
  });
  setIsLiveZoom(false);
  setLiveDate("");
  setLiveTime("");
  onOpenChange(false);
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Aula
          </DialogTitle>
          <DialogDescription>
            Crie uma nova aula preenchendo as informações abaixo
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
                <option value="">Selecione um curso</option>
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
              value={formData.description}
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
                onChange={(e) => setFormData({ ...formData, order_index: Number.isNaN(parseInt(e.target.value, 10)) ? 0 : parseInt(e.target.value, 10) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number.isNaN(parseInt(e.target.value, 10)) ? 0 : parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

<div className="grid gap-2">
  <div className="flex items-center justify-between">
    <div>
      <Label htmlFor="isLiveZoom">Aula ao vivo (Zoom)</Label>
      <p className="text-sm text-muted-foreground">Geraremos o link automaticamente no horário definido.</p>
    </div>
    <Switch id="isLiveZoom" checked={isLiveZoom} onCheckedChange={setIsLiveZoom} />
  </div>
</div>
{isLiveZoom && (
  <div className="grid gap-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="liveDate">Data</Label>
        <Input
          id="liveDate"
          type="date"
          value={liveDate}
          onChange={(e) => setLiveDate(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="liveTime">Hora</Label>
        <Input
          id="liveTime"
          type="time"
          value={liveTime}
          onChange={(e) => setLiveTime(e.target.value)}
        />
      </div>
    </div>
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
  </div>
)}

<div className="grid gap-2">
  <Label htmlFor="video_url">Link do Vídeo</Label>
  <Input
    id="video_url"
    value={formData.video_url}
    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
    disabled={isLiveZoom || isCreatingLive}
    placeholder={isLiveZoom ? "Será preenchido automaticamente com o link do Zoom" : undefined}
  />
</div>

          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Input
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4" />
            Cancelar
          </Button>
<Button 
  onClick={handleSave}
  disabled={
    isCreatingLive ||
    createLessonMutation.isPending ||
    !formData.title.trim() ||
    !formData.course_id ||
    (isLiveZoom && (!liveDate || !liveTime || !formData.duration_minutes || formData.duration_minutes <= 0 || !formData.attendance_keyword || formData.attendance_keyword.trim().length < 3))
  }
>
  <Save className="w-4 h-4" />
  {(isCreatingLive || createLessonMutation.isPending) ? "Criando..." : "Criar Aula"}
</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonDialog;
