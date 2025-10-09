import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface MetricData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  onClick?: () => void;
}

interface MetricsGridProps {
  metrics: MetricData[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  columns = 4,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  const gridCols = isMobile 
    ? 'grid-cols-2' 
    : columns === 2 
      ? 'grid-cols-1 md:grid-cols-2' 
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`metrics-grid ${gridCols} ${className}`}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div 
            key={index}
            className={`metric-card ${metric.onClick ? 'cursor-pointer' : ''}`}
            onClick={metric.onClick}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="metric-card-header">
              <div className="metric-icon-wrapper">
                <Icon className="metric-icon" />
              </div>
              <span className="metric-title">{metric.title}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
            {metric.change && (
              <div className={`metric-change metric-change-${metric.changeType || 'neutral'}`}>
                {metric.change}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
