import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface SkeletonCardProps {
  variant?: 'default' | 'compact' | 'list';
  showActions?: boolean;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'default', 
  showActions = true,
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (variant === 'compact' || (isMobile && variant === 'default')) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          
          {/* Status and count */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
          
          {/* Professor */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          
          {/* Date */}
          <Skeleton className="h-3 w-20" />
          
          {/* Actions */}
          {showActions && (
            <div className="flex gap-1.5 pt-1">
              <Skeleton className="h-7 flex-1 rounded" />
              <Skeleton className="h-7 flex-1 rounded" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`flex items-center gap-3 p-3 animate-pulse ${className}`}>
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    );
  }

  // Default variant
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Professor */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;