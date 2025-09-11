import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useTests } from "@/hooks/useTests";
import { useTurmas } from "@/hooks/useTurmas";

interface CreateTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestCreated: () => void;
}

export const CreateTestDialog = ({ open, onOpenChange, onTestCreated }: CreateTestDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    turma_id: "",
    course_id: "",
    passing_percentage: 70,
    max_attempts: 1,
    time_limit_minutes: null as number | null,
  });
  const [applicationDate, setApplicationDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);

  const { createTest } = useTests();
  const { data: turmas, isLoading: loadingTurmas } = useTurmas();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.turma_id) {
      toast.error("Nome do teste e turma são obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await createTest({
        ...formData,
        status: "draft"
      });

      toast.success("Teste criado com sucesso!");
      onTestCreated();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        turma_id: "",
        course_id: "",
        passing_percentage: 70,
        max_attempts: 1,
        time_limit_minutes: null,
      });
      setApplicationDate(undefined);
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Erro ao criar teste");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTurmaChange = (turmaId: string) => {
    const selectedTurma = turmas?.find(t => t.id === turmaId);
    setFormData(prev => ({
      ...prev,
      turma_id: turmaId,
      course_id: selectedTurma?.course_id || ""
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Teste Avaliativo
          </DialogTitle>
          <DialogDescription>
            Configure um novo teste com sistema de pontuação diferenciada (0, 1, 2 pontos)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Teste */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Teste *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Avaliação de Vendas - Módulo 1"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o objetivo e conteúdo do teste..."
              rows={3}
            />
          </div>

          {/* Turma */}
          <div className="space-y-2">
            <Label htmlFor="turma">Turma *</Label>
            <Select onValueChange={handleTurmaChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {loadingTurmas ? (
                  <SelectItem value="loading" disabled>Carregando turmas...</SelectItem>
                ) : turmas && turmas.length > 0 ? (
                  turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.name} - {turma.code}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-turmas" disabled>Nenhuma turma encontrada</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Taxa de Aprovação */}
            <div className="space-y-2">
              <Label htmlFor="passing_percentage">Taxa de Aprovação (%)</Label>
              <Input
                id="passing_percentage"
                type="number"
                min="1"
                max="100"
                value={formData.passing_percentage}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  passing_percentage: parseInt(e.target.value) || 70 
                }))}
              />
            </div>

            {/* Máximo de Tentativas */}
            <div className="space-y-2">
              <Label htmlFor="max_attempts">Máximo de Tentativas</Label>
              <Input
                id="max_attempts"
                type="number"
                min="1"
                max="10"
                value={formData.max_attempts}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_attempts: parseInt(e.target.value) || 1 
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tempo Limite */}
            <div className="space-y-2">
              <Label htmlFor="time_limit">Tempo Limite (minutos)</Label>
              <Input
                id="time_limit"
                type="number"
                min="5"
                max="180"
                value={formData.time_limit_minutes || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  time_limit_minutes: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Opcional - deixe vazio para sem limite"
              />
            </div>

            {/* Data de Aplicação */}
            <div className="space-y-2">
              <Label>Data de Aplicação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !applicationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {applicationDate ? (
                      format(applicationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      "Selecionar data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={applicationDate}
                    onSelect={setApplicationDate}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Informação sobre Sistema de Pontuação */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Sistema de Pontuação</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Resposta Errada:</strong> 0 pontos</p>
              <p>• <strong>Resposta Mediana:</strong> 1 ponto</p>
              <p>• <strong>Resposta Correta:</strong> 2 pontos</p>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              A nota final será calculada como: (pontos obtidos / pontos totais) × 100%
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Teste"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};