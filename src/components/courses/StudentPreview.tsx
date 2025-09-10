import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  Download, 
  Settings,
  Maximize,
  ChevronRight,
  ChevronDown,
  Volume2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModules } from "@/hooks/useModules";
import { useRecordedLessons } from "@/hooks/useRecordedLessons";
import { useStudentProgress } from "@/hooks/useStudentProgress";
import { getVideoFileName, getMimeFromExtension } from "@/lib/videoUtils";

interface StudentPreviewProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
  initialLessonId?: string;
  enableProgressionLock?: boolean; // Default true - só admin pode desabilitar
}

const StudentPreview = ({ courseId, courseName, onBack, initialLessonId, enableProgressionLock = true }: StudentPreviewProps) => {
  console.log('StudentPreview renderizado:', { courseId, courseName, initialLessonId });
  
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(initialLessonId || null);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [videoAspect, setVideoAspect] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const { data: modules = [] } = useModules(courseId);
  const { data: lessons = [] } = useRecordedLessons(courseId);
  
  // Use the progress hook instead of local state
  const { 
    getCompletedLessons, 
    isLessonCompleted, 
    markLessonCompleted, 
    markLessonInProgress,
    markLessonCompletedManually,
    getLastProgress,
    isLoading: progressLoading 
  } = useStudentProgress(courseId);
  
  // Get completed lessons from the database
  const completedLessons = getCompletedLessons();
  const watchedLessons = new Set(completedLessons);

  console.log('StudentPreview dados:', { 
    modulesCount: modules.length, 
    lessonsCount: lessons.length,
    completedLessonsCount: completedLessons.length,
    modules,
    lessons 
  });

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_id]) {
      acc[lesson.module_id] = [];
    }
    acc[lesson.module_id].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  // Check if a lesson is unlocked (progressive system)
  const isLessonUnlocked = (lesson: any, index: number, moduleLessons: any[]) => {
    // If progression lock is disabled (admin mode), all lessons are unlocked
    if (!enableProgressionLock) {
      console.log('🔓 Progression lock disabled - all lessons unlocked');
      return true;
    }
    
    // Find current module
    const currentModule = modules.find(m => m.id === lesson.module_id);
    const currentModuleIndex = modules.findIndex(m => m.id === lesson.module_id);
    
    // First lesson of the FIRST module is always unlocked
    if (currentModuleIndex === 0 && index === 0) {
      console.log('🆓 First lesson of first module - always unlocked:', lesson.title);
      return true;
    }
    
    // For first lesson of other modules, check if previous module is completed
    if (index === 0 && currentModuleIndex > 0) {
      const previousModule = modules[currentModuleIndex - 1];
      const previousModuleLessons = lessonsByModule[previousModule.id] || [];
      
      // Check if ALL lessons of previous module are completed
      const previousModuleCompleted = previousModuleLessons.every(prevLesson => 
        watchedLessons.has(prevLesson.id)
      );
      
      console.log(`🔍 First lesson of module "${currentModule?.name}":`, {
        previousModule: previousModule.name,
        previousModuleLessonsCount: previousModuleLessons.length,
        completedInPreviousModule: previousModuleLessons.filter(l => watchedLessons.has(l.id)).length,
        previousModuleCompleted
      });
      
      return previousModuleCompleted;
    }
    
    // For other lessons in the same module, previous lesson must be watched
    const previousLesson = moduleLessons[index - 1];
    const isPreviousWatched = watchedLessons.has(previousLesson.id);
    
    console.log(`🔍 Checking lesson unlock for "${lesson.title}":`, {
      moduleIndex: currentModuleIndex,
      lessonIndex: index,
      previousLessonTitle: previousLesson.title,
      previousLessonId: previousLesson.id,
      isPreviousWatched,
      watchedLessonsSet: Array.from(watchedLessons)
    });
    
    return isPreviousWatched;
  };

  // Get first lesson if none selected, with localStorage recovery
  const currentLesson = currentLessonId 
    ? lessons.find(l => l.id === currentLessonId)
    : lessons[0];

  // Auto-recover last progress from localStorage
  useEffect(() => {
    if (!currentLessonId && lessons.length > 0) {
      const lastProgress = getLastProgress();
      if (lastProgress && lessons.find(l => l.id === lastProgress.lessonId)) {
        console.log('🔄 Recuperando último progresso:', lastProgress.lessonId);
        setCurrentLessonId(lastProgress.lessonId);
      } else {
        // Fallback to first lesson
        setCurrentLessonId(lessons[0].id);
      }
    }
  }, [lessons, currentLessonId, getLastProgress]);

  // Auto-expand module containing current lesson (only once, don't force it open)
  useEffect(() => {
    if (currentLesson && modules.length > 0 && openModules.length === 0) {
      const moduleId = currentLesson.module_id;
      setOpenModules([moduleId]);
    }
  }, [currentLesson, modules]);

  // Auto-scroll to current lesson in sidebar
  useEffect(() => {
    if (currentLesson && sidebarRef.current) {
      const lessonElement = sidebarRef.current.querySelector(`[data-lesson-id="${currentLesson.id}"]`);
      if (lessonElement) {
        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [currentLesson]);

  // Reset video error when lesson changes
  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setVideoError(false);
    setVideoLoading(true);
  };

  const handleVideoLoadStart = () => {
    setVideoLoading(true);
    setVideoError(false);
    setVideoAspect(null);
  };

  const handleVideoCanPlay = () => {
    setVideoLoading(false);
    if (videoRef.current) {
      // Ajusta taxa de reprodução
      videoRef.current.playbackRate = playbackRate;
      // Define o aspect ratio real do vídeo para evitar barras pretas sem cortar
      const vw = videoRef.current.videoWidth || 16;
      const vh = videoRef.current.videoHeight || 9;
      if (vw && vh) setVideoAspect(vw / vh);
    }
  };

  const handleVideoError = (e: any) => {
    console.log('Video error:', e);
    // Give it a moment before showing error - sometimes it's just a temporary network issue
    setTimeout(() => {
      setVideoError(true);
      setVideoLoading(false);
    }, 2000);
  };

  const handleLessonComplete = (lessonId: string) => {
    // Mark lesson as completed using the progress hook
    markLessonCompleted(lessonId);
    
    // Find the next unlocked lesson
    const currentModule = modules.find(m => m.id === currentLesson?.module_id);
    if (currentModule) {
      const currentModuleLessons = lessonsByModule[currentModule.id] || [];
      const currentLessonIndex = currentModuleLessons.findIndex(l => l.id === lessonId);
      
      // Check if there's a next lesson in the same module
      if (currentLessonIndex < currentModuleLessons.length - 1) {
        const nextLesson = currentModuleLessons[currentLessonIndex + 1];
        setCurrentLessonId(nextLesson.id);
      } else {
        // Look for the first lesson in the next module
        const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
        if (currentModuleIndex < modules.length - 1) {
          const nextModule = modules[currentModuleIndex + 1];
          const nextModuleLessons = lessonsByModule[nextModule.id] || [];
          if (nextModuleLessons.length > 0) {
            setCurrentLessonId(nextModuleLessons[0].id);
          }
        }
      }
    }
  };

  const progressPercentage = lessons.length > 0 
    ? Math.round((watchedLessons.size / lessons.length) * 100)
    : 0;

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  const toggleTheaterMode = () => {
    setTheaterMode(!theaterMode);
  };

  const handlePictureInPicture = async () => {
    if (videoRef.current && 'requestPictureInPicture' in videoRef.current) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (error) {
        console.log('PiP not supported or failed:', error);
      }
    }
  };

  return (
    <div className="h-full min-h-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* Consolidated Header Area */}
      <div className="flex-shrink-0">
        {/* Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b bg-white shadow-sm gap-3 sm:gap-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="outline" size="sm" onClick={onBack} className="flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Voltar</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{courseName}</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                Progresso: {watchedLessons.size}/{lessons.length} aulas ({progressPercentage}%)
              </p>
            </div>
          </div>
          
          <div className="bg-blue-100 px-2 sm:px-3 py-1 rounded-full animate-fade-in flex-shrink-0 self-start sm:self-auto">
            <span className="text-blue-700 text-xs sm:text-sm font-medium">👁️ Visualização</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Video Controls Bar - Mobile Responsive */}
        {currentLesson?.video_url && !videoError && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2 bg-gray-900 text-white gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger className="w-16 sm:w-20 bg-gray-800 border-gray-700 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePictureInPicture}
                className="text-white hover:bg-gray-800 text-xs px-2"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">PiP</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheaterMode}
                className={`text-white hover:bg-gray-800 text-xs px-2 ${theaterMode ? 'bg-gray-800' : ''}`}
              >
                <Maximize className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Cinema</span>
              </Button>
            </div>
            
            <div className="text-xs sm:text-sm opacity-75 whitespace-normal break-anywhere line-clamp-2 sm:line-clamp-1 sm:truncate sm:whitespace-nowrap">
              {currentLesson.title} • {currentLesson.duration_minutes} min
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Mobile Responsive */}
      <div className="flex-1 p-2 sm:px-1 sm:py-1 min-h-0">
         <div className={`${theaterMode ? 'flex flex-col h-full' : 'flex flex-col lg:flex-row h-full'} gap-3 sm:gap-1 h-full`}>
           
           {/* Video Player - Mobile First */}
          <div 
            className={`bg-black rounded-lg shadow-lg overflow-hidden relative ${
              theaterMode 
                ? 'flex-1' 
                : 'w-full lg:flex-[2]'
            } aspect-[16/9] sm:aspect-[16/9] md:aspect-[16/9] lg:aspect-[16/9] min-h-[200px] sm:min-h-[300px] max-h-[260px] sm:max-h-none lg:self-start`}
            style={{ 
              height: theaterMode ? 'auto' : undefined,
              aspectRatio: theaterMode ? undefined : (videoAspect ?? 16/9)
            }}
          >
            {currentLesson?.video_url ? (
              <>
                {!videoError ? (
                  <video
                    ref={videoRef}
                    key={currentLesson.id}
                    controls
                    className="w-full h-full"
                    style={{ objectFit: 'contain' }}
                    onLoadStart={handleVideoLoadStart}
                    onCanPlay={handleVideoCanPlay}
                    onPlay={() => {
                      // Mark lesson as in progress when user starts watching
                      if (currentLesson && !isLessonCompleted(currentLesson.id)) {
                        markLessonInProgress(currentLesson.id);
                      }
                    }}
                    onEnded={() => handleLessonComplete(currentLesson.id)}
                    onError={handleVideoError}
                    preload="metadata"
                    playsInline
                  >
                    <source src={currentLesson.video_url} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                ) : (
                  <div className="h-full flex items-center justify-center text-white p-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 max-w-sm mx-auto border border-white/20 text-center">
                      <Play className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-base sm:text-lg mb-2">Vídeo não pode ser reproduzido</p>
                      <p className="text-sm opacity-75 mb-4">
                        Este formato não é suportado pelo navegador.
                      </p>
                      <p className="text-xs opacity-60 mb-6">
                        💡 Dica: Para máxima compatibilidade, use MP4 com codec H.264/AAC
                      </p>
                      <div className="space-y-3">
                        <Button 
                          variant="outline"
                          className="text-white border-white/40 hover:bg-white hover:text-black w-full text-sm"
                          onClick={() => window.open(currentLesson.video_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar vídeo
                        </Button>
                        <Button 
                          variant="ghost"
                          className="text-white/70 hover:text-white text-sm"
                          onClick={() => {
                            setVideoError(false);
                            setVideoLoading(true);
                          }}
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {videoLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm">Carregando vídeo...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-white p-4">
                <div className="text-center">
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base sm:text-lg">Selecione uma aula para começar</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Mobile Responsive */}
          <div 
            className={`bg-white rounded-lg shadow-lg flex flex-col ${
              theaterMode 
                ? 'flex-1 max-h-80' 
                : 'flex-1 lg:w-96 lg:flex-shrink-0'
            }`}
            style={{ 
              minHeight: theaterMode ? '200px' : window.innerWidth < 768 ? '350px' : '300px'
            }}
          >
            {/* Header - Fixed */}
            <div className="p-4 sm:p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg flex-shrink-0">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base sm:text-base">
                <Volume2 className="w-5 h-5 sm:w-5 sm:h-5 text-blue-500" />
                Aulas do Curso
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {watchedLessons.size} de {lessons.length} assistidas
              </p>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                <Accordion 
                  type="multiple" 
                  value={openModules}
                  onValueChange={setOpenModules}
                  className="space-y-2"
                >
                  {modules.map((module) => (
                    <AccordionItem 
                      key={module.id} 
                      value={module.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 text-sm font-medium text-blue-900 hover:no-underline">
                        <div className="flex items-start gap-3 w-full">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span className="flex-1 text-left leading-relaxed text-sm sm:text-sm break-words hyphens-auto break-anywhere whitespace-normal sm:break-normal sm:whitespace-nowrap sm:truncate">{module.name}</span>
                          <span className="text-xs bg-blue-200 px-2 sm:px-2 py-1 rounded-full flex-shrink-0">
                            {lessonsByModule[module.id]?.length || 0}
                          </span>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="p-0">
                        {lessonsByModule[module.id]?.map((lesson, index) => {
                          const isWatched = watchedLessons.has(lesson.id);
                          const isCurrent = currentLesson?.id === lesson.id;
                          const isUnlocked = isLessonUnlocked(lesson, index, lessonsByModule[module.id]);
                          
                          return (
                            <button
                              key={lesson.id}
                              data-lesson-id={lesson.id}
                              onClick={() => {
                                if (isUnlocked) {
                                  handleLessonChange(lesson.id);
                                }
                              }}
                              disabled={!isUnlocked || progressLoading}
                              className={`w-full text-left px-4 sm:px-4 py-3 sm:py-3 border-b last:border-b-0 transition-all duration-200 ${
                                !isUnlocked || progressLoading
                                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                  : isCurrent 
                                    ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm hover:bg-blue-100' 
                                    : 'hover:bg-gray-50 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex-shrink-0">
                                  {progressLoading ? (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                  ) : !isUnlocked ? (
                                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                  ) : isWatched ? (
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                  ) : (
                                    <Circle className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                                      isCurrent ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm sm:text-sm leading-relaxed transition-colors break-words hyphens-auto break-anywhere whitespace-normal sm:break-normal sm:whitespace-nowrap sm:truncate ${
                                    !isUnlocked || progressLoading
                                      ? 'text-gray-400' 
                                      : isCurrent 
                                        ? 'text-blue-700' 
                                        : 'text-gray-800'
                                  }`}>
                                    Aula {index + 1}: {lesson.title}
                                  </p>
                                  <p className={`text-sm ${!isUnlocked || progressLoading ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                    {lesson.duration_minutes} minutos
                                    {!isUnlocked && index > 0 && !progressLoading && (
                                      <span className="ml-2 sm:ml-2 text-xs bg-gray-200 px-2 sm:px-2 py-1 rounded-full">
                                        Complete a aula anterior
                                      </span>
                                    )}
                                    {progressLoading && (
                                      <span className="ml-2 sm:ml-2 text-xs text-blue-500">
                                        Carregando...
                                      </span>
                                    )}
                                  </p>
                                  {lesson.description && (
                                    <p className={`text-sm mt-2 leading-relaxed break-words hyphens-auto break-anywhere whitespace-normal ${
                                      !isUnlocked || progressLoading ? 'text-gray-300' : 'text-gray-400'
                                    }`}>
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                                
                                {(isCurrent && isUnlocked && !progressLoading) || (isUnlocked && !isWatched) ? (
                                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                                    {isCurrent && isUnlocked && !progressLoading && (
                                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    )}
                                    {isUnlocked && !isWatched && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="px-1 sm:px-2 py-1 text-xs hover:bg-green-100 hover:text-green-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markLessonCompletedManually(lesson.id);
                                        }}
                                        disabled={progressLoading}
                                      >
                                        ✓
                                      </Button>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                        
                        {(!lessonsByModule[module.id] || lessonsByModule[module.id].length === 0) && (
                          <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                            Nenhuma aula neste módulo
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {lessons.length === 0 && (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    <Volume2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base">Nenhuma aula encontrada</p>
                    <p className="text-xs sm:text-sm">Adicione aulas para visualizar o curso</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPreview;