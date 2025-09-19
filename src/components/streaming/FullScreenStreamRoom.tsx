import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { WebRTCManager, StreamParticipant, createWebRTCManager } from '@/utils/webRTC';
import ProfessionalVideoGrid from './ProfessionalVideoGrid';
import ProfessionalStreamControls from './ProfessionalStreamControls';
import StreamingChat from './StreamingChat';
import HostControls from './HostControls';
import PreviewModal from './PreviewModal';
import StreamingReactions from './StreamingReactions';
import { Button } from '@/components/ui/button';
import { X, Users, MessageCircle, Settings } from 'lucide-react';

interface ChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  message: string;
  timestamp: string;
}

type ViewMode = 'gallery' | 'speaker' | 'presentation';

const FullScreenStreamRoom = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<any>(null);
  const [participants, setParticipants] = useState<StreamParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showHostControls, setShowHostControls] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'waiting' | 'live' | 'ended'>('waiting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [allMuted, setAllMuted] = useState(false);
  const [participantsBlocked, setParticipantsBlocked] = useState(false);
  
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Enter fullscreen on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(console.log);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.log);
      }
    };
  }, []);

  useEffect(() => {
    if (!lessonId || !user) return;

    loadLessonData();
    
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
    const stream = await webRTCManager.initializeLocalStream(audioEnabled, videoEnabled);
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
          audio_enabled: audioEnabled,
          video_enabled: videoEnabled
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

  const handlePreviewComplete = async (audioEnabled: boolean, videoEnabled: boolean) => {
    setAudioEnabled(audioEnabled);
    setVideoEnabled(videoEnabled);
    setShowPreview(false);
    await initializeWebRTC();
  };

  const handleLeaveRoom = () => {
    webRTCManagerRef.current?.cleanup();
    navigate(-1);
  };

  const handleStartStream = async () => {
    if (!isInstructor || !lessonId) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ live_stream_status: 'live' })
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

  const handleEndStream = async () => {
    if (!isInstructor || !lessonId) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ live_stream_status: 'ended' })
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

  const handleToggleAudio = (enabled: boolean) => {
    setAudioEnabled(enabled);
    webRTCManagerRef.current?.toggleAudio(enabled);
  };

  const handleToggleVideo = (enabled: boolean) => {
    setVideoEnabled(enabled);
    webRTCManagerRef.current?.toggleVideo(enabled);
  };

  const handleStartScreenShare = async () => {
    const screenStream = await webRTCManagerRef.current?.startScreenShare();
    if (screenStream && localVideoRef.current) {
      localVideoRef.current.srcObject = screenStream;
      setScreenSharing(true);
    }
  };

  const handleStopScreenShare = () => {
    webRTCManagerRef.current?.stopScreenShare();
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      setScreenSharing(false);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual recording logic
    toast({
      title: isRecording ? "Gravação parada" : "Gravação iniciada",
      description: isRecording ? "A gravação foi interrompida" : "A aula está sendo gravada",
    });
  };

  if (showPreview) {
    return (
      <PreviewModal
        onComplete={handlePreviewComplete}
        onCancel={() => navigate(-1)}
        lessonTitle={lesson?.title || 'Aula ao Vivo'}
      />
    );
  }

  if (!lesson) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col">
      {/* Top Bar - Minimal */}
      <div className="h-14 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium truncate max-w-xs">{lesson.title}</h1>
          <div className={`text-xs px-2 py-1 rounded-full ${
            streamStatus === 'live' ? 'bg-red-500 text-white' : 
            streamStatus === 'waiting' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'
          }`}>
            {streamStatus === 'live' ? 'AO VIVO' : 
             streamStatus === 'waiting' ? 'AGUARDANDO' : 'ENCERRADA'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="h-4 w-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">Gravando</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-gray-700"
          >
            <Users className="h-4 w-4 mr-2" />
            {participants.length + 1}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Video Area */}
        <div className="flex-1 relative">
          <ProfessionalVideoGrid
            participants={participants}
            localStream={localStream}
            localVideoRef={localVideoRef}
            viewMode={viewMode}
            activeSpeaker={activeSpeaker}
            isInstructor={isInstructor}
            screenSharing={screenSharing}
          />
          
          {/* Reactions Overlay */}
          <StreamingReactions />
        </div>

        {/* Side Panels */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <StreamingChat
              messages={chatMessages}
              onSendMessage={(message) => webRTCManagerRef.current?.sendChatMessage(message)}
              currentUserId={user?.id || ''}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}

        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {/* Participants list will be implemented */}
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Participantes ({participants.length + 1})</h3>
              {/* Participant items */}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-20 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
            className="text-white hover:bg-gray-700 text-xs"
          >
            {viewMode === 'gallery' ? 'Modo Foco' : 'Galeria'}
          </Button>
          
          {isInstructor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleRecording}
              className={`text-white hover:bg-gray-700 text-xs ${isRecording ? 'text-red-400' : ''}`}
            >
              <div className={`h-4 w-4 rounded-full mr-1 ${isRecording ? 'bg-red-500' : 'bg-gray-500'}`} />
              {isRecording ? 'Parar' : 'Gravar'}
            </Button>
          )}
        </div>

        {/* Central Controls */}
        <ProfessionalStreamControls
          isInstructor={isInstructor}
          streamStatus={streamStatus}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          screenSharing={screenSharing}
          onStartStream={handleStartStream}
          onEndStream={handleEndStream}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onStartScreenShare={handleStartScreenShare}
          onStopScreenShare={handleStopScreenShare}
          onLeave={handleLeaveRoom}
        />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white hover:bg-gray-700"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          {isInstructor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHostControls(!showHostControls)}
              className="text-white hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Host Controls Modal */}
      {showHostControls && isInstructor && (
        <HostControls
          participants={participants}
          allMuted={allMuted}
          participantsBlocked={participantsBlocked}
          onMuteAll={() => setAllMuted(!allMuted)}
          onBlockParticipants={() => setParticipantsBlocked(!participantsBlocked)}
          onRemoveParticipant={(id: string) => {
            // TODO: Implement remove participant
            console.log('Remove participant:', id);
          }}
          onClose={() => setShowHostControls(false)}
        />
      )}
    </div>
  );
};

export default FullScreenStreamRoom;