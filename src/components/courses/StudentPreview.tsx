import { useState } from "react";
import { Play, ArrowLeft, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModules } from "@/hooks/useModules";
import { useRecordedLessons } from "@/hooks/useRecordedLessons";

interface StudentPreviewProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
  initialLessonId?: string;
}

const StudentPreview = ({ courseId, courseName, onBack, initialLessonId }: StudentPreviewProps) => {
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(initialLessonId || null);
  const [watchedLessons, setWatchedLessons] = useState<Set<string>>(new Set());
  
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
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
        
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-blue-700 text-sm font-medium">👁️ Visualização do Aluno</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div 
          className="bg-blue-500 h-2 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex-1 flex">
        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {currentLesson?.video_url ? (
            <div className="w-full h-full max-w-4xl">
              <video
                controls
                className="w-full h-full"
                src={currentLesson.video_url}
                onEnded={() => handleLessonComplete(currentLesson.id)}
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          ) : (
            <div className="text-white text-center">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione uma aula para começar</p>
            </div>
          )}
        </div>

        {/* Lessons Sidebar */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Aulas do Curso</h3>
          </div>
          
          <div className="space-y-1">
            {modules.map((module) => (
              <div key={module.id}>
                <div className="px-4 py-2 bg-gray-100 font-medium text-sm text-gray-700">
                  {module.name}
                </div>
                
                {lessonsByModule[module.id]?.map((lesson, index) => {
                  const isWatched = watchedLessons.has(lesson.id);
                  const isCurrent = currentLesson?.id === lesson.id;
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonId(lesson.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b transition-colors ${
                        isCurrent ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isWatched ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${
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
                          <Play className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          
          {lessons.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhuma aula encontrada</p>
              <p className="text-sm">Adicione aulas para visualizar o curso</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPreview;