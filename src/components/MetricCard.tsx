
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
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-2'}`}>
        <div className={`rounded-lg bg-brand-blue-light flex items-center justify-center ${
          isMobile ? 'w-6 h-6' : 'w-7 h-7'
        }`}>
          <Icon className={`text-brand-blue ${isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        </div>
        {change && change !== "—" && (
          <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${changeStyles[changeType]}`}>
            {change}
          </div>
        )}
      </div>
      
      {/* Conteúdo principal - mobile optimized */}
      <div className={`space-y-0.5 ${isMobile ? 'space-y-0' : 'space-y-0.5'}`}>
        <h3 className={`font-bold text-brand-black ${
          isMobile ? 'text-lg' : 'text-xl'
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
        className={`p-2 ${onClick ? 'cursor-pointer' : ''}`}
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
