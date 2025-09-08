import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertCircle } from 'lucide-react';
import { usePaginatedLessons } from '@/hooks/usePaginatedLessons';
import { useAutomatedLessonDispatches, useCreateAutomatedDispatch, useUpdateAutomatedDispatch } from '@/hooks/useAutomatedLessonDispatches';
import { AutomatedDispatchesFilters } from './AutomatedDispatchesFilters';
import { BulkDispatchActions } from './BulkDispatchActions';
import { LessonDispatchCard } from './LessonDispatchCard';
import { LessonCardSkeletonList } from './LessonCardSkeleton';
import { PaginationCustom } from '@/components/ui/pagination-custom';

const AutomatedDispatches = () => {
  const {
    lessons,
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
  } = usePaginatedLessons();
  
  const { data: dispatches = [] } = useAutomatedLessonDispatches();
  const createDispatch = useCreateAutomatedDispatch();
  const updateDispatch = useUpdateAutomatedDispatch();

  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
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

  // Bulk actions
  const handleSelectAll = () => {
    setSelectedLessons(lessons.map(lesson => lesson.id));
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

  const handleBulkToggle = async (type: '1_hour_before' | '10_minutes_before') => {
    for (const lessonId of selectedLessons) {
      await handleToggleDispatch(lessonId, type);
    }
    setSelectedLessons([]);
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
        {/* Default Messages Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mensagens Padrão</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="msg-1h">Mensagem para 1 hora antes</Label>
              <Textarea
                id="msg-1h"
                value={messages['1_hour_before']}
                onChange={(e) => setMessages(prev => ({ ...prev, '1_hour_before': e.target.value }))}
                placeholder="Digite a mensagem que será enviada 1 hora antes da aula..."
                className="mt-1"
                rows={3}
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
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{titulo}'} para o nome da aula e {'{link}'} para o link do Zoom
              </p>
            </div>
          </div>
        </div>

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
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || selectedCourse ? 'Nenhuma aula encontrada com os filtros aplicados.' : 'Nenhuma aula ao vivo agendada encontrada.'}
            </p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <BulkDispatchActions
              selectedLessons={selectedLessons}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkToggle1h={() => handleBulkToggle('1_hour_before')}
              onBulkToggle10m={() => handleBulkToggle('10_minutes_before')}
              totalLessons={lessons.length}
            />

            {/* Lessons List */}
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const dispatch1h = getDispatchForLesson(lesson.id, '1_hour_before');
                const dispatch10m = getDispatchForLesson(lesson.id, '10_minutes_before');
                const isSelected = selectedLessons.includes(lesson.id);

                return (
                  <LessonDispatchCard
                    key={lesson.id}
                    lesson={lesson}
                    dispatch1h={dispatch1h}
                    dispatch10m={dispatch10m}
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
  );
};

export default AutomatedDispatches;