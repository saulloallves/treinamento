import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageSectionProps {
  title?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  icon: Icon,
  actions,
  children,
  className = ''
}) => {
  return (
    <section className={`page-section ${className}`}>
      {(title || actions) && (
        <div className="section-header">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="section-icon" />}
            {title && <h2 className="section-title">{title}</h2>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};
