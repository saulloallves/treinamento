
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
    positive: "text-accent",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <div className="metric-card group hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className={`text-sm font-medium ${changeColor[changeType]}`}>
          {change}
        </span>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-card-foreground mb-1">
          {value}
        </h3>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
