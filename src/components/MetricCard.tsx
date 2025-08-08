
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
    positive: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30",
    negative: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/30",
    neutral: "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-gray-500/30"
  };

  const gradients = [
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600', 
    'from-blue-500 to-blue-600',
    'from-orange-500 to-orange-600'
  ];

  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <div className="card-modern group hover-lift hover:scale-105 transition-all duration-300">
      <div className="relative z-10 p-6">
        {/* Header do card */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${randomGradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className={`px-3 py-2 rounded-lg text-xs font-bold shadow-lg transition-all duration-200 group-hover:scale-105 ${changeStyles[changeType]}`}>
            {change}
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
            {value}
          </h3>
          <p className="text-gray-600 font-medium group-hover:text-gray-700 transition-colors">
            {title}
          </p>
        </div>

        {/* Barra decorativa */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 group-hover:opacity-100 group-hover:w-20 transition-all duration-300"></div>
      </div>

      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

export default MetricCard;
