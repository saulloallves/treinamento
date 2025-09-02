import { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  Upload, 
  Play, 
  Folder,
  FileVideo,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useModules, useCreateModule, useUpdateModule, useDeleteModule, Module } from "@/hooks/useModules";
import { useRecordedLessons, useCreateRecordedLesson, useUpdateRecordedLesson, useDeleteRecordedLesson, useUploadVideo, RecordedLesson } from "@/hooks/useRecordedLessons";
import { toast } from "sonner";

interface RecordedCoursesDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModuleFormData {
  name: string;
  description: string;
  order_index: number;
}

interface LessonFormData {
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

const RecordedCoursesDialog = ({ courseId, courseName, open, onOpenChange }: RecordedCoursesDialogProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'add-module' | 'edit-module' | 'add-lesson' | 'edit-lesson'>('overview');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<RecordedLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  
  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    name: '',
    description: '',
    order_index: 0
  });
  
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    order_index: 0
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const { data: modules = [] } = useModules(courseId);
  const { data: lessons = [] } = useRecordedLessons(courseId);
  
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();
  
  const createLessonMutation = useCreateRecordedLesson();
  const updateLessonMutation = useUpdateRecordedLesson();
  const deleteLessonMutation = useDeleteRecordedLesson();
  const uploadVideoMutation = useUploadVideo();

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_id]) {
      acc[lesson.module_id] = [];
    }
    acc[lesson.module_id].push(lesson);
    return acc;
  }, {} as Record<string, RecordedLesson[]>);

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const resetForms = () => {
    setModuleForm({ name: '', description: '', order_index: 0 });
    setLessonForm({ title: '', description: '', video_url: '', duration_minutes: 0, order_index: 0 });
    setSelectedModule(null);
    setSelectedLesson(null);
  };

  const handleAddModule = () => {
    resetForms();
    setModuleForm(prev => ({ ...prev, order_index: modules.length }));
    setActiveView('add-module');
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setModuleForm({
      name: module.name,
      description: module.description || '',
      order_index: module.order_index
    });
    setActiveView('edit-module');
  };

  const handleAddLesson = (module: Module) => {
    setSelectedModule(module);
    resetForms();
    const moduleLessons = lessonsByModule[module.id] || [];
    setLessonForm(prev => ({ ...prev, order_index: moduleLessons.length }));
    setActiveView('add-lesson');
  };

  const handleEditLesson = (lesson: RecordedLesson) => {
    setSelectedLesson(lesson);
    setSelectedModule(modules.find(m => m.id === lesson.module_id) || null);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index
    });
    setActiveView('edit-lesson');
  };

  const handleSaveModule = async () => {
    if (!moduleForm.name.trim()) {
      toast.error("Nome do módulo é obrigatório");
      return;
    }

    try {
      if (activeView === 'add-module') {
        await createModuleMutation.mutateAsync({
          course_id: courseId,
          ...moduleForm
        });
      } else if (selectedModule) {
        await updateModuleMutation.mutateAsync({
          ...selectedModule,
          ...moduleForm
        });
      }
      setActiveView('overview');
      resetForms();
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim() || !selectedModule) {
      toast.error("Título da aula e módulo são obrigatórios");
      return;
    }

    try {
      if (activeView === 'add-lesson') {
        await createLessonMutation.mutateAsync({
          module_id: selectedModule.id,
          course_id: courseId,
          ...lessonForm
        });
      } else if (selectedLesson) {
        await updateLessonMutation.mutateAsync({
          ...selectedLesson,
          ...lessonForm
        });
      }
      setActiveView('overview');
      resetForms();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDeleteModule = async (module: Module) => {
    if (window.confirm(`Tem certeza que deseja excluir o módulo "${module.name}" e todas suas aulas?`)) {
      await deleteModuleMutation.mutateAsync(module.id);
    }
  };

  const handleDeleteLesson = async (lesson: RecordedLesson) => {
    if (window.confirm(`Tem certeza que deseja excluir a aula "${lesson.title}"?`)) {
      await deleteLessonMutation.mutateAsync(lesson.id);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    setUploadingVideo(true);
    try {
      const fileName = `${courseId}/${Date.now()}-${file.name}`;
      const result = await uploadVideoMutation.mutateAsync({ file, fileName });
      
      setLessonForm(prev => ({
        ...prev,
        video_url: result.publicUrl,
        // Try to extract duration from file if possible (this is basic, would need proper video analysis)
        duration_minutes: prev.duration_minutes || 10
      }));
      
      toast.success("Vídeo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar vídeo");
    } finally {
      setUploadingVideo(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Módulos e Aulas</h3>
        <Button onClick={handleAddModule} className="btn-primary">
          <Plus className="w-4 h-4" />
          Adicionar Módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Nenhum módulo criado ainda.</p>
          <p className="text-sm">Comece criando o primeiro módulo do curso.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg">
              <div className="flex items-center justify-between p-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleModuleExpansion(module.id)}
                  >
                    {expandedModules.has(module.id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </Button>
                  <Folder className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{module.name}</h4>
                    {module.description && (
                      <p className="text-sm text-gray-600">{module.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {lessonsByModule[module.id]?.length || 0} aulas
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddLesson(module)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditModule(module)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteModule(module)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {expandedModules.has(module.id) && (
                <div className="p-3 space-y-2">
                  {lessonsByModule[module.id]?.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-2 bg-white border rounded">
                      <div className="flex items-center gap-2">
                        <FileVideo className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">{lesson.title}</p>
                          <p className="text-xs text-gray-500">
                            {lesson.duration_minutes} min
                            {lesson.video_url && " • Vídeo disponível"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {lesson.video_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(lesson.video_url, '_blank')}
                          >
                            <Play className="w-3 h-3" />
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
                          onClick={() => handleDeleteLesson(lesson)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma aula neste módulo
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModuleForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {activeView === 'add-module' ? 'Adicionar Módulo' : 'Editar Módulo'}
        </h3>
        <Button variant="outline" onClick={() => setActiveView('overview')}>
          Voltar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="moduleName">Nome do Módulo *</Label>
          <Input
            id="moduleName"
            value={moduleForm.name}
            onChange={(e) => setModuleForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Módulo 1 - Introdução"
          />
        </div>

        <div>
          <Label htmlFor="moduleDescription">Descrição</Label>
          <Textarea
            id="moduleDescription"
            value={moduleForm.description}
            onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição opcional do módulo"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="moduleOrder">Ordem</Label>
          <Input
            id="moduleOrder"
            type="number"
            value={moduleForm.order_index}
            onChange={(e) => setModuleForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSaveModule} disabled={createModuleMutation.isPending || updateModuleMutation.isPending}>
            {(createModuleMutation.isPending || updateModuleMutation.isPending) ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLessonForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {activeView === 'add-lesson' ? 'Adicionar Aula' : 'Editar Aula'}
          {selectedModule && (
            <span className="text-sm text-gray-500 block">
              Módulo: {selectedModule.name}
            </span>
          )}
        </h3>
        <Button variant="outline" onClick={() => setActiveView('overview')}>
          Voltar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="lessonTitle">Título da Aula *</Label>
          <Input
            id="lessonTitle"
            value={lessonForm.title}
            onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Aula 1 - Conceitos básicos"
          />
        </div>

        <div>
          <Label htmlFor="lessonDescription">Descrição</Label>
          <Textarea
            id="lessonDescription"
            value={lessonForm.description}
            onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da aula"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="videoDuration">Duração (minutos)</Label>
          <Input
            id="videoDuration"
            type="number"
            value={lessonForm.duration_minutes}
            onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Link do Vídeo (YouTube, Vimeo, etc.)</Label>
          <Input
            id="videoUrl"
            value={lessonForm.video_url}
            onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div>
          <Label>Ou faça upload do vídeo</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoUpload(file);
              }}
              className="hidden"
              id="videoUpload"
            />
            <label htmlFor="videoUpload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {uploadingVideo ? 'Enviando vídeo...' : 'Clique para selecionar um vídeo'}
              </p>
              <p className="text-xs text-gray-500">MP4, WebM, MOV até 100MB</p>
            </label>
          </div>
        </div>

        <div>
          <Label htmlFor="lessonOrder">Ordem</Label>
          <Input
            id="lessonOrder"
            type="number"
            value={lessonForm.order_index}
            onChange={(e) => setLessonForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
            min="0"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSaveLesson} 
            disabled={createLessonMutation.isPending || updateLessonMutation.isPending || uploadingVideo}
          >
            {(createLessonMutation.isPending || updateLessonMutation.isPending) ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button variant="outline" onClick={() => setActiveView('overview')}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Curso Gravado: {courseName}
          </DialogTitle>
          <DialogDescription>
            Gerencie os módulos e aulas gravadas deste curso
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {activeView === 'overview' && renderOverview()}
          {(activeView === 'add-module' || activeView === 'edit-module') && renderModuleForm()}
          {(activeView === 'add-lesson' || activeView === 'edit-lesson') && renderLessonForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordedCoursesDialog;