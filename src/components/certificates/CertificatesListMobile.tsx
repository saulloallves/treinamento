import { useState, useMemo, useEffect } from "react";
import { Search, Download, RefreshCw, Award, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";


const formatBRDateSafe = (date: string | Date | null | undefined): string => {
  try {
    if (!date) return "—";
    const dt = typeof date === "string" ? new Date(date) : date;
    return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
};

const CertificatesListMobile = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const isMobile = useIsMobile();

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

  const rows = useMemo(() => {
    try {
      const all = (certsQuery.data ?? []) as any[];
      const enriched = all.map((c) => {
        const enr = enrollmentsMap.get(c.enrollment_id);
        const course = coursesMap.get(c.course_id ?? enr?.course_id);
        const turma = enr?.turmas;
        return {
          id: c.id,
          studentName: enr?.student_name ?? "—",
          courseName: course?.name ?? "—",
          courseId: course?.id ?? c.course_id ?? enr?.course_id ?? null,
          turmaName: turma?.name || turma?.code || "Turma não definida",
          professorName: turma?.responsavel_name || "Professor não definido",
          generatedAt: c.generated_at ?? null,
          status: String(c.status ?? "—"),
          url: typeof c.certificate_url === "string" ? c.certificate_url : null,
        };
      });
      const q = searchTerm.trim().toLowerCase();
      const filtered = enriched.filter((r) => {
        const matchesSearch = !q || (r.studentName || "").toLowerCase().includes(q);
        const matchesCourse = selectedCourseId === "all" || r.courseId === selectedCourseId;
        return matchesSearch && matchesCourse;
      });
      return filtered;
    } catch (err) {
      console.error("certificates-mobile rows error", err, {
        certs: certsQuery.data,
        enrollments: enrollmentsForCertsQuery.data,
        courses: coursesQuery.data,
      });
      return [];
    }
  }, [certsQuery.data, enrollmentsMap, coursesMap, searchTerm, selectedCourseId, enrollmentsForCertsQuery.data, coursesQuery.data]);

  const stats = useMemo(() => {
    const total = (certsQuery.data ?? []).length;
    const now = new Date();
    const month = (certsQuery.data ?? []).reduce((acc: number, c: any) => {
      const d = new Date(c.generated_at);
      if (!isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return acc + 1;
      }
      return acc;
    }, 0);
    const enr = (enrollmentsStatsQuery.data ?? []) as any[];
    const totalEnr = enr.length || 0;
    const completed = enr.filter((e) => (e.progress_percentage ?? 0) >= 100).length;
    const rate = totalEnr ? Math.round((completed / totalEnr) * 100) : 0;
    const activeCourses = ((coursesQuery.data ?? []) as any[]).filter((c) => c.status === 'Ativo').length;
    return { total, month, rate, activeCourses };
  }, [certsQuery.data, enrollmentsStatsQuery.data, coursesQuery.data]);

  useEffect(() => {
    if (!isMobile) return;
    console.debug("certs", certsQuery.data);
    console.debug("enrollmentsForCerts", enrollmentsForCertsQuery.data);
    console.debug("courses", coursesQuery.data);
    console.debug("rows", rows);
  }, [isMobile, certsQuery.data, enrollmentsForCertsQuery.data, coursesQuery.data, rows]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-black">Certificados</h1>
          <p className="text-sm sm:text-base text-brand-gray-dark">Visualizar e gerenciar certificados emitidos</p>
        </div>
      </div>

      {/* Filtros Mobile */}
      <div className="space-y-3">
        <div>
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
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="h-10 w-full px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">Todos os cursos</option>
            {(coursesQuery.data ?? []).map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Certificados - Mobile Cards */}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">Nenhum certificado encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id as any} className="p-4">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{r.studentName}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{r.courseName}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${
                    String(r.status).toLowerCase() === 'emitido' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {r.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium block">Turma:</span>
                    <span className="truncate block">{r.turmaName}</span>
                  </div>
                  <div>
                    <span className="font-medium block">Professor:</span>
                    <span className="truncate block">{r.professorName}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{formatBRDateSafe(r.generatedAt)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!r.url} 
                      onClick={() => { if (r.url) window.open(r.url, '_blank'); }}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => certsQuery.refetch()}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-clean p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-brand-blue mb-1">{stats.total}</div>
          <div className="text-xs sm:text-sm text-brand-gray-dark">Total Emitidos</div>
        </div>
        <div className="card-clean p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">{stats.month}</div>
          <div className="text-xs sm:text-sm text-brand-gray-dark">Este Mês</div>
        </div>
        <div className="card-clean p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-orange-600 mb-1">{stats.rate}%</div>
          <div className="text-xs sm:text-sm text-brand-gray-dark">Taxa Conclusão</div>
        </div>
        <div className="card-clean p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">{stats.activeCourses}</div>
          <div className="text-xs sm:text-sm text-brand-gray-dark">Cursos Ativos</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesListMobile;