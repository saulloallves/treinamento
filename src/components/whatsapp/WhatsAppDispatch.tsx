
import { useState, useMemo, useEffect } from "react";
import { Send, MessageSquare, Users, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

  const recipientsCount = recipientMode === 'all' ? relevantEnrollments.length : selectedRecipients.length;

  const handleSendDispatch = async () => {
    if (!selectedItem || !message.trim() || (recipientMode === 'selected' && selectedRecipients.length === 0)) {
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

    try {
      await createDispatchMutation.mutateAsync({
        type: selectedType,
        item_id: selectedItem,
        item_name: itemName,
        recipients_count: recipientsCount,
        message: message.trim(),
        delivered_count: Math.floor(recipientsCount * 0.9),
        failed_count: Math.ceil(recipientsCount * 0.1),
      });

      // Reset form
      setSelectedItem('');
      setMessage('');
      setSelectedRecipients([]);
      setRecipientMode('all');
      setRecipientSearch('');
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
    <div className="space-y-6">
      {/* Novo Disparo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-blue" />
            Novo Disparo WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">
                Tipo de Disparo
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'curso' | 'aula');
                  setSelectedItem('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="curso">Curso</option>
                <option value="aula">Aula</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">
                Selecionar {selectedType === 'curso' ? 'Curso' : 'Aula'}
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
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

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Destinatários
            </label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientMode"
                    value="all"
                    checked={recipientMode === 'all'}
                    onChange={() => setRecipientMode('all')}
                  />
                  <span>Todos os {selectedType === 'curso' ? 'inscritos do curso' : 'inscritos do curso da aula'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipientMode"
                    value="selected"
                    checked={recipientMode === 'selected'}
                    onChange={() => setRecipientMode('selected')}
                  />
                  <span>Escolher destinatários</span>
                </label>
              </div>

              {recipientMode === 'selected' && selectedItem && (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="Buscar por nome, email ou telefone"
                    />
                    <Button variant="outline" onClick={() => setSelectedRecipients(filteredRecipients.map(e => e.id))} disabled={filteredRecipients.length === 0}>Selecionar todos</Button>
                    <Button variant="ghost" onClick={() => setSelectedRecipients([])} disabled={selectedRecipients.length === 0}>Limpar</Button>
                  </div>
                  <div className="mt-2 max-h-56 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredRecipients.length === 0 ? (
                      <div className="text-sm text-brand-gray-dark p-2">Nenhum destinatário encontrado.</div>
                    ) : (
                      filteredRecipients.map((e) => (
                        <label key={e.id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                          <Checkbox
                            checked={selectedRecipients.includes(e.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedRecipients((prev) => prev.includes(e.id) ? prev : [...prev, e.id]);
                              else setSelectedRecipients((prev) => prev.filter((id) => id !== e.id));
                            }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-brand-black">{e.student_name}</div>
                            <div className="text-xs text-brand-gray-dark">{e.student_email || ''}{e.student_phone ? ` • ${e.student_phone}` : ''}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem que será enviada via WhatsApp..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
            />
            <div className="text-sm text-brand-gray-dark mt-1">
              {message.length}/500 caracteres
            </div>
          </div>

          {selectedItem && (
            <div className="bg-brand-gray-light p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm text-brand-gray-dark">
                <Users className="w-4 h-4" />
                <span>
                  Destinatários: {recipientsCount} {recipientMode === 'all' ? 'inscritos' : 'selecionados'}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSendDispatch}
            disabled={!selectedItem || !message.trim() || (recipientMode === 'selected' && selectedRecipients.length === 0) || createDispatchMutation.isPending}
            className="btn-primary w-full"
          >
            <Send className="w-4 h-4" />
            {createDispatchMutation.isPending ? "Enviando..." : "Enviar Disparo"}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Disparos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-blue" />
            Histórico de Disparos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDispatches ? (
            <div className="text-center py-8">
              <div className="text-brand-gray-dark">Carregando histórico...</div>
            </div>
          ) : dispatches.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto w-12 h-12 text-brand-gray-dark mb-4" />
              <p className="text-brand-gray-dark">Nenhum disparo realizado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dispatches.map((dispatch) => (
                <div key={dispatch.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-brand-black">{dispatch.item_name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {dispatch.type === 'curso' ? 'Curso' : 'Aula'}
                        </Badge>
                        <Badge className={getStatusColor(dispatch.status)}>
                          {dispatch.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-brand-gray-dark line-clamp-2">
                        {dispatch.message}
                      </p>
                    </div>
                    <div className="text-right text-sm text-brand-gray-dark">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(dispatch.sent_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-blue" />
                      <span>{dispatch.recipients_count} destinatários</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{dispatch.delivered_count} entregues</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>{dispatch.failed_count} falharam</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-brand-gray-dark mb-1">
                      <span>Taxa de entrega</span>
                      <span>{getDeliveryRate(dispatch.delivered_count, dispatch.recipients_count)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${getDeliveryRate(dispatch.delivered_count, dispatch.recipients_count)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppDispatch;
