import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StandardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const StandardCard: React.FC<StandardCardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  onClick,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'standard-card',
    outlined: 'standard-card-outlined',
    elevated: 'standard-card-elevated'
  };

  return (
    <Card 
      className={cn(
        variantClasses[variant],
        onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <CardHeader className="standard-card-header">
          {title && <CardTitle className="card-title">{title}</CardTitle>}
          {description && <CardDescription className="card-description">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="standard-card-content">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="standard-card-footer">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};
