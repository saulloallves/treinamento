import React, { useState } from 'react';
import { Plus, Video, Users, Calendar, Clock, Play, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '@/components/BaseLayout';
import { useToast } from '@/hooks/use-toast';

const StreamingModule = () => {
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState([
    {
      id: 'demo-room-1',
      name: 'Sala de Teste Principal',
      participants: 0,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      isDemo: true
    },
    {
      id: 'demo-room-2', 
      name: 'Reunião de Apresentação',
      participants: 2,
      status: 'live',
      createdAt: new Date().toISOString(),
      isDemo: true
    }
  ]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a sala de streaming",
        variant: "destructive"
      });
      return;
    }

    const newRoom = {
      id: `room-${Date.now()}`,
      name: roomName,
      participants: 0,
      status: 'waiting' as const,
      createdAt: new Date().toISOString(),
      isDemo: true
    };

    setRooms([newRoom, ...rooms]);
    setRoomName('');
    setCreateRoomDialog(false);
    
    toast({
      title: "Sala criada!",
      description: `Sala "${roomName}" criada com sucesso`,
    });
  };

  const joinRoom = (roomId: string) => {
    navigate(`/aula-ao-vivo/${roomId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'waiting': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'AO VIVO';
      case 'waiting': return 'AGUARDANDO';
      case 'ended': return 'ENCERRADA';
      default: return 'INATIVA';
    }
  };

  return (
    <BaseLayout title="Módulo de Streaming"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Módulo de Streaming</h1>
            <p className="text-muted-foreground">
              Crie e gerencie salas de streaming para testes e aulas ao vivo
            </p>
          </div>
          <Button onClick={() => setCreateRoomDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Sala
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => joinRoom('demo-test')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Teste Rápido</h3>
                  <p className="text-sm text-muted-foreground">Entrar direto para testar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => navigate('/streaming-demo')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Ver Demo</h3>
                  <p className="text-sm text-muted-foreground">Conhecer funcionalidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105" onClick={() => setCreateRoomDialog(true)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Criar Sala</h3>
                  <p className="text-sm text-muted-foreground">Nova sala personalizada</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105 border-2 border-dashed border-muted-foreground/25">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Agendar Reunião</h3>
                  <p className="text-sm text-muted-foreground">Em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Salas Disponíveis</h2>
          
          {rooms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma sala criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira sala de streaming para começar
                </p>
                <Button onClick={() => setCreateRoomDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sala
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-all hover:scale-105 border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate flex items-center gap-2">
                          {room.name}
                          {room.status === 'live' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          Criada {new Date(room.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${getStatusColor(room.status)} text-white text-xs px-3 py-1 rounded-full`}
                      >
                        {getStatusText(room.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{room.participants}</span>
                        </div>
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                          ID: {room.id}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => joinRoom(room.id)}
                          className="gap-2 flex-1"
                        >
                          <Video className="h-3 w-3" />
                          Entrar na Sala
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const link = `${window.location.origin}/aula-ao-vivo/${room.id}`;
                            try {
                              await navigator.clipboard.writeText(link);
                              toast({
                                title: "Link copiado!",
                                description: "O link da sala foi copiado para a área de transferência"
                              });
                            } catch (error) {
                              toast({
                                title: "Erro ao copiar",
                                description: "Não foi possível copiar o link",
                                variant: "destructive"
                              });
                            }
                          }}
                          title="Copiar link da sala"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      {room.status === 'live' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm text-red-700 font-medium">
                              🔴 Transmissão ao vivo em andamento
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Features Info */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Disponíveis</CardTitle>
            <CardDescription>
              Teste todas as funcionalidades do sistema de streaming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Video className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Vídeo HD</h4>
                <p className="text-xs text-muted-foreground">Qualidade adaptável</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm">Múltiplos Usuários</h4>
                <p className="text-xs text-muted-foreground">Até 50 participantes</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">💬</div>
                <h4 className="font-medium text-sm">Chat ao Vivo</h4>
                <p className="text-xs text-muted-foreground">Mensagens em tempo real</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">📺</div>
                <h4 className="font-medium text-sm">Compartilhar Tela</h4>
                <p className="text-xs text-muted-foreground">Apresentações e demos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={createRoomDialog} onOpenChange={setCreateRoomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Sala de Streaming
            </DialogTitle>
            <DialogDescription>
              Crie uma nova sala para testar o sistema de streaming
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roomName">Nome da Sala</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ex: Reunião de Teste, Apresentação Demo..."
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-1">💡 Dica</h4>
              <p className="text-xs text-muted-foreground">
                Você pode criar quantas salas quiser para testar diferentes cenários
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoomDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRoom} disabled={!roomName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Sala
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BaseLayout>
  );
};

export default StreamingModule;