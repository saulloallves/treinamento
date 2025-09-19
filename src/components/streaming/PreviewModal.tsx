import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, VideoOff, Mic, MicOff, Settings, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreviewModalProps {
  onComplete: (audioEnabled: boolean, videoEnabled: boolean) => void;
  onCancel: () => void;
  lessonTitle: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  onComplete,
  onCancel,
  lessonTitle
}) => {
  const { toast } = useToast();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioLevelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      startPreview();
    }
  }, [audioEnabled, videoEnabled, selectedAudioDevice, selectedVideoDevice, permissionGranted]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      // Stop the stream immediately - we just needed permissions
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      await getDevices();
      
    } catch (error) {
      console.error('Error requesting permissions:', error);
      
      // Set permission granted to true even if denied - user can still join without media
      setPermissionGranted(true);
      await getDevices();
      
      toast({
        title: "Permissões de Mídia",
        description: "Você pode entrar na sala sem câmera/microfone",
        variant: "default",
      });
    }
  };

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      // Set default devices
      if (audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const startPreview = async () => {
    try {
      // Stop existing stream
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: audioEnabled ? {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
        video: videoEnabled ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setPreviewStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Audio level monitoring
      if (audioEnabled && stream.getAudioTracks().length > 0) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        microphone.connect(analyser);
        
        const updateAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const percentage = (average / 255) * 100;
          
          if (audioLevelRef.current) {
            audioLevelRef.current.style.width = `${percentage}%`;
          }
          
          requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      }

    } catch (error) {
      console.error('Error starting preview:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar câmera ou microfone",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async () => {
    setIsLoading(true);
    
    try {
      // Stop preview stream
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
      
      onComplete(audioEnabled, videoEnabled);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar na sala",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Preparar para entrar na aula
          </DialogTitle>
          <p className="text-gray-400">{lessonTitle}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {videoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-gray-400">Câmera desabilitada</p>
                  </div>
                </div>
              )}
              
              {/* Audio level indicator */}
              {audioEnabled && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      ref={audioLevelRef}
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: '0%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Nível do microfone</p>
                </div>
              )}
            </div>

            {/* Quick controls */}
            <div className="flex justify-center gap-4">
              <Button
                variant={audioEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="w-14 h-14 rounded-full p-0"
              >
                {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant={videoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className="w-14 h-14 rounded-full p-0"
              >
                {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </h3>
              
              <div className="space-y-4">
                {/* Audio settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-toggle" className="text-sm">
                      Microfone
                    </Label>
                    <Switch
                      id="audio-toggle"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                    />
                  </div>
                  
                  {audioEnabled && audioDevices.length > 0 && (
                    <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Selecione o microfone" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {audioDevices.map(device => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="text-white hover:bg-gray-700"
                          >
                            {device.label || `Microfone ${device.deviceId.slice(0, 8)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Video settings */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-toggle" className="text-sm">
                      Câmera
                    </Label>
                    <Switch
                      id="video-toggle"
                      checked={videoEnabled}
                      onCheckedChange={setVideoEnabled}
                    />
                  </div>
                  
                  {videoEnabled && videoDevices.length > 0 && (
                    <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Selecione a câmera" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {videoDevices.map(device => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                            className="text-white hover:bg-gray-700"
                          >
                            {device.label || `Câmera ${device.deviceId.slice(0, 8)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Dicas para uma melhor experiência:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Use fones de ouvido para evitar eco</li>
                <li>• Certifique-se de ter boa iluminação</li>
                <li>• Teste seu microfone falando normalmente</li>
                <li>• Mantenha uma conexão estável com a internet</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleJoinRoom}
            disabled={isLoading || !permissionGranted}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Entrando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Entrar na Aula
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;