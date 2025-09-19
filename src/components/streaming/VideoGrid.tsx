import React, { useRef, useEffect } from 'react';
import { StreamParticipant } from '@/utils/webRTC';
import { Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';

interface VideoGridProps {
  participants: StreamParticipant[];
  localStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localStream,
  localVideoRef
}) => {
  const participantVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    // Update participant video streams
    participants.forEach(participant => {
      const videoElement = participantVideosRef.current.get(participant.id);
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
      }
    });
  }, [participants]);

  const getGridClass = () => {
    const totalVideos = participants.length + (localStream ? 1 : 0);
    
    if (totalVideos <= 1) return 'grid-cols-1';
    if (totalVideos <= 4) return 'grid-cols-2';
    if (totalVideos <= 9) return 'grid-cols-3';
    if (totalVideos <= 16) return 'grid-cols-4';
    if (totalVideos <= 25) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  const VideoCard = ({ 
    name, 
    stream, 
    audioEnabled, 
    videoEnabled, 
    screenSharing,
    isLocal = false,
    participantId 
  }: {
    name: string;
    stream?: MediaStream;
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenSharing: boolean;
    isLocal?: boolean;
    participantId?: string;
  }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video min-h-[120px] max-h-[300px]">
      <video
        ref={isLocal ? localVideoRef : 
          (el) => {
            if (el && participantId) {
              participantVideosRef.current.set(participantId, el);
            }
          }
        }
        autoPlay
        muted={isLocal}
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Overlay with participant info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <span className="text-sm font-medium truncate">
            {name} {isLocal && '(Você)'}
          </span>
          <div className="flex items-center gap-1">
            {screenSharing && (
              <Monitor className="h-4 w-4 text-blue-400" />
            )}
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

      {/* No video overlay */}
      {!videoEnabled && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <VideoOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">{name}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full p-4 overflow-auto">
      <div className={`grid gap-2 sm:gap-4 h-auto min-h-full ${getGridClass()}`}>
        {/* Local video */}
        {localStream && (
          <VideoCard
            name="Você"
            stream={localStream}
            audioEnabled={true}
            videoEnabled={true}
            screenSharing={false}
            isLocal={true}
          />
        )}

        {/* Participant videos */}
        {participants.map(participant => (
          <VideoCard
            key={participant.id}
            name={participant.name}
            stream={participant.stream}
            audioEnabled={participant.audioEnabled}
            videoEnabled={participant.videoEnabled}
            screenSharing={participant.screenSharing}
            participantId={participant.id}
          />
        ))}

        {/* Empty state when no participants */}
        {participants.length === 0 && !localStream && (
          <div className="col-span-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aguardando participantes</h3>
              <p className="text-sm">A aula ainda não começou ou não há participantes conectados</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;