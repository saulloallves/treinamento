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
      className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => onViewDetails(unidade)}
    >
      <CardContent className="p-3 space-y-2.5 flex-1 flex flex-col">
        {/* Header com nome e status da conta */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-[clamp(0.75rem,3vw,0.875rem)] leading-tight line-clamp-2 break-words hyphens-auto"
              title={unidade.group_name || "N/A"}
              lang="pt-BR"
            >
              {unidade.group_name || "N/A"}
            </h3>
            <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-muted-foreground mt-1">
              {unidade.group_code || "N/A"}
            </p>
          </div>

          {/* Status de usuários */}
          <div className="flex shrink-0">
            {unidade.hasUsers ? (
              <CheckCircle className="h-4 w-4 text-green-600" title="Com usuários" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" title="Sem usuários" />
            )}
          </div>
        </div>

        {/* Localização */}
        <div className="flex items-center gap-1.5 text-[clamp(0.625rem,2.5vw,0.75rem)] text-muted-foreground min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {unidade.city && unidade.uf
              ? `${unidade.city} / ${unidade.uf}`
              : "N/A"}
          </span>
        </div>

        {/* Badges compactas */}
        <div className="flex flex-wrap gap-1">
          {unidade.store_phase && (
            <Badge
              variant={getFaseBadgeVariant(unidade.store_phase)}
              className="text-[clamp(0.625rem,2vw,0.6875rem)] px-1.5 py-0.5 h-auto leading-tight"
            >
              {unidade.store_phase}
            </Badge>
          )}
          {unidade.store_model && (
            <Badge
              variant="outline"
              className="text-[clamp(0.625rem,2vw,0.6875rem)] px-1.5 py-0.5 h-auto leading-tight"
            >
              {unidade.store_model}
            </Badge>
          )}
        </div>

        {/* Etapa da loja */}
        {unidade.store_imp_phase && (
          <div className="text-[clamp(0.625rem,2vw,0.6875rem)] text-muted-foreground line-clamp-1 mt-auto">
            {unidade.store_imp_phase}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnidadeCardMobile;