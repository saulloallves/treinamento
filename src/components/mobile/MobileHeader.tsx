import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onBack,
  actions,
  className = ''
}) => {
  return (
    <header className={`
      sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border
      px-4 py-3 flex items-center gap-3
      ${className}
    `}>
      {onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      
      <h1 className="text-lg font-semibold text-foreground flex-1 truncate">
        {title}
      </h1>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
};

export default MobileHeader;