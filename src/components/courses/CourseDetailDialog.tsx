import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/hooks/useCourses";
import { TurmasList } from "@/components/turmas/TurmasList";
import LessonsListForCourse from "@/components/lessons/LessonsListForCourse";

interface CourseDetailDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CourseDetailDialog = ({ course, open, onOpenChange }: CourseDetailDialogProps) => {
  if (!course) return null;

  const isLiveCourse = course.tipo === 'ao_vivo';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>

          <Tabs defaultValue={isLiveCourse ? "turmas" : "lessons"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {isLiveCourse && (
                <TabsTrigger value="turmas">Turmas</TabsTrigger>
              )}
              <TabsTrigger value="lessons">
                {isLiveCourse ? "Aulas" : "Lições"}
              </TabsTrigger>
            </TabsList>
            
            {isLiveCourse && (
              <TabsContent value="turmas" className="space-y-4">
                <TurmasList courseId={course.id} />
              </TabsContent>
            )}
            
            <TabsContent value="lessons" className="space-y-4">
              <LessonsListForCourse courseId={course.id} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};