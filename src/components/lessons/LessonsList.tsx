import StreamingLessonButton from '@/components/streaming/StreamingLessonButton';
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Video, Clock, ExternalLink, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationCustom } from "@/components/ui/pagination-custom";
import EditLessonDialog from "./EditLessonDialog";
import CreateLessonDialog from "./CreateLessonDialog";
import { useLessons, useDeleteLesson, Lesson } from "@/hooks/useLessons";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import LessonsListMobile from "./LessonsListMobile";

const LessonsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const isMobile = useIsMobile();

  const [lessonsFilter, setLessonsFilter] = useState<'upcoming' | 'archived'>('upcoming');
  const [activeTab, setActiveTab] = useState('upcoming-all');
  const { data: lessons = [], isLoading } = useLessons(lessonsFilter);
  const { data: courses = [] } = useCourses();
  const deleteLessonMutation = useDeleteLesson();

  // Get both upcoming and archived lessons separately for correct counts
  const { data: upcomingLessons = [] } = useLessons('upcoming');
  const { data: archivedLessons = [] } = useLessons('archived');

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

  // Pagination logic
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLessons = filteredLessons.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

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

  const handleTabChange = (tabType: 'upcoming' | 'archived', tabValue: string) => {
    setLessonsFilter(tabType);
    setActiveTab(tabValue);
    setCurrentPage(1); // Reset pagination when changing tabs
  };

  if (isMobile) {
    return <LessonsListMobile />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-brand-gray-dark">Carregando aulas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 no-x-scroll">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-brand-black">Aulas</h1>
          <p className="text-sm sm:text-base text-brand-gray-dark">Gerencie as aulas dos cursos</p>
        </div>
        <Button 
          className="btn-primary shrink-0 w-full sm:w-auto"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nova Aula
        </Button>
      </div>

      {/* Filtros */}
      <Accordion type="single" collapsible className="w-full" defaultValue="filters">
        <AccordionItem value="filters">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Filtros e Busca
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="card-clean p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Buscar aula
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
                    <Input
                      placeholder="Digite o nome da aula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-1">
                    Curso
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Tabs por Status e Organização */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="upcoming-all"
            onClick={() => handleTabChange('upcoming', 'upcoming-all')}
          >
            Próximas Aulas ({upcomingLessons.length})
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming-by-course"
            onClick={() => handleTabChange('upcoming', 'upcoming-by-course')}
          >
            Próximas por Curso
          </TabsTrigger>
          <TabsTrigger 
            value="archived-all"
            onClick={() => handleTabChange('archived', 'archived-all')}
          >
            Aulas Arquivadas ({archivedLessons.length})
          </TabsTrigger>
          <TabsTrigger 
            value="archived-by-course"
            onClick={() => handleTabChange('archived', 'archived-by-course')}
          >
            Arquivadas por Curso
          </TabsTrigger>
        </TabsList>
        
        {/* Próximas Aulas - Lista */}
        <TabsContent value="upcoming-all" className="mt-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">
                Nenhuma aula próxima encontrada para os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {paginatedLessons.map((lesson) => (
                  <div key={lesson.id} className="card-clean border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Content Section */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title and badges row */}
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-brand-black line-clamp-1 mb-1">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-brand-gray-dark">
                                <span className="font-medium">{lesson.courses?.name}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-2 py-1 text-xs rounded-md font-medium ${
                                  lesson.status === "Ativo"
                                    ? "bg-green-100 text-green-700"
                                    : lesson.status === "Em revisão"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {lesson.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Meta information row */}
                          <div className="flex items-center gap-6 text-sm text-brand-gray-dark">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-brand-blue" />
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                            
                            {lesson.zoom_start_time && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-brand-blue" />
                                <span>
                                  {format(new Date(lesson.zoom_start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            )}
                            
                            {lesson.video_url && (
                              <div className="flex items-center gap-1">
                                <Video className="w-4 h-4 text-brand-blue" />
                                <span>Vídeo disponível</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions Section */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Show only Zoom button for Zoom lessons, or streaming/video buttons for others */}
                          {lesson.zoom_join_url ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                window.open(lesson.zoom_join_url!, "_blank", "noopener,noreferrer")
                              }
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Entrar no Zoom
                            </Button>
                          ) : (
                            <>
                              <StreamingLessonButton
                                lessonId={lesson.id}
                                hasZoomUrl={false}
                                streamStatus={(lesson as any).live_stream_status || 'waiting'}
                              />
                              {lesson.video_url && (
                                <Button
                                  size="sm"
                                  className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 h-9"
                                  onClick={() =>
                                    window.open(lesson.video_url!, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <Video className="w-4 h-4 mr-1" />
                                  Ver Vídeo
                                </Button>
                              )}
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditLesson(lesson)}
                            disabled={deleteLessonMutation.isPending}
                            className="h-9 px-3"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={deleteLessonMutation.isPending}
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredLessons.length > itemsPerPage && (
                <PaginationCustom
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredLessons.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemName="aulas"
                />
              )}
            </div>
          )}
        </TabsContent>

        {/* Próximas Aulas - Por Curso */}
        <TabsContent value="upcoming-by-course" className="mt-4">
          {Object.keys(lessonsByCourse).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">Nenhuma aula próxima encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(lessonsByCourse).map(([courseId, { course, lessons: courseLessons }]) => (
                <AccordionItem key={courseId} value={courseId}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course?.name || 'Curso não encontrado'}</span>
                      <span className="text-sm text-brand-gray-dark">({courseLessons.length} aulas)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {courseLessons.map((lesson) => (
                        <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between gap-4">
                            {/* Content Section */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-brand-black line-clamp-1">{lesson.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-md font-medium ${
                                      lesson.status === "Ativo"
                                        ? "bg-green-100 text-green-700"
                                        : lesson.status === "Em revisão"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {lesson.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-brand-gray-dark">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-brand-blue" />
                                  <span>{lesson.duration_minutes} min</span>
                                </div>
                                {lesson.zoom_start_time && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-brand-blue" />
                                    <span>{format(new Date(lesson.zoom_start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {lesson.zoom_join_url ? (
                                <Button
                                  size="sm"
                                  className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 h-9"
                                  onClick={() =>
                                    window.open(lesson.zoom_join_url!, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Entrar no Zoom
                                </Button>
                              ) : (
                                <>
                                  <StreamingLessonButton
                                    lessonId={lesson.id}
                                    hasZoomUrl={false}
                                    streamStatus={(lesson as any).live_stream_status || 'waiting'}
                                  />
                                  {lesson.video_url && (
                                    <Button
                                      size="sm"
                                      className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 h-9"
                                      onClick={() =>
                                        window.open(lesson.video_url!, "_blank", "noopener,noreferrer")
                                      }
                                    >
                                      <Video className="w-4 h-4 mr-1" />
                                      Ver Vídeo
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditLesson(lesson)}
                                disabled={deleteLessonMutation.isPending}
                                className="h-9 px-3"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                disabled={deleteLessonMutation.isPending}
                                className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* Aulas Arquivadas - Lista */}
        <TabsContent value="archived-all" className="mt-4">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">
                Nenhuma aula arquivada encontrada para os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {paginatedLessons.map((lesson) => (
                  <div key={lesson.id} className="card-clean border border-gray-200 hover:shadow-md transition-shadow opacity-75">
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Content Section */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Title and badges row */}
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-brand-black line-clamp-1 mb-1">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-brand-gray-dark">
                                <span className="font-medium">{lesson.courses?.name}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600 font-medium">
                                Arquivada
                              </span>
                            </div>
                          </div>
                          
                          {/* Meta information row */}
                          <div className="flex items-center gap-6 text-sm text-brand-gray-dark">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-brand-blue" />
                              <span>{lesson.duration_minutes} min</span>
                            </div>
                            
                            {lesson.zoom_start_time && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-brand-blue" />
                                <span>
                                  {format(new Date(lesson.zoom_start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            )}
                            
                            {lesson.video_url && (
                              <div className="flex items-center gap-1">
                                <Video className="w-4 h-4 text-brand-blue" />
                                <span>Vídeo disponível</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions Section */}
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.video_url && (
                            <Button
                              size="sm"
                              className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 h-9"
                              onClick={() =>
                                window.open(lesson.video_url!, "_blank", "noopener,noreferrer")
                              }
                            >
                              <Video className="w-4 h-4 mr-1" />
                              Ver Vídeo
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditLesson(lesson)}
                            disabled={deleteLessonMutation.isPending}
                            className="h-9 px-3"
                            style={{ color: '#007BFF', borderColor: '#d1d5db' }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            disabled={deleteLessonMutation.isPending}
                            className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredLessons.length > itemsPerPage && (
                <PaginationCustom
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredLessons.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemName="aulas"
                />
              )}
            </div>
          )}
        </TabsContent>

        {/* Aulas Arquivadas - Por Curso */}
        <TabsContent value="archived-by-course" className="mt-4">
          {Object.keys(lessonsByCourse).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-gray-dark">Nenhuma aula arquivada encontrada para os filtros aplicados.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(lessonsByCourse).map(([courseId, { course, lessons: courseLessons }]) => (
                <AccordionItem key={courseId} value={courseId}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{course?.name || 'Curso não encontrado'}</span>
                      <span className="text-sm text-brand-gray-dark">({courseLessons.length} aulas arquivadas)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {courseLessons.map((lesson) => (
                        <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow opacity-75">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-brand-black line-clamp-1">{lesson.title}</h4>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600 font-medium">
                                    Arquivada
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 text-sm text-brand-gray-dark">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-brand-blue" />
                                  <span>{lesson.duration_minutes} min</span>
                                </div>
                                {lesson.zoom_start_time && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-brand-blue" />
                                    <span>{format(new Date(lesson.zoom_start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              {lesson.video_url && (
                                <Button
                                  size="sm"
                                  className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 h-9"
                                  onClick={() =>
                                    window.open(lesson.video_url!, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <Video className="w-4 h-4 mr-1" />
                                  Ver Vídeo
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditLesson(lesson)}
                                disabled={deleteLessonMutation.isPending}
                                className="h-9 px-3"
                                style={{ color: '#007BFF', borderColor: '#d1d5db' }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                disabled={deleteLessonMutation.isPending}
                                className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>

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

export default LessonsList;