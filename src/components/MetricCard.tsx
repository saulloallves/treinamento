
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
      <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className={`rounded-lg bg-brand-blue-light flex items-center justify-center ${
          isMobile ? 'w-8 h-8' : 'w-10 h-10'
        }`}>
          <Icon className={`text-brand-blue ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
        </div>
        {change && change !== "—" && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${changeStyles[changeType]}`}>
            {change}
          </div>
        )}
      </div>
      
      {/* Conteúdo principal - mobile optimized */}
      <div className={`space-y-1 ${isMobile ? 'space-y-0.5' : 'space-y-1'}`}>
        <h3 className={`font-bold text-brand-black ${
          isMobile ? 'text-xl' : 'text-2xl'
        }`}>
          {value}
        </h3>
        <p className={`text-brand-gray-dark font-medium ${
          isMobile ? 'text-xs' : 'text-sm'
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
        className={`p-3 ${onClick ? 'cursor-pointer' : ''}`}
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
