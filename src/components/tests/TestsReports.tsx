import { useState } from "react";
import { Download, Filter, Calendar, Building2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const TestsReports = () => {
  const [filters, setFilters] = useState({
    testId: "all",
    unitCode: "all",
    period: "last30days",
    reportType: "general"
  });

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting report in ${format} format with filters:`, filters);
    // Implementation for export functionality
  };

  const reportTypes = [
    { value: "general", label: "Relatório Geral", description: "Visão completa de todos os testes" },
    { value: "byStudent", label: "Por Aluno", description: "Performance individual detalhada" },
    { value: "byUnit", label: "Por Unidade/Loja", description: "Comparativo entre unidades" },
    { value: "evolution", label: "Evolução", description: "Progresso dos alunos ao longo do tempo" },
    { value: "questions", label: "Análise de Questões", description: "Performance por questão" }
  ];

  const predefinedReports = [
    {
      title: "Relatório Mensal - Janeiro 2024",
      description: "Desempenho geral de todos os testes em Janeiro",
      tests: 8,
      students: 125,
      passRate: 78.5,
      generatedAt: "2024-01-31"
    },
    {
      title: "Performance por Unidade - Q4 2023",
      description: "Comparativo entre todas as lojas no último trimestre",
      tests: 15,
      students: 234,
      passRate: 82.1,
      generatedAt: "2024-01-05"
    },
    {
      title: "Evolução de Alunos - Programa Vendas",
      description: "Acompanhamento da evolução nos testes de vendas",
      tests: 6,
      students: 89,
      passRate: 85.3,
      generatedAt: "2024-01-20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Gerar Novo Relatório
          </CardTitle>
          <CardDescription>
            Configure os filtros e gere relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={filters.reportType} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, reportType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Teste Específico</label>
              <Select value={filters.testId} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, testId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os testes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os testes</SelectItem>
                  <SelectItem value="test1">Avaliação de Vendas</SelectItem>
                  <SelectItem value="test2">Teste de Atendimento</SelectItem>
                  <SelectItem value="test3">Avaliação Técnica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade/Loja</label>
              <Select value={filters.unitCode} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, unitCode: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  <SelectItem value="centro">Loja Centro</SelectItem>
                  <SelectItem value="norte">Loja Norte</SelectItem>
                  <SelectItem value="sul">Loja Sul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={filters.period} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, period: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Report Type Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">
              {reportTypes.find(t => t.value === filters.reportType)?.label}
            </h4>
            <p className="text-sm text-blue-800">
              {reportTypes.find(t => t.value === filters.reportType)?.description}
            </p>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')}>
              <Download className="h-4 w-4 mr-1" />
              Exportar Excel
            </Button>
            <Button onClick={() => handleExport('pdf')}>
              <Download className="h-4 w-4 mr-1" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Salvos</CardTitle>
          <CardDescription>
            Relatórios gerados anteriormente prontos para download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predefinedReports.map((report, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {report.tests} testes
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {report.students} alunos
                  </div>
                  <Badge variant="outline">
                    {report.passRate}% aprovação
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Compartilhamento via WhatsApp</CardTitle>
          <CardDescription>
            Envie relatórios diretamente para responsáveis e gestores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Recursos de Compartilhamento</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Envio automático de resultados para gestores por unidade</li>
              <li>• Notificações de aprovação/reprovação para responsáveis</li>
              <li>• Relatórios executivos semanais via WhatsApp</li>
              <li>• Alertas de baixa performance em tempo real</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              Configurar Destinatários
            </Button>
            <Button variant="outline">
              Agendar Envios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};