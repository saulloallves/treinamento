
import { useState, useMemo } from "react";
import { Search, Download, RefreshCw, Award, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CertificatesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("todos");

  const certsQuery = useQuery({
    queryKey: ["certificates", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id,generated_at,status,certificate_url,course_id,enrollment_id,user_id")
        .order("generated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const coursesQuery = useQuery({
    queryKey: ["courses", "for-certs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id,name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", "for-certs", certsQuery.data?.length ?? 0],
    enabled: !!certsQuery.data,
    queryFn: async () => {
      const ids = Array.from(new Set((certsQuery.data ?? []).map((c: any) => c.enrollment_id).filter(Boolean)));
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("id,student_name,course_id")
        .in("id", ids);
      if (error) throw error;
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
    for (const e of (enrollmentsQuery.data ?? []) as any[]) m.set(e.id, e);
    return m;
  }, [enrollmentsQuery.data]);

  const rows = useMemo(() => {
    const all = (certsQuery.data ?? []) as any[];
    const enriched = all.map((c) => {
      const enr = enrollmentsMap.get(c.enrollment_id);
      const course = coursesMap.get(c.course_id ?? enr?.course_id);
      return {
        id: c.id,
        studentName: enr?.student_name ?? "—",
        courseName: course?.name ?? "—",
        generatedAt: c.generated_at,
        status: c.status,
        url: c.certificate_url as string | null,
      };
    });
    const q = searchTerm.trim().toLowerCase();
    return enriched.filter((r) => {
      const matchesSearch = !q || r.studentName.toLowerCase().includes(q);
      const matchesCourse = selectedCourse === "todos" || r.courseName === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [certsQuery.data, enrollmentsMap, coursesMap, searchTerm, selectedCourse]);

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

      {/* Lista de Certificados */}
      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-brand-black">Aluno</th>
                <th className="text-left p-4 font-medium text-brand-black">Curso</th>
                <th className="text-left p-4 font-medium text-brand-black">Data da Solicitação</th>
                <th className="text-left p-4 font-medium text-brand-black">Status</th>
                <th className="text-left p-4 font-medium text-brand-black">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id as any} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-white" />
                      </div>
                      <span className="font-medium text-brand-black">{r.studentName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{r.courseName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{new Date(r.generatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${String(r.status).toLowerCase() === 'emitido' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" title="Baixar PDF" disabled={!r.url} onClick={() => { if (r.url) window.open(r.url, '_blank'); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Atualizar" onClick={() => certsQuery.refetch()}>
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
