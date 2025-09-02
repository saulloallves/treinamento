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
import StudentPreview from "./StudentPreview";
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
    duration_minutes: 0,
    order_index: 0
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);

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
    setLessonForm({ title: '', description: '', duration_minutes: 0, order_index: 0 });
    setSelectedModule(null);
    setSelectedLesson(null);
    setUploadedVideoUrl('');
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
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index
    });
    setUploadedVideoUrl(lesson.video_url || '');
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

    if (!uploadedVideoUrl && activeView === 'add-lesson') {
      toast.error("Upload de vídeo é obrigatório");
      return;
    }

    try {
      const lessonData = {
        ...lessonForm,
        video_url: uploadedVideoUrl
      };

      if (activeView === 'add-lesson') {
        await createLessonMutation.mutateAsync({
          module_id: selectedModule.id,
          course_id: courseId,
          ...lessonData
        });
      } else if (selectedLesson) {
        await updateLessonMutation.mutateAsync({
          ...selectedLesson,
          ...lessonData
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
      
      // Store the public URL for immediate playback
      setUploadedVideoUrl(result.publicUrl);
      setLessonForm(prev => ({
        ...prev,
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

  const renderStudentPreview = () => (
    <StudentPreview 
      courseId={courseId}
      courseName={courseName}
      onBack={() => {
        setPreviewMode(false);
        setPreviewLessonId(null);
      }}
      initialLessonId={previewLessonId || undefined}
    />
  );

  const renderOverview = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Linha do Tempo das Aulas</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => setPreviewMode(true)} 
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <Play className="w-4 h-4" />
            👁️ Visualizar como Aluno
          </Button>
          <Button onClick={handleAddModule} className="btn-primary">
            <Plus className="w-4 h-4" />
            Adicionar Módulo
          </Button>
        </div>
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
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Aula
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
                <div className="p-3 space-y-3">
                  {lessonsByModule[module.id]?.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gradient-to-r from-white to-gray-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-full p-2">
                            <FileVideo className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                            <p className="text-sm text-gray-600">
                              Aula {index + 1} • {lesson.duration_minutes} min
                              {lesson.video_url && " • Vídeo carregado"}
                            </p>
                            {lesson.description && (
                              <p className="text-xs text-gray-500 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {lesson.video_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPreviewLessonId(lesson.id);
                                setPreviewMode(true);
                              }}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <Play className="w-4 h-4" />
                              Assistir
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLesson(lesson)}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
        {!selectedModule && (
          <div>
            <Label htmlFor="moduleSelect">Módulo *</Label>
            <select
              id="moduleSelect"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              onChange={(e) => {
                const module = modules.find(m => m.id === e.target.value);
                setSelectedModule(module || null);
              }}
              value={selectedModule?.id || ''}
            >
              <option value="">Selecione um módulo</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
          <Label>Upload do Vídeo *</Label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            uploadedVideoUrl 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            <input
              type="file"
              accept="video/mp4,video/webm,video/mov,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 100 * 1024 * 1024) {
                    toast.error("Arquivo muito grande. Máximo 100MB");
                    return;
                  }
                  handleVideoUpload(file);
                }
              }}
              className="hidden"
              id="videoUpload"
            />
            <label htmlFor="videoUpload" className="cursor-pointer block">
              {uploadedVideoUrl ? (
                <div className="text-green-600">
                  <Video className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Vídeo carregado com sucesso!</p>
                  <p className="text-xs text-green-700 mt-1">Clique para substituir</p>
                </div>
              ) : (
                <div className="text-gray-600">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">
                    {uploadingVideo ? 'Enviando vídeo...' : 'Clique para selecionar um vídeo'}
                  </p>
                  <p className="text-xs text-gray-500">MP4, WebM, MOV (QuickTime) • Máximo 100MB</p>
                </div>
              )}
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
          {previewMode ? renderStudentPreview() : (
            <>
              {activeView === 'overview' && renderOverview()}
              {(activeView === 'add-module' || activeView === 'edit-module') && renderModuleForm()}
              {(activeView === 'add-lesson' || activeView === 'edit-lesson') && renderLessonForm()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordedCoursesDialog;