import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen } from "lucide-react";

interface CourseScheduleCardProps {
  courseId: string;
  courseName: string;
  lessonsCount: number;
  nextLesson?: {
    date: string;
    time: string;
    title: string;
  };
  onClick: () => void;
}

const CourseScheduleCard = ({ 
  courseId, 
  courseName, 
  lessonsCount, 
  nextLesson, 
  onClick 
}: CourseScheduleCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] h-56 bg-gradient-to-br from-background to-muted/30 overflow-hidden">
      <div className="h-full flex flex-col p-4">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-3">
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] flex items-center">
            {courseName}
          </h3>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {lessonsCount} {lessonsCount === 1 ? 'aula' : 'aulas'}
            </Badge>
          </div>
          
          {nextLesson && (
            <div className="space-y-1 text-center">
              <p className="text-xs text-muted-foreground font-medium">Próxima aula:</p>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{nextLesson.date}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{nextLesson.time}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Button Section */}
        <div className="mt-3">
          <Button 
            onClick={onClick}
            className="w-full" 
            size="sm"
            variant="default"
          >
            Ver Aulas
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CourseScheduleCard;