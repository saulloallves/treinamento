
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const MetricCard = ({ title, value, change, changeType, icon: Icon }: MetricCardProps) => {
  const changeStyles = {
    positive: "bg-green-500 text-brand-white",
    negative: "bg-red-500 text-brand-white",
    neutral: "bg-brand-gray-dark text-brand-white"
  };

  return (
    <div className="metric-card p-6">
      {/* Header do card */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 rounded-lg bg-brand-blue-light flex items-center justify-center">
          <Icon className="w-6 h-6 text-brand-blue" />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${changeStyles[changeType]}`}>
          {change}
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-brand-black">
          {value}
        </h3>
        <p className="text-brand-gray-dark font-medium">
          {title}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
