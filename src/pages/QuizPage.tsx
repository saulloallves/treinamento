import { useState } from "react";
import { Plus } from "lucide-react";
import BaseLayout from "@/components/BaseLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizList from "@/components/quiz/QuizList";
import CreateQuizDialog from "@/components/quiz/CreateQuizDialog";

const QuizPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <BaseLayout title="Quiz">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quiz</h1>
            <p className="text-muted-foreground">Gerencie perguntas e respostas dos cursos</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Pergunta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Perguntas do Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <QuizList />
          </CardContent>
        </Card>

        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </BaseLayout>
  );
};

export default QuizPage;