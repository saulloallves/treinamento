
import { useState, useMemo } from "react";
import { Search, Download, RefreshCw, Award, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import CertificatesListMobile from "./CertificatesListMobile";

const CertificatesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const isMobile = useIsMobile();

  if (isMobile) {
    return <CertificatesListMobile />;
  }

  const certsQuery = useQuery({
    queryKey: ["certificates", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          generated_at,
          status,
          certificate_url,
          course_id,
          enrollment_id,
          user_id,
          turma_id
        `)
        .order("generated_at", { ascending: false });
      if (error) { console.error('certificates query error', error); return []; }
      return data ?? [];
    },
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", "for-certs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,name,status")
        .order("name", { ascending: true });
      if (error) { console.error('courses query error', error); return []; }
      return data ?? [];
    },
  });

  const enrollmentsStatsQuery = useQuery({
    queryKey: ["enrollments", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id,progress_percentage");
      if (error) { console.error('enrollments stats query error', error); return []; }
      return data ?? [];
    },
  });

  const enrollmentsForCertsQuery = useQuery({
    queryKey: ["enrollments", "for-certs", certsQuery.data?.length ?? 0],
    enabled: !!certsQuery.data,
    queryFn: async () => {
      const ids = Array.from(new Set((certsQuery.data ?? []).map((c: any) => c.enrollment_id).filter(Boolean)));
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          student_name,
          course_id,
          turma_id,
          turmas(id, name, code, responsavel_name)
        `)
        .in("id", ids);
      if (error) { console.error('enrollments for certs query error', error); return []; }
      return data ?? [];
    },
  });

  const coursesMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of (coursesQuery.data ?? []) as any[]) m.set(c.id, c);
    return m;
  }, [coursesQuery.data]);

  const enrollmentsMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of (enrollmentsForCertsQuery.data ?? []) as any[]) m.set(e.id, e);
    return m;
  }, [enrollmentsForCertsQuery.data]);

  const groupedByTurma = useMemo(() => {
    const all = (certsQuery.data ?? []) as any[];
    const enriched = all.map((c) => {
      const enr = enrollmentsMap.get(c.enrollment_id);
      const course = coursesMap.get(c.course_id ?? enr?.course_id);
      const turma = enr?.turmas;
      return {
        id: c.id,
        studentName: enr?.student_name ?? "—",
        courseName: course?.name ?? "—",
        turmaName: turma?.name || turma?.code || "Turma não definida",
        professorName: turma?.responsavel_name || "Professor não definido",
        generatedAt: c.generated_at,
        status: c.status,
        url: c.certificate_url as string | null,
      };
    });

    const q = searchTerm.trim().toLowerCase();
    const filtered = enriched.filter((r) => {
      const matchesSearch = !q || r.studentName.toLowerCase().includes(q);
      const matchesCourse = selectedCourse === "todos" || r.courseName === selectedCourse;
      return matchesSearch && matchesCourse;
    });

    // Group by turma
    const grouped = filtered.reduce((acc, cert) => {
      const turmaKey = cert.turmaName;
      if (!acc[turmaKey]) {
        acc[turmaKey] = {
          turmaName: cert.turmaName,
          professorName: cert.professorName,
          certificates: []
        };
      }
      acc[turmaKey].certificates.push(cert);
      return acc;
    }, {} as Record<string, { turmaName: string; professorName: string; certificates: any[] }>);

    return Object.values(grouped).sort((a, b) => a.turmaName.localeCompare(b.turmaName));
  }, [certsQuery.data, enrollmentsMap, coursesMap, searchTerm, selectedCourse]);

  const totalCertificates = useMemo(() => {
    return groupedByTurma.reduce((total, group) => total + group.certificates.length, 0);
  }, [groupedByTurma]);

  const stats = useMemo(() => {
    const total = (certsQuery.data ?? []).length;
    const now = new Date();
    const month = (certsQuery.data ?? []).filter((c: any) => {
      const d = new Date(c.generated_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const enr = (enrollmentsStatsQuery.data ?? []) as any[];
    const totalEnr = enr.length || 0;
    const completed = enr.filter((e) => (e.progress_percentage ?? 0) >= 100).length;
    const rate = totalEnr ? Math.round((completed / totalEnr) * 100) : 0;
    const activeCourses = ((coursesQuery.data ?? []) as any[]).filter((c) => c.status === 'Ativo').length;
    return { total, month, rate, activeCourses };
  }, [certsQuery.data, enrollmentsStatsQuery.data, coursesQuery.data]);

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
                placeholder="Nome do aluno..."
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
              {(coursesQuery.data ?? []).map((course: any) => (
                <option key={course.id} value={course.name}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Certificados Agrupados por Turma */}
      <div className="space-y-4">
        {groupedByTurma.length === 0 ? (
          <div className="card-clean p-8 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum certificado encontrado</p>
          </div>
        ) : (
          groupedByTurma.map((group) => (
            <div key={group.turmaName} className="card-clean overflow-hidden">
              {/* Cabeçalho da Turma */}
              <div className="bg-muted/50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{group.turmaName}</h3>
                    <p className="text-sm text-muted-foreground">Professor: {group.professorName}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.certificates.length} certificado{group.certificates.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Tabela de Certificados da Turma */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Aluno</TableHead>
                    <TableHead className="min-w-[180px]">Curso</TableHead>
                    <TableHead className="w-[120px]">Data da Emissão</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                          <span className="font-medium truncate">{cert.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{cert.courseName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">
                            {cert.generatedAt ? new Date(cert.generatedAt).toLocaleDateString('pt-BR') : '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          String(cert.status).toLowerCase() === 'emitido' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {cert.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cert.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </div>

      {/* Estatísticas (reais) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-brand-blue mb-1">{stats.total}</div>
          <div className="text-sm text-brand-gray-dark">Total Emitidos</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.month}</div>
          <div className="text-sm text-brand-gray-dark">Este Mês</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.rate}%</div>
          <div className="text-sm text-brand-gray-dark">Taxa Conclusão</div>
        </div>
        <div className="card-clean p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.activeCourses}</div>
          <div className="text-sm text-brand-gray-dark">Cursos Ativos</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesList;
