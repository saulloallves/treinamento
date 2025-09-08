import BaseLayout from "@/components/BaseLayout";
import AutomatedDispatches from "@/components/whatsapp/AutomatedDispatches";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Sparkles } from "lucide-react";
import { useLessonsWithSchedule } from "@/hooks/useLessonsWithSchedule";
import { useAutomatedLessonDispatches } from "@/hooks/useAutomatedLessonDispatches";
import { RobotIcon } from "@/components/ui/robot-icon";

const CommunicationPage = () => {
  const { data: lessons = [] } = useLessonsWithSchedule();
  const { data: dispatches = [] } = useAutomatedLessonDispatches();
  
  const activeDispatches = dispatches.filter(d => d.is_active).length;
  const totalLessons = lessons.length;

  return (
    <BaseLayout title="Disparos Automáticos">
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-card rounded-xl border shadow-clean">
          <div className="px-8 py-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-clean">
              <RobotIcon className="w-8 h-8 text-white" size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Disparos Automáticos
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Configure mensagens automáticas do WhatsApp que serão enviadas antes das aulas ao vivo para lembrar os alunos
              </p>
            </div>

            {/* Estatísticas */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Card className="bg-card border shadow-clean">
                <CardContent className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">{totalLessons}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Aulas Agendadas</p>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-clean">
                <CardContent className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{activeDispatches}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Disparos Ativos</p>
                </CardContent>
              </Card>

              <Badge variant="secondary" className="px-4 py-2">
                <Clock className="h-3 w-3 mr-1" />
                Automação Inteligente
              </Badge>
            </div>

            {/* Info sobre intervalo */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Intervalo entre disparos:</strong> 10 segundos • Para grandes volumes, considere o tempo total de envio
              </p>
            </div>
          </div>
        </div>
        
        <AutomatedDispatches />
      </div>
    </BaseLayout>
  );
};

export default CommunicationPage;