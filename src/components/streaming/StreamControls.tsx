import React, { useState } from 'react';
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
  Phone,
  PhoneOff
} from 'lucide-react';

interface StreamControlsProps {
  isInstructor: boolean;
  streamStatus: 'waiting' | 'live' | 'ended';
  onStartStream: () => void;
  onEndStream: () => void;
  onToggleAudio: (enabled: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
}

const StreamControls: React.FC<StreamControlsProps> = ({
  isInstructor,
  streamStatus,
  onStartStream,
  onEndStream,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const handleToggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    onToggleAudio(newState);
  };

  const handleToggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    onToggleVideo(newState);
  };

  const handleToggleScreenShare = () => {
    if (screenSharing) {
      onStopScreenShare();
      setScreenSharing(false);
    } else {
      onStartScreenShare();
      setScreenSharing(true);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
      {/* Audio Control */}
      <Button
        variant={audioEnabled ? "secondary" : "destructive"}
        size="sm"
        onClick={handleToggleAudio}
        className="rounded-full w-10 h-10 p-0"
      >
        {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>

      {/* Video Control */}
      <Button
        variant={videoEnabled ? "secondary" : "destructive"}
        size="sm"
        onClick={handleToggleVideo}
        className="rounded-full w-10 h-10 p-0"
      >
        {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>

      {/* Screen Share (Instructor only) */}
      {isInstructor && (
        <Button
          variant={screenSharing ? "default" : "secondary"}
          size="sm"
          onClick={handleToggleScreenShare}
          className="rounded-full w-10 h-10 p-0"
        >
          {screenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </Button>
      )}

      {/* Stream Controls (Instructor only) */}
      {isInstructor && (
        <>
          <div className="w-px h-6 bg-white/20 mx-2" />
          
          {streamStatus === 'waiting' && (
            <Button
              onClick={onStartStream}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Transmissão
            </Button>
          )}

          {streamStatus === 'live' && (
            <Button
              onClick={onEndStream}
              variant="destructive"
              className="rounded-full px-4"
            >
              <Square className="h-4 w-4 mr-2" />
              Encerrar Transmissão
            </Button>
          )}
        </>
      )}

      {/* Leave Button */}
      <div className="w-px h-6 bg-white/20 mx-2" />
      <Button
        variant="destructive"
        size="sm"
        onClick={() => window.history.back()}
        className="rounded-full w-10 h-10 p-0"
      >
        <PhoneOff className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default StreamControls;