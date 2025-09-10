import { useState } from "react";
import { Plus, Search, Edit, Trash2, Video, Clock, Calendar, User, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditLessonDialog from "./EditLessonDialog";
import CreateLessonDialog from "./CreateLessonDialog";
import { useLessons, useDeleteLesson, Lesson } from "@/hooks/useLessons";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FloatingActionButton from "@/components/mobile/FloatingActionButton";

const LessonsListMobile = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [lessonsFilter, setLessonsFilter] = useState<'upcoming' | 'archived'>('upcoming');

  const { data: lessons = [], isLoading } = useLessons(lessonsFilter);
  const { data: courses = [] } = useCourses();
  const deleteLessonMutation = useDeleteLesson();

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      await deleteLessonMutation.mutateAsync(lessonId);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "todos" || lesson.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Group lessons by course
  const lessonsByCourse = filteredLessons.reduce((acc, lesson) => {
    const courseId = lesson.course_id;
    if (!acc[courseId]) {
      acc[courseId] = {
        course: courses.find(c => c.id === courseId),
        lessons: []
      };
    }
    acc[courseId].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { course: any; lessons: Lesson[] }>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Carregando aulas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 no-x-scroll max-w-full">
      {/* Filtros Mobile */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros e Busca
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Buscar aula
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Digite o nome da aula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="todos">Todos os cursos</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs Mobile - Stack em duas linhas */}
      <Tabs defaultValue="upcoming-all" className="w-full">
        <div className="space-y-2">
          {/* Primeira linha */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="upcoming-all" 
              className="text-xs px-2 py-1.5 flex flex-col items-center gap-1"
              onClick={() => setLessonsFilter('upcoming')}
            >
              <span className="font-medium">Próximas</span>
              <span className="text-xs opacity-70">({lessonsFilter === 'upcoming' ? filteredLessons.length : 0})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming-by-course" 
              className="text-xs px-2 py-1.5 flex flex-col items-center gap-1"
              onClick={() => setLessonsFilter('upcoming')}
            >
              <span className="font-medium">Por Curso</span>
              <span className="text-xs opacity-70">Próximas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Segunda linha */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="archived-all" 
              className="text-xs px-2 py-1.5 flex flex-col items-center gap-1"
              onClick={() => setLessonsFilter('archived')}
            >
              <span className="font-medium">Arquivadas</span>
              <span className="text-xs opacity-70">({lessonsFilter === 'archived' ? filteredLessons.length : 0})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="archived-by-course" 
              className="text-xs px-2 py-1.5 flex flex-col items-center gap-1"
              onClick={() => setLessonsFilter('archived')}
            >
              <span className="font-medium">Por Curso</span>
              <span className="text-xs opacity-70">Arquivadas</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming-all" className="mt-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {lessons.length === 0 
                  ? "Nenhuma aula próxima encontrada."
                  : "Nenhuma aula próxima corresponde aos filtros aplicados."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {lesson.courses?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            #{lesson.order_index}
                          </Badge>
                          <Badge 
                            className={`text-xs px-1.5 py-0.5 ${
                              lesson.status === "Ativo"
                                ? "bg-green-100 text-green-700"
                                : lesson.status === "Em revisão"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {lesson.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{lesson.duration_minutes}min</span>
                      </div>
                      
                      {lesson.zoom_start_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {format(new Date(lesson.zoom_start_time), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      
                      {lesson.courses?.tipo === 'ao_vivo' && (lesson.professor_names?.length || lesson.professor_name) && (
                        (() => {
                          const names = lesson.professor_names && lesson.professor_names.length > 0
                            ? lesson.professor_names
                            : (lesson.professor_name ? [lesson.professor_name] : []);
                          return names.length > 0 ? (
                            <div className="flex items-center gap-1 col-span-2">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate">Prof. {names.join(', ')}</span>
                            </div>
                          ) : null;
                        })()
                      )}
                      
                      {lesson.video_url && (
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3 shrink-0" />
                          <span>Vídeo</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      {(lesson.zoom_join_url || lesson.video_url) && (
                        <Button
                          className="flex-1"
                          size="sm"
                          onClick={() =>
                            window.open((lesson.zoom_join_url || lesson.video_url)!, "_blank", "noopener,noreferrer")
                          }
                        >
                          Acessar
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditLesson(lesson)}
                        className="w-8 h-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming-by-course" className="mt-4">
          {Object.keys(lessonsByCourse).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma aula próxima encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(lessonsByCourse).map(([courseId, { course, lessons: courseLessons }]) => (
                <AccordionItem key={courseId} value={courseId} className="border rounded-lg mb-2">
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{course?.name || 'Curso não encontrado'}</span>
                      <Badge variant="secondary" className="text-xs">
                        {courseLessons.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {courseLessons.map((lesson) => (
                        <Card key={lesson.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 line-clamp-2">{lesson.title}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                    #{lesson.order_index}
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration_minutes} min
                                  </div>
                                  {lesson.zoom_start_time && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(lesson.zoom_start_time), "dd/MM HH:mm", { locale: ptBR })}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-1 shrink-0">
                                {(lesson.zoom_join_url || lesson.video_url) && (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      window.open((lesson.zoom_join_url || lesson.video_url)!, "_blank", "noopener,noreferrer")
                                    }
                                  >
                                    Acessar
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditLesson(lesson)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
        
        <TabsContent value="archived-all" className="mt-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {lessons.length === 0 
                  ? "Nenhuma aula arquivada encontrada."
                  : "Nenhuma aula arquivada corresponde aos filtros aplicados."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {lesson.courses?.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                            #{lesson.order_index}
                          </Badge>
                          <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                            Arquivada
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{lesson.duration_minutes}min</span>
                      </div>
                      
                      {lesson.zoom_start_time && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0 text-gray-400" />
                          <span className="truncate">
                            {format(new Date(lesson.zoom_start_time), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                      
                      {lesson.courses?.tipo === 'ao_vivo' && (lesson.professor_names?.length || lesson.professor_name) && (
                        (() => {
                          const names = lesson.professor_names && lesson.professor_names.length > 0
                            ? lesson.professor_names
                            : (lesson.professor_name ? [lesson.professor_name] : []);
                          return names.length > 0 ? (
                            <div className="flex items-center gap-1 col-span-2">
                              <User className="w-3 h-3 shrink-0 text-gray-400" />
                              <span className="truncate">Prof. {names.join(', ')}</span>
                            </div>
                          ) : null;
                        })()
                      )}
                      
                      {lesson.video_url && (
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3 shrink-0 text-gray-400" />
                          <span>Vídeo</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      {(lesson.zoom_join_url || lesson.video_url) && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          size="sm"
                          onClick={() =>
                            window.open((lesson.zoom_join_url || lesson.video_url)!, "_blank", "noopener,noreferrer")
                          }
                        >
                          Acessar
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditLesson(lesson)}
                        className="w-8 h-8 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived-by-course" className="mt-4">
          {Object.keys(lessonsByCourse).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma aula arquivada encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(lessonsByCourse).map(([courseId, { course, lessons: courseLessons }]) => (
                <AccordionItem key={courseId} value={courseId} className="border rounded-lg mb-2">
                  <AccordionTrigger className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{course?.name || 'Curso não encontrado'}</span>
                      <Badge variant="secondary" className="text-xs">
                        {courseLessons.length} arquivadas
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {courseLessons.map((lesson) => (
                        <Card key={lesson.id} className="border-l-4 border-l-gray-300 opacity-75">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 line-clamp-2">{lesson.title}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                                    #{lesson.order_index}
                                  </Badge>
                                  <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600">
                                    Arquivada
                                  </Badge>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {lesson.duration_minutes} min
                                  </div>
                                  {lesson.zoom_start_time && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-gray-400" />
                                      {format(new Date(lesson.zoom_start_time), "dd/MM HH:mm", { locale: ptBR })}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-1 shrink-0">
                                {(lesson.zoom_join_url || lesson.video_url) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open((lesson.zoom_join_url || lesson.video_url)!, "_blank", "noopener,noreferrer")
                                    }
                                  >
                                    Acessar
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditLesson(lesson)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <FloatingActionButton 
        onClick={() => setIsCreateDialogOpen(true)}
        icon={Plus}
        label="Nova Aula"
      />

      {/* Dialogs */}
      <CreateLessonDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <EditLessonDialog
        lesson={editingLesson}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
};

export default LessonsListMobile;