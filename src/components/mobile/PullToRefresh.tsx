import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [isMobile]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isPulling || window.scrollY > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, (currentY.current - startY.current) * 0.5);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  }, [isMobile, isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!isMobile || !isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Erro ao atualizar:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isMobile, isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const shouldShowIndicator = pullDistance > 20 || isRefreshing;
  const indicatorOpacity = Math.min(pullDistance / threshold, 1);
  const rotation = isRefreshing ? 'animate-spin' : '';

  return (
    <div 
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {shouldShowIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
          style={{
            transform: `translateY(${Math.min(pullDistance, threshold) - 60}px)`,
            opacity: indicatorOpacity
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full border shadow-sm">
            <RefreshCw className={`w-4 h-4 text-primary ${rotation}`} />
            <span className="text-sm text-muted-foreground">
              {isRefreshing ? 'Atualizando...' : 
               pullDistance >= threshold ? 'Solte para atualizar' : 
               'Puxe para atualizar'}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;