import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { Unidade } from "@/hooks/useUnidades";

interface UnidadeCardMobileProps {
  unidade: Unidade;
  onViewDetails: (unidade: Unidade) => void;
}

const UnidadeCardMobile = ({ unidade, onViewDetails }: UnidadeCardMobileProps) => {
  const getFaseBadgeVariant = (fase: string) => {
    switch (fase?.toUpperCase()) {
      case "OPERAÇÃO":
        return "default";
      case "IMPLANTAÇÃO":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer h-fit"
      onClick={() => onViewDetails(unidade)}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header com nome e status da conta */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {unidade.group_name || "N/A"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {unidade.group_code || "N/A"}
            </p>
          </div>
          
          {/* Status de usuários */}
          <div className="flex shrink-0">
            {unidade.hasUsers ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        
        {/* Localização */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {unidade.city && unidade.uf 
              ? `${unidade.city}/${unidade.uf}` 
              : "N/A"}
          </span>
        </div>
        
        {/* Badges compactas */}
        <div className="flex flex-wrap gap-1">
          {unidade.store_phase && (
            <Badge 
              variant={getFaseBadgeVariant(unidade.store_phase)}
              className="text-xs px-2 py-0.5 h-auto"
            >
              {unidade.store_phase}
            </Badge>
          )}
          {unidade.store_model && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
              {unidade.store_model}
            </Badge>
          )}
        </div>
        
        {/* Etapa da loja */}
        {unidade.store_imp_phase && (
          <div className="text-xs text-muted-foreground truncate">
            {unidade.store_imp_phase}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnidadeCardMobile;