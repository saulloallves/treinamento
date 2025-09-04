import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, ChevronRight, UserCheck, Calendar } from "lucide-react";

interface AttendanceGroup {
  id: string;
  name: string;
  turmaName: string;
  courseName: string;
  items: any[];
}

interface AttendanceCardProps {
  group: AttendanceGroup;
  onClick: () => void;
}

const getStatusColor = (count: number) => {
  if (count === 0) return 'bg-muted text-muted-foreground';
  if (count <= 10) return 'bg-primary/10 text-primary';
  if (count <= 30) return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
};

export const AttendanceCard = ({ group, onClick }: AttendanceCardProps) => {
  const attendanceCount = group.items.length;
  const latestAttendance = group.items[0]?.confirmedAt;

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
          {/* Attendance count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Presenças</span>
            </div>
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(attendanceCount)} font-medium`}
            >
              {attendanceCount}
            </Badge>
          </div>

          {/* Latest attendance */}
          {latestAttendance && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Última presença</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(latestAttendance).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};