import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, GraduationCap, ChevronRight, TrendingUp } from "lucide-react";

interface ProgressGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

interface ProgressCardProps {
  group: ProgressGroup;
  onClick: () => void;
}

const getStatusColor = (count: number) => {
  if (count === 0) return 'bg-muted text-muted-foreground';
  if (count <= 10) return 'bg-primary/10 text-primary';
  if (count <= 30) return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

export const ProgressCard = ({ group, onClick }: ProgressCardProps) => {
  const studentCount = group.items.length;
  const avgProgress = studentCount > 0 
    ? Math.round(group.items.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / studentCount)
    : 0;

  // Count students by status
  const activeStudents = group.items.filter(item => item.status === 'Ativo').length;

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
          {/* Student count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estudantes</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(studentCount)} font-medium`}
            >
              {studentCount}
            </Badge>
          </div>

          {/* Average Progress */}
          {studentCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Progresso médio</span>
                </div>
                <span className="text-sm font-medium text-foreground">{avgProgress}%</span>
              </div>
              <Progress value={avgProgress} className="h-2" />
            </div>
          )}

          {/* Active students indicator */}
          {activeStudents > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ativos</span>
              <Badge variant="outline" className="text-xs">
                {activeStudents}/{studentCount}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};