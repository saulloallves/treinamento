import { useState } from "react";
import { Edit, Trash2, Filter, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";
import { useCourses } from "@/hooks/useCourses";
import EditQuizDialog from "./EditQuizDialog";
import DuplicateQuizDialog from "./DuplicateQuizDialog";

const QuizGroupedList = () => {
  const { toast } = useToast();
  const { data: quizQuestions = [], isLoading, deleteQuestion } = useQuiz();
  const { data: courses = [] } = useCourses();
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [duplicatingQuiz, setDuplicatingQuiz] = useState<{ questions: any[], quizName: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [expandedQuizzes, setExpandedQuizzes] = useState<Record<string, boolean>>({});

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion.mutateAsync(id);
      toast({
        title: "Pergunta excluída",
        description: "A pergunta foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta.",
        variant: "destructive",
      });
    }
  };

  // Group questions by quiz_name
  const groupedQuestions = quizQuestions.reduce((acc: any, question: any) => {
    const quizName = question.quiz_name || "Quiz sem nome";
    if (!acc[quizName]) {
      acc[quizName] = [];
    }
    acc[quizName].push(question);
    return acc;
  }, {});

  // Filter questions based on search and filters
  const filteredGroups = Object.entries(groupedQuestions).filter(([quizName, questions]: [string, any[]]) => {
    const matchesSearch = quizName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      questions.some((q: any) => q.question.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCourse = !selectedCourse || questions.some((q: any) => q.course_id === selectedCourse);
    const matchesType = !selectedType || questions.some((q: any) => q.question_type === selectedType);
    
    return matchesSearch && matchesCourse && matchesType;
  });

  const toggleQuizExpansion = (quizName: string) => {
    setExpandedQuizzes(prev => ({
      ...prev,
      [quizName]: !prev[quizName]
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma pergunta cadastrada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <Input
                placeholder="Nome do quiz ou pergunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={selectedCourse || undefined} onValueChange={(value) => setSelectedCourse(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os cursos" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={selectedType || undefined} onValueChange={(value) => setSelectedType(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="essay">Dissertativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Quizzes Agrupados */}
      <div className="space-y-4">
        {filteredGroups.map(([quizName, questions]: [string, any[]]) => (
          <Card key={quizName}>
            <Collapsible
              open={expandedQuizzes[quizName]}
              onOpenChange={() => toggleQuizExpansion(quizName)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedQuizzes[quizName] ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{quizName}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">
                            {questions.length} pergunta{questions.length > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="secondary">
                            {questions[0]?.courses?.name || 'Curso não informado'}
                          </Badge>
                          {questions[0]?.lessons?.title && (
                            <Badge variant="outline">
                              {questions[0].lessons.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuplicatingQuiz({ questions, quizName });
                        }}
                        title="Duplicar quiz"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {questions.map((question: any, index: number) => (
                      <Card key={question.id} className="border-l-4 border-l-primary/20">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Pergunta {index + 1}
                                </span>
                                <Badge variant={question.question_type === 'essay' ? 'default' : 'secondary'}>
                                  {question.question_type === 'essay' ? 'Dissertativa' : 'Múltipla Escolha'}
                                </Badge>
                              </div>
                              <p className="font-medium">{question.question}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingQuestion(question)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(question.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {question.question_type === 'multiple_choice' && (
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted'}`}>
                                <strong>A)</strong> {question.option_a}
                              </div>
                              <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted'}`}>
                                <strong>B)</strong> {question.option_b}
                              </div>
                              {question.option_c && (
                                <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted'}`}>
                                  <strong>C)</strong> {question.option_c}
                                </div>
                              )}
                              {question.option_d && (
                                <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-muted'}`}>
                                  <strong>D)</strong> {question.option_d}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              Resposta correta: <strong>{question.correct_answer}</strong>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum quiz encontrado com os filtros aplicados
        </div>
      )}

      <EditQuizDialog
        question={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      />

      {duplicatingQuiz && (
        <DuplicateQuizDialog
          questions={duplicatingQuiz.questions}
          quizName={duplicatingQuiz.quizName}
          open={!!duplicatingQuiz}
          onOpenChange={(open) => !open && setDuplicatingQuiz(null)}
        />
      )}
    </div>
  );
};

export default QuizGroupedList;