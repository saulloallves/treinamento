import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WebRTCManager, StreamParticipant, createWebRTCManager } from '@/utils/webRTC';
import VideoGrid from './VideoGrid';
import StreamControls from './StreamControls';
import ParticipantsList from './ParticipantsList';
import ChatPanel from './ChatPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  message: string;
  timestamp: string;
}

const LiveStreamRoom = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<any>(null);
  const [participants, setParticipants] = useState<StreamParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'waiting' | 'live' | 'ended'>('waiting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!lessonId || !user) return;

    loadLessonData();
    initializeWebRTC();

    return () => {
      webRTCManagerRef.current?.cleanup();
    };
  }, [lessonId, user]);

  const loadLessonData = async () => {
    try {
      const { data: lessonData, error } = await supabase
        .from('lessons')
        .select(`
          *,
          courses (
            name,
            instructor
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      setLesson(lessonData);
      setStreamStatus((lessonData.live_stream_status as 'waiting' | 'live' | 'ended') || 'waiting');
      
      // Check if user is instructor
      const isLessonCreator = lessonData.created_by === user.id;
      setIsInstructor(isLessonCreator);

    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da aula",
        variant: "destructive",
      });
    }
  };

  const initializeWebRTC = async () => {
    if (!user || !lessonId) return;

    const webRTCManager = createWebRTCManager(
      lessonId,
      user.id,
      setParticipants,
      handleChatMessage
    );

    webRTCManagerRef.current = webRTCManager;

    // Initialize local media stream
    const stream = await webRTCManager.initializeLocalStream(true, true);
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
    }

    // Join the room
    await joinStreamRoom();
  };

  const joinStreamRoom = async () => {
    if (!user || !lessonId) return;

    try {
      const { error } = await supabase
        .from('live_participants')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          user_name: user.email || 'Participante',
          is_instructor: isInstructor,
          audio_enabled: true,
          video_enabled: true
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast({
        title: "Conectado",
        description: "Você entrou na sala de aula ao vivo",
      });

    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar na sala",
        variant: "destructive",
      });
    }
  };

  const startStream = async () => {
    if (!isInstructor || !lessonId) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          live_stream_status: 'live' 
        })
        .eq('id', lessonId);

      if (error) throw error;

      setStreamStatus('live');
      toast({
        title: "Transmissão iniciada",
        description: "A aula ao vivo está no ar!",
      });

    } catch (error) {
      console.error('Error starting stream:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a transmissão",
        variant: "destructive",
      });
    }
  };

  const endStream = async () => {
    if (!isInstructor || !lessonId) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          live_stream_status: 'ended' 
        })
        .eq('id', lessonId);

      if (error) throw error;

      setStreamStatus('ended');
      webRTCManagerRef.current?.cleanup();
      
      toast({
        title: "Transmissão encerrada",
        description: "A aula ao vivo foi finalizada",
      });

    } catch (error) {
      console.error('Error ending stream:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a transmissão",
        variant: "destructive",
      });
    }
  };

  const handleChatMessage = (message: any) => {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      participantId: message.participantId,
      participantName: message.participantName || 'Participante',
      message: message.data.message,
      timestamp: message.data.timestamp
    };
    setChatMessages(prev => [...prev, chatMessage]);
  };

  const toggleAudio = (enabled: boolean) => {
    webRTCManagerRef.current?.toggleAudio(enabled);
  };

  const toggleVideo = (enabled: boolean) => {
    webRTCManagerRef.current?.toggleVideo(enabled);
  };

  const startScreenShare = async () => {
    const screenStream = await webRTCManagerRef.current?.startScreenShare();
    if (screenStream && localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
    }
  };

  const stopScreenShare = () => {
    webRTCManagerRef.current?.stopScreenShare();
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">
                {lesson.courses?.name} - {streamStatus === 'live' ? 'Ao Vivo' : 
                  streamStatus === 'waiting' ? 'Aguardando' : 'Encerrada'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4 mr-2" />
              Participantes ({participants.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Area */}
        <div className="flex-1 relative">
          <VideoGrid 
            participants={participants}
            localStream={localStream}
            localVideoRef={localVideoRef}
          />
          
          {/* Stream Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <StreamControls
              isInstructor={isInstructor}
              streamStatus={streamStatus}
              onStartStream={startStream}
              onEndStream={endStream}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
              onStartScreenShare={startScreenShare}
              onStopScreenShare={stopScreenShare}
            />
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="w-80 border-l bg-card">
            <ParticipantsList 
              participants={participants}
              isInstructor={isInstructor}
            />
          </div>
        )}

        {showChat && (
          <div className="w-80 border-l bg-card">
            <ChatPanel 
              messages={chatMessages}
              onSendMessage={(message) => webRTCManagerRef.current?.sendChatMessage(message)}
              currentUserId={user?.id || ''}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStreamRoom;