import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, AlertTriangle, CheckCircle, Mail, UserPlus } from "lucide-react";
import { useBulkCreateFranchisees } from "@/hooks/useBulkCreateFranchisees";
import { useFixEmailFormatting } from "@/hooks/useFixEmailFormatting";

interface BulkCreateFranchiseesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkCreateFranchiseesDialog = ({ open, onOpenChange }: BulkCreateFranchiseesDialogProps) => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const bulkCreateMutation = useBulkCreateFranchisees();
  const fixEmailMutation = useFixEmailFormatting();

  const handleFixEmails = async () => {
    try {
      await fixEmailMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao corrigir emails:", error);
    }
  };

  const handleCreateAll = async () => {
    try {
      const result = await bulkCreateMutation.mutateAsync();
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error("Erro ao criar franqueados:", error);
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setResults(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <DialogTitle>Criar Alunos Franqueados</DialogTitle>
          </div>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação irá criar contas de <strong>aluno</strong> para todos os franqueados com base na tabela de unidades.
                <br />
                <strong>Perfil:</strong> Aluno Franqueado
                <br />
                <strong>Senha padrão:</strong> Trocar01
                <br />
                <strong>Atenção:</strong> Apenas unidades com email válido serão processadas.
                <br />
                <strong>Dica:</strong> Se houver emails malformatados, corrija-os primeiro clicando no botão abaixo.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleFixEmails}
                disabled={fixEmailMutation.isPending}
                className="flex items-center gap-2"
              >
                {fixEmailMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Mail className="h-4 w-4" />
                Corrigir Formatação dos Emails
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">O que será feito:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Buscar todas as unidades com email cadastrado</li>
                <li>• Criar conta de <strong>aluno</strong> para cada franqueado</li>
                <li>• Definir perfil como <strong>"Franqueado"</strong></li>
                <li>• Definir senha padrão: "Trocar01"</li>
                <li>• Vincular franqueado à sua respectiva unidade</li>
                <li>• Aprovar automaticamente o acesso</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Resultado do Processamento</h3>
              <div className="flex gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {results?.summary?.success || 0} Criados
                </Badge>
                {results?.summary?.errors > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {results.summary.errors} Erros
                  </Badge>
                )}
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {results?.message}
              </AlertDescription>
            </Alert>

            {results?.results && results.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <h4 className="font-medium text-sm">Detalhes:</h4>
                {results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    <div>
                      <span className="font-medium">{result.unitName}</span>
                      <span className="text-xs ml-2">({result.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-xs">{result.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!showResults ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={bulkCreateMutation.isPending || fixEmailMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAll}
                disabled={bulkCreateMutation.isPending || fixEmailMutation.isPending}
              >
                {bulkCreateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Todos os Alunos Franqueados
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCreateFranchiseesDialog;