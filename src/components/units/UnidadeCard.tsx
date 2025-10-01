import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { Unidade } from "@/hooks/useUnidades";
import { useIsMobile } from "@/hooks/use-mobile";
import UnidadeCardMobile from "./UnidadeCardMobile";

interface UnidadeCardProps {
  unidade: Unidade;
  onViewDetails: (unidade: Unidade) => void;
}

const UnidadeCard = ({ unidade, onViewDetails }: UnidadeCardProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <UnidadeCardMobile unidade={unidade} onViewDetails={onViewDetails} />;
  }

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
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onViewDetails(unidade)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-lg text-foreground leading-tight"
              title={unidade.grupo || "N/A"}
            >
              {unidade.grupo || "N/A"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {unidade.codigo_grupo || "N/A"}
            </p>
          </div>
          
          {/* Indicador de usuários */}
          <div className="flex items-center gap-1 ml-2">
            {unidade.hasUsers ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Com usuários</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-medium">Sem usuários</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {unidade.cidade && unidade.uf 
              ? `${unidade.cidade} / ${unidade.uf}` 
              : "N/A"}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {unidade.fase_loja && (
            <Badge variant={getFaseBadgeVariant(unidade.fase_loja)}>
              {unidade.fase_loja}
            </Badge>
          )}
          {unidade.modelo_loja && (
            <Badge variant="outline" className="text-xs">
              {unidade.modelo_loja}
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {unidade.etapa_loja || "N/A"}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnidadeCard;