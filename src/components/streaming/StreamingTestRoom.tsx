import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  Users, 
  MessageCircle, 
  Send,
  Play,
  Square,
  Settings,
  PhoneOff,
  Copy,
  Share2,
  Link2,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useIsProfessor } from '@/hooks/useIsProfessor';

const StreamingTestRoom = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: isProfessor } = useIsProfessor(user?.id);
  
  const [roomName] = useState(lessonId === 'demo-test' ? 'Sala de Teste Rápido' : `Sala ${lessonId}`);
  const [isConnected, setIsConnected] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEndMeetingDialog, setShowEndMeetingDialog] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [participants] = useState([
    {
      id: 'user-1',
      name: user?.email?.split('@')[0] || 'Você',
      isInstructor: true,
      videoEnabled: true,
      audioEnabled: true,
      screenSharing: false
    },
    {
      id: 'user-2', 
      name: 'Demo User',
      isInstructor: false,
      videoEnabled: true,
      audioEnabled: false,
      screenSharing: false
    }
  ]);
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      participantId: 'system',
      participantName: 'Sistema',
      message: 'Bem-vindo à sala de streaming! Esta é uma demonstração das funcionalidades.',
      timestamp: new Date().toISOString()
    }
  ]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    setIsConnected(true);
    
    toast({
      title: "Conectado à sala",
      description: "Você entrou na sala de streaming de teste",
    });

    return () => {
      cleanupMedia();
    };
  }, []);

  const initializeMedia = async () => {
    // Não inicializar mídia automaticamente - apenas quando necessário
    console.log('Media initialization skipped - will be requested when needed');
  };

  const cleanupMedia = () => {
    console.log('Cleaning up media resources...');
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`Stopping ${track.kind} track`);
        track.stop();
      });
      setLocalStream(null);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    // Reset states
    setVideoEnabled(false);
    setAudioEnabled(false);
    setScreenSharing(false);
    setIsStreaming(false);
    
    console.log('Media cleanup completed');
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setVideoEnabled(true);
      setAudioEnabled(true);
      
      toast({
        title: "Câmera conectada",
        description: "Sua câmera e microfone foram ativados",
      });
    } catch (error) {
      console.error('Error accessing media:', error);
      toast({
        title: "Erro de mídia",
        description: "Não foi possível acessar câmera/microfone. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
        
        toast({
          title: videoEnabled ? "Câmera desligada" : "Câmera ligada",
          description: videoEnabled ? "Sua câmera foi desabilitada" : "Sua câmera foi habilitada"
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
        
        toast({
          title: audioEnabled ? "Microfone mutado" : "Microfone ativo",
          description: audioEnabled ? "Seu microfone foi desabilitado" : "Seu microfone foi habilitado"
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setScreenSharing(true);
        toast({
          title: "Compartilhamento iniciado",
          description: "Sua tela está sendo compartilhada"
        });

        screenStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
          toast({
            title: "Compartilhamento encerrado",
            description: "O compartilhamento de tela foi interrompido"
          });
        };
      } catch (error) {
        toast({
          title: "Erro no compartilhamento",
          description: "Não foi possível compartilhar a tela",
          variant: "destructive"
        });
      }
    } else {
      setScreenSharing(false);
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  };

  const toggleStreaming = () => {
    const newStreamingState = !isStreaming;
    setIsStreaming(newStreamingState);
    
    // Update room status in parent component if possible
    const updateRoomStatus = () => {
      const rooms = JSON.parse(localStorage.getItem('streamingRooms') || '[]');
      const updatedRooms = rooms.map((room: any) => 
        room.id === lessonId 
          ? { ...room, status: newStreamingState ? 'live' : 'waiting' }
          : room
      );
      localStorage.setItem('streamingRooms', JSON.stringify(updatedRooms));
    };
    
    updateRoomStatus();
    
    toast({
      title: newStreamingState ? "Transmissão iniciada" : "Transmissão encerrada",
      description: newStreamingState ? "Sua transmissão está ao vivo" : "A transmissão foi interrompida"
    });
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        participantId: 'user-1',
        participantName: user?.email?.split('@')[0] || 'Você',
        message: chatMessage,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoomLink = () => {
    return `${window.location.origin}/aula-ao-vivo/${lessonId}`;
  };

  const copyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(getRoomLink());
      toast({
        title: "Link copiado!",
        description: "O link da reunião foi copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const shareRoom = async () => {
    const roomLink = getRoomLink();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reunião: ${roomName}`,
          text: `Você foi convidado para uma reunião de streaming`,
          url: roomLink,
        });
      } catch (error) {
        // Fallback para copiar se share falhar
        copyRoomLink();
      }
    } else {
      copyRoomLink();
    }
  };

  const canEndMeeting = isAdmin || isProfessor;

  const endMeeting = () => {
    // Stop streaming first
    setIsStreaming(false);
    
    // Update room status in storage
    const updateRoomStatus = () => {
      const rooms = JSON.parse(localStorage.getItem('streamingRooms') || '[]');
      const updatedRooms = rooms.map((room: any) => 
        room.id === lessonId 
          ? { ...room, status: 'ended', participants: 0 }
          : room
      );
      localStorage.setItem('streamingRooms', JSON.stringify(updatedRooms));
    };
    
    updateRoomStatus();
    
    setMeetingEnded(true);
    setIsConnected(false);
    cleanupMedia();
    
    toast({
      title: "Reunião finalizada",
      description: "A reunião foi encerrada pelo organizador",
      variant: "destructive"
    });

    // Redirect after cleanup
    setTimeout(() => {
      navigate('/streaming');
    }, 2000);
  };

  const leaveMeeting = () => {
    // Cleanup media before leaving
    cleanupMedia();
    
    toast({
      title: "Saiu da reunião",
      description: "Você saiu da sala de streaming",
    });
    
    navigate('/streaming');
  };

  // Se a reunião foi finalizada, mostrar tela de encerramento
  if (meetingEnded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <PhoneOff className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold">Reunião Finalizada</h2>
          <p className="text-muted-foreground">A reunião foi encerrada pelo organizador</p>
          <Button onClick={() => navigate('/streaming')} className="mt-4">
            Voltar ao Módulo de Streaming
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{roomName}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      {isConnected ? 'Conectado' : 'Desconectado'}
                    </div>
                    {isStreaming && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <Badge variant="destructive" className="animate-pulse text-xs">
                          🔴 AO VIVO
                        </Badge>
                      </>
                    )}
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={shareRoom}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className={`gap-2 ${showParticipants ? 'bg-accent' : ''}`}
              >
                <Users className="h-4 w-4" />
                {participants.length}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className={`gap-2 ${showChat ? 'bg-accent' : ''}`}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
              
              {canEndMeeting && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowEndMeetingDialog(true)}
                  className="gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  Finalizar Reunião
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900">
          {/* Main Video */}
          <div className="absolute inset-4">
            <div className="w-full h-full rounded-lg overflow-hidden bg-gray-800 relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!localStream ? (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">{user?.email?.split('@')[0] || 'Você'}</p>
                    <p className="text-sm text-gray-400 mb-4">Câmera desconectada</p>
                    <Button 
                      onClick={startMedia}
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-white hover:text-black"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Conectar Câmera
                    </Button>
                  </div>
                </div>
              ) : !videoEnabled ? (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">{user?.email?.split('@')[0] || 'Você'}</p>
                    <p className="text-sm text-gray-400">Câmera desligada</p>
                  </div>
                </div>
              ) : null}

              {/* Video Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {user?.email?.split('@')[0] || 'Você'}
                    </span>
                    {screenSharing && (
                      <Badge variant="secondary" className="text-xs">
                        <Monitor className="h-3 w-3 mr-1" />
                        Compartilhando
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {audioEnabled ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4 text-red-400" />
                    )}
                    {videoEnabled ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <VideoOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border">
              <Button
                variant={audioEnabled ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleAudio}
                className="rounded-full w-12 h-12 p-0 hover:scale-105 transition-transform"
                title={audioEnabled ? "Desligar microfone" : "Ligar microfone"}
                disabled={!localStream}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={videoEnabled ? "secondary" : "destructive"}
                size="sm"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0 hover:scale-105 transition-transform"
                title={videoEnabled ? "Desligar câmera" : "Ligar câmera"}
                disabled={!localStream}
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={screenSharing ? "default" : "secondary"}
                size="sm"
                onClick={toggleScreenShare}
                className="rounded-full w-12 h-12 p-0 hover:scale-105 transition-transform"
                title={screenSharing ? "Parar compartilhamento" : "Compartilhar tela"}
                disabled={!localStream}
              >
                {screenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              </Button>

              <div className="w-px h-8 bg-border mx-3" />

              <Button
                onClick={toggleStreaming}
                className={`rounded-full px-6 py-3 font-medium transition-all hover:scale-105 ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                }`}
                title={isStreaming ? "Parar transmissão" : "Iniciar transmissão"}
              >
                {isStreaming ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Parar Transmissão
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Transmissão
                  </>
                )}
              </Button>

              <div className="w-px h-8 bg-border mx-3" />

              <Button
                variant="destructive"
                size="sm"
                onClick={leaveMeeting}
                className="rounded-full w-12 h-12 p-0 hover:scale-105 transition-transform"
                title="Sair da reunião"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="w-80 border-l bg-card">
            <Card className="h-full rounded-none border-0">
              <CardHeader>
                <CardTitle className="text-lg">Participantes ({participants.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {participant.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{participant.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {participant.audioEnabled ? (
                              <Mic className="h-3 w-3 text-green-500" />
                            ) : (
                              <MicOff className="h-3 w-3 text-red-500" />
                            )}
                            {participant.videoEnabled ? (
                              <Video className="h-3 w-3 text-green-500" />
                            ) : (
                              <VideoOff className="h-3 w-3 text-red-500" />
                            )}
                            {participant.screenSharing && (
                              <Monitor className="h-3 w-3 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {showChat && (
          <div className="w-80 border-l bg-card">
            <Card className="h-full rounded-none border-0 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Chat da Aula</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{msg.participantName}</span>
                          <span>{formatTime(msg.timestamp)}</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button size="sm" onClick={sendChatMessage} disabled={!chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartilhar Reunião
            </DialogTitle>
            <DialogDescription>
              Compartilhe este link para que outras pessoas possam entrar na reunião
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link da reunião
                </Label>
                <Input
                  id="link"
                  value={getRoomLink()}
                  readOnly
                  className="h-10"
                />
              </div>
              <Button type="button" size="sm" className="px-3" onClick={copyRoomLink}>
                <span className="sr-only">Copiar</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Qualquer pessoa com este link pode entrar na reunião</li>
                    <li>• A reunião ficará ativa enquanto houver participantes</li>
                    <li>• Use os controles para gerenciar sua transmissão</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowShareDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Meeting Dialog */}
      <Dialog open={showEndMeetingDialog} onOpenChange={setShowEndMeetingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <PhoneOff className="h-5 w-5" />
              Finalizar Reunião
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja finalizar esta reunião? Todos os participantes serão desconectados e a reunião será encerrada permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-destructive/10 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Esta ação não pode ser desfeita:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Todos os participantes serão desconectados</li>
                  <li>• A transmissão será interrompida imediatamente</li>
                  <li>• O histórico do chat será perdido</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEndMeetingDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowEndMeetingDialog(false);
                endMeeting();
              }}
            >
              Finalizar Reunião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamingTestRoom;