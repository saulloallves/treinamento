import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Play,
  Square,
  PhoneOff,
  Settings
} from 'lucide-react';

interface ProfessionalStreamControlsProps {
  isInstructor: boolean;
  streamStatus: 'waiting' | 'live' | 'ended';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  onStartStream: () => void;
  onEndStream: () => void;
  onToggleAudio: (enabled: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onLeave: () => void;
}

const ProfessionalStreamControls: React.FC<ProfessionalStreamControlsProps> = ({
  isInstructor,
  streamStatus,
  audioEnabled,
  videoEnabled,
  screenSharing,
  onStartStream,
  onEndStream,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onLeave
}) => {
  const handleToggleAudio = () => {
    onToggleAudio(!audioEnabled);
  };

  const handleToggleVideo = () => {
    onToggleVideo(!videoEnabled);
  };

  const handleToggleScreenShare = () => {
    if (screenSharing) {
      onStopScreenShare();
    } else {
      onStartScreenShare();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Audio Control */}
      <Button
        variant={audioEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={handleToggleAudio}
        className="w-14 h-14 rounded-full p-0 shadow-lg hover:scale-105 transition-all duration-200"
      >
        {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>

      {/* Video Control */}
      <Button
        variant={videoEnabled ? "secondary" : "destructive"}
        size="lg"
        onClick={handleToggleVideo}
        className="w-14 h-14 rounded-full p-0 shadow-lg hover:scale-105 transition-all duration-200"
      >
        {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
      </Button>

      {/* Screen Share Control */}
      <Button
        variant={screenSharing ? "default" : "secondary"}
        size="lg"
        onClick={handleToggleScreenShare}
        className="w-14 h-14 rounded-full p-0 shadow-lg hover:scale-105 transition-all duration-200"
      >
        {screenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
      </Button>

      {/* Stream Controls (Instructor only) */}
      {isInstructor && (
        <>
          <div className="w-px h-8 bg-gray-600 mx-2" />
          
          {streamStatus === 'waiting' && (
            <Button
              onClick={onStartStream}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 h-12 shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Transmissão
            </Button>
          )}

          {streamStatus === 'live' && (
            <Button
              onClick={onEndStream}
              variant="destructive"
              className="rounded-full px-6 h-12 shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Square className="h-5 w-5 mr-2" />
              Encerrar Transmissão
            </Button>
          )}
        </>
      )}

      {/* Leave Button */}
      <div className="w-px h-8 bg-gray-600 mx-2" />
      <Button
        variant="destructive"
        size="lg"
        onClick={onLeave}
        className="w-14 h-14 rounded-full p-0 shadow-lg hover:scale-105 transition-all duration-200"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ProfessionalStreamControls;