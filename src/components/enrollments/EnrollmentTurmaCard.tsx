import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, ChevronRight } from "lucide-react";

interface EnrollmentGroup {
  id: string;
  name: string;
  turmaName: string;
  professorName: string;
  courseName: string;
  items: any[];
}

interface EnrollmentTurmaCardProps {
  group: EnrollmentGroup;
  onClick: () => void;
}

const getStatusColor = (count: number) => {
  if (count === 0) return 'bg-muted text-muted-foreground';
  if (count <= 10) return 'bg-primary/10 text-primary';
  if (count <= 30) return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

export const EnrollmentTurmaCard = ({ group, onClick }: EnrollmentTurmaCardProps) => {
  const enrollmentCount = group.items.length;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-muted-foreground truncate">
                {group.courseName}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground line-clamp-1">
              {group.turmaName}
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 p-4">
        {/* Statistics */}
        <div className="space-y-3">
          {/* Enrollments count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Inscrições</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(enrollmentCount)} font-medium`}
            >
              {enrollmentCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};