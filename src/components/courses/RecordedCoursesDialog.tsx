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
import { MAX_UPLOAD_BYTES, formatBytes } from "@/lib/config";

interface RecordedCoursesDialogProps {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewOnly?: boolean;
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

const RecordedCoursesDialog = ({ courseId, courseName, open, onOpenChange, viewOnly = false }: RecordedCoursesDialogProps) => {
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

    // Check file size before upload
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(`Arquivo muito grande! O arquivo tem ${formatBytes(file.size)}, mas o limite é ${formatBytes(MAX_UPLOAD_BYTES)}. Comprima o vídeo ou reduza a qualidade.`);
      return;
    }

    // Accept any file - no format validation
    setUploadingVideo(true);
    try {
      const { buildSafeVideoPath } = await import('@/lib/storageUtils');
      const fileName = buildSafeVideoPath(courseId, file.name);
      const result = await uploadVideoMutation.mutateAsync({ file, fileName });
      
      // Store the public URL for immediate playback
      setUploadedVideoUrl(result.publicUrl);
      setLessonForm(prev => ({
        ...prev,
        video_url: result.publicUrl,
        video_file_path: result.path,
        // Try to extract duration from file if possible (this is basic, would need proper video analysis)
        duration_minutes: prev.duration_minutes || 10
      }));
      
      toast.success("Upload concluído! Vídeo enviado com sucesso.");
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error("Erro no upload. Falha ao enviar o vídeo. Tente novamente.");
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
      enableProgressionLock={false} // Admin mode - all lessons unlocked
    />
  );

  const renderOverview = () => (
    <div className="space-y-4 max-h-[calc(100svh-140px)] sm:max-h-[60vh] overflow-y-auto px-4 sm:px-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base sm:text-lg font-semibold">Linha do Tempo das Aulas</h3>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {!viewOnly && (
            <Button 
              onClick={() => setPreviewMode(true)} 
              variant="outline"
              className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <Play className="w-4 h-4" />
              <span className="ml-1">Visualizar como Aluno</span>
            </Button>
          )}
          {!viewOnly && (
            <Button onClick={handleAddModule} className="w-full sm:w-auto btn-primary">
              <Plus className="w-4 h-4" />
              <span className="ml-1">Adicionar Módulo</span>
            </Button>
          )}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50">
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
                    <h4 className="text-base sm:text-lg font-medium break-anywhere">{module.name}</h4>
                    {module.description && (
                      <p className="text-sm text-gray-600">{module.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-gray-500">
                    {lessonsByModule[module.id]?.length || 0} aulas
                  </span>
                  {!viewOnly && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddLesson(module)}
                        className="w-auto sm:w-auto bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="ml-1 hidden sm:inline">Adicionar Aula</span>
                        <span className="ml-1 sm:hidden">Adicionar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                        className="hidden sm:inline-flex"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModule(module)}
                        className="hidden sm:inline-flex"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {expandedModules.has(module.id) && (
                <div className="p-3 space-y-3">
                  {lessonsByModule[module.id]?.map((lesson, index) => (
                    <div key={lesson.id} className="bg-gradient-to-r from-white to-gray-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          {lesson.video_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPreviewLessonId(lesson.id);
                                setPreviewMode(true);
                              }}
                              className="w-auto sm:w-auto bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <Play className="w-4 h-4" />
                              <span className="ml-1">Assistir</span>
                            </Button>
                          )}
                          {!viewOnly && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLesson(lesson)}
                                className="hidden sm:inline-flex bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson)}
                                className="hidden sm:inline-flex bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
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
                  {uploadingVideo ? (
                    <div className="animate-pulse">
                      <div className="w-8 h-8 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                      <p className="font-medium text-blue-600">Enviando vídeo...</p>
                      <p className="text-xs text-blue-500">Por favor, aguarde</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-medium">Clique para selecionar um vídeo</p>
                      <p className="text-xs text-gray-500">Todos os formatos de vídeo aceitos • Tamanho máximo: {formatBytes(MAX_UPLOAD_BYTES)}</p>
                    </>
                  )}
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
      <DialogContent
        className={
          previewMode
            ? [
                // Mobile: fullscreen, no horizontal scroll, pinned to viewport
                "p-0 sm:p-0 w-[100vw] h-[100svh] max-w-[100vw] max-h-[100svh] overflow-x-hidden rounded-none",
                "left-0 top-0 translate-x-0 translate-y-0",
                // Desktop+: centered, height fits content up to viewport
                "sm:w-[96vw] sm:max-w-[1600px] sm:h-auto sm:max-h-[90vh] sm:rounded-lg sm:left-1/2 sm:top-1/2 sm:translate-x-[-50%] sm:translate-y-[-50%]",
              ].join(" ")
            : [
                // Mobile: wide, tall, pinned to viewport to avoid sideways drag
                "w-[100vw] h-[90vh] max-w-[100vw] overflow-x-hidden rounded-none",
                "left-0 top-0 translate-x-0 translate-y-0",
                // Desktop+: standard centered dialog
                "sm:max-w-4xl sm:h-auto sm:rounded-lg sm:left-1/2 sm:top-1/2 sm:translate-x-[-50%] sm:translate-y-[-50%]",
              ].join(" ")
        }
      >
        {!previewMode && (
          <DialogHeader className="sticky top-0 bg-background z-10 px-4 py-3 border-b sm:static sm:top-auto sm:border-none sm:px-0 sm:py-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Video className="w-5 h-5" />
              Curso Gravado: {courseName}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Gerencie os módulos e aulas gravadas deste curso
            </DialogDescription>
          </DialogHeader>
        )}

        <div className={previewMode ? "h-full sm:h-auto" : "py-4 px-4 sm:px-6"}>
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