
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
    positive: "bg-gradient-to-r from-green-500 to-emerald-500 text-brand-white shadow-green-500/30",
    negative: "bg-gradient-to-r from-red-500 to-rose-500 text-brand-white shadow-red-500/30",
    neutral: "bg-gradient-to-r from-brand-brown/60 to-brand-brown/80 text-brand-white shadow-brand-brown/30"
  };

  const gradients = [
    'from-brand-yellow to-brand-yellow/80',
    'from-brand-orange to-brand-orange/80', 
    'from-brand-blue to-brand-blue/80',
    'from-brand-yellow via-brand-orange to-brand-blue'
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className="card-modern hover-lift hover:scale-105 transition-all duration-300">
      <div className="relative z-10 p-6">
        {/* Header do card */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${randomGradient} flex items-center justify-center shadow-lg group-hover:shadow-xl hover:scale-110 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-brand-white" />
          </div>
          <div className={`px-3 py-2 rounded-lg text-xs font-bold shadow-lg transition-all duration-200 hover:scale-105 ${changeStyles[changeType]}`}>
            {change}
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-brand-brown mb-2 hover:text-brand-brown/80 transition-colors">
            {value}
          </h3>
          <p className="text-brand-brown/70 font-medium hover:text-brand-brown transition-colors">
            {title}
          </p>
        </div>

        {/* Barra decorativa */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange rounded-full opacity-60 hover:opacity-100 hover:w-20 transition-all duration-300"></div>
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 via-transparent to-brand-blue/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

export default MetricCard;
