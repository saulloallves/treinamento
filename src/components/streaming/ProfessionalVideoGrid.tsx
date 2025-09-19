import React, { useRef, useEffect, useState } from 'react';
import { StreamParticipant } from '@/utils/webRTC';
import { Mic, MicOff, Video, VideoOff, Monitor, Crown, Hand } from 'lucide-react';

interface ProfessionalVideoGridProps {
  participants: StreamParticipant[];
  localStream: MediaStream | null;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  viewMode: 'gallery' | 'speaker' | 'presentation';
  activeSpeaker: string | null;
  isInstructor: boolean;
  screenSharing: boolean;
}

const ProfessionalVideoGrid: React.FC<ProfessionalVideoGridProps> = ({
  participants,
  localStream,
  localVideoRef,
  viewMode,
  activeSpeaker,
  isInstructor,
  screenSharing
}) => {
  const participantVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Update participant video streams
    participants.forEach(participant => {
      const videoElement = participantVideosRef.current.get(participant.id);
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
        
        // Audio level detection for speaking indicator
        if (participant.stream.getAudioTracks().length > 0) {
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(participant.stream);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          microphone.connect(analyser);
          
          const checkAudioLevel = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            
            if (average > 10) { // Threshold for speaking
              setSpeakingParticipants(prev => new Set(prev).add(participant.id));
            } else {
              setSpeakingParticipants(prev => {
                const newSet = new Set(prev);
                newSet.delete(participant.id);
                return newSet;
              });
            }
            
            requestAnimationFrame(checkAudioLevel);
          };
          
          checkAudioLevel();
        }
      }
    });
  }, [participants]);

  const getGridLayout = () => {
    const totalVideos = participants.length + (localStream ? 1 : 0);
    
    if (viewMode === 'speaker' && activeSpeaker) {
      return 'speaker-focus';
    }
    
    if (viewMode === 'presentation' && screenSharing) {
      return 'presentation';
    }
    
    // Gallery mode
    if (totalVideos <= 1) return 'grid-cols-1';
    if (totalVideos <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalVideos <= 4) return 'grid-cols-2';
    if (totalVideos <= 6) return 'grid-cols-2 md:grid-cols-3';
    if (totalVideos <= 9) return 'grid-cols-3';
    if (totalVideos <= 16) return 'grid-cols-3 md:grid-cols-4';
    if (totalVideos <= 25) return 'grid-cols-4 md:grid-cols-5';
    return 'grid-cols-4 md:grid-cols-6';
  };

  const VideoCard = ({ 
    name, 
    stream, 
    audioEnabled, 
    videoEnabled, 
    screenSharing: isScreenSharing,
    isLocal = false,
    participantId,
    isInstructor: participantIsInstructor = false,
    isSpeaking = false,
    isActiveSpeaker = false
  }: {
    name: string;
    stream?: MediaStream;
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenSharing: boolean;
    isLocal?: boolean;
    participantId?: string;
    isInstructor?: boolean;
    isSpeaking?: boolean;
    isActiveSpeaker?: boolean;
  }) => {
    const cardClass = `
      relative rounded-xl overflow-hidden transition-all duration-300
      ${isSpeaking ? 'ring-4 ring-green-400 shadow-lg shadow-green-400/20' : ''}
      ${isActiveSpeaker ? 'ring-4 ring-blue-400 shadow-lg shadow-blue-400/20' : ''}
      ${viewMode === 'speaker' && isActiveSpeaker 
        ? 'col-span-full row-span-2 aspect-video max-h-[60vh]' 
        : 'aspect-video bg-gray-800'}
    `;

    return (
      <div className={cardClass}>
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
        
        {/* Video controls overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
          {/* Top indicators */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {participantIsInstructor && (
                <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Professor
                </div>
              )}
              {isScreenSharing && (
                <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Tela
                </div>
              )}
            </div>
            
            {/* Reactions placeholder */}
            <div className="flex items-center gap-1">
              {/* Hand raised indicator */}
              {/* <Hand className="h-4 w-4 text-yellow-400" /> */}
            </div>
          </div>
          
          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-white font-medium text-sm truncate">
              {name} {isLocal && '(Você)'}
            </span>
            
            <div className="flex items-center gap-2">
              {audioEnabled ? (
                <div className={`p-1 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <Mic className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-red-500">
                  <MicOff className="h-3 w-3 text-white" />
                </div>
              )}
              
              {videoEnabled ? (
                <div className="p-1 rounded-full bg-gray-600">
                  <Video className="h-3 w-3 text-white" />
                </div>
              ) : (
                <div className="p-1 rounded-full bg-red-500">
                  <VideoOff className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* No video state */}
        {!videoEnabled && (
          <div className="absolute inset-0 bg-gray-700 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3">
              <span className="text-white text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white font-medium text-sm">{name}</p>
            {isLocal && <p className="text-gray-300 text-xs">(Você)</p>}
          </div>
        )}
      </div>
    );
  };

  const renderSpeakerFocusLayout = () => {
    const speaker = participants.find(p => p.id === activeSpeaker);
    const otherParticipants = participants.filter(p => p.id !== activeSpeaker);
    
    return (
      <div className="h-full p-4 flex flex-col gap-4">
        {/* Main speaker area */}
        <div className="flex-1 flex items-center justify-center">
          {speaker ? (
            <VideoCard
              name={speaker.name}
              stream={speaker.stream}
              audioEnabled={speaker.audioEnabled}
              videoEnabled={speaker.videoEnabled}
              screenSharing={speaker.screenSharing}
              participantId={speaker.id}
              isActiveSpeaker={true}
            />
          ) : localStream && (
            <VideoCard
              name="Você"
              stream={localStream}
              audioEnabled={true}
              videoEnabled={true}
              screenSharing={screenSharing}
              isLocal={true}
              isActiveSpeaker={true}
            />
          )}
        </div>
        
        {/* Thumbnail strip */}
        <div className="h-24 flex gap-2 overflow-x-auto">
          {localStream && speaker && (
            <div className="w-32 flex-shrink-0">
              <VideoCard
                name="Você"
                stream={localStream}
                audioEnabled={true}
                videoEnabled={true}
                screenSharing={screenSharing}
                isLocal={true}
              />
            </div>
          )}
          
          {otherParticipants.map(participant => (
            <div key={participant.id} className="w-32 flex-shrink-0">
              <VideoCard
                name={participant.name}
                stream={participant.stream}
                audioEnabled={participant.audioEnabled}
                videoEnabled={participant.videoEnabled}
                screenSharing={participant.screenSharing}
                participantId={participant.id}
                isSpeaking={speakingParticipants.has(participant.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPresentationLayout = () => {
    // Similar to speaker focus but optimized for screen sharing
    return renderSpeakerFocusLayout();
  };

  const renderGalleryLayout = () => {
    const gridClass = getGridLayout();
    
    return (
      <div className="h-full p-4 overflow-auto">
        <div className={`grid gap-4 min-h-full ${gridClass}`}>
          {/* Local video */}
          {localStream && (
            <VideoCard
              name="Você"
              stream={localStream}
              audioEnabled={true}
              videoEnabled={true}
              screenSharing={screenSharing}
              isLocal={true}
              isInstructor={isInstructor}
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
              isInstructor={participant.isInstructor}
              isSpeaking={speakingParticipants.has(participant.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  // Empty state
  if (participants.length === 0 && !localStream) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Video className="h-20 w-20 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">Aguardando participantes</h3>
          <p className="text-gray-500">A aula ainda não começou ou não há participantes conectados</p>
        </div>
      </div>
    );
  }

  // Render based on view mode
  if (viewMode === 'speaker' || (viewMode === 'presentation' && screenSharing)) {
    return viewMode === 'speaker' ? renderSpeakerFocusLayout() : renderPresentationLayout();
  }

  return renderGalleryLayout();
};

export default ProfessionalVideoGrid;