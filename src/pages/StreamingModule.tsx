import React, { useState } from 'react';
import { Plus, Video, Users, Calendar, Clock, Play, Copy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '@/components/BaseLayout';
import { useToast } from '@/hooks/use-toast';

const StreamingModule = () => {
  const [createRoomDialog, setCreateRoomDialog] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState(() => {
    // Initialize from localStorage if available
    const storedRooms = localStorage.getItem('streamingRooms');
    if (storedRooms) {
      try {
        const parsed = JSON.parse(storedRooms);
        // Filter out demo/fake rooms and keep only real user-created rooms
        return parsed.filter((room: any) => !room.isDemo);
      } catch (error) {
        console.error('Error parsing stored rooms:', error);
        return [];
      }
    }
    
    // Start with empty rooms array - no fake data
    return [];
  });
  
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
      isDemo: false // Real user-created room
    };

    const updatedRooms = [newRoom, ...rooms];
    setRooms(updatedRooms);
    localStorage.setItem('streamingRooms', JSON.stringify(updatedRooms));
    
    setRoomName('');
    setCreateRoomDialog(false);
    
    toast({
      title: "Sala criada!",
      description: `Sala "${roomName}" criada com sucesso`,
    });
  };

  // Refresh rooms when component mounts or when returning from a room
  React.useEffect(() => {
    const handleFocus = () => {
      const storedRooms = localStorage.getItem('streamingRooms');
      if (storedRooms) {
        try {
          const parsed = JSON.parse(storedRooms);
          // Filter out demo/fake rooms and keep only real user-created rooms
          setRooms(parsed.filter((room: any) => !room.isDemo));
        } catch (error) {
          console.error('Error parsing stored rooms:', error);
          setRooms([]);
        }
      }
    };

    // Also clean existing data on mount
    const storedRooms = localStorage.getItem('streamingRooms');
    if (storedRooms) {
      try {
        const parsed = JSON.parse(storedRooms);
        const realRooms = parsed.filter((room: any) => !room.isDemo);
        localStorage.setItem('streamingRooms', JSON.stringify(realRooms));
        setRooms(realRooms);
      } catch (error) {
        console.error('Error cleaning stored rooms:', error);
        localStorage.removeItem('streamingRooms');
        setRooms([]);
      }
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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
    <BaseLayout title="Módulo de Streaming">
      <div className="space-y-8">
        {/* Compact Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 rounded-xl p-4 border border-border/50">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                <Video className="h-3 w-3" />
                Sistema de Streaming
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Módulo de Streaming
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Crie e gerencie salas de streaming para testes e aulas ao vivo
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setCreateRoomDialog(true)} 
              size="sm"
              className="gap-2 px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              Nova Sala
            </Button>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <div className="w-full h-full bg-gradient-to-bl from-primary/30 to-transparent rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Two-Column Professional Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content (60%) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quick Actions - Compact Dashboard Style */}
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-bold mb-1">Ações Rápidas</h2>
                <p className="text-sm text-muted-foreground">Acesse rapidamente as principais funcionalidades</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-border/50 bg-gradient-to-r from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/15" onClick={() => joinRoom('demo-test')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                        <Play className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">Teste Rápido</h3>
                        <p className="text-xs text-muted-foreground">Testar funcionalidades</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-border/50 bg-gradient-to-r from-blue-500/5 to-blue-500/10 hover:from-blue-500/10 hover:to-blue-500/15" onClick={() => navigate('/streaming-demo')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Video className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">Ver Demo</h3>
                        <p className="text-xs text-muted-foreground">Conhecer funcionalidades</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-border/50 bg-gradient-to-r from-purple-500/5 to-purple-500/10 hover:from-purple-500/10 hover:to-purple-500/15" onClick={() => setCreateRoomDialog(true)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                        <Plus className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">Criar Sala</h3>
                        <p className="text-xs text-muted-foreground">Nova sala personalizada</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border-2 border-dashed border-muted-foreground/25 bg-gradient-to-r from-amber-500/5 to-amber-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">Agendar</h3>
                        <p className="text-xs text-muted-foreground">Em breve</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Collapsible Rooms List */}
            <Accordion type="single" collapsible className="w-full" defaultValue="rooms">
              <AccordionItem value="rooms">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Salas Disponíveis</h2>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {rooms.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-4">Gerencie suas salas de streaming criadas</p>
                    
                    {rooms.length === 0 ? (
                      <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/20 to-muted/10">
                        <CardContent className="p-8 text-center">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="p-4 bg-muted/30 rounded-full w-fit mx-auto">
                              <Video className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">Nenhuma sala criada</h3>
                              <p className="text-sm text-muted-foreground">
                                Crie sua primeira sala de streaming para começar
                              </p>
                            </div>
                            <Button 
                              onClick={() => setCreateRoomDialog(true)}
                              size="default" 
                              className="gap-2 mt-4"
                            >
                              <Plus className="h-4 w-4" />
                              Criar Primeira Sala
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {rooms.map((room) => (
                          <Card key={room.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border-border/50 bg-gradient-to-br from-card to-muted/10">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0 space-y-1">
                                  <CardTitle className="text-base truncate flex items-center gap-2">
                                    <span>{room.name}</span>
                                    {room.status === 'live' && (
                                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                    )}
                                  </CardTitle>
                                  <CardDescription className="flex items-center gap-2 text-xs">
                                    <Clock className="h-3 w-3" />
                                    Criada às {new Date(room.createdAt).toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </CardDescription>
                                </div>
                                <Badge 
                                  className={`${getStatusColor(room.status)} text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm`}
                                >
                                  {getStatusText(room.status)}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0 space-y-3">
                              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs font-medium">{room.participants} participantes</span>
                                </div>
                                <div className="text-xs bg-background px-2 py-1 rounded border font-mono">
                                  ID: {room.id.split('-')[1]}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => joinRoom(room.id)}
                                  className="gap-2 flex-1 font-semibold"
                                >
                                  <Video className="h-3 w-3" />
                                  Entrar
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
                                  className="px-3"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>

                              {room.status === 'live' && (
                                <div className="p-2 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                    <span className="text-xs text-red-700 font-semibold">
                                      🔴 Transmissão ao vivo
                                    </span>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Column - Secondary Content (40%) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Features Info - Compact Sidebar Style */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-muted/10 shadow-lg sticky top-6">
              <CardHeader className="pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Funcionalidades</CardTitle>
                  <CardDescription className="text-sm">
                    Recursos disponíveis do sistema
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="group p-3 bg-gradient-to-r from-blue-500/5 to-blue-600/10 rounded-lg border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Video className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">Vídeo HD</h4>
                      <p className="text-xs text-muted-foreground">Qualidade até 1080p</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-3 bg-gradient-to-r from-green-500/5 to-green-600/10 rounded-lg border border-green-500/20 hover:border-green-500/30 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">Múltiplos Usuários</h4>
                      <p className="text-xs text-muted-foreground">Users ilimitados</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-3 bg-gradient-to-r from-purple-500/5 to-purple-600/10 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <div className="h-4 w-4 flex items-center justify-center text-sm">💬</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">Chat ao Vivo</h4>
                      <p className="text-xs text-muted-foreground">Mensagens em tempo real</p>
                    </div>
                  </div>
                </div>
                
                <div className="group p-3 bg-gradient-to-r from-orange-500/5 to-orange-600/10 rounded-lg border border-orange-500/20 hover:border-orange-500/30 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <div className="h-4 w-4 flex items-center justify-center text-sm">📺</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">Compartilhar Tela</h4>
                      <p className="text-xs text-muted-foreground">Apresentações e demos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Expansion Area */}
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/5 to-muted/10">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-full w-fit mx-auto">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Próximas Funcionalidades</h3>
                    <p className="text-xs text-muted-foreground">
                      Estatísticas de uso, calendário de agendamentos e mais recursos em breve
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
