import { useMemo } from "react";
import { useEnrollments } from "@/hooks/useEnrollments";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const EnrollmentsByCourse = () => {
  const { data: enrollments = [], isLoading } = useEnrollments();

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; items: typeof enrollments }>();
    for (const e of enrollments) {
      const key = e.course_id || "sem-curso";
      const name = (e.courses?.name || "Sem curso").trim();
      if (!map.has(key)) map.set(key, { name, items: [] as any });
      map.get(key)!.items.push(e);
    }
    return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }));
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
        <div key={group.id} className="card-clean p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-black">
              {group.name}
            </h3>
            <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
              {group.items.length} inscrição{group.items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-sm mx-2">
              <thead>
                <tr className="text-left text-brand-gray-dark">
                  <th className="py-2 pr-4 font-medium">Aluno</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Telefone</th>
                  <th className="py-2 pr-4 font-medium">Unidade</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Progresso</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="py-3 pr-4 text-foreground">{e.student_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{e.student_email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{e.student_phone || "-"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{e.units?.name || e.unit_code || "-"}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={e.progress_percentage ?? 0} />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{e.progress_percentage ?? 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {e.enrollment_date ? new Date(e.enrollment_date).toLocaleDateString("pt-BR") : "-"}
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
