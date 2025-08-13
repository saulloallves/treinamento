import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/hooks/useQuiz";
import EditQuizDialog from "./EditQuizDialog";

const QuizList = () => {
  const { toast } = useToast();
  const { data: quizQuestions = [], isLoading, deleteQuestion } = useQuiz();
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

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
    <div className="space-y-4">
      {quizQuestions.map((question: any) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-lg">{question.question}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{question.courses?.name || 'Curso não informado'}</Badge>
                  <Badge variant="secondary">{question.lessons?.title || 'Aula não informada'}</Badge>
                </div>
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
          <CardContent>
            <div className="space-y-2">
              <div className="mb-2">
                <Badge variant={question.question_type === 'essay' ? 'default' : 'secondary'}>
                  {question.question_type === 'essay' ? 'Dissertativa' : 'Múltipla Escolha'}
                </Badge>
              </div>
              
              {question.question_type === 'multiple_choice' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className={`p-2 rounded ${question.correct_answer === 'A' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                      <strong>A)</strong> {question.option_a}
                    </div>
                    <div className={`p-2 rounded ${question.correct_answer === 'B' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                      <strong>B)</strong> {question.option_b}
                    </div>
                    {question.option_c && (
                      <div className={`p-2 rounded ${question.correct_answer === 'C' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                        <strong>C)</strong> {question.option_c}
                      </div>
                    )}
                    {question.option_d && (
                      <div className={`p-2 rounded ${question.correct_answer === 'D' ? 'bg-green-100 text-green-800' : 'bg-muted'}`}>
                        <strong>D)</strong> {question.option_d}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resposta correta: <strong>{question.correct_answer}</strong>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <em>Pergunta dissertativa - respostas serão avaliadas manualmente</em>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <EditQuizDialog
        question={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      />
    </div>
  );
};

export default QuizList;