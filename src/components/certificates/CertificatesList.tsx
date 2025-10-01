
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

  // Buscar todas as turmas em andamento e agendadas
  const turmasQuery = useQuery({
    queryKey: ["turmas", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select(`
          id,
          name,
          code,
          status,
          responsavel_name,
          course_id,
          courses(id, name)
        `)
        .in("status", ["em_andamento", "agendada"])
        .order("name", { ascending: true });
      if (error) { console.error('turmas query error', error); return []; }
      return data ?? [];
    },
  });

  // Buscar certificados
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

  // Buscar enrollments para relacionar com certificados
  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", "for-certs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, student_name, turma_id");
      if (error) { console.error('enrollments query error', error); return []; }
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

  const enrollmentsMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const e of (enrollmentsQuery.data ?? []) as any[]) m.set(e.id, e);
    return m;
  }, [enrollmentsQuery.data]);

  const groupedByTurma = useMemo(() => {
    const turmas = (turmasQuery.data ?? []) as any[];
    const certificates = (certsQuery.data ?? []) as any[];
    
    // Criar mapa de certificados por turma
    const certsByTurma = certificates.reduce((acc, cert) => {
      const enr = enrollmentsMap.get(cert.enrollment_id);
      if (!enr?.turma_id) return acc;
      
      if (!acc[enr.turma_id]) {
        acc[enr.turma_id] = [];
      }
      
      acc[enr.turma_id].push({
        id: cert.id,
        studentName: enr.student_name ?? "—",
        courseName: "",
        generatedAt: cert.generated_at,
        status: cert.status,
        url: cert.certificate_url as string | null,
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    // Criar grupos de turmas com seus certificados
    const grouped = turmas.map((turma) => {
      const courseName = turma.courses?.name ?? "—";
      const turmaName = turma.name || turma.code || "Turma não definida";
      const professorName = turma.responsavel_name || "Professor não definido";
      const turmaCerts = certsByTurma[turma.id] || [];
      
      // Adicionar courseName aos certificados
      turmaCerts.forEach(cert => {
        cert.courseName = courseName;
      });
      
      return {
        turmaId: turma.id,
        turmaName,
        courseName,
        courseId: turma.course_id,
        professorName,
        certificates: turmaCerts
      };
    });

    // Filtrar por busca e curso
    const q = searchTerm.trim().toLowerCase();
    const filtered = grouped.filter((group) => {
      const matchesCourse = selectedCourse === "todos" || group.courseName === selectedCourse;
      const matchesSearch = !q || group.certificates.some(cert => 
        cert.studentName.toLowerCase().includes(q)
      );
      return matchesCourse && (!q || matchesSearch);
    });

    return filtered.sort((a, b) => a.turmaName.localeCompare(b.turmaName));
  }, [turmasQuery.data, certsQuery.data, enrollmentsMap, searchTerm, selectedCourse]);

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
              key={group.turmaId}
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
