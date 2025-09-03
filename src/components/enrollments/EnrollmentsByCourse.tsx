import { useMemo } from "react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import LinkEnrollmentButton from "./LinkEnrollmentButton";

const EnrollmentsByCourse = () => {
  const { data: enrollments = [], isLoading } = useEnrollments();

  const grouped = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      turmaName: string;
      professorName: string;
      courseName: string;
      items: typeof enrollments 
    }>();
    for (const e of enrollments) {
      const key = `${e.course_id}-${e.turma_id}` || "sem-turma";
      const courseName = (e.courses?.name || "Sem curso").trim();
      const turmaName = e.turmas?.name || e.turmas?.code || "Turma não definida";
      const professorName = e.turmas?.responsavel_name || "Professor não definido";
      const name = `${courseName} - ${turmaName}`;
      
      if (!map.has(key)) {
        map.set(key, { 
          name, 
          turmaName,
          professorName,
          courseName,
          items: [] as any 
        });
      }
      map.get(key)!.items.push(e);
    }
    return Array.from(map.entries())
      .map(([id, g]) => ({ id, ...g }))
      .sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [enrollments]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-brand-gray-dark">Carregando inscrições...</div>
      </div>
    );
  }

  if (!enrollments.length) {
    return (
      <Card className="p-6">
        <p className="text-brand-gray-dark">Nenhuma inscrição encontrada.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Header da Turma */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.courseName}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">
                    Turma: <span className="font-medium">{group.turmaName}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Professor: <span className="font-medium">{group.professorName}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {group.items.length} inscrição{group.items.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Tabela de Inscrições */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.items.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{e.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{e.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{e.student_phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{e.units?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${e.progress_percentage ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {e.progress_percentage ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString("pt-BR") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!e.user_id && (
                        <LinkEnrollmentButton 
                          enrollmentId={e.id} 
                          studentEmail={e.student_email} 
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnrollmentsByCourse;
