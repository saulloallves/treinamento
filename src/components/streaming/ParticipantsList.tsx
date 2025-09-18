import React from 'react';
import { StreamParticipant } from '@/utils/webRTC';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown, 
  MoreVertical,
  Monitor,
  PhoneOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ParticipantsListProps {
  participants: StreamParticipant[];
  isInstructor: boolean;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  isInstructor
}) => {
  const handleMuteParticipant = (participantId: string) => {
    // TODO: Implement mute participant functionality
    console.log('Mute participant:', participantId);
  };

  const handleRemoveParticipant = (participantId: string) => {
    // TODO: Implement remove participant functionality
    console.log('Remove participant:', participantId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          Participantes ({participants.length})
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {participants.map(participant => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              {/* Avatar/Status */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {participant.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                {participant.isInstructor && (
                  <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500" />
                )}
              </div>

              {/* Name and Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate">
                    {participant.name}
                  </p>
                  {participant.isInstructor && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                      Instrutor
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
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

              {/* Actions (Instructor only) */}
              {isInstructor && !participant.isInstructor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleMuteParticipant(participant.id)}
                    >
                      <MicOff className="h-4 w-4 mr-2" />
                      Silenciar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRemoveParticipant(participant.id)}
                      className="text-red-600"
                    >
                      <PhoneOff className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum participante conectado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ParticipantsList;