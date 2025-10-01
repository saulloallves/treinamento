
import { useState, useMemo } from "react";
import { Search, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import CertificatesListMobile from "./CertificatesListMobile";
import CertificateTurmaCard from "./CertificateTurmaCard";
import TurmaCertificatesDialog from "./TurmaCertificatesDialog";

const CertificatesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
          turmas(id, name, code, responsavel_name, status)
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
        courseId: c.course_id ?? enr?.course_id,
        turmaName: turma?.name || turma?.code || "Turma não definida",
        turmaStatus: turma?.status,
        professorName: turma?.responsavel_name || "Professor não definido",
        generatedAt: c.generated_at,
        status: c.status,
        url: c.certificate_url as string | null,
      };
    });

    const q = searchTerm.trim().toLowerCase();
    const filtered = enriched.filter((r) => {
      // Filtrar apenas turmas em andamento ou agendadas
      const isActiveTurma = r.turmaStatus === 'em_andamento' || r.turmaStatus === 'agendada';
      const matchesSearch = !q || r.studentName.toLowerCase().includes(q);
      const matchesCourse = selectedCourse === "todos" || r.courseName === selectedCourse;
      return isActiveTurma && matchesSearch && matchesCourse;
    });

    // Group by turma and course
    const grouped = filtered.reduce((acc, cert) => {
      const key = `${cert.turmaName}-${cert.courseId}`;
      if (!acc[key]) {
        acc[key] = {
          turmaName: cert.turmaName,
          courseName: cert.courseName,
          professorName: cert.professorName,
          certificates: []
        };
      }
      acc[key].certificates.push(cert);
      return acc;
    }, {} as Record<string, { turmaName: string; courseName: string; professorName: string; certificates: any[] }>);

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

      {/* Grid de Cards de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groupedByTurma.length === 0 ? (
          <div className="col-span-full card-clean p-8 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum certificado encontrado</p>
          </div>
        ) : (
          groupedByTurma.map((group, index) => (
            <CertificateTurmaCard
              key={`${group.turmaName}-${index}`}
              courseName={group.courseName}
              turmaName={group.turmaName}
              certificatesCount={group.certificates.length}
              onClick={() => {
                setSelectedTurma(group);
                setDialogOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Dialog com Certificados da Turma */}
      {selectedTurma && (
        <TurmaCertificatesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          turmaName={selectedTurma.turmaName}
          professorName={selectedTurma.professorName}
          certificates={selectedTurma.certificates}
        />
      )}

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
