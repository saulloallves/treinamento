
import { useState } from "react";
import { Search, Download, RefreshCw, Award, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CertificatesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");

  const certificates = [
    {
      id: 1,
      studentName: "João Silva",
      courseName: "Segurança no Trabalho",
      issuedDate: "2024-01-10",
      certificateCode: "CERT-2024-001",
      status: "Emitido",
      downloadLink: "#",
      unit: "SP-001"
    },
    {
      id: 2,
      studentName: "Maria Santos",
      courseName: "Atendimento ao Cliente",
      issuedDate: "2024-01-09",
      certificateCode: "CERT-2024-002",
      status: "Emitido",
      downloadLink: "#",
      unit: "SP-001"
    },
    {
      id: 3,
      studentName: "Carlos Oliveira",
      courseName: "Gestão Franqueado",
      issuedDate: "2024-01-08",
      certificateCode: "CERT-2024-003",
      status: "Emitido",
      downloadLink: "#",
      unit: "RJ-002"
    }
  ];

  const courses = [
    { id: 1, name: "Segurança no Trabalho" },
    { id: 2, name: "Atendimento ao Cliente" },
    { id: 3, name: "Gestão Franqueado" }
  ];

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "todos" || cert.courseName === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Certificados</h1>
          <p className="text-brand-gray-dark">Visualizar e gerenciar certificados emitidos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-clean p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-brand-black mb-1">
              Buscar certificado
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
              <Input
                placeholder="Nome do aluno ou código do certificado..."
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
              className="h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="todos">Todos os cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Certificados */}
      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-brand-black">Aluno</th>
                <th className="text-left p-4 font-medium text-brand-black">Curso</th>
                <th className="text-left p-4 font-medium text-brand-black">Código</th>
                <th className="text-left p-4 font-medium text-brand-black">Data de Emissão</th>
                <th className="text-left p-4 font-medium text-brand-black">Unidade</th>
                <th className="text-left p-4 font-medium text-brand-black">Status</th>
                <th className="text-left p-4 font-medium text-brand-black">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-white" />
                      </div>
                      <span className="font-medium text-brand-black">{certificate.studentName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{certificate.courseName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm text-brand-black">
                      {certificate.certificateCode}
                    </code>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{certificate.issuedDate}</span>
                    </div>
                  </td>
                  <td className="p-4 text-brand-gray-dark">{certificate.unit}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {certificate.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Baixar PDF">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Reemitir">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue mb-1">456</div>
          <div className="text-sm text-brand-gray-dark">Total Emitidos</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">23</div>
          <div className="text-sm text-brand-gray-dark">Este Mês</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">89%</div>
          <div className="text-sm text-brand-gray-dark">Taxa Conclusão</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">12</div>
          <div className="text-sm text-brand-gray-dark">Cursos Ativos</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesList;
