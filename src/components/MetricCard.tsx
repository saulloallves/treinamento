
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

const MetricCard = ({ title, value, change, changeType, icon: Icon }: MetricCardProps) => {
  const changeColor = {
    positive: "text-accent bg-accent/10 border-accent/20",
    negative: "text-destructive bg-destructive/10 border-destructive/20",
    neutral: "text-muted-foreground bg-muted/50 border-muted/20"
  };

  return (
    <div className="metric-card group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-medium relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary"></div>
          <Icon className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[20px]"></div>
        </div>
        <div className={`px-3 py-2 rounded-[16px] text-xs font-semibold shadow-soft border transition-all duration-200 group-hover:scale-105 ${changeColor[changeType]}`}>
          {change}
        </div>
      </div>
      
      <div className="text-center relative">
        <h3 className="text-3xl font-bold text-brand-gray-dark mb-2 group-hover:scale-105 transition-transform duration-200">
          {value}
        </h3>
        <p className="text-base text-brand-gray font-medium">
          {title}
        </p>
        
        {/* Elemento decorativo */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full opacity-40 group-hover:opacity-100 group-hover:w-16 transition-all duration-300">
          <div className="w-full h-full gradient-primary rounded-full"></div>
        </div>
      </div>

      {/* Forma orgânica decorativa */}
      <div className="absolute top-4 right-4 w-6 h-6 organic-shape-3 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <div className="w-full h-full bg-primary/10"></div>
      </div>
    </div>
  );
};

export default MetricCard;
