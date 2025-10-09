import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: LucideIcon;
  label?: string;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
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
      className={`
        fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg 
        bg-primary hover:bg-primary/90 text-primary-foreground
        transition-all duration-300 ease-out
        hover:shadow-xl active:scale-95
        ${className}
      `}
      size="icon"
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
};

export default FloatingActionButton;