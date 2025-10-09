import React, { useState } from 'react';
import { Plus, Video, Users, Calendar, Clock, Play, Copy, Trash2 } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Módulo de Streaming</h1>
                <p className="text-xs text-muted-foreground">Gerencie salas de streaming e aulas ao vivo</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setCreateRoomDialog(true)} 
              size="sm"
              className="h-8"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Nova Sala
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ações Rápidas</h2>
            <p className="text-muted-foreground">Acesse rapidamente as principais funcionalidades do sistema</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-border/50 bg-gradient-to-br from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/20" onClick={() => joinRoom('demo-test')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-colors">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">Teste Rápido</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Entrar direto para testar funcionalidades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-border/50 bg-gradient-to-br from-blue-500/5 to-blue-500/10 hover:from-blue-500/10 hover:to-blue-500/20" onClick={() => navigate('/streaming-demo')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">Ver Demo</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Conhecer todas as funcionalidades disponíveis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-border/50 bg-gradient-to-br from-purple-500/5 to-purple-500/10 hover:from-purple-500/10 hover:to-purple-500/20" onClick={() => setCreateRoomDialog(true)}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">Criar Sala</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Nova sala personalizada para suas necessidades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg">Agendar Reunião</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">Em breve disponível</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rooms List */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Salas Disponíveis</h2>
            <p className="text-muted-foreground">Gerencie suas salas de streaming criadas</p>
          </div>
          
          {rooms.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-muted/20 to-muted/10">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-6 bg-muted/30 rounded-full w-fit mx-auto">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Nenhuma sala criada</h3>
                    <p className="text-muted-foreground">
                      Crie sua primeira sala de streaming para começar a realizar transmissões ao vivo
                    </p>
                  </div>
                  <Button 
                    onClick={() => setCreateRoomDialog(true)}
                    size="lg" 
                    className="gap-2 mt-6"
                  >
                    <Plus className="h-5 w-5" />
                    Criar Primeira Sala
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <Card key={room.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 bg-gradient-to-br from-card to-muted/10">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <CardTitle className="text-xl truncate flex items-center gap-3">
                          <span>{room.name}</span>
                          {room.status === 'live' && (
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Criada às {new Date(room.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`${getStatusColor(room.status)} text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm`}
                      >
                        {getStatusText(room.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{room.participants} participantes</span>
                      </div>
                      <div className="text-xs bg-background px-3 py-1.5 rounded-lg border font-mono">
                        ID: {room.id.split('-')[1]}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button 
                        size="default" 
                        onClick={() => joinRoom(room.id)}
                        className="gap-2 flex-1 font-semibold"
                      >
                        <Video className="h-4 w-4" />
                        Entrar na Sala
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="default"
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
                        className="px-4"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => {
                          // Remove room from state
                          const updatedRooms = rooms.filter(r => r.id !== room.id);
                          setRooms(updatedRooms);
                          
                          // Update localStorage with the filtered rooms
                          if (updatedRooms.length === 0) {
                            localStorage.removeItem('streamingRooms');
                          } else {
                            localStorage.setItem('streamingRooms', JSON.stringify(updatedRooms));
                          }
                          
                          toast({
                            title: "Sala excluída!",
                            description: `A sala "${room.name}" foi removida permanentemente`
                          });
                        }}
                        title="Excluir sala"
                        className="px-4 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {room.status === 'live' && (
                      <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                          <span className="text-sm text-red-700 font-semibold">
                            🔴 Transmissão ao vivo em andamento
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
