
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
      <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
        <div className={`rounded-lg bg-brand-blue-light flex items-center justify-center ${
          isMobile ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          <Icon className={`text-brand-blue ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </div>
        {change && change !== "—" && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${changeStyles[changeType]}`}>
            {change}
          </div>
        )}
      </div>
      
      {/* Conteúdo principal - mobile optimized */}
      <div className={`space-y-1 ${isMobile ? 'space-y-1' : 'space-y-2'}`}>
        <h3 className={`font-bold text-brand-black ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          {value}
        </h3>
        <p className={`text-brand-gray-dark font-medium ${
          isMobile ? 'text-sm' : 'text-base'
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
        className={`p-4 ${onClick ? 'cursor-pointer' : ''}`}
        variant="elevated"
      >
        {content}
      </TouchCard>
    );
  }

  return (
    <div className="metric-card p-6">
      {content}
    </div>
  );
};

export default MetricCard;
