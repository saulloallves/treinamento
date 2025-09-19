import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StreamingLessonButtonProps {
  lessonId: string;
  hasZoomUrl: boolean;
  streamStatus?: string;
  participantCount?: number;
}

const StreamingLessonButton: React.FC<StreamingLessonButtonProps> = ({
  lessonId,
  hasZoomUrl,
  streamStatus = 'waiting',
  participantCount = 0
}) => {
  const navigate = useNavigate();

  const handleJoinStream = () => {
    navigate(`/aula-ao-vivo/${lessonId}`);
  };

  const getStatusVariant = () => {
    switch (streamStatus) {
      case 'live': return 'default'; // Uses primary blue
      case 'waiting': return 'default'; // Uses primary blue
      case 'ended': return 'secondary'; // Uses secondary/muted styling
      default: return 'default'; // Uses primary blue
    }
  };

  const getStatusText = () => {
    switch (streamStatus) {
      case 'live': return 'AO VIVO';
      case 'waiting': return 'Entrar na Sala';
      case 'ended': return 'Encerrada';
      default: return 'Entrar na Sala';
    }
  };

  if (hasZoomUrl) {
    return null; // Don't show streaming button if Zoom is being used
  }

  return (
    <Button
      onClick={handleJoinStream}
      variant={getStatusVariant()}
      size="sm"
      disabled={streamStatus === 'ended'}
    >
      <Video className="h-4 w-4 mr-2" />
      {getStatusText()}
      {participantCount > 0 && (
        <span className="ml-2 flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {participantCount}
        </span>
      )}
    </Button>
  );
};

export default StreamingLessonButton;