
import { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import TouchCard from "@/components/mobile/TouchCard";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  onClick?: () => void;
}

const MetricCard = ({ title, value, change, changeType, icon: Icon, onClick }: MetricCardProps) => {
  const isMobile = useIsMobile();
  
  const changeStyles = {
    positive: "bg-green-500 text-brand-white",
    negative: "bg-red-500 text-brand-white",
    neutral: "bg-brand-gray-dark text-brand-white"
  };

  const content = (
    <>
      {/* Header do card - mobile optimized */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-1.5' : 'mb-1.5'}`}>
        <div className={`rounded-md bg-brand-blue-light flex items-center justify-center ${
          isMobile ? 'w-5 h-5' : 'w-6 h-6'
        }`}>
          <Icon className={`text-brand-blue ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
        </div>
        {change && change !== "—" && (
          <div className={`px-1 py-0.5 rounded-full text-xs font-medium ${changeStyles[changeType]}`}>
            {change}
          </div>
        )}
      </div>
      
      {/* Conteúdo principal - mobile optimized */}
      <div className={`space-y-0.5 ${isMobile ? 'space-y-0' : 'space-y-0'}`}>
        <h3 className={`font-bold text-brand-black ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>
          {value}
        </h3>
        <p className={`text-brand-gray-dark font-medium ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          {title}
        </p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <TouchCard 
        onClick={onClick} 
        className={`p-1.5 ${onClick ? 'cursor-pointer' : ''}`}
        variant="elevated"
      >
        {content}
      </TouchCard>
    );
  }

  return (
    <div className="metric-card">
      {content}
    </div>
  );
};

export default MetricCard;
