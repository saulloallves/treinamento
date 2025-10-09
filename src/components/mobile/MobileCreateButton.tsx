import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileCreateButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  label: string;
  className?: string;
}

const MobileCreateButton: React.FC<MobileCreateButtonProps> = ({
  onClick,
  icon: Icon = Plus,
  label,
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Button
      onClick={onClick}
      size="sm"
      className={`flex items-center gap-2 h-8 ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Button>
  );
};

export default MobileCreateButton;