import React from 'react';

interface RobotIconProps {
  className?: string;
  size?: number;
}

export const RobotIcon: React.FC<RobotIconProps> = ({ className = "w-5 h-5", size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Robot head */}
      <rect x="6" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      
      {/* Robot eyes */}
      <circle cx="9" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="8" r="1.5" fill="currentColor"/>
      
      {/* Robot mouth */}
      <rect x="10" y="11" width="4" height="1" rx="0.5" fill="currentColor"/>
      
      {/* Robot antennas */}
      <line x1="10" y1="4" x2="10" y2="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="14" y1="4" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="2" r="0.5" fill="currentColor"/>
      <circle cx="14" cy="2" r="0.5" fill="currentColor"/>
      
      {/* Robot body */}
      <rect x="8" y="14" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      
      {/* Robot arms */}
      <rect x="4" y="16" width="4" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="16" y="16" width="4" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      
      {/* Robot legs */}
      <rect x="9" y="20" width="2" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <rect x="13" y="20" width="2" height="2" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
};