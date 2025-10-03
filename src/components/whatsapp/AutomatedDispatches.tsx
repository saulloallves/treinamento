import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertCircle, MessageSquare, Zap, Info, Sparkles } from 'lucide-react';
import { usePaginatedLessonsForDispatches } from '@/hooks/usePaginatedLessonsForDispatches';
import { useAutomatedLessonDispatches, useCreateAutomatedDispatch, useUpdateAutomatedDispatch } from '@/hooks/useAutomatedLessonDispatches';
import { AutomatedDispatchesFilters } from './AutomatedDispatchesFilters';
import { BulkDispatchActions } from './BulkDispatchActions';
import { LessonDispatchCard } from './LessonDispatchCard';
import { LessonCardSkeletonList } from './LessonCardSkeleton';
import { PaginationCustom } from '@/components/ui/pagination-custom';

const AutomatedDispatches = () => {
  const {
    lessons,
    filteredLessons,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setPage,
    setItemsPerPage,
    searchTerm,
    setSearchTerm,
    selectedCourse,
    setSelectedCourse,
    courses,
    isLoading: lessonsLoading
  } = usePaginatedLessonsForDispatches();
  
  const { data: dispatches = [] } = useAutomatedLessonDispatches();
  const createDispatch = useCreateAutomatedDispatch();
  const updateDispatch = useUpdateAutomatedDispatch();

  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [messages, setMessages] = useState({
    '2_hours_before': 'Lembrete: Sua aula "{titulo}" começará em breve! Acesse: {link}',
    '30_minutes_before': 'ATENÇÃO! Sua aula "{titulo}" está começando! Acesse agora: {link}'
  });

  const getDispatchForLesson = (lessonId: string, type: '2_hours_before' | '30_minutes_before') => {
    return dispatches.find(d => d.lesson_id === lessonId && d.dispatch_type === type);
  };

  const handleToggleDispatch = async (lessonId: string, type: '2_hours_before' | '30_minutes_before') => {
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

  const handleUpdateMessage = async (lessonId: string, type: '2_hours_before' | '30_minutes_before', message: string) => {
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

  // Function to update all lessons with the new default message
  const updateAllLessonsWithDefaultMessage = async (type: '2_hours_before' | '30_minutes_before', newMessage: string) => {
    // Get all lessons that have dispatches of this type
    const lessonsToUpdate = dispatches.filter(dispatch => dispatch.dispatch_type === type);
    
    // Update each dispatch with the new message
    for (const dispatch of lessonsToUpdate) {
      await updateDispatch.mutateAsync({
        id: dispatch.id,
        message_template: newMessage
      });
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    setSelectedLessons(filteredLessons.map(lesson => lesson.id));
  };

  const handleDeselectAll = () => {
    setSelectedLessons([]);
  };

  const handleToggleSelection = (lessonId: string) => {
    setSelectedLessons(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleBulkToggle = async (type: '2_hours_before' | '30_minutes_before') => {
    for (const lessonId of selectedLessons) {
      await handleToggleDispatch(lessonId, type);
    }
    // Keep selections after bulk action - don't clear selectedLessons
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
          <LessonCardSkeletonList count={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Seção de Mensagens Padrão */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Configurar Mensagens Padrão</h2>
            <p className="text-sm text-muted-foreground">
              Defina os templates que serão usados para todas as aulas
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card Mensagem 2 horas */}
          <Card className="border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-lg">2 Horas Antes</span>
                  <p className="text-sm font-normal text-muted-foreground">Lembrete inicial</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="msg-2h"
                value={messages['2_hours_before']}
                onChange={(e) => {
                  const newMessage = e.target.value;
                  setMessages(prev => ({ ...prev, '2_hours_before': newMessage }));
                  updateAllLessonsWithDefaultMessage('2_hours_before', newMessage);
                }}
                placeholder="Digite a mensagem que será enviada 2 horas antes da aula..."
                className="min-h-[80px]"
                rows={3}
              />
              <div className="bg-muted/50 border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Variáveis disponíveis:</p>
                    <p><code className="bg-background px-1 rounded">{'{titulo}'}</code> - Nome da aula</p>
                    <p><code className="bg-background px-1 rounded">{'{link}'}</code> - Link do Zoom</p>
                    <p><code className="bg-background px-1 rounded">{'{horario}'}</code> - Horário da aula</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Mensagem 30 minutos */}
          <Card className="border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="text-lg">30 Minutos Antes</span>
                  <p className="text-sm font-normal text-muted-foreground">Lembrete urgente</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="msg-30m"
                value={messages['30_minutes_before']}
                onChange={(e) => {
                  const newMessage = e.target.value;
                  setMessages(prev => ({ ...prev, '30_minutes_before': newMessage }));
                  updateAllLessonsWithDefaultMessage('30_minutes_before', newMessage);
                }}
                placeholder="Digite a mensagem que será enviada 30 minutos antes da aula..."
                className="min-h-[80px]"
                rows={3}
              />
              <div className="bg-muted/50 border rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Variáveis disponíveis:</p>
                    <p><code className="bg-background px-1 rounded">{'{titulo}'}</code> - Nome da aula</p>
                    <p><code className="bg-background px-1 rounded">{'{link}'}</code> - Link do Zoom</p>
                    <p><code className="bg-background px-1 rounded">{'{horario}'}</code> - Horário da aula</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Aulas */}
      <Card className="border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-xl">Gerenciar Aulas</span>
              <p className="text-sm font-normal text-muted-foreground">
                Configure disparos individuais para cada aula agendada
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">

        <Separator />

        {/* Filters and Search */}
        <AutomatedDispatchesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
          courses={courses}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {totalItems === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || selectedCourse ? 'Nenhuma aula encontrada' : 'Nenhuma aula agendada'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || selectedCourse 
                ? 'Tente ajustar os filtros para encontrar as aulas desejadas.' 
                : 'Quando houver aulas ao vivo agendadas, elas aparecerão aqui para configuração dos disparos.'}
            </p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <BulkDispatchActions
              selectedLessons={selectedLessons}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkToggle2h={() => handleBulkToggle('2_hours_before')}
              onBulkToggle30m={() => handleBulkToggle('30_minutes_before')}
              totalLessons={filteredLessons.length}
            />

            {/* Lessons List */}
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const dispatch2h = getDispatchForLesson(lesson.id, '2_hours_before');
                const dispatch30m = getDispatchForLesson(lesson.id, '30_minutes_before');
                const isSelected = selectedLessons.includes(lesson.id);

                return (
                  <LessonDispatchCard
                    key={lesson.id}
                    lesson={lesson}
                    dispatch2h={dispatch2h}
                    dispatch30m={dispatch30m}
                    onToggleDispatch={handleToggleDispatch}
                    onUpdateMessage={handleUpdateMessage}
                    isSelected={isSelected}
                    onToggleSelection={handleToggleSelection}
                    showSelection={true}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <PaginationCustom
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedDispatches;