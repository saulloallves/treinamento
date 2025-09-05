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
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 h-64 bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-center mb-2">
          <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center text-lg leading-tight line-clamp-2 h-14 flex items-center justify-center">
          {courseName}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 flex flex-col justify-between flex-1">
        <div className="space-y-2 flex-1">
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-xs">
              {lessonsCount} {lessonsCount === 1 ? 'aula' : 'aulas'}
            </Badge>
          </div>
          
          {nextLesson && (
            <div className="space-y-1 text-center">
              <p className="text-xs text-muted-foreground font-medium">Próxima aula:</p>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{nextLesson.date}</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{nextLesson.time}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onClick}
          className="w-full mt-4" 
          size="sm"
          variant="default"
        >
          Ver Aulas
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseScheduleCard;