
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
    <div className="metric-card group hover:scale-105 transition-transform duration-300 hover:shadow-large">
      <div className="flex items-center justify-between mb-4">
        <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-medium">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <span className={`text-sm font-bold px-2 py-1 rounded-full bg-background/50 ${changeColor[changeType]}`}>
          {change}
        </span>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-primary mb-1">
          {value}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          {title}
        </p>
      </div>
    </div>
  );
};

export default MetricCard;
