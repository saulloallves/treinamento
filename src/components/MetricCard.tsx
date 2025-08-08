
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
    positive: "text-accent bg-accent/10 border-accent/30",
    negative: "text-destructive bg-destructive/10 border-destructive/30",
    neutral: "text-muted-foreground bg-muted/30 border-muted/30"
  };

  return (
    <div className="metric-card group hover:scale-110 transition-all duration-500 hover:shadow-glow hover:rotate-1">
      <div className="flex items-center justify-between mb-6 relative">
        <div className="w-16 h-16 gradient-warm rounded-3xl flex items-center justify-center group-hover:scale-125 group-hover:animate-wiggle transition-all duration-500 shadow-large relative overflow-hidden">
          <Icon className="w-8 h-8 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-3xl"></div>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-black shadow-soft border-2 transition-all duration-300 group-hover:scale-110 ${changeColor[changeType]}`}>
          {change}
        </div>
      </div>
      
      <div className="text-center relative">
        <h3 className="text-4xl font-black text-brand-brown mb-2 group-hover:scale-110 transition-transform duration-300">
          {value}
        </h3>
        <p className="text-base text-brand-brown-light font-bold">
          {title}
        </p>
        
        {/* Elemento decorativo */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-secondary to-primary rounded-full opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-300"></div>
      </div>

      {/* Forma orgânica decorativa */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-accent/20 organic-shape-3 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
    </div>
  );
};

export default MetricCard;
