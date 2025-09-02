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
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModules } from "@/hooks/useModules";
import { useRecordedLessons } from "@/hooks/useRecordedLessons";
import { getVideoFileName, getMimeFromExtension } from "@/lib/videoUtils";

interface StudentPreviewProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
  initialLessonId?: string;
}

const StudentPreview = ({ courseId, courseName, onBack, initialLessonId }: StudentPreviewProps) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(initialLessonId || null);
  const [watchedLessons, setWatchedLessons] = useState<Set<string>>(new Set());
  const [videoError, setVideoError] = useState<boolean>(false);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [openModules, setOpenModules] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const { data: modules = [] } = useModules(courseId);
  const { data: lessons = [] } = useRecordedLessons(courseId);

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_id]) {
      acc[lesson.module_id] = [];
    }
    acc[lesson.module_id].push(lesson);
    return acc;
  }, {} as Record<string, typeof lessons>);

  // Get first lesson if none selected
  const currentLesson = currentLessonId 
    ? lessons.find(l => l.id === currentLessonId)
    : lessons[0];

  // Auto-expand module containing current lesson
  useEffect(() => {
    if (currentLesson && modules.length > 0) {
      const moduleId = currentLesson.module_id;
      if (!openModules.includes(moduleId)) {
        setOpenModules(prev => [...prev, moduleId]);
      }
    }
  }, [currentLesson, modules, openModules]);

  // Auto-scroll to current lesson in sidebar
  useEffect(() => {
    if (currentLesson && sidebarRef.current) {
      const lessonElement = sidebarRef.current.querySelector(`[data-lesson-id="${currentLesson.id}"]`);
      if (lessonElement) {
        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  };

  const handleVideoCanPlay = () => {
    setVideoLoading(false);
    // Apply playback rate
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
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
    setWatchedLessons(prev => new Set([...prev, lessonId]));
    
    // Auto-advance to next lesson
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
      setCurrentLessonId(lessons[currentIndex + 1].id);
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="hover-scale">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{courseName}</h2>
            <p className="text-sm text-gray-600">
              Progresso: {watchedLessons.size}/{lessons.length} aulas ({progressPercentage}%)
            </p>
          </div>
        </div>
        
        <div className="bg-blue-100 px-3 py-1 rounded-full animate-fade-in">
          <span className="text-blue-700 text-sm font-medium">👁️ Visualização do Aluno</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Video Controls Bar */}
      {currentLesson?.video_url && !videoError && (
        <div className="flex items-center justify-between p-3 bg-gray-900 text-white">
          <div className="flex items-center gap-4">
            <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
              <SelectTrigger className="w-20 bg-gray-800 border-gray-700">
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
              className="text-white hover:bg-gray-800"
            >
              <Settings className="w-4 h-4 mr-1" />
              PiP
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheaterMode}
              className={`text-white hover:bg-gray-800 ${theaterMode ? 'bg-gray-800' : ''}`}
            >
              <Maximize className="w-4 h-4 mr-1" />
              Cinema
            </Button>
          </div>
          
          <div className="text-sm opacity-75">
            {currentLesson.title} • {currentLesson.duration_minutes} min
          </div>
        </div>
      )}

      <div className={`flex-1 flex ${theaterMode ? 'flex-col' : ''}`}>
        {/* Video Player */}
        <div className={`${theaterMode ? 'flex-1' : 'flex-1'} bg-black flex items-center justify-center relative overflow-hidden`}>
          {currentLesson?.video_url ? (
            <div className="w-full h-full flex items-center justify-center">
              {!videoError ? (
                <AspectRatio ratio={16 / 9} className="w-full max-w-none">
                  <video
                    ref={videoRef}
                    key={currentLesson.id}
                    controls
                    className="w-full h-full object-contain"
                    onLoadStart={handleVideoLoadStart}
                    onCanPlay={handleVideoCanPlay}
                    onEnded={() => handleLessonComplete(currentLesson.id)}
                    onError={handleVideoError}
                    preload="metadata"
                    playsInline
                  >
                    <source src={currentLesson.video_url} />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </AspectRatio>
              ) : (
                <div className="text-white text-center p-8 animate-fade-in">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto border border-white/20">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Vídeo não pode ser reproduzido</p>
                    <p className="text-sm opacity-75 mb-4">
                      Este formato não é suportado pelo navegador.
                    </p>
                    <p className="text-xs opacity-60 mb-6">
                      💡 Dica: Para máxima compatibilidade, use MP4 com codec H.264/AAC
                    </p>
                    <div className="space-y-3">
                      <Button 
                        variant="outline"
                        className="text-white border-white/40 hover:bg-white hover:text-black w-full hover-scale"
                        onClick={() => window.open(currentLesson.video_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar vídeo ({getVideoFileName(currentLesson.video_url)})
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-fade-in">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm">Carregando vídeo...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-white text-center animate-fade-in">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione uma aula para começar</p>
            </div>
          )}
        </div>

        {/* Enhanced Lessons Sidebar */}
        <div className={`${theaterMode ? 'w-full border-t' : 'w-80 border-l'} bg-white transition-all duration-300`}>
          <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-500" />
              Aulas do Curso
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {watchedLessons.size} de {lessons.length} assistidas
            </p>
          </div>
          
          <ScrollArea className="flex-1" ref={sidebarRef}>
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
                    className="border rounded-lg overflow-hidden animate-fade-in"
                  >
                    <AccordionTrigger className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 text-sm font-medium text-blue-900 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {module.name}
                        <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                          {lessonsByModule[module.id]?.length || 0}
                        </span>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="p-0">
                      {lessonsByModule[module.id]?.map((lesson, index) => {
                        const isWatched = watchedLessons.has(lesson.id);
                        const isCurrent = currentLesson?.id === lesson.id;
                        
                        return (
                          <button
                            key={lesson.id}
                            data-lesson-id={lesson.id}
                            onClick={() => handleLessonChange(lesson.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-all duration-200 hover-scale ${
                              isCurrent 
                                ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
                                : 'hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                {isWatched ? (
                                  <CheckCircle className="w-5 h-5 text-green-500 animate-scale-in" />
                                ) : (
                                  <Circle className={`w-5 h-5 transition-colors ${
                                    isCurrent ? 'text-blue-500' : 'text-gray-400'
                                  }`} />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm truncate transition-colors ${
                                  isCurrent ? 'text-blue-700' : 'text-gray-800'
                                }`}>
                                  Aula {index + 1}: {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lesson.duration_minutes} minutos
                                </p>
                                {lesson.description && (
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                              
                              {isCurrent && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      
                      {(!lessonsByModule[module.id] || lessonsByModule[module.id].length === 0) && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Nenhuma aula neste módulo
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {lessons.length === 0 && (
                <div className="p-8 text-center text-gray-500 animate-fade-in">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma aula encontrada</p>
                  <p className="text-sm">Adicione aulas para visualizar o curso</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default StudentPreview;