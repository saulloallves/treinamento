import BaseLayout from "@/components/BaseLayout";
import AutomatedDispatches from "@/components/whatsapp/AutomatedDispatches";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, MessageSquare, Sparkles } from "lucide-react";
import { useLessonsWithSchedule } from "@/hooks/useLessonsWithSchedule";
import { useAutomatedLessonDispatches } from "@/hooks/useAutomatedLessonDispatches";

const CommunicationPage = () => {
  const { data: lessons = [] } = useLessonsWithSchedule();
  const { data: dispatches = [] } = useAutomatedLessonDispatches();
  
  const activeDispatches = dispatches.filter(d => d.is_active).length;
  const totalLessons = lessons.length;

  return (
    <BaseLayout title="Disparos Automáticos">
      <div className="space-y-8">
        {/* Header com gradiente */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl"></div>
          <div className="relative px-8 py-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Disparos Automáticos
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Configure mensagens automáticas do WhatsApp que serão enviadas antes das aulas ao vivo para lembrar os alunos
              </p>
            </div>

            {/* Estatísticas */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-sm">
                <CardContent className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{totalLessons}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Aulas Agendadas</p>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-sm">
                <CardContent className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{activeDispatches}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Disparos Ativos</p>
                </CardContent>
              </Card>

              <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                Automação Inteligente
              </Badge>
            </div>
          </div>
        </div>
        
        <AutomatedDispatches />
      </div>
    </BaseLayout>
  );
};

export default CommunicationPage;