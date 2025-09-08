import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TouchCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

const TouchCard: React.FC<TouchCardProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  variant = 'default'
}) => {
  const variants = {
    default: 'border shadow-sm',
    elevated: 'border shadow-md hover:shadow-lg',
    outlined: 'border-2 shadow-none'
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 overflow-hidden',
        variants[variant],
        onClick && !disabled && [
          'cursor-pointer active:scale-[0.98] hover:shadow-md',
          'active:bg-muted/30 select-none'
        ],
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Card>
  );
};

export default TouchCard;