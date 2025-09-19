import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StreamParticipant } from '@/utils/webRTC';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  UserX, 
  Crown,
  Shield,
  Settings,
  Users
} from 'lucide-react';

interface HostControlsProps {
  participants: StreamParticipant[];
  allMuted: boolean;
  participantsBlocked: boolean;
  onMuteAll: () => void;
  onBlockParticipants: () => void;
  onRemoveParticipant: (participantId: string) => void;
  onClose: () => void;
}

const HostControls: React.FC<HostControlsProps> = ({
  participants,
  allMuted,
  participantsBlocked,
  onMuteAll,
  onBlockParticipants,
  onRemoveParticipant,
  onClose
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Controles do Anfitrião
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Controles Globais
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Silenciar Todos</Label>
                  <p className="text-xs text-gray-400">
                    Silencia o microfone de todos os participantes
                  </p>
                </div>
                <Switch
                  checked={allMuted}
                  onCheckedChange={onMuteAll}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Bloquear Controles</Label>
                  <p className="text-xs text-gray-400">
                    Impede que participantes ativem microfone/câmera
                  </p>
                </div>
                <Switch
                  checked={participantsBlocked}
                  onCheckedChange={onBlockParticipants}
                />
              </div>
            </div>
          </div>

          {/* Participant Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participantes ({participants.length})
            </h3>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {participants.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum participante conectado</p>
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {participant.name}
                            </span>
                            {participant.isInstructor && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
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
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement mute participant
                            console.log('Mute participant:', participant.id);
                          }}
                          className="text-gray-400 hover:text-white hover:bg-gray-600"
                        >
                          {participant.audioEnabled ? (
                            <MicOff className="h-4 w-4" />
                          ) : (
                            <Mic className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement disable video
                            console.log('Toggle video:', participant.id);
                          }}
                          className="text-gray-400 hover:text-white hover:bg-gray-600"
                        >
                          {participant.videoEnabled ? (
                            <VideoOff className="h-4 w-4" />
                          ) : (
                            <Video className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {!participant.isInstructor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveParticipant(participant.id)}
                            className="text-red-400 hover:text-white hover:bg-red-600"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Security & Privacy */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança & Privacidade
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  // TODO: Implement waiting room
                  console.log('Enable waiting room');
                }}
              >
                Sala de Espera
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  // TODO: Implement lock room
                  console.log('Lock room');
                }}
              >
                Trancar Sala
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  // TODO: Implement generate report
                  console.log('Generate report');
                }}
              >
                Relatório
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  // TODO: Implement share link
                  console.log('Share room link');
                }}
              >
                Compartilhar Link
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HostControls;