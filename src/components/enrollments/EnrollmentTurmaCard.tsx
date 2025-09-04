import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, User, ChevronRight } from "lucide-react";

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
  const avgProgress = enrollmentCount > 0 
    ? Math.round(group.items.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / enrollmentCount)
    : 0;

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-border hover:border-primary/20" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground truncate">
                {group.courseName}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">
              {group.turmaName}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Professor */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {group.professorName}
            </p>
          </div>
        </div>

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

          {/* Progress bar */}
          {enrollmentCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progresso médio</span>
                <span className="text-sm font-medium text-foreground">{avgProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};