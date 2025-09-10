import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useTestSubmissions } from "@/hooks/useTests";

interface TestReportsViewProps {
  testId: string;
}

const TestReportsView = ({ testId }: TestReportsViewProps) => {
  const { data: submissions, isLoading } = useTestSubmissions(testId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedSubmissions = submissions?.filter(s => s.status === 'completed') || [];
  
  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Relatórios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Share className="w-4 h-4" />
              Enviar WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Unit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance por Unidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedSubmissions.length > 0 ? (
            <div className="space-y-4">
              {/* Group by unit logic would go here */}
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="w-16 h-16 mx-auto mb-4" />
                <p>Relatórios detalhados em desenvolvimento...</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4" />
              <p>Dados insuficientes para gerar relatórios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evolution Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Relatórios de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Comparação com Testes Anteriores</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Compare a evolução dos alunos entre diferentes aplicações do teste
              </p>
              <Button variant="outline" size="sm">
                Ver Evolução
              </Button>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Identificação de Necessidades</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Identifique unidades com baixa performance para intervenção
              </p>
              <Button variant="outline" size="sm">
                Gerar Relatório
              </Button>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Acompanhamento de Meta</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Monitore o progresso em direção à meta de 100% de êxito
              </p>
              <Button variant="outline" size="sm">
                Ver Progresso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Integração WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Aprovados</h4>
              <p className="text-sm text-green-600 mb-3">
                Envie mensagens de parabenização para os aprovados
              </p>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Enviar Mensagens
              </Button>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Reprovados</h4>
              <p className="text-sm text-red-600 mb-3">
                Notifique sobre necessidade de revisão e novo teste
              </p>
              <Button size="sm" variant="outline" className="border-red-600 text-red-600">
                Enviar Notificações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReportsView;