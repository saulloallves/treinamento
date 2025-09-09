import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { LessonForDispatch } from '@/hooks/useLessonsForDispatches';
import { AutomatedLessonDispatch } from '@/hooks/useAutomatedLessonDispatches';

interface LessonDispatchCardProps {
  lesson: LessonForDispatch;
  dispatch2h?: AutomatedLessonDispatch;
  dispatch30m?: AutomatedLessonDispatch;
  onToggleDispatch: (lessonId: string, type: '2_hours_before' | '30_minutes_before') => void;
  onUpdateMessage: (lessonId: string, type: '2_hours_before' | '30_minutes_before', message: string) => void;
  isSelected?: boolean;
  onToggleSelection?: (lessonId: string) => void;
  showSelection?: boolean;
}

export const LessonDispatchCard = ({
  lesson,
  dispatch2h,
  dispatch30m,
  onToggleDispatch,
  onUpdateMessage,
  isSelected = false,
  onToggleSelection,
  showSelection = false,
}: LessonDispatchCardProps) => {
  const [customMessage2h, setCustomMessage2h] = useState(dispatch2h?.message_template || '');
  const [customMessage30m, setCustomMessage30m] = useState(dispatch30m?.message_template || '');

  const handleMessageChange = (type: '2_hours_before' | '30_minutes_before', message: string) => {
    if (type === '2_hours_before') {
      setCustomMessage2h(message);
    } else {
      setCustomMessage30m(message);
    }
    
    // Debounce the update to avoid too many API calls
    setTimeout(() => {
      onUpdateMessage(lesson.id, type, message);
    }, 500);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Card className="border shadow-clean hover:shadow-clean-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {showSelection && onToggleSelection && (
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelection(lesson.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            {/* Header da aula */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-base leading-tight">{lesson.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{lesson.course_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{lesson.zoom_start_time ? formatDateTime(lesson.zoom_start_time) : 'Não agendada'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.duration_minutes}min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de disparo */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Disparo 2 horas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-secondary rounded-md flex items-center justify-center">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">2h antes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dispatch2h?.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Ativo
                      </Badge>
                    )}
                    <Switch
                      checked={dispatch2h?.is_active || false}
                      onCheckedChange={() => onToggleDispatch(lesson.id, '2_hours_before')}
                    />
                  </div>
                </div>
                
                {dispatch2h?.is_active && (
                  <Textarea
                    value={customMessage2h}
                    onChange={(e) => handleMessageChange('2_hours_before', e.target.value)}
                    placeholder="Mensagem personalizada para 2 horas antes..."
                    className="min-h-[60px] text-xs"
                    rows={2}
                  />
                )}
              </div>

              {/* Disparo 30 minutos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-secondary rounded-md flex items-center justify-center">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">30min antes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dispatch30m?.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Ativo
                      </Badge>
                    )}
                    <Switch
                      checked={dispatch30m?.is_active || false}
                      onCheckedChange={() => onToggleDispatch(lesson.id, '30_minutes_before')}
                    />
                  </div>
                </div>
                
                {dispatch30m?.is_active && (
                  <Textarea
                    value={customMessage30m}
                    onChange={(e) => handleMessageChange('30_minutes_before', e.target.value)}
                    placeholder="Mensagem personalizada para 30 minutos antes..."
                    className="min-h-[60px] text-xs"
                    rows={2}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};