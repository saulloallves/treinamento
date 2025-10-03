import BaseLayout from "@/components/BaseLayout";
import AutomatedDispatches from "@/components/whatsapp/AutomatedDispatches";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Sparkles } from "lucide-react";
import { useLessonsWithSchedule } from "@/hooks/useLessonsWithSchedule";
import { useAutomatedLessonDispatches } from "@/hooks/useAutomatedLessonDispatches";
import { RobotIcon } from "@/components/ui/robot-icon";

const CommunicationPage = () => {
  const { data: lessons = [] } = useLessonsWithSchedule();
  const { data: allDispatches = [] } = useAutomatedLessonDispatches();
  
  // Calculate active dispatches for scheduled lessons only
  const activeDispatches = allDispatches.filter(dispatch => {
    // Check if the dispatch is active
    if (!dispatch.is_active) return false;
    
    // Check if there's a corresponding scheduled lesson
    return lessons.some(lesson => lesson.id === dispatch.lesson_id);
  }).length;
  
  const totalLessons = lessons.length;

  return (
    <BaseLayout title="Disparos Automáticos">
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <RobotIcon className="w-5 h-5 text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Disparos Automáticos</h1>
                <p className="text-xs text-muted-foreground">Configure mensagens automáticas antes das aulas</p>
              </div>
            </div>
            
            {/* Estatísticas inline */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{totalLessons}</span>
                <span className="text-xs text-muted-foreground">aulas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">{activeDispatches}</span>
                <span className="text-xs text-muted-foreground">ativos</span>
              </div>
            </div>
          </div>
        </div>
        
        <AutomatedDispatches />
      </div>
    </BaseLayout>
  );
};

export default CommunicationPage;