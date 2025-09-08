import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MessageSquare, Calendar, AlertCircle } from 'lucide-react';
import { useLessonsWithSchedule } from '@/hooks/useLessonsWithSchedule';
import { useAutomatedLessonDispatches, useCreateAutomatedDispatch, useUpdateAutomatedDispatch } from '@/hooks/useAutomatedLessonDispatches';
import { safeFormatDateTime } from '@/lib/dateUtils';

const AutomatedDispatches = () => {
  const { data: lessons = [], isLoading: lessonsLoading } = useLessonsWithSchedule();
  const { data: dispatches = [] } = useAutomatedLessonDispatches();
  const createDispatch = useCreateAutomatedDispatch();
  const updateDispatch = useUpdateAutomatedDispatch();

  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [messages, setMessages] = useState({
    '1_hour_before': 'Lembrete: Sua aula "{titulo}" começará em 1 hora! Acesse: {link}',
    '10_minutes_before': 'ATENÇÃO! Sua aula "{titulo}" começará em 10 minutos! Acesse agora: {link}'
  });

  const getDispatchForLesson = (lessonId: string, type: '1_hour_before' | '10_minutes_before') => {
    return dispatches.find(d => d.lesson_id === lessonId && d.dispatch_type === type);
  };

  const handleToggleDispatch = async (lessonId: string, type: '1_hour_before' | '10_minutes_before') => {
    const existingDispatch = getDispatchForLesson(lessonId, type);
    
    if (existingDispatch) {
      // Toggle existing dispatch
      await updateDispatch.mutateAsync({
        id: existingDispatch.id,
        is_active: !existingDispatch.is_active
      });
    } else {
      // Create new dispatch
      await createDispatch.mutateAsync({
        lesson_id: lessonId,
        dispatch_type: type,
        message_template: messages[type],
        is_active: true
      });
    }
  };

  const handleUpdateMessage = async (lessonId: string, type: '1_hour_before' | '10_minutes_before', message: string) => {
    const existingDispatch = getDispatchForLesson(lessonId, type);
    
    if (existingDispatch) {
      await updateDispatch.mutateAsync({
        id: existingDispatch.id,
        message_template: message
      });
    } else {
      await createDispatch.mutateAsync({
        lesson_id: lessonId,
        dispatch_type: type,
        message_template: message,
        is_active: true
      });
    }
  };

  if (lessonsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disparos Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando aulas agendadas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Disparos Automáticos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure disparos automáticos para aulas ao vivo. O sistema enviará mensagens automaticamente 1 hora e 10 minutos antes do início.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {lessons.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma aula ao vivo agendada encontrada.
            </p>
          </div>
        ) : (
          <>
            {/* Default Messages Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mensagens Padrão</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="msg-1h">Mensagem para 1 hora antes</Label>
                  <Textarea
                    id="msg-1h"
                    value={messages['1_hour_before']}
                    onChange={(e) => setMessages(prev => ({ ...prev, '1_hour_before': e.target.value }))}
                    placeholder="Digite a mensagem que será enviada 1 hora antes da aula..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{titulo}'} para o nome da aula e {'{link}'} para o link do Zoom
                  </p>
                </div>
                <div>
                  <Label htmlFor="msg-10m">Mensagem para 10 minutos antes</Label>
                  <Textarea
                    id="msg-10m"
                    value={messages['10_minutes_before']}
                    onChange={(e) => setMessages(prev => ({ ...prev, '10_minutes_before': e.target.value }))}
                    placeholder="Digite a mensagem que será enviada 10 minutos antes da aula..."
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {'{titulo}'} para o nome da aula e {'{link}'} para o link do Zoom
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lessons List with Dispatch Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Aulas Agendadas</h3>
              <div className="space-y-4">
                {lessons.map((lesson) => {
                  const dispatch1h = getDispatchForLesson(lesson.id, '1_hour_before');
                  const dispatch10m = getDispatchForLesson(lesson.id, '10_minutes_before');

                  return (
                    <Card key={lesson.id} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{lesson.title}</h4>
                              <p className="text-sm text-muted-foreground">{lesson.course_name}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-sm">{safeFormatDateTime(lesson.zoom_start_time)}</span>
                                </div>
                                <Badge variant="outline">{lesson.duration_minutes} min</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* 1 Hour Before */}
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">1 hora antes</span>
                                {dispatch1h?.is_active && (
                                  <Badge variant="secondary" className="text-xs">Ativo</Badge>
                                )}
                              </div>
                              <Switch
                                checked={dispatch1h?.is_active || false}
                                onCheckedChange={() => handleToggleDispatch(lesson.id, '1_hour_before')}
                              />
                            </div>

                            {/* 10 Minutes Before */}
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">10 minutos antes</span>
                                {dispatch10m?.is_active && (
                                  <Badge variant="secondary" className="text-xs">Ativo</Badge>
                                )}
                              </div>
                              <Switch
                                checked={dispatch10m?.is_active || false}
                                onCheckedChange={() => handleToggleDispatch(lesson.id, '10_minutes_before')}
                              />
                            </div>

                            {/* Custom Messages for this lesson */}
                            {(dispatch1h?.is_active || dispatch10m?.is_active) && (
                              <div className="mt-4 space-y-3">
                                <h5 className="text-sm font-medium">Mensagens personalizadas para esta aula:</h5>
                                
                                {dispatch1h?.is_active && (
                                  <div>
                                    <Label className="text-xs">Mensagem 1 hora antes</Label>
                                    <Textarea
                                      value={dispatch1h.message_template}
                                      onChange={(e) => handleUpdateMessage(lesson.id, '1_hour_before', e.target.value)}
                                      className="text-sm mt-1"
                                      rows={2}
                                    />
                                  </div>
                                )}
                                
                                {dispatch10m?.is_active && (
                                  <div>
                                    <Label className="text-xs">Mensagem 10 minutos antes</Label>
                                    <Textarea
                                      value={dispatch10m.message_template}
                                      onChange={(e) => handleUpdateMessage(lesson.id, '10_minutes_before', e.target.value)}
                                      className="text-sm mt-1"
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
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomatedDispatches;