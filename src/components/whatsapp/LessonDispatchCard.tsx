import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar } from 'lucide-react';
import { LessonWithSchedule } from '@/hooks/useLessonsWithSchedule';
import { safeFormatDateTime } from '@/lib/dateUtils';

interface LessonDispatchCardProps {
  lesson: LessonWithSchedule;
  dispatch1h?: {
    id: string;
    is_active: boolean;
    message_template: string;
  };
  dispatch10m?: {
    id: string;
    is_active: boolean;
    message_template: string;
  };
  onToggleDispatch: (lessonId: string, type: '1_hour_before' | '10_minutes_before') => void;
  onUpdateMessage: (lessonId: string, type: '1_hour_before' | '10_minutes_before', message: string) => void;
  isSelected?: boolean;
  onToggleSelection?: (lessonId: string) => void;
  showSelection?: boolean;
}

export const LessonDispatchCard = ({
  lesson,
  dispatch1h,
  dispatch10m,
  onToggleDispatch,
  onUpdateMessage,
  isSelected = false,
  onToggleSelection,
  showSelection = false,
}: LessonDispatchCardProps) => {
  return (
    <Card className={`border-l-4 transition-colors ${isSelected ? 'border-l-primary bg-accent/20' : 'border-l-primary/30'}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {showSelection && onToggleSelection && (
                <div className="pt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(lesson.id)}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base truncate pr-2">{lesson.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{lesson.course_name}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="text-sm">{safeFormatDateTime(lesson.zoom_start_time)}</span>
                  </div>
                  <Badge variant="outline" className="w-fit">{lesson.duration_minutes} min</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* 1 Hour Before */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">1 hora antes</span>
                {dispatch1h?.is_active && (
                  <Badge variant="secondary" className="text-xs">Ativo</Badge>
                )}
              </div>
              <Switch
                checked={dispatch1h?.is_active || false}
                onCheckedChange={() => onToggleDispatch(lesson.id, '1_hour_before')}
              />
            </div>

            {/* 10 Minutes Before */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">10 minutos antes</span>
                {dispatch10m?.is_active && (
                  <Badge variant="secondary" className="text-xs">Ativo</Badge>
                )}
              </div>
              <Switch
                checked={dispatch10m?.is_active || false}
                onCheckedChange={() => onToggleDispatch(lesson.id, '10_minutes_before')}
              />
            </div>

            {/* Custom Messages for this lesson */}
            {(dispatch1h?.is_active || dispatch10m?.is_active) && (
              <div className="mt-4 space-y-3 p-3 bg-accent/30 rounded-lg">
                <h5 className="text-sm font-medium">Mensagens personalizadas:</h5>
                
                {dispatch1h?.is_active && (
                  <div className="space-y-1">
                    <Label className="text-xs">Mensagem 1 hora antes</Label>
                    <Textarea
                      value={dispatch1h.message_template}
                      onChange={(e) => onUpdateMessage(lesson.id, '1_hour_before', e.target.value)}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                )}
                
                {dispatch10m?.is_active && (
                  <div className="space-y-1">
                    <Label className="text-xs">Mensagem 10 minutos antes</Label>
                    <Textarea
                      value={dispatch10m.message_template}
                      onChange={(e) => onUpdateMessage(lesson.id, '10_minutes_before', e.target.value)}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};