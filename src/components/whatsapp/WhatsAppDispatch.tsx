import { useState, useMemo, useEffect } from "react";
import { Send, MessageSquare, Users, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import { useWhatsAppDispatches, useCreateWhatsAppDispatch } from "@/hooks/useWhatsAppDispatches";
import { useCourses } from "@/hooks/useCourses";
import { useLessons } from "@/hooks/useLessons";
import { useEnrollments } from "@/hooks/useEnrollments";


const WhatsAppDispatch = () => {
  const [selectedType, setSelectedType] = useState<'curso' | 'aula'>('curso');
  const [selectedItem, setSelectedItem] = useState('');
  const [message, setMessage] = useState('');
  const [recipientMode, setRecipientMode] = useState<'all' | 'selected'>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const { data: dispatches = [], isLoading: loadingDispatches } = useWhatsAppDispatches();
  const { data: courses = [] } = useCourses();
  const { data: lessons = [] } = useLessons();
  const { data: enrollments = [] } = useEnrollments();
  const createDispatchMutation = useCreateWhatsAppDispatch();

  const relevantEnrollments = useMemo(() => {
    if (!selectedItem) return [] as typeof enrollments;
    if (selectedType === 'curso') {
      return enrollments.filter(e => e.course_id === selectedItem);
    } else {
      const lesson = lessons.find(l => l.id === selectedItem);
      if (!lesson) return [] as typeof enrollments;
      return enrollments.filter(e => e.course_id === lesson.course_id);
    }
  }, [selectedItem, selectedType, enrollments, lessons]);

  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.trim().toLowerCase();
    if (!q) return relevantEnrollments;
    return relevantEnrollments.filter(e =>
      (e.student_name || '').toLowerCase().includes(q) ||
      (e.student_email || '').toLowerCase().includes(q) ||
      (e.student_phone || '').toLowerCase().includes(q)
    );
  }, [relevantEnrollments, recipientSearch]);

  useEffect(() => {
    setSelectedRecipients([]);
    setRecipientMode('all');
    setRecipientSearch('');
  }, [selectedItem, selectedType]);

  // Reset visible list when history changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dispatches]);

  const recipientsCount = recipientMode === 'all' ? relevantEnrollments.length : selectedRecipients.length;

  const handleSendDispatch = async () => {
    if (!selectedItem || !message.trim() || (recipientMode === 'selected' && selectedRecipients.length === 0)) {
      return;
    }

    // Validate scheduled date/time if scheduling is enabled
    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      return;
    }

    let itemName = '';

    if (selectedType === 'curso') {
      const course = courses.find(c => c.id === selectedItem);
      itemName = course?.name || '';
    } else {
      const lesson = lessons.find(l => l.id === selectedItem);
      itemName = lesson?.title || '';
    }

    // Create scheduled_at datetime if scheduled
    let scheduledAt = undefined;
    if (isScheduled && scheduledDate && scheduledTime) {
      scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
    }

    try {
      await createDispatchMutation.mutateAsync({
        type: selectedType,
        item_id: selectedItem,
        item_name: itemName,
        message: message.trim(),
        recipient_mode: recipientMode,
        recipient_ids: recipientMode === 'selected' ? selectedRecipients : undefined,
        is_scheduled: isScheduled,
        scheduled_at: scheduledAt,
      });

      // Reset form
      setSelectedItem('');
      setMessage('');
      setSelectedRecipients([]);
      setRecipientMode('all');
      setRecipientSearch('');
      setIsScheduled(false);
      setScheduledDate('');
      setScheduledTime('');
    } catch (error) {
      console.error('Error sending dispatch:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enviado':
        return 'bg-green-100 text-green-700';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-700';
      case 'erro':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDeliveryRate = (delivered: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  };

  const availableItems = selectedType === 'curso' 
    ? courses.filter(c => c.status === 'Ativo')
    : lessons.filter(l => l.status === 'Ativo');

  return (
    <div className="w-full max-w-full sm:max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 mx-auto">

      {/* Novo Disparo - Mobile optimized */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Send className="w-5 h-5 text-primary" />
            Novo Disparo WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Tipo e Seleção - Stack em mobile */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Disparo
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'curso' | 'aula');
                  setSelectedItem('');
                }}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="curso">Curso</option>
                <option value="aula">Aula</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Selecionar {selectedType === 'curso' ? 'Curso' : 'Aula'}
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Selecione...</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {selectedType === 'curso' ? (item as any).name : (item as any).title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destinatários */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Destinatários
            </label>
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientMode"
                    value="all"
                    checked={recipientMode === 'all'}
                    onChange={() => setRecipientMode('all')}
                    className="mt-0.5 w-4 h-4 text-primary"
                  />
                  <span className="text-sm leading-5">
                    Todos os {selectedType === 'curso' ? 'inscritos do curso' : 'inscritos do curso da aula'}
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientMode"
                    value="selected"
                    checked={recipientMode === 'selected'}
                    onChange={() => setRecipientMode('selected')}
                    className="mt-0.5 w-4 h-4 text-primary"
                  />
                  <span className="text-sm leading-5">Escolher destinatários</span>
                </label>
              </div>

              {recipientMode === 'selected' && selectedItem && (
                <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="Buscar por nome, email ou telefone"
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRecipients(filteredRecipients.map(e => e.id))} 
                        disabled={filteredRecipients.length === 0}
                        className="flex-1 sm:flex-none"
                      >
                        Todos
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRecipients([])} 
                        disabled={selectedRecipients.length === 0}
                        className="flex-1 sm:flex-none"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-border rounded-md bg-background">
                    {filteredRecipients.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 text-center">
                        Nenhum destinatário encontrado.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {filteredRecipients.map((e) => (
                          <label key={e.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer">
                            <Checkbox
                              checked={selectedRecipients.includes(e.id)}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedRecipients((prev) => prev.includes(e.id) ? prev : [...prev, e.id]);
                                else setSelectedRecipients((prev) => prev.filter((id) => id !== e.id));
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{e.student_name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {e.student_email || ''}{e.student_phone ? ` • ${e.student_phone}` : ''}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem que será enviada via WhatsApp..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/500 caracteres
            </div>
          </div>

          {/* Agendamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="scheduled"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="scheduled" className="text-sm font-medium text-foreground">
                Agendar envio automático
              </label>
            </div>

            {isScheduled && (
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  O disparo será enviado automaticamente na data e horário especificados.
                </div>
              </div>
            )}
          </div>

          {/* Resumo de destinatários */}
          {selectedItem && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  Destinatários: {recipientsCount} {recipientMode === 'all' ? 'inscritos' : 'selecionados'}
                </span>
              </div>
            </div>
          )}

          {/* Botão de envio */}
          <Button
            onClick={handleSendDispatch}
            disabled={
              !selectedItem || 
              !message.trim() || 
              (recipientMode === 'selected' && selectedRecipients.length === 0) || 
              (isScheduled && (!scheduledDate || !scheduledTime)) || 
              createDispatchMutation.isPending
            }
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            <Send className="w-5 h-5 mr-2" />
            {createDispatchMutation.isPending ? "Processando..." : isScheduled ? "Agendar Disparo" : "Enviar Disparo"}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Disparos - Mobile optimized */}
      <Accordion type="single" collapsible className="w-full max-w-full min-w-0 overflow-x-hidden" defaultValue="history">
        <AccordionItem value="history" className="border border-border rounded-lg">
          <AccordionTrigger className="text-left px-4 sm:px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full min-w-0">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-semibold truncate">Histórico de Disparos</span>
              <Badge variant="secondary" className="shrink-0">
                {dispatches.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 sm:px-6 pb-4 overflow-x-clip overflow-x-hidden max-w-full w-full no-x-scroll">
            {loadingDispatches ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">Carregando histórico...</div>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum disparo realizado ainda.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 w-full max-w-full min-w-0 overflow-x-hidden">
                  {(() => {
                    const totalPages = Math.ceil(dispatches.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedDispatches = dispatches.slice(startIndex, endIndex);
                    
                    return paginatedDispatches.map((dispatch) => (
                      <Card key={dispatch.id} className="shadow-sm overflow-hidden border-l-4 border-l-primary/20">
                        <CardContent className="p-3 sm:p-4 overflow-hidden min-w-0">
                          {/* Header do dispatch - mobile otimizado */}
                          <div className="space-y-3 mb-4">
                            {/* Título e badges na parte superior */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-sm sm:text-base leading-tight break-anywhere">
                                  {dispatch.item_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                                    {dispatch.type === 'curso' ? 'Curso' : 'Aula'}
                                  </Badge>
                                  <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(dispatch.status)}`}>
                                    {dispatch.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground shrink-0">
                                <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-xs">
                                    {new Date(dispatch.sent_date).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Mensagem */}
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words break-anywhere line-clamp-2 sm:line-clamp-3">
                                {dispatch.message}
                              </p>
                            </div>
                          </div>
                          
                          {/* Estatísticas em grid mobile-first */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-primary/5 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div className="text-lg font-bold text-foreground">
                                {dispatch.recipients_count}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium">Total</div>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="text-lg font-bold text-green-700">
                                {dispatch.delivered_count}
                              </div>
                              <div className="text-xs text-green-600 font-medium">Entregues</div>
                            </div>
                            
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                              <div className="flex items-center justify-center mb-1">
                                <XCircle className="w-4 h-4 text-red-600" />
                              </div>
                              <div className="text-lg font-bold text-red-700">
                                {dispatch.failed_count}
                              </div>
                              <div className="text-xs text-red-600 font-medium">Falhas</div>
                            </div>
                          </div>
                          
                          {/* Barra de progresso melhorada */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-foreground">Taxa de entrega</span>
                              <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                {getDeliveryRate(dispatch.delivered_count, dispatch.recipients_count)}%
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-3 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                                style={{ 
                                  width: `${getDeliveryRate(dispatch.delivered_count, dispatch.recipients_count)}%` 
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>
                
                {dispatches.length > itemsPerPage && (
                  <div className="mt-6 pt-4 border-t border-border w-full max-w-full min-w-0 overflow-x-hidden">
                    <PaginationCustom
                      currentPage={currentPage}
                      totalPages={Math.ceil(dispatches.length / itemsPerPage)}
                      totalItems={dispatches.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(newItemsPerPage) => {
                        setItemsPerPage(newItemsPerPage);
                        setCurrentPage(1);
                      }}
                      itemName="disparos"
                    />
                  </div>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default WhatsAppDispatch;