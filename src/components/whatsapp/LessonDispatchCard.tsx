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
  const hasActiveDispatch = dispatch1h?.is_active || dispatch10m?.is_active;
  
  return (
    <Card className={`relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:shadow-md'
    } ${hasActiveDispatch ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-200'}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header da Aula */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {showSelection && onToggleSelection && (
                <div className="pt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(lesson.id)}
                    className="border-2"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gray-900 truncate pr-2">{lesson.title}</h4>
                    <p className="text-sm text-blue-600 font-medium truncate">{lesson.course_name}</p>
                  </div>
                  {hasActiveDispatch && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span className="text-sm font-medium">{safeFormatDateTime(lesson.zoom_start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      {lesson.duration_minutes} minutos
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Disparo */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* 1 Hour Before */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              dispatch1h?.is_active 
                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                    dispatch1h?.is_active ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${dispatch1h?.is_active ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">1 hora antes</p>
                    <p className="text-xs text-gray-600">Lembrete inicial</p>
                  </div>
                </div>
                <Switch
                  checked={dispatch1h?.is_active || false}
                  onCheckedChange={() => onToggleDispatch(lesson.id, '1_hour_before')}
                />
              </div>
            </div>

            {/* 10 Minutes Before */}
            <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              dispatch10m?.is_active 
                ? 'bg-orange-50 border-orange-200 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                    dispatch10m?.is_active ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <Clock className={`h-4 w-4 ${dispatch10m?.is_active ? 'text-orange-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">10 minutos antes</p>
                    <p className="text-xs text-gray-600">Lembrete urgente</p>
                  </div>
                </div>
                <Switch
                  checked={dispatch10m?.is_active || false}
                  onCheckedChange={() => onToggleDispatch(lesson.id, '10_minutes_before')}
                />
              </div>
            </div>
          </div>

          {/* Custom Messages for this lesson */}
          {(dispatch1h?.is_active || dispatch10m?.is_active) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <h5 className="font-semibold text-gray-900">Mensagens Personalizadas</h5>
              </div>
              
              <div className="space-y-4">
                {dispatch1h?.is_active && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Mensagem 1 hora antes</Label>
                    <Textarea
                      value={dispatch1h.message_template}
                      onChange={(e) => onUpdateMessage(lesson.id, '1_hour_before', e.target.value)}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                      rows={3}
                    />
                  </div>
                )}
                
                {dispatch10m?.is_active && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Mensagem 10 minutos antes</Label>
                    <Textarea
                      value={dispatch10m.message_template}
                      onChange={(e) => onUpdateMessage(lesson.id, '10_minutes_before', e.target.value)}
                      className="border-orange-200 focus:border-orange-500 focus:ring-orange-500/20"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};