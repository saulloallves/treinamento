import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertCircle, MessageSquare, Zap, Info, Sparkles } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Seção de Mensagens Padrão */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurar Mensagens Padrão</h2>
            <p className="text-sm text-muted-foreground">
              Defina os templates que serão usados para todas as aulas
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card Mensagem 1 hora */}
          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-lg">1 Hora Antes</span>
                  <p className="text-sm font-normal text-muted-foreground">Lembrete inicial</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="msg-1h"
                value={messages['1_hour_before']}
                onChange={(e) => setMessages(prev => ({ ...prev, '1_hour_before': e.target.value }))}
                placeholder="Digite a mensagem que será enviada 1 hora antes da aula..."
                className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                rows={4}
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Variáveis disponíveis:</p>
                    <p><code className="bg-blue-100 px-1 rounded">{'{titulo}'}</code> - Nome da aula</p>
                    <p><code className="bg-blue-100 px-1 rounded">{'{link}'}</code> - Link do Zoom</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Mensagem 10 minutos */}
          <Card className="relative overflow-hidden border-0 shadow-md">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <span className="text-lg">10 Minutos Antes</span>
                  <p className="text-sm font-normal text-muted-foreground">Lembrete urgente</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="msg-10m"
                value={messages['10_minutes_before']}
                onChange={(e) => setMessages(prev => ({ ...prev, '10_minutes_before': e.target.value }))}
                placeholder="Digite a mensagem que será enviada 10 minutos antes da aula..."
                className="min-h-[100px] border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                rows={4}
              />
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-800">
                    <p className="font-medium mb-1">Variáveis disponíveis:</p>
                    <p><code className="bg-orange-100 px-1 rounded">{'{titulo}'}</code> - Nome da aula</p>
                    <p><code className="bg-orange-100 px-1 rounded">{'{link}'}</code> - Link do Zoom</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Aulas */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <AlertCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
    </div>
  );
};

export default AutomatedDispatches;