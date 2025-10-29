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
      className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
      onClick={() => onViewDetails(unidade)}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-[clamp(0.875rem,1vw+0.5rem,1.125rem)] text-foreground leading-tight break-words hyphens-auto line-clamp-2"
              title={unidade.group_name || "N/A"}
              lang="pt-BR"
            >
              {unidade.group_name || "N/A"}
            </h3>
            <p className="text-[clamp(0.75rem,0.8vw+0.4rem,0.875rem)] text-muted-foreground mt-1">
              {unidade.group_code || "N/A"}
            </p>
          </div>

          {/* Indicador de usuários */}
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {unidade.hasUsers ? (
              <CheckCircle className="h-4 w-4 text-green-600" title="Com usuários" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" title="Sem usuários" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[clamp(0.75rem,0.8vw+0.4rem,0.875rem)] text-muted-foreground min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {unidade.city && unidade.uf
                ? `${unidade.city} / ${unidade.uf}`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {unidade.store_phase && (
              <Badge
                variant={getFaseBadgeVariant(unidade.store_phase)}
                className="text-[clamp(0.625rem,0.7vw+0.35rem,0.75rem)] px-2 py-0.5"
              >
                {unidade.store_phase}
              </Badge>
            )}
            {unidade.store_model && (
              <Badge
                variant="outline"
                className="text-[clamp(0.625rem,0.7vw+0.35rem,0.75rem)] px-2 py-0.5"
              >
                {unidade.store_model}
              </Badge>
            )}
          </div>

          {unidade.store_imp_phase && (
            <div className="text-[clamp(0.625rem,0.7vw+0.35rem,0.75rem)] text-muted-foreground line-clamp-1">
              {unidade.store_imp_phase}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnidadeCard;