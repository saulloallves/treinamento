import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Unidade } from "@/hooks/useUnidades";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EditUnidadeDialogProps {
  unidade: Unidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUnidadeDialog = ({
  unidade,
  open,
  onOpenChange,
}: EditUnidadeDialogProps) => {
  const [formData, setFormData] = useState({
    grupo: "",
    endereco: "",
    cidade: "",
    estado: "",
    uf: "",
    cep: "",
    email: "",
    telefone: "",
    fase_loja: "",
    etapa_loja: "",
    modelo_loja: "",
  });
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (unidade) {
      setFormData({
        grupo: unidade.grupo || "",
        endereco: unidade.endereco || "",
        cidade: unidade.cidade || "",
        estado: unidade.estado || "",
        uf: unidade.uf || "",
        cep: unidade.cep || "",
        email: unidade.email || "",
        telefone: unidade.telefone?.toString() || "",
        fase_loja: unidade.fase_loja || "",
        etapa_loja: unidade.etapa_loja || "",
        modelo_loja: unidade.modelo_loja || "",
      });
    }
  }, [unidade]);

  const handleSave = async () => {
    if (!unidade) return;
    
    setLoading(true);
    try {
      const updateData = {
        ...formData,
        telefone: formData.telefone ? parseInt(formData.telefone) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("unidades")
        .update(updateData)
        .eq("id", unidade.id);

      if (error) {
        throw error;
      }

      toast.success("Unidade atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["unidades"] });
      queryClient.invalidateQueries({ queryKey: ["unidade", unidade.id] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar unidade:", error);
      toast.error("Erro ao atualizar unidade: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!unidade) return null;

  const faseOptions = ["OPERAÇÃO", "IMPLANTAÇÃO", "PLANEJAMENTO", "CONSTRUÇÃO"];
  const modeloOptions = ["LIGHT", "INTERMEDIARIA", "PREMIUM"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Editar Unidade</span>
            <Badge variant="outline">#{unidade.codigo_grupo}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="grupo">Nome do Grupo</Label>
              <Input
                id="grupo"
                value={formData.grupo}
                onChange={(e) => handleInputChange("grupo", e.target.value)}
                placeholder="Nome da unidade"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fase_loja">Fase</Label>
                <Select
                  value={formData.fase_loja}
                  onValueChange={(value) => handleInputChange("fase_loja", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fase" />
                  </SelectTrigger>
                  <SelectContent>
                    {faseOptions.map((fase) => (
                      <SelectItem key={fase} value={fase}>
                        {fase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo_loja">Modelo</Label>
                <Select
                  value={formData.modelo_loja}
                  onValueChange={(value) => handleInputChange("modelo_loja", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modeloOptions.map((modelo) => (
                      <SelectItem key={modelo} value={modelo}>
                        {modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="etapa_loja">Etapa</Label>
              <Input
                id="etapa_loja"
                value={formData.etapa_loja}
                onChange={(e) => handleInputChange("etapa_loja", e.target.value)}
                placeholder="Etapa atual"
              />
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Localização</h3>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                placeholder="Endereço completo"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange("cidade", e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={formData.uf}
                  onChange={(e) => handleInputChange("uf", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  placeholder="Estado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold">Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUnidadeDialog;