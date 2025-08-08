
import { useState } from "react";
import { Plus, Play, Link, Upload, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/hooks/useLessons";

interface RecordedLessonsDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NewLessonForm {
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  type: 'link' | 'upload';
}

const RecordedLessonsDialog = ({ courseId, courseName, open, onOpenChange }: RecordedLessonsDialogProps) => {
  const { toast } = useToast();
  const { data: allLessons = [] } = useLessons();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [newLesson, setNewLesson] = useState<NewLessonForm>({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    type: 'link'
  });

  // Filter lessons for this specific course
  const courseLessons = allLessons.filter(lesson => lesson.course_id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLesson.title || (!newLesson.video_url && newLesson.type === 'link')) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título e o link/arquivo da aula.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lessonData = {
        course_id: courseId,
        title: newLesson.title,
        description: newLesson.description,
        video_url: newLesson.video_url,
        duration_minutes: newLesson.duration_minutes || 0,
        order_index: courseLessons.length,
        status: 'Ativo'
      };

      if (editingLesson) {
        await updateLessonMutation.mutateAsync({
          ...editingLesson,
          ...lessonData
        });
      } else {
        await createLessonMutation.mutateAsync(lessonData);
      }

      setNewLesson({
        title: '',
        description: '',
        video_url: '',
        duration_minutes: 0,
        type: 'link'
      });
      setShowAddForm(false);
      setEditingLesson(null);
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
    }
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      type: lesson.video_url ? 'link' : 'upload'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (lessonId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula gravada?")) {
      await deleteLessonMutation.mutateAsync(lessonId);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingLesson(null);
    setNewLesson({
      title: '',
      description: '',
      video_url: '',
      duration_minutes: 0,
      type: 'link'
    });
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Aulas Gravadas - {courseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Lesson Button */}
          {!showAddForm && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {courseLessons.length} aula{courseLessons.length !== 1 ? 's' : ''} gravada{courseLessons.length !== 1 ? 's' : ''}
              </p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Aula Gravada
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingLesson ? 'Editar Aula' : 'Nova Aula Gravada'}
                </h3>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs value={newLesson.type} onValueChange={(value) => setNewLesson({...newLesson, type: value as 'link' | 'upload'})}>
                  <TabsList>
                    <TabsTrigger value="link" className="gap-2">
                      <Link className="w-4 h-4" />
                      Link/URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload (Em breve)
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="link" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Título da Aula *</Label>
                        <Input
                          id="title"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          placeholder="Ex: Introdução ao Tráfego Pago"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duração (minutos)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newLesson.duration_minutes}
                          onChange={(e) => setNewLesson({...newLesson, duration_minutes: parseInt(e.target.value) || 0})}
                          placeholder="60"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="video_url">Link do Vídeo *</Label>
                      <Input
                        id="video_url"
                        value={newLesson.video_url}
                        onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                        placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Suporte para YouTube, Vimeo e outros links de vídeo
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newLesson.description}
                        onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                        placeholder="Descreva o conteúdo desta aula..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Funcionalidade de upload em desenvolvimento</p>
                      <p className="text-sm text-gray-500">Em breve você poderá fazer upload de arquivos de vídeo</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
                  >
                    {editingLesson ? 'Atualizar' : 'Adicionar'} Aula
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Lessons List */}
          <div className="space-y-4">
            {courseLessons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma aula gravada encontrada</p>
                <p className="text-sm">Adicione a primeira aula gravada para este curso</p>
              </div>
            ) : (
              courseLessons.map((lesson, index) => (
                <div key={lesson.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{lesson.title}</h4>
                        <Badge variant="secondary">Aula {index + 1}</Badge>
                        {lesson.duration_minutes > 0 && (
                          <Badge variant="outline">{lesson.duration_minutes}min</Badge>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(lesson)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(lesson.id)}
                        disabled={deleteLessonMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Video Preview */}
                  {lesson.video_url && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {lesson.video_url.includes('youtube') || lesson.video_url.includes('youtu.be') ? (
                        <iframe
                          src={getVideoEmbedUrl(lesson.video_url)}
                          className="w-full h-full"
                          allowFullScreen
                          title={lesson.title}
                        />
                      ) : lesson.video_url.includes('vimeo') ? (
                        <iframe
                          src={lesson.video_url.replace('vimeo.com', 'player.vimeo.com/video')}
                          className="w-full h-full"
                          allowFullScreen
                          title={lesson.title}
                        />
                      ) : (
                        <video
                          src={lesson.video_url}
                          controls
                          className="w-full h-full object-cover"
                          title={lesson.title}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordedLessonsDialog;
