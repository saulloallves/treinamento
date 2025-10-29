import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateTurma } from "@/hooks/useTurmas";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Video } from "lucide-react";
import { format } from "date-fns";

interface CreateTurmaDialogProps {
  courseId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTurmaDialog = ({ courseId, open, onOpenChange }: CreateTurmaDialogProps) => {
  const [selectedType, setSelectedType] = useState<"ao_vivo" | "gravado" | "">(courseId ? "" : "");
  const [formData, setFormData] = useState({
    course_id: courseId || "",
    name: "",
    code: "",
    responsavel_user_id: "",
    completion_deadline: undefined as Date | undefined,
    enrollment_open_at: "",
    enrollment_close_at: "",
    capacity: ""
  });

  const createTurma = useCreateTurma();

  // Fetch professors/teachers
  const { data: professors = [] } = useQuery({
    queryKey: ['professors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('user_type', 'Professor')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Get course info when courseId is provided
  const { data: preselectedCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, tipo')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId
  });

  // Set selectedType when preselected course is loaded
  useEffect(() => {
    if (preselectedCourse && !selectedType) {
      setSelectedType(preselectedCourse.tipo as "ao_vivo" | "gravado");
    }
  }, [preselectedCourse, selectedType]);

  // Reset course when type changes
  const handleTypeChange = (type: "ao_vivo" | "gravado") => {
    setSelectedType(type);
    if (!courseId) {
      setFormData({ ...formData, course_id: "" });
    }
  };

  // Fetch courses based on selected type
  const { data: availableCourses } = useQuery({
    queryKey: ['courses', selectedType],
    queryFn: async () => {
      if (!selectedType && !courseId) return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, tipo')
        .eq('tipo', selectedType || 'ao_vivo')
        .eq('status', 'Ativo')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!selectedType || !!courseId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id || !formData.responsavel_user_id || !formData.completion_deadline || !formData.enrollment_open_at || !formData.enrollment_close_at) {
      return;
    }

    const selectedProfessor = professors.find(p => p.id === formData.responsavel_user_id);

    try {
      await createTurma.mutateAsync({
        course_id: formData.course_id,
        name: formData.name || undefined,
        code: formData.code || undefined,
        responsavel_user_id: formData.responsavel_user_id,
        responsavel_name: selectedProfessor?.name || "",
        completion_deadline: formData.completion_deadline ? format(formData.completion_deadline, "yyyy-MM-dd") : "",
        enrollment_open_at: formData.enrollment_open_at,
        enrollment_close_at: formData.enrollment_close_at,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      });
      
      setFormData({
        course_id: courseId || "",
        name: "",
        code: "",
        responsavel_user_id: "",
        completion_deadline: undefined,
        enrollment_open_at: "",
        enrollment_close_at: "",
        capacity: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating turma:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Criar Nova Turma</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Type Selection */}
          {!courseId && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Tipo de Curso *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecione o tipo de curso para a turma
                </p>
              </div>
              
              <RadioGroup 
                value={selectedType} 
                onValueChange={handleTypeChange}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="ao_vivo" id="ao_vivo" />
                  <div className="flex items-center space-x-2 flex-1">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="ao_vivo" className="font-medium cursor-pointer">
                        Curso Ao Vivo
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Aulas ao vivo com professor (online)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="gravado" id="gravado" />
                  <div className="flex items-center space-x-2 flex-1">
                    <Video className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="gravado" className="font-medium cursor-pointer">
                        Treinamento Online
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Conteúdo gravado para estudo
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Course Selection */}
          {(selectedType || courseId) && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    {selectedType === "ao_vivo" ? "Curso Selecionado" : "Treinamento Selecionado"}
                  </Label>
                </div>
                
                {!courseId ? (
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={`Selecione um ${selectedType === "ao_vivo" ? "curso" : "treinamento"}`} 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-accent/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      Curso pré-selecionado
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 3: Basic Information */}
          {(selectedType || courseId) && formData.course_id && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Informações Básicas</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Turma (opcional)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Turma Janeiro 2024"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="code">Código (opcional)</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: T001"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsavel">Professor Responsável *</Label>
                  <Select
                    value={formData.responsavel_user_id}
                    onValueChange={(value) => setFormData({ ...formData, responsavel_user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 4: Dates Configuration */}
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base font-medium">Configurações de Datas</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enrollment_open_at">Abertura das Inscrições *</Label>
                    <Input
                      id="enrollment_open_at"
                      type="datetime-local"
                      value={formData.enrollment_open_at}
                      onChange={(e) => setFormData({ ...formData, enrollment_open_at: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="enrollment_close_at">Fechamento das Inscrições *</Label>
                    <Input
                      id="enrollment_close_at"
                      type="datetime-local"
                      value={formData.enrollment_close_at}
                      onChange={(e) => setFormData({ ...formData, enrollment_close_at: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="completion_deadline">Prazo de Conclusão *</Label>
                    <DatePicker
                      date={formData.completion_deadline}
                      onDateChange={(date) => setFormData({ ...formData, completion_deadline: date })}
                      placeholder="Selecione o prazo"
                      disablePast
                    />
                  </div>

                  <div>
                    <Label htmlFor="capacity">Capacidade (opcional)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="Ex: 30"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Separator />
              
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTurma.isPending || !formData.responsavel_user_id || !formData.completion_deadline || !formData.enrollment_open_at || !formData.enrollment_close_at || (!courseId && !formData.course_id)}
                  className="min-w-[120px]"
                >
                  {createTurma.isPending ? "Criando..." : "Criar Turma"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};