import { GraduationCap, Users, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CertificateTurmaCardProps {
  courseName: string;
  turmaName: string;
  certificatesCount: number;
  onClick: () => void;
}

const CertificateTurmaCard = ({
  courseName,
  turmaName,
  certificatesCount,
  onClick
}: CertificateTurmaCardProps) => {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer border border-border bg-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap className="w-5 h-5" />
          <span className="text-sm font-medium">{courseName}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-4">
        {turmaName}
      </h3>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span className="text-sm">
          {certificatesCount} {certificatesCount === 1 ? 'certificado' : 'certificados'}
        </span>
      </div>
    </Card>
  );
};

export default CertificateTurmaCard;
