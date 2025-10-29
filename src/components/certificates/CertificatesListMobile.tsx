import { useState, useMemo } from "react";
import { Search, Award, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TurmaCertificatesDialog from "./TurmaCertificatesDialog";

const CertificatesListMobile = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Reutilização de toda a lógica de busca de dados da versão desktop
  const turmasQuery = useQuery({
    queryKey: ["turmas", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("turmas")
        .select("id, name, code, status, responsavel_name, course_id, courses(id, name)")
        .in("status", ["em_andamento", "agendada"])
        .order("name", { ascending: true });
      if (error) { console.error('turmas query error', error); return []; }
      return data ?? [];
    },
  });

  const certsQuery = useQuery({
    queryKey: ["certificates", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id, generated_at, status, certificate_url, course_id, enrollment_id, user_id, turma_id")
        .order("generated_at", { ascending: false });
      if (error) { console.error('certificates query error', error); return []; }
      return data ?? [];
    },
  });

  const eligibleEnrollmentsQuery = useQuery({
    queryKey: ["enrollments", "eligible-for-certs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, student_name, turma_id, user_id, course_id, completed_lessons")
        .gte("progress_percentage", 100);
      if (error) { console.error('eligible enrollments query error', error); return []; }
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

  // Reutilização da lógica de agrupamento e filtragem
  const groupedByTurma = useMemo(() => {
    const turmas = (turmasQuery.data ?? []) as any[];
    const certificates = (certsQuery.data ?? []) as any[];
    const eligibleEnrollments = (eligibleEnrollmentsQuery.data ?? []) as any[];
    
    const certsByEnrollmentId = new Map(certificates.map(c => [c.enrollment_id, c]));

    const allStudentsByTurma = eligibleEnrollments.reduce((acc, enr) => {
      if (!acc[enr.turma_id]) {
        acc[enr.turma_id] = [];
      }
      acc[enr.turma_id].push(enr);
      return acc;
    }, {} as Record<string, any[]>);

    const grouped = turmas.map((turma) => {
      const courseName = turma.courses?.name ?? "—";
      const turmaName = turma.name || turma.code || "Turma não definida";
      const professorName = turma.responsavel_name || "Professor não definido";
      
      const studentsInTurma = allStudentsByTurma[turma.id] || [];
      const issuedCount = studentsInTurma.filter(enr => certsByEnrollmentId.has(enr.id)).length;

      const certificateList = studentsInTurma.map(enr => {
        const existingCert = certsByEnrollmentId.get(enr.id);
        return {
          id: existingCert?.id || enr.id,
          studentName: enr.student_name ?? "—",
          courseName: courseName,
          generatedAt: existingCert?.generated_at || null,
          status: existingCert ? 'Emitido' : 'Pendente',
          url: existingCert?.certificate_url || null,
          enrollmentId: enr.id,
          userId: enr.user_id,
          courseId: enr.course_id,
          completedLessons: enr.completed_lessons || [],
        };
      });

      return {
        turmaId: turma.id,
        turmaName,
        courseName,
        courseId: turma.course_id,
        professorName,
        certificates: certificateList,
        issuedCount,
        pendingCount: studentsInTurma.length - issuedCount
      };
    });

    const q = searchTerm.trim().toLowerCase();
    const filtered = grouped.filter((group) => {
        const matchesCourse = selectedCourse === "todos" || group.courseName === selectedCourse;
        const matchesSearch = !q || 
            group.turmaName.toLowerCase().includes(q) ||
            group.courseName.toLowerCase().includes(q) ||
            group.certificates.some(cert => cert.studentName.toLowerCase().includes(q));
        return matchesCourse && matchesSearch;
    });

    return filtered.sort((a, b) => a.turmaName.localeCompare(b.turmaName));

  }, [turmasQuery.data, certsQuery.data, eligibleEnrollmentsQuery.data, searchTerm, selectedCourse]);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-card p-4 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Aluno, turma ou curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Curso
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Lista de Turmas */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground px-1">Turmas Elegíveis</h3>
        {groupedByTurma.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma turma encontrada com os filtros atuais.</p>
          </div>
        ) : (
          groupedByTurma.map((group) => (
            <button
              key={group.turmaId}
              onClick={() => {
                setSelectedTurma(group);
                setDialogOpen(true);
              }}
              className="w-full text-left bg-card p-4 rounded-lg border hover:bg-muted transition-colors flex flex-col gap-2"
            >
              <div>
                <p className="font-semibold text-foreground">{group.turmaName}</p>
                <p className="text-xs text-muted-foreground">{group.courseName}</p>
              </div>
              <div className="flex items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-muted-foreground"><span className="font-medium text-foreground">{group.issuedCount}</span> Emitidos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-muted-foreground"><span className="font-medium text-foreground">{group.pendingCount}</span> Pendentes</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Dialog com Certificados da Turma (reutilizado) */}
      {selectedTurma && (
        <TurmaCertificatesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          turmaName={selectedTurma.turmaName}
          professorName={selectedTurma.professorName}
          certificates={selectedTurma.certificates}
        />
      )}
    </div>
  );
};

export default CertificatesListMobile;