
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
      <div className="flex items-center justify-between mb-8 relative">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-125 group-hover:animate-wiggle transition-all duration-500 shadow-large relative overflow-hidden">
          <div className="absolute inset-0 gradient-warm"></div>
          <Icon className="w-10 h-10 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-3xl"></div>
        </div>
        <div className={`px-5 py-3 rounded-full text-sm font-black shadow-medium border-2 transition-all duration-300 group-hover:scale-110 ${changeColor[changeType]}`}>
          {change}
        </div>
      </div>
      
      <div className="text-center relative">
        <h3 className="text-5xl font-black text-brand-brown mb-3 group-hover:scale-110 transition-transform duration-300">
          {value}
        </h3>
        <p className="text-lg text-brand-brown-light font-bold">
          {title}
        </p>
        
        {/* Elemento decorativo */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-2 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-20 transition-all duration-300">
          <div className="w-full h-full gradient-primary rounded-full"></div>
        </div>
      </div>

      {/* Forma orgânica decorativa */}
      <div className="absolute top-6 right-6 w-10 h-10 organic-shape-3 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
        <div className="w-full h-full bg-accent/20"></div>
      </div>
    </div>
  );
};

export default MetricCard;
